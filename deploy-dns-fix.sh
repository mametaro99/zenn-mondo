#!/bin/bash
set -e

# 色の設定
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# AWS リージョンとアカウント ID の設定
REGION="ap-northeast-1"
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

# ECR リポジトリ名
BACKEND_REPO="zenn-mondo-backend"
FRONTEND_REPO="zenn-mondo-frontend"

# ECR リポジトリ URI
BACKEND_REPO_URI="${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com/${BACKEND_REPO}"
FRONTEND_REPO_URI="${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com/${FRONTEND_REPO}"

# ECS クラスター名とサービス名
CLUSTER_NAME="zenn-mondo-cluster-new"
BACKEND_SERVICE="ZennMondoInfraStack-BackendService7A4224EE-U0P5jrwHA9Sz"
FRONTEND_SERVICE="ZennMondoInfraStack-FrontendServiceBC94BA93-YcSEWpblQKGw"

echo -e "${YELLOW}=== CDK スタックのデプロイ ===${NC}"
cd zenn-mondo-infra
npm run build
npx cdk deploy --require-approval never
cd ..

echo -e "${YELLOW}=== ECR へのログイン ===${NC}"
aws ecr get-login-password --region ${REGION} | docker login --username AWS --password-stdin ${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com

echo -e "${YELLOW}=== バックエンドイメージのビルドとプッシュ ===${NC}"
docker build -t ${BACKEND_REPO}:latest -f Dockerfile.backend .
docker tag ${BACKEND_REPO}:latest ${BACKEND_REPO_URI}:latest
docker push ${BACKEND_REPO_URI}:latest

echo -e "${YELLOW}=== フロントエンドイメージのビルドとプッシュ ===${NC}"
docker build -t ${FRONTEND_REPO}:latest -f Dockerfile.frontend .
docker tag ${FRONTEND_REPO}:latest ${FRONTEND_REPO_URI}:latest
docker push ${FRONTEND_REPO_URI}:latest

echo -e "${YELLOW}=== バックエンドサービスの更新 ===${NC}"
aws ecs update-service --cluster ${CLUSTER_NAME} --service ${BACKEND_SERVICE} --force-new-deployment --region ${REGION}

echo -e "${YELLOW}=== フロントエンドサービスの更新 ===${NC}"
aws ecs update-service --cluster ${CLUSTER_NAME} --service ${FRONTEND_SERVICE} --force-new-deployment --region ${REGION}

echo -e "${GREEN}=== デプロイが完了しました ===${NC}"
echo -e "${GREEN}新しいコンテナは起動時に自動的に最新のALB DNS名を取得します${NC}"
