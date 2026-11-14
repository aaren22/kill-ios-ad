/**
 * 华夏基金去广告脚本 v1.7
 * 适用App：华夏基金管家（HXFundManager / 7.0.2）
 * 处理范围：
 * 1. 开屏广告接口：splashAfter4_5_0.json (http-response)
 * 2. 营销弹窗接口：getPopupInfoNew.json (http-response)
 * 3. 系统参数弹窗：getSystemParameter.json -> data.popAd (http-response)
 */

const SCRIPT_VERSION = "1.7";

/**
 * 开屏处理策略：
 * - "biz_error"   : 返回业务无数据码 code:"9999", data:{}（v1.7 默认，跳过 code=="0000" 的展示分支）
 * - "empty_data"  : 返回 code:"0000", data:{}（空字典，无 id/imageList 等键）
 * - "empty_array" : 返回 code:"0000", imageList:[]（实测 7.0.2 仍会留有空白页与跳过按钮）
 */
const SPLASH_MODE = "biz_error";

const url = ($request && $request.url) ? $request.url : "";

try {
    if (url.indexOf("/query/splashAfter4_5_0.json") !== -1) {
        handleSplash();
    } else if (url.indexOf("/query/getPopupInfoNew.json") !== -1) {
        handlePopup();
    } else if (url.indexOf("/query/getSystemParameter.json") !== -1) {
        handleSystemParam();
    } else {
        $done({});
    }
} catch (e) {
    console.log(`[华夏基金去广告 v${SCRIPT_VERSION}] 脚本异常: ${e && e.message ? e.message : e}`);
    $done({});
}

function handleSplash() {
    const body = ($response && $response.body) ? $response.body : "";
    if (!body) {
        $done({});
        return;
    }

    const resp = JSON.parse(body);

    if (SPLASH_MODE === "biz_error") {
        resp.code = "9999";
        resp.msg = "暂无开屏数据";
        resp.data = {};
    } else if (SPLASH_MODE === "empty_data") {
        resp.code = "0000";
        resp.msg = resp.msg || "获取数据成功";
        resp.data = {};
    } else {
        resp.code = "0000";
        resp.msg = resp.msg || "获取数据成功";
        resp.data = {
            id: null,
            activityDesc: null,
            imageList: [],
            skipBtnTxt: null
        };
    }

    console.log(`[华夏基金去广告 v${SCRIPT_VERSION}] splash 已处理 (mode=${SPLASH_MODE})`);
    $done({ body: JSON.stringify(resp) });
}

function handlePopup() {
    const body = ($response && $response.body) ? $response.body : "";
    if (!body) {
        $done({});
        return;
    }

    const resp = JSON.parse(body);
    if (resp && resp.data && Array.isArray(resp.data.popupBodyList) && resp.data.popupBodyList.length > 0) {
        const removedCount = resp.data.popupBodyList.length;
        resp.data.popupBodyList = [];
        console.log(`[华夏基金去广告 v${SCRIPT_VERSION}] 已清空弹窗广告 ${removedCount} 条`);
        $done({ body: JSON.stringify(resp) });
        return;
    }

    $done({});
}

function handleSystemParam() {
    const body = ($response && $response.body) ? $response.body : "";
    if (!body) {
        $done({});
        return;
    }

    const resp = JSON.parse(body);
    if (resp && resp.data && resp.data.popAd && typeof resp.data.popAd === "object") {
        const popAd = resp.data.popAd;
        if (popAd.adId !== null || popAd.scheme !== null || popAd.imageUrl !== null) {
            resp.data.popAd = {
                adId: null,
                scheme: null,
                imageUrl: null
            };
            console.log(`[华夏基金去广告 v${SCRIPT_VERSION}] 已清空 getSystemParameter.popAd`);
            $done({ body: JSON.stringify(resp) });
            return;
        }
    }

    $done({});
}
