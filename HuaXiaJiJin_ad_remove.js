/*
 * 华夏基金去广告
 *
 * 原理（基于 HAR 抓包分析，App 华夏基金 iOS 7.0.2）：
 * 1. 开屏广告由 GET a.chinaamc.com/mtrading-fm/query/splashAfter4_5_0.json 下发。
 *    初版脚本只清空 data.imageList，实测开屏变空白但跳过按钮仍在——App 只要
 *    收到 code 0000 就会渲染开屏容器。改为在 .lpx 中直接 REJECT 该请求，
 *    App 拿不到开屏配置则跳过开屏直进首页，不经过本脚本。
 * 2. 弹窗由 GET a.chinaamc.com/mtrading-fm/query/getPopupInfoNew.json 控制，
 *    响应体 data.popupBodyList 为弹窗内容数组；强制改写为空数组。
 * 3. 纯上报与广告配置类请求（腾讯 rdelivery 广告配置、APM 监控、神策埋点、
 *    未知第三方探针）在 .lpx 中直接 REJECT，不经过本脚本。
 */

const requestUrl = String(($request && $request.url) || "");

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

if (/\/query\/getPopupInfoNew\.json/i.test(requestUrl)) {
    handlePopup();
} else {
    $done({});
}
