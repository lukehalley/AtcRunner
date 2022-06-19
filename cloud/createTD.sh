aws ecs create-cluster --cluster-name arb-bot
aws ecs register-task-definition --cli-input-json file://cloud/json/taskDefinition.json
aws ecs create-service --cluster arb-bot --service-name arb-bot-service --task-definition arb-bot:1 --desired-count 1 --launch-type "FARGATE" --network-configuration "awsvpcConfiguration={subnets=[subnet-0e71dc83b256dd6da],securityGroups=[sg-01e50f3d9d855d864],assignPublicIp=ENABLED}"
aws ecs list-services --cluster arb-bot
aws ecs describe-services --cluster arb-bot --services arb-bot-service