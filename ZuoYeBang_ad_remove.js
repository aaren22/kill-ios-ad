/*
 * 作业帮去广告
 *
 * 原理（基于 HAR 抓包分析，App 包名 com.baidu.homework，iOS 14.52.0）：
 * 1. 作业帮广告由自有羽克广告平台下发：POST syh.yukeweb.com/com/adx/impress
 *    响应体 data.list 为广告素材数组；无广告时服务端返回 "ishavead":"0" 且 list 为空。
 *    此处将 list 强制清空，模拟"无广告"响应，App 不展示广告位。
 * 2. 弹窗由 POST pluto.zuoyebang.com/plutov2/app/popstatus 控制，
 *    响应体 data.needPopup 为 1 时弹弹窗；强制改写为 0。
 * 3. 纯上报类请求（曝光监测、行为埋点、广告归因）在 .lpx 中直接 REJECT，
 *    不经过本脚本。
 */

const requestUrl = String(($request && $request.url) || "");

function handleImpress() {
    const body = $response && $response.body;
    if (!body) {
        $done({});
        return;
    }
    try {
        const resp = JSON.parse(body);
        if (resp && resp.data && Array.isArray(resp.data.list)) {
            const n = resp.data.list.length;
            resp.data.list = [];
            console.log("[作业帮] 已清空广告列表 (原 " + n + " 条): " + requestUrl);
        } else {
            console.log("[作业帮] impress 响应无广告列表，保持原样");
        }
        $done({ body: JSON.stringify(resp) });
    } catch (e) {
        console.log("[作业帮] impress 解析失败: " + e.message);
        $done({});
    }
}

function handlePopstatus() {
    const body = $response && $response.body;
    if (!body) {
        $done({});
        return;
    }
    try {
        const resp = JSON.parse(body);
        if (resp && resp.data && resp.data.needPopup !== 0) {
            resp.data.needPopup = 0;
            resp.data.tips = "";
            console.log("[作业帮] 已关闭弹窗 (needPopup -> 0)");
        } else {
            console.log("[作业帮] 本次无弹窗 (needPopup=0)");
        }
        $done({ body: JSON.stringify(resp) });
    } catch (e) {
        console.log("[作业帮] popstatus 解析失败: " + e.message);
        $done({});
    }
}

if (/\/com\/adx\/impress/i.test(requestUrl)) {
    handleImpress();
} else if (/\/plutov2\/app\/popstatus/i.test(requestUrl)) {
    handlePopstatus();
} else {
    $done({});
}
