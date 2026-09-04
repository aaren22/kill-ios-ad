# kill-ios-ad

iOS 去广告 Loon 插件集合。

## 插件列表

| 插件 | 应用 | 一键订阅 |
|------|------|---------|
| [iBailian.lpx](iBailian.lpx) | i百联 | `https://raw.githubusercontent.com/aaren22/kill-ios-ad/main/iBailian.lpx` |
| [UnicomCloud.lpx](UnicomCloud.lpx) | 联通云盘 | `https://raw.githubusercontent.com/aaren22/kill-ios-ad/main/UnicomCloud.lpx` |
| [Flacbox.lpx](Flacbox.lpx) | Flacbox | `https://raw.githubusercontent.com/aaren22/kill-ios-ad/main/Flacbox.lpx` |

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

去除 Flacbox 启动时加载的 Evermusic 跨应用推广页。

### 工作原理

HAR 抓包显示 Flacbox 启动时会通过内置 WKWebView 加载 `www.everappz.com/banners/evermusic_free_ios/` 推广页。该页面的右上角关闭按钮绑定的协议为 `action://close`，原生 App 通过 `WKNavigationDelegate` 监听此协议来关闭弹窗。

1. **自动关闭**：插件拦截 HTML 页面请求并直接 Mock 返回极简页面 `<script>window.location.replace("action://close");</script>`，WKWebView 加载后毫秒级触发原生关闭回调，弹窗自动 Dismiss。
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

## 免责声明

本项目仅供学习交流使用，请勿用于商业用途。
