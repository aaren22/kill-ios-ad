# kill-ios-ad

iOS 去广告 Loon 插件集合。

## 插件列表

| 插件 | 应用 | 订阅 |
|---|---|---|
| [iBailian.lpx](iBailian.lpx) | i百联 | [订阅](https://raw.githubusercontent.com/aaren22/kill-ios-ad/main/iBailian.lpx) |
| [UnicomCloud.lpx](UnicomCloud.lpx) | 联通云盘 | [订阅](https://raw.githubusercontent.com/aaren22/kill-ios-ad/main/UnicomCloud.lpx) |
| [Flacbox.lpx](Flacbox.lpx) | Flacbox | [订阅](https://raw.githubusercontent.com/aaren22/kill-ios-ad/main/Flacbox.lpx) |
| [XiaoAiSpeaker.lpx](XiaoAiSpeaker.lpx) | 小爱音箱 | [订阅](https://raw.githubusercontent.com/aaren22/kill-ios-ad/main/XiaoAiSpeaker.lpx) |
| [EdifierConnect.lpx](EdifierConnect.lpx) | 漫步者 Edifier Connect | [订阅](https://raw.githubusercontent.com/aaren22/kill-ios-ad/main/EdifierConnect.lpx) |

## 功能

- **i百联**：移除开屏及应用内广告。
- **联通云盘**：移除开屏、启动弹窗及 Flow 广告。
- **Flacbox**：关闭 Evermusic 跨应用及平台推广页，并阻断相关素材加载。
- **小爱音箱**：移除开屏及启动弹窗广告，并处理本地广告缓存回退。
- **漫步者 Edifier Connect**：移除开屏活动、跑马灯广告，并屏蔽相关统计埋点。

## 使用

1. 安装并打开 [Loon](https://nsloon.com/)。
2. 在「插件」中添加对应的 `.lpx` 订阅。
3. 按插件要求开启 MITM，并将相关域名加入 Hostname。
4. 更新插件后重新启动对应 App。

部分 App 使用本地缓存保存广告内容。首次启用插件后，如广告仍未消失，可尝试强退 App；必要时清除 App 缓存或重新安装。

## 文件说明

每个插件通常由以下文件组成：

- `*.lpx`：Loon 插件配置，直接订阅此文件即可。
- `*_ad_remove.js`：广告拦截及响应处理脚本。

## 免责声明

本项目仅供学习交流使用，请勿用于商业用途。
