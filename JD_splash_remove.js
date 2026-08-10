/*
 * 京东开屏广告移除
 *
 * 1. basicConfig 响应：开启 JDAdsCore 广告降级模式。
 * 2. 开屏素材请求：仅在请求来源属于京东首页启动控制器时返回空响应。
 */

const requestUrl = $request.url;
const requestHeaders = $request.headers || {};
const referer = String(
    requestHeaders.Referer ||
    requestHeaders.referer ||
    requestHeaders.Referrer ||
    requestHeaders.referrer ||
    ""
);

function finishEmpty() {
    $done({
        response: {
            status: 204,
            headers: {
                "Cache-Control": "no-store"
            },
            body: ""
        }
    });
}

function handleBasicConfig() {
    const body = $response && $response.body;
    if (!body) {
        $done({});
        return;
    }

    try {
        const response = JSON.parse(body);
        const degradationConfig =
            response &&
            response.data &&
            response.data.JDAdsCore &&
            response.data.JDAdsCore.adDegradationConfig;

        if (!degradationConfig) {
            $done({});
            return;
        }

        degradationConfig.degraded = "1";
        console.log("[京东] 已开启 JDAdsCore 广告降级模式");
        $done({ body: JSON.stringify(response) });
    } catch (error) {
        console.log("[京东] basicConfig 解析失败: " + error.message);
        $done({});
    }
}

if (typeof $response !== "undefined") {
    handleBasicConfig();
} else {
    const isHomeImage =
        /^https:\/\/(?:quic|m)\.360buyimg\.com\/mobilecms\/s1125x2436_jfs\//i.test(requestUrl) &&
        /download_Image_JDAppHome/i.test(referer);

    const isHomeVideo =
        /^https:\/\/storage\.360buyimg\.com\/material-video\/video\//i.test(requestUrl) &&
        /JDMainPageViewController/i.test(referer);

    if (isHomeImage || isHomeVideo) {
        console.log("[京东] 已拦截开屏素材: " + requestUrl);
        finishEmpty();
    } else {
        $done({});
    }
}
