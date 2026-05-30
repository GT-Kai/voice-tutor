# 语音对话助手小项目

这是一个适合技术入门者练习的 **网页语音对话助手** 项目。项目目标是实现一个可以在浏览器中使用的英语陪练 / 客服 FAQ 原型：用户通过麦克风说话，系统把语音转换为文字，调用大模型生成回复，再把回复用语音播放出来。

## 快速开始

```bash
npm install
npm start
```

启动后访问：

```text
http://localhost:3000
```

## 环境变量

使用 OpenAI：

```env
OPENAI_API_KEY=你的OpenAI_API_Key
PORT=3000
```

使用字节火山引擎 / 豆包：

```env
ARK_API_KEY=你的字节火山引擎_API_Key
ARK_BASE_URL=你的模型服务地址
ARK_MODEL=你的模型名称或Endpoint_ID
PORT=3000
```

## 核心功能

* 网页端语音输入
* AI 文本回复
* AI 回复语音播放
* 支持英语陪练场景
* 支持客服 FAQ 场景
* 可切换 OpenAI 或字节火山引擎 / 豆包相关模型服务

## 常见问题

如果 `npm init -y` 报 `EJSONPARSE`，通常是因为 `package.json` 文件为空或损坏，可以执行：

```bash
rm package.json
npm init -y
```

注意不要把 `.env` 文件上传到 GitHub，建议添加 `.gitignore`：

```text
.env
node_modules/
```

::: 
