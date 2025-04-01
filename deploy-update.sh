#!/bin/bash
set -e

# Configuration
AWS_REGION="ap-northeast-1"
PROJECT_NAME="zenn-mondo"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Updating and redeploying Zenn Mondo to AWS...${NC}"

# Step 1: Get ECR repository URIs
echo -e "${GREEN}Step 1: Getting ECR repository URIs...${NC}"
BACKEND_REPO_URI=$(aws ecr describe-repositories --repository-names zenn-mondo-backend --query 'repositories[0].repositoryUri' --output text)
FRONTEND_REPO_URI=$(aws ecr describe-repositories --repository-names zenn-mondo-frontend --query 'repositories[0].repositoryUri' --output text)

echo -e "${GREEN}Backend ECR Repository: ${BACKEND_REPO_URI}${NC}"
echo -e "${GREEN}Frontend ECR Repository: ${FRONTEND_REPO_URI}${NC}"

# Step 2: Authenticate Docker to ECR
echo -e "${GREEN}Step 2: Authenticating Docker to ECR...${NC}"
aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin $(echo $BACKEND_REPO_URI | cut -d'/' -f1)

# Step 3: Build and push backend Docker image
echo -e "${GREEN}Step 3: Building and pushing backend Docker image...${NC}"
docker build -t ${BACKEND_REPO_URI}:latest -f Dockerfile.backend .
docker push ${BACKEND_REPO_URI}:latest

# Step 4: Build and push frontend Docker image using the new Dockerfile
echo -e "${GREEN}Step 4: Building and pushing frontend Docker image with new Dockerfile...${NC}"
docker build -t ${FRONTEND_REPO_URI}:latest -f Dockerfile.frontend.new .
docker push ${FRONTEND_REPO_URI}:latest

# Step 5: Deploy CDK stack to update infrastructure
echo -e "${GREEN}Step 5: Deploying CDK stack to update infrastructure...${NC}"
cd zenn-mondo-infra
npm run build
cdk deploy --require-approval never

# Step 6: Force new deployment of ECS services
echo -e "${GREEN}Step 6: Updating ECS services...${NC}"
aws ecs update-service --cluster zenn-mondo-cluster-new --service BackendService --force-new-deployment
aws ecs update-service --cluster zenn-mondo-cluster-new --service FrontendService --force-new-deployment

# Get ALB DNS
ALB_DNS=$(aws cloudformation describe-stacks --stack-name ZennMondoInfraStack --query "Stacks[0].Outputs[?OutputKey=='LoadBalancerDNS'].OutputValue" --output text)

echo -e "${GREEN}Deployment completed!${NC}"
echo -e "${GREEN}Your application will be available at: http://${ALB_DNS}:8080${NC}"
echo -e "${YELLOW}Note: It may take a few minutes for the services to start and the load balancer to become available.${NC}"
