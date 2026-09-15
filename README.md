# kill-ios-ad

iOS 去广告 Loon 插件集合。

## 插件列表

| 插件 | 应用 | 一键订阅 |
|------|------|---------|
| [iBailian.lpx](iBailian.lpx) | i百联 | `https://raw.githubusercontent.com/aaren22/kill-ios-ad/main/iBailian.lpx` |
| [UnicomCloud.lpx](UnicomCloud.lpx) | 联通云盘 | `https://raw.githubusercontent.com/aaren22/kill-ios-ad/main/UnicomCloud.lpx` |
| [Flacbox.lpx](Flacbox.lpx) | Flacbox | `https://raw.githubusercontent.com/aaren22/kill-ios-ad/main/Flacbox.lpx` |
| [XiaoAiSpeaker.lpx](XiaoAiSpeaker.lpx) | 小爱音箱 | `https://raw.githubusercontent.com/aaren22/kill-ios-ad/main/XiaoAiSpeaker.lpx` |
| [EdifierConnect.lpx](EdifierConnect.lpx) | 漫步者 (Edifier Connect) | `https://raw.githubusercontent.com/aaren22/kill-ios-ad/main/EdifierConnect.lpx` |

---

## i百联去广告

去除 i百联 APP 开屏广告及应用内广告。

### 工作原理

拦截 `mobile.bl.com/app/site/queryCutAdDeployv2.htm` 广告配置接口，将返回的所有广告位 `advList` 清空为 `[]`。APP 收到空广告列表后，自动跳过开屏，不显示任何广告。

```
APP启动 → 请求广告配置 queryCutAdDeployv2.htm
                    ↓
          Loon MITM 拦截响应
                    ↓
       脚本将 advList 全部清空为 []
                    ↓
    APP 收到空列表 → 无广告可显示 → 直接进入 ✅
```

### 使用方法

1. 打开 Loon → 插件 → 添加插件
2. 输入订阅 URL：
   ```
   https://raw.githubusercontent.com/aaren22/kill-ios-ad/main/iBailian.lpx
   ```
3. 确保 Loon 已开启 MITM，且 `mobile.bl.com` 在 hostname 列表中
4. 清除 i百联 APP 缓存后重新打开测试

### 文件说明

| 文件 | 作用 |
|------|------|
| `iBailian.lpx` | Loon 插件配置（订阅此文件即可） |
| `iBailian_ad_remove.js` | 广告配置接口修改脚本 |

---

## 联通云盘去广告

去除联通云盘 APP 开屏广告及启动首页弹窗/Flow 广告。

### 工作原理

1. 拦截 `s.pan.wo.cn/wohome/open/v1/resource/query/open-screen/app` 与 `s.pan.wo.cn/api/bff/resource/query/popupAndFlow` 请求。
2. 返回标准的结构化成功响应 `{"meta":{"code":"200","message":"成功"},"result":null}`。
3. APP 成功解析数据并确认广告内容为空后，直接跳过开屏广告进入主界面，避免因请求报错回退展示本地历史缓存广告。

### 文件说明

| 文件 | 作用 |
|------|------|
| `UnicomCloud.lpx` | Loon 插件配置（订阅此文件即可） |
| `UnicomCloud_splash_remove.js` | 开屏与弹窗广告拦截脚本 |

---

## Flacbox 去广告

去除 Flacbox 启动时加载的 Evermusic 跨应用及全平台推广页（如 `evermusic_free_ios`、`evermusic_macos` 等）。

### 工作原理

HAR 抓包显示 Flacbox 启动时会通过内置 WKWebView 随机加载 `www.everappz.com/banners/` 目录下的推广页（例如宣传 iOS 版的 `evermusic_free_ios` 或宣传 Mac 版的 `evermusic_macos`）。这些页面的右上角关闭按钮均绑定协议 `action://close`，原生 App 通过 `WKNavigationDelegate` 监听此协议来关闭弹窗。

1. **自动关闭**：插件通配拦截 `/banners/` 下的所有 HTML 页面请求，并直接 Mock 返回极简页面 `<script>window.location.replace("action://close");</script>`，WKWebView 加载后毫秒级触发原生关闭回调，弹窗自动 Dismiss。
2. **阻断素材**：对 `config.json` 返回空配置（或将关闭事件兜底映射到 action），对图片、字体等静态素材返回 204，防止流量浪费。
3. **禁用缓存**：所有 Mock 响应均附带 `Cache-Control: no-store, no-cache, must-revalidate`，避免强缓存干扰。

### 缓存说明

iOS 的 WKWebView 拥有独立的沙盒磁盘缓存（杀后台不会清空）。若在未开启去广告前曾加载过该推广页，可能已被写入 308 重定向与图片强缓存：
- 更新插件后请在 Loon 中更新插件缓存并重新打开 App。
- 若仍显示历史缓存页面，可在 iOS `设置` -> `通用` -> `iPhone 存储空间` -> `Flacbox` 中点击 **`卸载 App`**（**保留音乐和文档数据**），然后原地重新安装即可彻底清除 WebKit 网页磁盘缓存。

### 文件说明

| 文件 | 作用 |
|------|------|
| `Flacbox.lpx` | Loon 插件配置（订阅此文件即可） |
| `Flacbox_ad_remove.js` | 推广页请求拦截与自动关闭脚本 |

---

## 小爱音箱去广告

去除小爱音箱 APP 开屏广告及启动弹窗广告。

### 工作原理

小爱音箱 iOS 客户端对广告接口有严格的数据模型解析要求（Alamofire + `Decodable`），且内置了**本地广告历史缓存回退机制**。当开屏广告接口返回 `reject`、`0 字节` 或不完整的字典时，解析器异常会触发 `catch`，导致 App 自动读取沙盒中的历史缓存广告并在屏幕上渲染。

1. **结构化 Mock**：拦截 `marketing-aibox.v.mitvos.com` / `info.mina.xiaoaisound.com` 的 `/advertise/v2/splash`、`/advertise/tab/alert` 以及 `/popup/home/v2` 请求。
2. **合法空数据**：在请求阶段（`http-request`）直接短路并 Mock 返回业务合法的成功响应 `{"code":0,"message":"Success","data":{"totalMaxTimes":0,"items":[]}}`。
3. **安全跳过**：App 正常反序列化并识别到广告项列表为空，直接跳过开屏，同时刷新本地缓存，彻底杜绝回退展示本地历史广告。

### 文件说明

| 文件 | 作用 |
|------|------|
| `XiaoAiSpeaker.lpx` | Loon 插件配置（订阅此文件即可） |
| `XiaoAiSpeaker_ad_remove.js` | 开屏与弹窗广告结构化 Mock 拦截脚本 |

---

## 漫步者 (Edifier Connect) 去广告

去除漫步者 Edifier Connect APP 开屏活动广告页、跑马灯推广及屏蔽数据统计埋点。

### 工作原理

漫步者 iOS 客户端在启动时通过接口请求活动与跑马灯广告，且内置了**本地历史持久化缓存机制**：
1. **接口请求与缓存回退**：App 启动时请求 `admin-app.edifier.com/edifier_provider/public/getAppMarqueeForApp`。若请求携带的 `updatetime` 时间戳命中服务端缓存，服务端会返回 `{"code":1,"msg":"无更新"}`。客户端收到该状态后判定无需拉取新数据，直接读取本地 SQLite/UserDefaults 中持久化的历史广告（例如“金秋焕新”抽奖活动）并展示为持续数秒的“广告页”。若直接断开网络连接或抛出错误，客户端解析异常同样会回退展示历史缓存广告。
2. **结构化 Mock 强制覆盖本地缓存**：该接口在正常数据下发时的真实模型为顶层 JSON 数组（`[{...}]`）。若仅 Mock 返回空数组 `[]`，客户端的本地增量更新逻辑不会遍历到旧记录，导致先前持久化在本地的旧广告（例如 `id: 1120`，有效截止时间至 2026-09-18）无法被清除，使得 App 仍会拉起开屏容器展示“跳过”倒计时残留页面。因此脚本在请求阶段（`http-request`）返回将已知及临近广告 ID 显式标记为 `publish: false`、`publish_end_timestamp: 0`、`show_area: 0` 的下线结构体，促使客户端更新本地数据库，彻底消除开屏广告容器，实现冷启动秒进主界面。
3. **素材精准阻断**：广告图片素材存储于 `edifier-provider-oss.edifier.com/marquee_img/`。由于漫步者耳机系列外观图也存放于该 OSS 域名（`/series_img/`），插件采用精准路径 Rewrite 拦截 `/marquee_img/`，在阻断广告图片加载的同时确保耳机型号外观图不受任何影响。
4. **屏蔽埋点上报**：通过规则 REJECT `app-statistics.edifier.com`（跑马灯统计）与 `analytics.edifier.com`（遥测埋点），阻止广告曝光及应用使用数据上传。

### 使用方法

1. 打开 Loon → 插件 → 添加插件
2. 输入订阅 URL：
   ```
   https://raw.githubusercontent.com/aaren22/kill-ios-ad/main/EdifierConnect.lpx
   ```
3. 确保 Loon 已开启 MITM，且 `admin-app.edifier.com, edifier-provider-oss.edifier.com` 在 hostname 列表中
4. 首次使用建议清除一次 App 缓存（或上划强退 App 重新冷启动）

### 文件说明

| 文件 | 作用 |
|------|------|
| `EdifierConnect.lpx` | Loon 插件配置（订阅此文件即可） |
| `EdifierConnect_ad_remove.js` | 跑马灯广告结构化 Mock 拦截脚本 |

---

## 免责声明

本项目仅供学习交流使用，请勿用于商业用途。
