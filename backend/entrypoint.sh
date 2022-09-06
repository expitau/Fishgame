#!/bin/sh
cd /app

npm install

exec "$@"
