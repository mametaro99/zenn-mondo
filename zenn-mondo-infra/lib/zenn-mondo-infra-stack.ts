import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as route53Targets from 'aws-cdk-lib/aws-route53-targets';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import { Construct } from 'constructs';

export class ZennMondoInfraStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Domain name
    const domainName = 'zenn-clone-demo.com';
    
    // Import the hosted zone
    const hostedZone = route53.HostedZone.fromLookup(this, 'HostedZone', {
      domainName: domainName,
    });
    
    // Import the existing certificate
    const certificate = acm.Certificate.fromCertificateArn(
      this,
      'Certificate',
      `arn:aws:acm:${this.region}:${this.account}:certificate/a081cad0-e4d5-424b-9e5c-9e609c666727`
    );
    
    // VPC
    const vpc = new ec2.Vpc(this, 'ZennMondoVpc', {
      maxAzs: 2,
      natGateways: 1,
    });

    // Security Group for ALB
    const albSg = new ec2.SecurityGroup(this, 'AlbSecurityGroup', {
      vpc,
      allowAllOutbound: true,
      description: 'Security group for ALB',
    });
    albSg.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(80), 'Allow HTTP traffic');
    albSg.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(443), 'Allow HTTPS traffic');

    // Security Group for ECS Tasks
    const ecsSg = new ec2.SecurityGroup(this, 'EcsSecurityGroup', {
      vpc,
      allowAllOutbound: true,
      description: 'Security group for ECS tasks',
    });
    ecsSg.addIngressRule(albSg, ec2.Port.tcp(3000), 'Allow traffic from ALB');

    // ECS Cluster
    const cluster = new ecs.Cluster(this, 'ZennMondoCluster', {
      vpc,
      clusterName: 'zenn-mondo-cluster-new',
    });

    // ECR Repositories
    const backendRepo = ecr.Repository.fromRepositoryName(
      this,
      'BackendRepo',
      'zenn-mondo-backend'
    );

    const frontendRepo = ecr.Repository.fromRepositoryName(
      this,
      'FrontendRepo',
      'zenn-mondo-frontend'
    );

    // IAM Role for ECS Task Execution
    const taskExecutionRole = new iam.Role(this, 'TaskExecutionRole', {
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AmazonECSTaskExecutionRolePolicy'),
      ],
    });

    // IAM Role for ECS Task
    const taskRole = new iam.Role(this, 'TaskRole', {
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
    });

    // Add SSM Parameter Store access permission
    taskRole.addToPolicy(
      new iam.PolicyStatement({
        actions: ['ssm:GetParameter'],
        resources: ['arn:aws:ssm:*:*:parameter/zenn-mondo/*'],
      })
    );

    // ALB
    const alb = new elbv2.ApplicationLoadBalancer(this, 'ZennMondoAlb', {
      vpc,
      internetFacing: true,
      securityGroup: albSg,
    });

    // Store ALB DNS name in SSM Parameter Store
    const albDnsParam = new ssm.StringParameter(this, 'AlbDnsParameter', {
      parameterName: '/zenn-mondo/alb-dns',
      stringValue: alb.loadBalancerDnsName,
      description: 'DNS name of the ALB for Zenn Mondo application',
    });

    // Backend Task Definition
    const backendTaskDef = new ecs.FargateTaskDefinition(this, 'BackendTaskDef', {
      memoryLimitMiB: 1024,
      cpu: 512,
      taskRole,
      executionRole: taskExecutionRole,
    });

    const backendContainer = backendTaskDef.addContainer('BackendContainer', {
      image: ecs.ContainerImage.fromEcrRepository(backendRepo),
      logging: ecs.LogDrivers.awsLogs({
        streamPrefix: 'zenn-mondo-backend',
      }),
      environment: {
        'RAILS_ENV': 'production',
        'RAILS_LOG_TO_STDOUT': 'true',
      },
    });

    backendContainer.addPortMappings({
      containerPort: 3000,
      hostPort: 3000,
    });

    // Frontend Task Definition
    const frontendTaskDef = new ecs.FargateTaskDefinition(this, 'FrontendTaskDef', {
      memoryLimitMiB: 1024,
      cpu: 512,
      taskRole,
      executionRole: taskExecutionRole,
    });

    const frontendContainer = frontendTaskDef.addContainer('FrontendContainer', {
      image: ecs.ContainerImage.fromEcrRepository(frontendRepo),
      logging: ecs.LogDrivers.awsLogs({
        streamPrefix: 'zenn-mondo-frontend',
      }),
      environment: {
        'NODE_ENV': 'production',
      },
    });

    frontendContainer.addPortMappings({
      containerPort: 3000,
      hostPort: 3000,
    });

    // Backend Service
    const backendService = new ecs.FargateService(this, 'BackendService', {
      cluster,
      taskDefinition: backendTaskDef,
      desiredCount: 1,
      securityGroups: [ecsSg],
      assignPublicIp: false,
      healthCheckGracePeriod: cdk.Duration.seconds(60),
    });

    // Frontend Service
    const frontendService = new ecs.FargateService(this, 'FrontendService', {
      cluster,
      taskDefinition: frontendTaskDef,
      desiredCount: 1,
      securityGroups: [ecsSg],
      assignPublicIp: false,
      healthCheckGracePeriod: cdk.Duration.seconds(60),
    });

    // Backend Target Group
    const backendTg = new elbv2.ApplicationTargetGroup(this, 'BackendTargetGroup', {
      vpc,
      port: 3000,
      protocol: elbv2.ApplicationProtocol.HTTP,
      targetType: elbv2.TargetType.IP,
      healthCheck: {
        path: '/api/v1/health_check',
        interval: cdk.Duration.seconds(30),
        timeout: cdk.Duration.seconds(5),
        healthyThresholdCount: 2,
        unhealthyThresholdCount: 2,
      },
    });

    // Frontend Target Group
    const frontendTg = new elbv2.ApplicationTargetGroup(this, 'FrontendTargetGroup', {
      vpc,
      port: 3000,
      protocol: elbv2.ApplicationProtocol.HTTP,
      targetType: elbv2.TargetType.IP,
      healthCheck: {
        path: '/api/health_check',
        interval: cdk.Duration.seconds(30),
        timeout: cdk.Duration.seconds(5),
        healthyThresholdCount: 2,
        unhealthyThresholdCount: 2,
      },
    });

    // Register targets
    backendTg.addTarget(backendService);
    frontendTg.addTarget(frontendService);

    // ALB Listener
    const httpsListener = alb.addListener('HttpsListener', {
      port: 443,
      protocol: elbv2.ApplicationProtocol.HTTPS,
      certificates: [certificate],
      open: true,
      defaultAction: elbv2.ListenerAction.forward([frontendTg]),
    });

    // Add API routing rule to the HTTPS listener
    httpsListener.addAction('BackendAction', {
      priority: 10,
      conditions: [
        elbv2.ListenerCondition.pathPatterns(['/api/v1/*']),
      ],
      action: elbv2.ListenerAction.forward([backendTg]),
    });

    // HTTP Listener - Redirect to HTTPS
    const httpListener = alb.addListener('HttpListener', {
      port: 80,
      open: true,
      defaultAction: elbv2.ListenerAction.redirect({
        protocol: 'HTTPS',
        port: '443',
        permanent: true,
      }),
    });

    // Create Route53 record for the domain pointing to the ALB
    // Use deleteExisting: true to ensure any existing records are removed first
    new route53.ARecord(this, 'AliasRecord', {
      zone: hostedZone,
      recordName: domainName, // apex domain
      target: route53.RecordTarget.fromAlias(new route53Targets.LoadBalancerTarget(alb)),
      deleteExisting: true, // Delete existing records before creating new ones
    });

    // Create Route53 record for www subdomain
    new route53.ARecord(this, 'WwwAliasRecord', {
      zone: hostedZone,
      recordName: `www.${domainName}`,
      target: route53.RecordTarget.fromAlias(new route53Targets.LoadBalancerTarget(alb)),
      deleteExisting: true, // Delete existing records before creating new ones
    });

    // Output the ALB DNS name
    new cdk.CfnOutput(this, 'AlbDnsName', {
      value: alb.loadBalancerDnsName,
      description: 'The DNS name of the ALB',
      exportName: 'ZennMondoAlbDnsName',
    });

    // Output the domain name
    new cdk.CfnOutput(this, 'DomainName', {
      value: `https://${domainName}`,
      description: 'The domain name of the application',
      exportName: 'ZennMondoDomainName',
    });
  }
}
