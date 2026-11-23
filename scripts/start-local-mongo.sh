#!/usr/bin/env bash
# اجرای MongoDB محلی بدون نیاز به نصب سیستمی (باینری رسمی MongoDB 7 را در /tmp می‌گذارد)
set -e
BIN_DIR="/tmp/mongodb"
DATA_DIR="/home/user/aria-motor/.mongo-data"
mkdir -p "$DATA_DIR"
if [ ! -x "$BIN_DIR/bin/mongod" ]; then
  echo "در حال دانلود MongoDB 7.0.14 ..."
  mkdir -p "$BIN_DIR"
  curl -sL -o /tmp/mongo.tgz https://fastdl.mongodb.org/linux/mongodb-linux-x86_64-debian12-7.0.14.tgz
  tar xzf /tmp/mongo.tgz -C "$BIN_DIR" --strip-components=1
  rm /tmp/mongo.tgz
fi
echo "MongoDB روی mongodb://127.0.0.1:27018 بالا می‌آید ..."
exec "$BIN_DIR/bin/mongod" --dbpath "$DATA_DIR" --bind_ip 127.0.0.1 --port 27018
