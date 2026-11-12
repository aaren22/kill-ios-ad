/*
 * 华夏基金去广告 v1.3
 *
 * 原理（基于 HAR 抓包分析，App 华夏基金 iOS 7.0.2）：
 * 1. 开屏广告由 GET a.chinaamc.com/mtrading-fm/query/splashAfter4_5_0.json 下发。
 *    v1.0 只清空 data.imageList，实测开屏变空白但跳过按钮仍在——App 只要
 *    收到 code 0000 就会渲染开屏容器。v1.1/v1.2 改为直接 REJECT 该请求，
 *    v1.2 实测（用户确认已装 v1.2 并重新抓包）：请求被挡成 404（2ms 空响应），
 *    rdelivery/APM/神策也全部无请求，开屏图片也不再下载，但空白开屏+跳过
 *    按钮仍然出现——说明 App 在请求失败时走了本地兜底（缓存或内置开屏）。
 *    v1.3 改回脚本：直接返回业务层"无投放"响应（code 9999，data 为 null），
 *    让 App 走正常的"无开屏"分支，不经过失败兜底。
 * 2. 弹窗由 GET a.chinaamc.com/mtrading-fm/query/getPopupInfoNew.json 控制，
 *    响应体 data.popupBodyList 为弹窗内容数组；强制改写为空数组。
 * 3. 纯上报与广告配置类请求（腾讯 rdelivery 广告配置、APM 监控、神策埋点、
 *    未知第三方探针）在 .lpx 中直接 REJECT，不经过本脚本。
 */

const requestUrl = String(($request && $request.url) || "");

function handleSplash() {
    // 不解析原响应，直接返回"无投放"：非 0000 的业务码 + 空 data
    $done({ body: JSON.stringify({ code: "9999", msg: "暂无开屏活动", data: null }) });
    console.log("[华夏基金] 开屏已按无投放处理: " + requestUrl);
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
