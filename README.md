# 💌 NodeMail - 每日爱的问候

一个基于 Node.js 的自动化邮件发送服务，每天定时发送精美的天气预报、生活指数和 ONE·一个 的美文到指定邮箱。使用现代化的设计和最新的天气 API，让关心更有温度。

## ✨ 功能特性

- 🌤️ **实时天气预报** - 使用和风天气 API，提供准确的 3 天天气预报
- 📊 **生活指数提醒** - 运动、洗车、穿衣、紫外线、感冒等多维度生活建议
- 🌫️ **空气质量监测** - 实时空气质量指数，6 级颜色分级显示
- 📖 **ONE·一个** - 每日精选美文、图片和音乐推荐
- ⏰ **定时发送** - 支持自定义发送时间，每天准时送达
- 🎨 **精美模板** - 响应式设计，完美适配各种邮件客户端
- ☁️ **Netlify Functions** - 无需服务器，部署到 Netlify 云端运行

## 📸 效果预览

邮件采用现代化卡片式设计，包含：

- 💑 爱情纪念日天数统计
- 🌈 今日天气详情卡片（大图标 + 温度 + 风力 + 空气质量）
- 💡 生活指数网格卡片（运动、洗车、穿衣等建议）
- 📅 未来三天天气预报
- 🎭 ONE·一个 每日精选

## 🚀 快速开始

### 环境要求

- Node.js 16 或更高版本
- pnpm 包管理器
- 一个可用的 SMTP 邮箱账号（推荐 QQ/163/Outlook）
- 和风天气开发者账号（免费版即可）

### 安装

```bash
git clone https://github.com/lzhen228/nodeMail.git
cd nodeMail
pnpm install
```

### 本地运行

```bash
node netlify/functions/main.js
```

执行后脚本会立即拉取数据并发送一封测试邮件，便于验证配置是否正确。

## 🔧 配置说明

所有核心配置都集中在 `netlify/functions/main.js` 顶部：

```javascript
let startDay = "2023/3/31"; // 纪念日
const cityId = "101200105"; // 城市 ID（可在城市列表中查询）
const weatherApiHost = "xxx.qweatherapi.com"; // 和风天气独立 API Host
const YourPrivateKey = `-----BEGIN PRIVATE KEY-----...`; // JWT 私钥
const YourKeyId = "YOUR_KEY_ID"; // JWT Key ID
const YourProjectId = "YOUR_PROJECT_ID"; // JWT Project ID

let EamilAuth = {
  user: "xxx@qq.com", // 发件邮箱
  pass: "smtp-auth-code", // SMTP 授权码
};

let EmailFrom = '"昵称" <xxx@qq.com>'; // 发件人
let EmailTo = "receiver1@qq.com,receiver2@qq.com"; // 收件人（可多个）
let EmailSubject = "遇见楠楠后的每一天"; // 邮件主题

let EmailHour = 7; // 每日小时（24 小时制）
let EmialMinminute = 30; // 每日分钟
```

### 如何获取配置信息

- **城市 ID**：访问 https://github.com/qwd/LocationList/blob/master/China-City-List-latest.csv 搜索城市名。
- **和风天气 JWT**：登录和风天气开发者控制台，在应用详情中复制 API Host、Private Key、Key ID、Project ID。
- **SMTP 授权码**：在邮箱安全设置中开启 SMTP/IMAP 服务并生成授权码（并非登录密码）。

## ☁️ 部署与定时

### Netlify Functions（默认方案）

1. 将仓库推送到 GitHub。
2. 在 Netlify 创建站点并连接仓库。
3. 配置环境变量（推荐）：将敏感信息放入 Netlify 环境变量，并在代码中 `process.env` 读取。
4. 部署成功后，Function URL 形如 `https://<site>.netlify.app/.netlify/functions/main`。

#### 定时触发

免费账号可以使用 GitHub Actions 触发 Netlify Function：

```yaml
name: Daily Email

on:
  schedule:
    - cron: "30 23 * * *" # UTC 23:30 = 北京时间 07:30
  workflow_dispatch:

jobs:
  trigger:
    runs-on: ubuntu-latest
    steps:
      - name: Call Netlify Function
        run: |
          curl -X POST https://<site>.netlify.app/.netlify/functions/main
```

付费 Netlify 账号可直接使用 Scheduled Functions，按界面指引配置即可。

### 自建服务器

如果你有自己的服务器，可以使用 `pm2` 或 `systemd` 常驻运行脚本：

```bash
pnpm install
pm2 start netlify/functions/main.js --name nodemail
```

或者使用 `crontab` 定时：

```bash
0 7 * * * /usr/bin/node /path/netlify/functions/main.js >/tmp/nodemail.log 2>&1
```

## 🗂️ 项目结构

```
├─ netlify/
│  └─ functions/
│     ├─ main.js        # 核心逻辑（数据拉取、模板渲染、发信）
│     └─ email.ejs      # 邮件模板
├─ package.json
├─ pnpm-lock.yaml
└─ README.md
```

## 🧩 生活指数类型

当前默认请求：1（运动）、2（洗车）、3（穿衣）、5（紫外线）、8（舒适度）。

完整列表（type 参数支持逗号分隔多选）：

| ID  | 名称       | ID  | 名称         |
| --- | ---------- | --- | ------------ |
| 1   | 运动指数   | 9   | 感冒指数     |
| 2   | 洗车指数   | 10  | 污染扩散条件 |
| 3   | 穿衣指数   | 11  | 空调开启     |
| 4   | 钓鱼指数   | 12  | 太阳镜       |
| 5   | 紫外线指数 | 13  | 化妆指数     |
| 6   | 旅游指数   | 14  | 晾晒指数     |
| 7   | 花粉过敏   | 15  | 交通指数     |
| 8   | 舒适度     | 16  | 防晒指数     |

在 `getWeatherTips` 中调整 `type` 即可：

```javascript
type: "1,2,3,5,8,9,14";
```

## ✅ 常见问题

**Q: 邮件发送失败？**

- 检查 SMTP 授权码是否正确且未过期。
- 部分邮箱需要在账号设置中勾选“允许第三方客户端”。
- 关注日志中的错误堆栈，常见为 535/550 等认证类错误。

**Q: 天气请求报错 401/403？**

- 确认 API Host、私钥、Key ID、Project ID 完全匹配。
- 生成 JWT 时系统时间需准确，可同步 NTP。
- 免费版每天有调用上限，注意频率控制。

**Q: ONE 图片不显示？**

- 邮件客户端可能默认屏蔽外链图片，手动允许即可。
- 模板中已做 `onerror` 处理，加载失败会隐藏图片避免空白区域。

**Q: 如何更换城市/收件人？**

- 替换 `cityId` 即可。
- `EmailTo` 支持多个邮箱，用逗号分隔。

## 📈 路线图

- [ ] 支持多语言模板
- [ ] 增加节假日提醒
- [ ] 接入更多数据源（新闻、日历）
- [ ] 提供 Web 管理界面

## 📜 许可证

MIT License

## 🙏 致谢

- [和风天气](https://www.qweather.com/) 提供精准天气数据
- [ONE·一个](http://wufazhuce.com/) 提供每日内容
- 原项目 [NodeMail](https://github.com/Vincedream/NodeMail) 提供灵感

---

如果这个项目帮到你，欢迎 Star ⭐ 或分享给更多朋友！
