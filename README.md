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
| [HuaXiaJiJin.lpx](HuaXiaJiJin.lpx) | 华夏基金 | [订阅](https://raw.githubusercontent.com/aaren22/kill-ios-ad/main/HuaXiaJiJin.lpx) |

## 功能

- **i百联**：移除开屏及应用内广告。
- **联通云盘**：移除开屏、启动弹窗及 Flow 广告。
- **Flacbox**：关闭 Evermusic 跨应用及平台推广页，并阻断相关素材加载。
- **小爱音箱**：移除开屏及启动弹窗广告，并处理本地广告缓存回退。
- **漫步者 Edifier Connect**：移除开屏活动、跑马灯广告，并屏蔽相关统计埋点。
- **华夏基金**：将开屏投放替换为空对象、移除营销弹窗，屏蔽监控埋点；跳过按钮是否消失需手机实测。

## 使用

1. 安装并打开 [Loon](https://nsloon.com/)。
2. 在「插件」中添加对应的 `.lpx` 订阅。
3. 按插件要求开启 MITM，并将相关域名加入 Hostname。
4. 更新插件后重新启动对应 App。

部分 App 使用本地缓存保存广告内容。首次启用插件后，如广告仍未消失，可尝试强退 App；必要时清除 App 缓存或重新安装。

### 华夏基金 v1.5 更新与验证

- `21_1794492262497.har` 的开屏响应为 HTTP 200，`data` 包含活动 ID、图片列表及按钮文案。`22_1794493763928.har` 中该请求已被 v1.2 拒绝为 HTTP 404、空响应，说明拦截生效，但不能由此证明客户端会移除开屏容器。
- 2026-11-14 使用虚构设备标识访问公开的 `splashAfter4_5_0.json` 接口：版本参数 `7.0.2` 返回活动，版本参数 `4.5.0` 返回以下空对象。v1.5 按这一实测响应模拟，不修改客户端版本、登录或交易配置：

  ```json
  {"code":"0000","msg":"获取数据成功","data":{"id":null,"activityDesc":null,"imageList":null,"skipBtnTxt":null}}
  ```

- v1.4 的 `data:null` 并非上述服务器响应；v1.0 只清空图片则仍保留活动 ID。抓包没有证明跳过按钮的创建/销毁逻辑，不能承诺仅改响应即可“秒进首页”。`skipBtnTxt` 在原响应中是“点击查看”，也不能把它等同于原生“跳过”按钮。
- 移除对 `camc.rdelivery.qq.com` 的拒绝规则：抓包只有加密配置，不能判定它是纯广告服务，避免误拦截远程配置。
- 发布本地修改到订阅所指向的仓库后，在 Loon 更新插件和脚本，确认插件名、开屏脚本标签均含 `v1.5`。脚本链接增加 `?v=1.5`，用于区分旧缓存；仅更新插件名称不代表脚本已更新。若不发布，须同时导入本地插件并将两处脚本路径改为 Loon 内已导入的本地脚本名。
- 禁用旧版华夏基金插件及其他针对该开屏接口的拒绝/复写规则；确认 `a.chinaamc.com` 的 MITM 已开启、证书已安装且受信任，再强退并重新打开华夏基金。
- 在新抓包中确认开屏响应是 HTTP 200、响应头含 `X-HuaXiaJiJin-Ad-Remove: 1.5`、响应体与上面一致。404 表示仍被拒绝规则拦截；`data:null` 或缺少版本头表示应先排查旧脚本或规则冲突。
- 若确认新响应生效后仍有空白页和跳过按钮，请提供这次冷启动的抓包及等待时长。现有两份 HAR 不含 v1.4/v1.5 的执行结果；网络脚本不能直接操作 App 的原生按钮或保证消除本地计时器。

## 文件说明

每个插件通常由以下文件组成：

- `*.lpx`：Loon 插件配置，直接订阅此文件即可。
- `*_ad_remove.js`：广告拦截及响应处理脚本。

## 免责声明

本项目仅供学习交流使用，请勿用于商业用途。
