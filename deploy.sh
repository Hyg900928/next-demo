#! /bin/sh

npm i


export NODE_ENV=production


echo "start export data"

#开始导出数据
node_modules/gulp/bin/gulp.js

#开始构建
node_modules/next/dist/bin/next build

# 启动服务之前,关闭上一次的服务
pm2 delete next-demo
#
### 启动服务
pm2 start
