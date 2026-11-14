/* 华夏基金去广告 v1.5 */

const requestUrl = typeof $request === "undefined" ? "" : String($request.url || "");

function handleSplash() {
    const emptySplash = JSON.stringify({
        code: "0000",
        msg: "获取数据成功",
        data: {
            id: null,
            activityDesc: null,
            imageList: null,
            skipBtnTxt: null
        }
    });
    console.log("[华夏基金 v1.5] 开屏已替换为服务端空对象 (id/imageList/skipBtnTxt 均为 null)");

    $done({
        response: {
            status: 200,
            headers: {
                "Content-Type": "application/json; charset=utf-8",
                "Cache-Control": "no-store",
                "X-HuaXiaJiJin-Ad-Remove": "1.5"
            },
            body: emptySplash
        }
    });
}

function handlePopup() {
    const body = typeof $response === "undefined" ? "" : $response.body;
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

if (/^https?:\/\/a\.chinaamc\.com\/mtrading-fm\/query\/splashAfter4_5_0\.json(?:\?|$)/i.test(requestUrl)) {
    handleSplash();
} else if (/^https?:\/\/a\.chinaamc\.com\/mtrading-fm\/query\/getPopupInfoNew\.json(?:\?|$)/i.test(requestUrl)) {
    handlePopup();
} else {
    $done({});
}
