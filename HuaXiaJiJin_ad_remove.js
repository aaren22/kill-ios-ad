/*
 * 华夏基金去广告 v1.4
 *
 * 原理（基于 HAR 抓包分析，App 华夏基金 iOS 7.0.2）：
 * 1. 开屏广告由 GET a.chinaamc.com/mtrading-fm/query/splashAfter4_5_0.json 下发。
 *    - v1.0 仅清空 data.imageList：App 收到 code 0000 且 data != null，判定有活动，
 *      创建开屏容器和跳过按钮并启动 5s 倒计时，但无图片渲染，呈现空白开屏+跳过按钮。
 *    - v1.1/v1.2 直接 REJECT：Loon 返回 404 Not Found（2ms），但 App 启动时前置挂载了
 *      开屏容器，在网络 failure 回调中未调用 dismiss，或走本地弱网缓存兜底，依然停留 5s 等跳过。
 *    - v1.3 返回业务错误码 code 9999：App 同样判定为网络/业务异常，仍可能走错误兜底分支。
 *    - v1.4 正解：在请求阶段（http-request）直接 Mock 标准成功且无活动响应（code: "0000", data: null），
 *      App 命中无投放分支主动调用 dismiss 销毁开屏容器，秒进首页，彻底去除空白开屏与跳过按钮。
 * 2. 弹窗由 GET a.chinaamc.com/mtrading-fm/query/getPopupInfoNew.json 控制，
 *    响应体 data.popupBodyList 为弹窗内容数组；强制改写为空数组。
 * 3. 纯上报与广告配置类请求（腾讯 rdelivery 广告配置、APM 监控、神策埋点、
 *    未知第三方探针）在 .lpx 中直接 REJECT，不经过本脚本。
 */

const requestUrl = String(($request && $request.url) || "");

function handleSplash() {
    const emptySplash = JSON.stringify({
        code: "0000",
        msg: "获取数据成功",
        data: null
    });
    console.log("[华夏基金] 开屏已按业务无投放处理 (code 0000, data null): " + requestUrl);

    if (typeof $response !== "undefined") {
        $done({ body: emptySplash });
    } else {
        $done({
            response: {
                status: 200,
                headers: {
                    "Content-Type": "application/json; charset=utf-8"
                },
                body: emptySplash
            }
        });
    }
}

function handlePopup() {
    const body = $response && $response.body;
    if (!body) {
        $done({});
        return;
    }
    try {
        const resp = JSON.parse(body);
        if (resp && resp.data && Array.isArray(resp.data.popupBodyList)) {
            if (resp.data.popupBodyList.length !== 0) {
                resp.data.popupBodyList = [];
                console.log("[华夏基金] 已关闭弹窗 (popupBodyList -> [])");
            } else {
                console.log("[华夏基金] 本次无弹窗 (popupBodyList 为空)");
            }
        } else {
            console.log("[华夏基金] 弹窗响应无列表字段，保持原样");
        }
        $done({ body: JSON.stringify(resp) });
    } catch (e) {
        console.log("[华夏基金] 弹窗解析失败: " + e.message);
        $done({});
    }
}

if (/\/query\/splashAfter4_5_0\.json/i.test(requestUrl)) {
    handleSplash();
} else if (/\/query\/getPopupInfoNew\.json/i.test(requestUrl)) {
    handlePopup();
} else {
    $done({});
}
