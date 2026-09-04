/*
 * Flacbox 跨应用推广页拦截
 *
 * HAR 中 Flacbox 打开的推广页位于 everappz.com 的
 * /banners/evermusic_free_ios/ 目录。请求阶段直接返回 204，
 * 使 WKWebView 不再跟随 index.html 的 308 重定向，也不会继续加载
 * config.json 和推广截图素材。
 */

const requestUrl = String($request && $request.url || "");
const bannerPath = /^https?:\/\/www\.everappz\.com\/banners\/evermusic_free_ios(?:[\/?#]|$)/i;

if (!bannerPath.test(requestUrl)) {
    $done({});
} else {
    console.log("[Flacbox] 已拦截 Evermusic 跨应用推广页: " + requestUrl);
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
