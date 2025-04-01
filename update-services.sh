#!/bin/bash
set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Updating ECS services in the new cluster...${NC}"

# Update backend service
echo -e "${GREEN}Updating backend service...${NC}"
aws ecs update-service \
  --cluster zenn-mondo-cluster-new \
  --service ZennMondoInfraStack-BackendService7A4224EE-vURf3VL2c8oA \
  --force-new-deployment

# Update frontend service
echo -e "${GREEN}Updating frontend service...${NC}"
aws ecs update-service \
  --cluster zenn-mondo-cluster-new \
  --service ZennMondoInfraStack-FrontendServiceBC94BA93-kDUFNDVyBUU0 \
  --force-new-deployment

echo -e "${GREEN}Services update initiated!${NC}"
echo -e "${YELLOW}Note: It may take a few minutes for the services to update.${NC}"
echo -e "${GREEN}Your application will be available at: http://ZennMo-ZennM-t4O70LYwEw2G-977005002.ap-northeast-1.elb.amazonaws.com:8080${NC}"
