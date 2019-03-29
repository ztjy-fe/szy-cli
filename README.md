## szy-cli
神州鹰前端命令行工具.

### 安装
szy-cli 依赖 [Node.js](https://nodejs.org/en/) (>=6.x)：

```
$ npm install szy-cli -g
```

### 用法
```
$ szy create <project-name>
```

示例:

```
$ szy create my-project

$ szy create dir/my-project
```

### 基本命令

* `szy` or `szy -h` --- 查看 szy 的帮助信息
* `szy create your-project-name` --- 用指定的脚手架创建你的项目.
* `szy token -u your-github-user-name -p your-personal-token` --- 设置 auth token，用于[Rate Limiting](https://developer.github.com/v3/#rate-limiting).

`szy create` 命令会向 `api.github.com` 发起请求。在没设置 auth token 的情况下，github限制的请求频率是 60次/小时，超过次数之后，github会拒绝请求，返回403。

而设置token后，请求频率是5000次/小时。

相关文档：

* [Rate Limiting](https://developer.github.com/v3/#rate-limiting)
* [Basic Authentication](https://developer.github.com/v3/auth/#basic-authentication)