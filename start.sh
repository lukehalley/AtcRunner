#!/bin/bash

pm2 start /home/arb-bot/server/index.js
pm2 ls
python3 /home/arb-bot/main.py