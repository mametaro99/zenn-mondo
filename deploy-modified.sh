#!/bin/bash
set -e

# Configuration
AWS_REGION="ap-northeast-1"
PROJECT_NAME="zenn-mondo"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Deploying Zenn Mondo to AWS with modified infrastructure...${NC}"

# Step 1: Deploy CDK stack with imported ECR repositories
echo -e "${GREEN}Step 1: Deploying CDK stack with imported ECR repositories...${NC}"
cd zenn-mondo-infra
npm run build
cdk deploy --require-approval never

# Get ECR repository URIs
BACKEND_REPO_URI=$(aws ecr describe-repositories --repository-names zenn-mondo-backend --query 'repositories[0].repositoryUri' --output text)
FRONTEND_REPO_URI=$(aws ecr describe-repositories --repository-names zenn-mondo-frontend --query 'repositories[0].repositoryUri' --output text)
ALB_DNS=$(aws cloudformation describe-stacks --stack-name ZennMondoInfraStack --query "Stacks[0].Outputs[?OutputKey=='LoadBalancerDNS'].OutputValue" --output text)

echo -e "${GREEN}Backend ECR Repository: ${BACKEND_REPO_URI}${NC}"
echo -e "${GREEN}Frontend ECR Repository: ${FRONTEND_REPO_URI}${NC}"
echo -e "${GREEN}ALB DNS: ${ALB_DNS}${NC}"

# Step 2: Authenticate Docker to ECR
echo -e "${GREEN}Step 2: Authenticating Docker to ECR...${NC}"
aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin $(echo $BACKEND_REPO_URI | cut -d'/' -f1)

# Step 3: Build and push backend Docker image
echo -e "${GREEN}Step 3: Building and pushing backend Docker image...${NC}"
cd ..
docker build -t ${BACKEND_REPO_URI}:latest -f Dockerfile.backend .
docker push ${BACKEND_REPO_URI}:latest

# Step 4: Build and push frontend Docker image
echo -e "${GREEN}Step 4: Building and pushing frontend Docker image...${NC}"
docker build -t ${FRONTEND_REPO_URI}:latest -f Dockerfile.frontend .
docker push ${FRONTEND_REPO_URI}:latest || {
  echo -e "${YELLOW}Frontend build failed. Continuing with backend only.${NC}"
}

# Step 5: Force new deployment of ECS services
echo -e "${GREEN}Step 5: Updating ECS services...${NC}"
aws ecs update-service --cluster zenn-mondo-cluster --service BackendService --force-new-deployment || {
  echo -e "${YELLOW}Backend service update failed. The service might not be created yet.${NC}"
}

aws ecs update-service --cluster zenn-mondo-cluster --service FrontendService --force-new-deployment || {
  echo -e "${YELLOW}Frontend service update failed. The service might not be created yet.${NC}"
}

echo -e "${GREEN}Deployment completed!${NC}"
echo -e "${GREEN}Your application will be available at: http://${ALB_DNS}:8080${NC}"
echo -e "${YELLOW}Note: It may take a few minutes for the services to start and the load balancer to become available.${NC}"
