# DNS名の動的更新による問題解決

## 問題
CDKでデプロイ後にDNS名が変わってしまい、バックエンドとフロントエンドに指定していたDNSのエンドポイントが古いDNS名を参照して、ERR_NAME_NOT_RESOLVEDエラーが発生していました。

## 解決策
以下の改善を実装しました：

1. **SSMパラメータストアの活用**:
   - ALBのDNS名をSSMパラメータストアに保存
   - パラメータ名: `/zenn-mondo/alb-dns`

2. **コンテナの起動スクリプト**:
   - コンテナ起動時にSSMパラメータストアから最新のDNS名を取得
   - 環境変数を動的に設定

3. **IAMロールの権限**:
   - タスクロールにSSMパラメータ読み取り権限を付与

## 実装の詳細

### バックエンドコンテナ
```bash
#!/bin/bash
# Remove server.pid if it exists
rm -f /app/tmp/pids/server.pid

# Get the ALB DNS from SSM Parameter Store
export ALB_DNS=$(aws ssm get-parameter --name /zenn-mondo/alb-dns --query "Parameter.Value" --output text --region ${AWS_REGION:-ap-northeast-1})

# Create dynamic production.yml with the latest ALB DNS
echo "front_domain: \"http://$ALB_DNS\"" > /app/config/settings/production.yml

# Start the Rails server
exec bundle exec rails server -b 0.0.0.0
```

### フロントエンドコンテナ
```bash
#!/bin/bash
# Get the ALB DNS from SSM Parameter Store
export ALB_DNS=$(aws ssm get-parameter --name /zenn-mondo/alb-dns --query "Parameter.Value" --output text --region ${AWS_REGION:-ap-northeast-1})
export NEXT_PUBLIC_API_BASE_URL="http://$ALB_DNS/api/v1"
export NEXT_PUBLIC_FRONT_BASE_URL="http://$ALB_DNS"
export FRONT_DOMAIN="http://$ALB_DNS"

# Start the application
exec "$@"
```

## デプロイ方法
```bash
npm run build
npx cdk deploy
```

デプロイ後、コンテナは自動的に最新のDNS名を取得して環境変数を設定します。
