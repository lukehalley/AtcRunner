build:
	make -i nuke
	docker build . -t arb-bot:$(version)
	docker run -itd arb-bot:$(version)

exec:
	docker exec -it $(docker ps --latest --quiet) bash

newRepo:
	aws ecr create-repository --repository-name $(name) --region eu-west-1

tag:
	docker tag arb-bot:$(version) 538602529242.dkr.ecr.eu-west-1.amazonaws.com/arb-bot:$(version)

ecr-login:
	aws ecr get-login-password --region eu-west-1 | docker login --username AWS --password-stdin 538602529242.dkr.ecr.eu-west-1.amazonaws.com/arb-bot

push:
	make ecr-login
	docker push 538602529242.dkr.ecr.eu-west-1.amazonaws.com/arb-bot:$(version)

buildAndPush:
	make build version=$(version)
	make tag version=$(version)
	make push version=$(version)

zeroTask:
	aws ecs update-service --cluster arb-botCluster --service arb-bot --desired-count 0

oneTask:
	aws ecs update-service --cluster arb-botCluster --service arb-bot --desired-count 1

createStack:
	aws cloudformation create-stack --template-body file://cloud/stack.json --stack-name arb-bot --capabilities CAPABILITY_NAMED_IAM

updateStack:
	aws cloudformation update-stack --template-body file://cloud/stack.json --stack-name arb-bot --capabilities CAPABILITY_NAMED_IAM

nuke:
	docker stop $$(docker ps -a -q) & docker rm -f $$(docker ps -a -q)