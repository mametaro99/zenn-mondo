#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { ZennMondoInfraStack } from '../lib/zenn-mondo-infra-stack';

const app = new cdk.App();
new ZennMondoInfraStack(app, 'ZennMondoInfraStack', {
  env: { 
    account: process.env.CDK_DEFAULT_ACCOUNT, 
    region: process.env.CDK_DEFAULT_REGION || 'ap-northeast-1' 
  },
  description: 'Infrastructure for Zenn Mondo application',
});
