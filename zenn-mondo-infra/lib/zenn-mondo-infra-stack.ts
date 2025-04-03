import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';

export class ZennMondoInfraStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

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
    const listener = alb.addListener('HttpListener', {
      port: 80,
      open: true,
      defaultAction: elbv2.ListenerAction.forward([frontendTg]),
    });

    // Add API routing rule to the listener
    listener.addAction('BackendAction', {
      priority: 10,
      conditions: [
        elbv2.ListenerCondition.pathPatterns(['/api/*']),
      ],
      action: elbv2.ListenerAction.forward([backendTg]),
    });

    // Output the ALB DNS name
    new cdk.CfnOutput(this, 'AlbDnsName', {
      value: alb.loadBalancerDnsName,
      description: 'The DNS name of the ALB',
      exportName: 'ZennMondoAlbDnsName',
    });
  }
}
