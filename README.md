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

HAR 显示 Flacbox 请求 `www.everappz.com/banners/evermusic_free_ios/index.html`，服务端先返回 `308`，再加载推广 HTML、`config.json` 和 9 张截图。插件在请求阶段精确匹配该目录并返回 HTTP `204`，阻止重定向和后续素材请求。

### 文件说明

| 文件 | 作用 |
|------|------|
| `Flacbox.lpx` | Loon 插件配置（订阅此文件即可） |
| `Flacbox_ad_remove.js` | 推广页请求拦截脚本 |

---

## 免责声明

本项目仅供学习交流使用，请勿用于商业用途。
