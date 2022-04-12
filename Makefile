build:
	docker build . -t selenium-chrome

run:
	docker run -it -d selenium-chrome

run-exec:
	docker run -it selenium-chrome python3

list:
	docker ps -a

enter:
	docker exec -it $(id) /bin/bash

nuke:
	docker stop $$(docker ps -a -q) & docker rm -f $$(docker ps -a -q)

all:
	make build
	make run
	make list

refresh:
	make nuke
	make all