# kill-ios-ad

iOS 去广告 Loon 插件集合。

## 插件列表

| 插件 | 应用 | 一键订阅 |
|------|------|---------|
| [iBailian.lpx](iBailian.lpx) | i百联 | `https://raw.githubusercontent.com/aaren22/kill-ios-ad/main/iBailian.lpx` |

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

## 免责声明

本项目仅供学习交流使用，请勿用于商业用途。
