#!/bin/bash
set -e

# Configuration
AWS_REGION="ap-northeast-1"
PROJECT_NAME="zenn-mondo"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Redeploying Zenn Mondo after endpoint modifications...${NC}"

# Step 1: Get ECR repository URIs
echo -e "${GREEN}Step 1: Getting ECR repository URIs...${NC}"
BACKEND_REPO_URI=$(aws ecr describe-repositories --repository-names zenn-mondo-backend --query 'repositories[0].repositoryUri' --output text)
FRONTEND_REPO_URI=$(aws ecr describe-repositories --repository-names zenn-mondo-frontend --query 'repositories[0].repositoryUri' --output text)

echo -e "${GREEN}Backend ECR Repository: ${BACKEND_REPO_URI}${NC}"
echo -e "${GREEN}Frontend ECR Repository: ${FRONTEND_REPO_URI}${NC}"

# Step 2: Authenticate Docker to ECR
echo -e "${GREEN}Step 2: Authenticating Docker to ECR...${NC}"
aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin $(echo $BACKEND_REPO_URI | cut -d'/' -f1)

# Step 3: Build and push backend Docker image with endpoint modifications
echo -e "${GREEN}Step 3: Building and pushing backend Docker image...${NC}"
docker build -t ${BACKEND_REPO_URI}:latest -f Dockerfile.backend .
docker push ${BACKEND_REPO_URI}:latest

# Step 4: Build and push frontend Docker image with endpoint modifications
echo -e "${GREEN}Step 4: Building and pushing frontend Docker image...${NC}"
docker build -t ${FRONTEND_REPO_URI}:latest -f Dockerfile.frontend.new .
docker push ${FRONTEND_REPO_URI}:latest

# Step 5: Force new deployment of ECS services
echo -e "${GREEN}Step 5: Updating ECS services with new images...${NC}"
aws ecs update-service \
  --cluster zenn-mondo-cluster-new \
  --service ZennMondoInfraStack-BackendService7A4224EE-vURf3VL2c8oA \
  --force-new-deployment

aws ecs update-service \
  --cluster zenn-mondo-cluster-new \
  --service ZennMondoInfraStack-FrontendServiceBC94BA93-kDUFNDVyBUU0 \
  --force-new-deployment

# Get ALB DNS
ALB_DNS=$(aws cloudformation describe-stacks --stack-name ZennMondoInfraStack --query "Stacks[0].Outputs[?OutputKey=='LoadBalancerDNS'].OutputValue" --output text)

echo -e "${GREEN}Redeployment completed!${NC}"
echo -e "${GREEN}Your application with updated endpoints will be available at: http://${ALB_DNS}:8080${NC}"
echo -e "${YELLOW}Note: It may take a few minutes for the services to update and become available.${NC}"
