/**
 * 华夏基金去广告脚本 v1.6
 * 适用App：华夏基金管家（HXFundManager / 7.0.2）
 * 处理范围：
 * 1. 开屏广告接口：splashAfter4_5_0.json (http-response)
 * 2. 营销弹窗接口：getPopupInfoNew.json (http-response)
 * 3. 系统参数弹窗：getSystemParameter.json -> data.popAd (http-response)
 */

const SCRIPT_VERSION = "1.6";

/**
 * 开屏处理策略（若默认模式仍出现空白开屏+跳过按钮，可切换以下模式测试）：
 * - "empty_array" : 保留 code:"0000"，将 imageList 设为 []（非 null），清理文案并归零可能存在的时长/状态字段（推荐首选）
 * - "empty_data"  : 返回 code:"0000", data:{}
 * - "biz_error"   : 返回业务空响应码 code:"9999", data:{}
 */
const SPLASH_MODE = "empty_array";

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

    // 打印服务端真实返回的字段结构，便于在 Loon 日志中核对 7.0.2 是否有新增字段
    if (resp && resp.data && typeof resp.data === "object") {
        const keys = Object.keys(resp.data);
        const imgCount = Array.isArray(resp.data.imageList) ? resp.data.imageList.length : String(resp.data.imageList);
        const firstItemKeys = (Array.isArray(resp.data.imageList) && resp.data.imageList.length > 0 && resp.data.imageList[0] && typeof resp.data.imageList[0] === "object")
            ? Object.keys(resp.data.imageList[0]).join(",")
            : "none";
        console.log(`[华夏基金去广告 v${SCRIPT_VERSION}] splash 原始响应: code=${resp.code}, dataKeys=[${keys.join(",")}], imageList=${imgCount}, itemKeys=[${firstItemKeys}]`);
    } else {
        console.log(`[华夏基金去广告 v${SCRIPT_VERSION}] splash 原始响应: code=${resp && resp.code}, data=${JSON.stringify(resp && resp.data)}`);
    }

    let modified = false;

    if (SPLASH_MODE === "biz_error") {
        resp.code = "9999";
        resp.msg = "暂无开屏数据";
        resp.data = {};
        modified = true;
    } else if (SPLASH_MODE === "empty_data") {
        resp.code = "0000";
        resp.msg = resp.msg || "获取数据成功";
        resp.data = {};
        modified = true;
    } else {
        // 默认 "empty_array" 模式
        resp.code = "0000";
        resp.msg = resp.msg || "获取数据成功";
        const data = (resp.data && typeof resp.data === "object" && !Array.isArray(resp.data)) ? resp.data : {};

        data.id = null;
        data.activityDesc = null;
        data.imageList = [];
        data.skipBtnTxt = null;

        // 兼容可能存在的时间/时长/开关控制字段，全部置为无效或 0
        const zeroKeys = ["showTime", "displayTime", "duration", "waitTime", "countDown", "countdown", "skipTime", "stayTime", "endTime", "startTime"];
        for (let i = 0; i < zeroKeys.length; i++) {
            if (Object.prototype.hasOwnProperty.call(data, zeroKeys[i])) {
                data[zeroKeys[i]] = 0;
            }
        }
        const falseKeys = ["isShow", "isOpen", "adSwitch", "enable", "showFlag"];
        for (let i = 0; i < falseKeys.length; i++) {
            if (Object.prototype.hasOwnProperty.call(data, falseKeys[i])) {
                data[falseKeys[i]] = false;
            }
        }
        if (Object.prototype.hasOwnProperty.call(data, "status")) {
            data.status = "0";
        }

        resp.data = data;
        modified = true;
    }

    if (modified) {
        console.log(`[华夏基金去广告 v${SCRIPT_VERSION}] splash 已处理 (mode=${SPLASH_MODE})`);
        $done({ body: JSON.stringify(resp) });
    } else {
        $done({});
    }
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
