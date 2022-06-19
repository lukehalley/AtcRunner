build:
	docker build . -t arb-bot:$(version)

newRepo:
	aws ecr create-repository --repository-name $(name) --region eu-west-1

tag:
	docker tag arb-bot:$(version) 538602529242.dkr.ecr.eu-west-1.amazonaws.com/arb-bot:$(version)

push:
	docker push 538602529242.dkr.ecr.eu-west-1.amazonaws.com/arb-bot:$(version)

buildAndPush:
	make build version=$(version)
	make tag version=$(version)
	make push version=$(version)

createStack:
	aws cloudformation create-stack --template-body file://cloud/stack.json --stack-name arb-bot --capabilities CAPABILITY_NAMED_IAM

updateStack:
	aws cloudformation update-stack --template-body file://cloud/stack.json --stack-name arb-bot --capabilities CAPABILITY_NAMED_IAM

nuke:
	docker stop $$(docker ps -a -q) & docker rm -f $$(docker ps -a -q)