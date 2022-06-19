#!/bin/sh
pm2 start server/index.js -s
pm2 start main.py -s