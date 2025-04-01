import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as route53Targets from 'aws-cdk-lib/aws-route53-targets';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';

export class ZennMondoInfraStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Import existing ECR Repositories instead of creating new ones
    const backendRepo = ecr.Repository.fromRepositoryName(
      this,
      'ZennMondoBackendRepo',
      'zenn-mondo-backend'
    );

    const frontendRepo = ecr.Repository.fromRepositoryName(
      this,
      'ZennMondoFrontendRepo',
      'zenn-mondo-frontend'
    );

    // Create VPC
    const vpc = new ec2.Vpc(this, 'ZennMondoVpc', {
      maxAzs: 2,
      natGateways: 1,
    });

    // Create ECS Cluster
    const cluster = new ecs.Cluster(this, 'ZennMondoCluster', {
      vpc,
      clusterName: 'zenn-mondo-cluster-new',
    });

    // Create security groups
    const albSg = new ec2.SecurityGroup(this, 'AlbSecurityGroup', {
      vpc,
      allowAllOutbound: true,
      description: 'Security group for ALB',
    });

    albSg.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(80),
      'Allow HTTP traffic'
    );
    
    albSg.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(443),
      'Allow HTTPS traffic'
    );

    const backendSg = new ec2.SecurityGroup(this, 'BackendSecurityGroup', {
      vpc,
      allowAllOutbound: true,
      description: 'Security group for Backend service',
    });

    backendSg.addIngressRule(
      albSg,
      ec2.Port.tcp(3000),
      'Allow traffic from ALB to Backend'
    );

    const frontendSg = new ec2.SecurityGroup(this, 'FrontendSecurityGroup', {
      vpc,
      allowAllOutbound: true,
      description: 'Security group for Frontend service',
    });

    frontendSg.addIngressRule(
      albSg,
      ec2.Port.tcp(3000),
      'Allow traffic from ALB to Frontend'
    );

    // Create ALB
    const alb = new elbv2.ApplicationLoadBalancer(this, 'ZennMondoALB', {
      vpc,
      internetFacing: true,
      securityGroup: albSg,
    });

    // Create task execution role
    const executionRole = new iam.Role(this, 'TaskExecutionRole', {
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AmazonECSTaskExecutionRolePolicy'),
      ],
    });

    // Create task role
    const taskRole = new iam.Role(this, 'TaskRole', {
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
    });

    // Add permissions for accessing other AWS services if needed
    taskRole.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore')
    );

    // Backend Task Definition
    const backendTaskDef = new ecs.FargateTaskDefinition(this, 'BackendTaskDef', {
      memoryLimitMiB: 1024,
      cpu: 512,
      executionRole,
      taskRole,
    });

    const backendContainer = backendTaskDef.addContainer('BackendContainer', {
      image: ecs.ContainerImage.fromEcrRepository(backendRepo),
      logging: ecs.LogDrivers.awsLogs({
        streamPrefix: 'zenn-mondo-backend',
        logRetention: logs.RetentionDays.ONE_MONTH,
      }),
      environment: {
        RAILS_ENV: 'production',
        RAILS_LOG_TO_STDOUT: 'true',
        // The front_domain will be set dynamically based on the ALB DNS - using direct string interpolation to preserve case
        FRONT_DOMAIN: `http://${alb.loadBalancerDnsName}`,
        // Adding consistent environment variable that matches frontend naming
        FRONT_BASE_URL: `http://${alb.loadBalancerDnsName}`,
      },
      portMappings: [{ containerPort: 3000 }],
    });

    // Frontend Task Definition
    const frontendTaskDef = new ecs.FargateTaskDefinition(this, 'FrontendTaskDef', {
      memoryLimitMiB: 1024,
      cpu: 512,
      executionRole,
      taskRole,
    });

    const frontendContainer = frontendTaskDef.addContainer('FrontendContainer', {
      image: ecs.ContainerImage.fromEcrRepository(frontendRepo),
      logging: ecs.LogDrivers.awsLogs({
        streamPrefix: 'zenn-mondo-frontend',
        logRetention: logs.RetentionDays.ONE_MONTH,
      }),
      environment: {
        NODE_ENV: 'production',
        // Set API base URL dynamically based on the ALB DNS - using direct string interpolation to preserve case
        NEXT_PUBLIC_API_BASE_URL: `http://${alb.loadBalancerDnsName}/api/v1`,
        // Set frontend base URL dynamically based on the ALB DNS - using direct string interpolation to preserve case
        NEXT_PUBLIC_FRONT_BASE_URL: `http://${alb.loadBalancerDnsName}`,
        // Adding consistent environment variable that matches backend naming
        FRONT_DOMAIN: `http://${alb.loadBalancerDnsName}`,
      },
      portMappings: [{ containerPort: 3000 }],
    });

    // Create target groups
    const backendTargetGroup = new elbv2.ApplicationTargetGroup(this, 'BackendTargetGroup', {
      vpc,
      port: 3000,
      protocol: elbv2.ApplicationProtocol.HTTP,
      targetType: elbv2.TargetType.IP,
      healthCheck: {
        path: '/api/v1/health_check',
        interval: cdk.Duration.seconds(60),
        timeout: cdk.Duration.seconds(5),
        healthyHttpCodes: '200',
      },
    });

    const frontendTargetGroup = new elbv2.ApplicationTargetGroup(this, 'FrontendTargetGroup', {
      vpc,
      port: 3000,
      protocol: elbv2.ApplicationProtocol.HTTP,
      targetType: elbv2.TargetType.IP,
      healthCheck: {
        path: '/api/health_check',
        interval: cdk.Duration.seconds(60),
        timeout: cdk.Duration.seconds(5),
        healthyHttpCodes: '200',
      },
    });

    // Create listeners
    const httpListener = alb.addListener('HttpListener', {
      port: 80,
      open: true,
      defaultAction: elbv2.ListenerAction.redirect({
        port: '443',
        protocol: 'HTTPS',
        permanent: true,
      }),
    });

    // For testing, we'll use HTTP instead of HTTPS
    const testListener = alb.addListener('TestListener', {
      port: 8080,
      open: true,
      defaultAction: elbv2.ListenerAction.forward([frontendTargetGroup]),
    });

    testListener.addAction('ApiAction', {
      conditions: [
        elbv2.ListenerCondition.pathPatterns(['/api/v1/*']),
      ],
      priority: 10,
      action: elbv2.ListenerAction.forward([backendTargetGroup]),
    });

    // Backend Service
    const backendService = new ecs.FargateService(this, 'BackendService', {
      cluster,
      taskDefinition: backendTaskDef,
      desiredCount: 1,
      securityGroups: [backendSg],
      assignPublicIp: false,
    });

    backendService.attachToApplicationTargetGroup(backendTargetGroup);

    // Frontend Service
    const frontendService = new ecs.FargateService(this, 'FrontendService', {
      cluster,
      taskDefinition: frontendTaskDef,
      desiredCount: 1,
      securityGroups: [frontendSg],
      assignPublicIp: false,
    });

    frontendService.attachToApplicationTargetGroup(frontendTargetGroup);

    // Output the ECR repository URLs and ALB DNS
    new cdk.CfnOutput(this, 'BackendRepositoryURI', {
      value: backendRepo.repositoryUri,
      description: 'Backend ECR Repository URI',
    });

    new cdk.CfnOutput(this, 'FrontendRepositoryURI', {
      value: frontendRepo.repositoryUri,
      description: 'Frontend ECR Repository URI',
    });

    new cdk.CfnOutput(this, 'LoadBalancerDNS', {
      value: alb.loadBalancerDnsName,
      description: 'ALB DNS Name',
    });
  }
}
