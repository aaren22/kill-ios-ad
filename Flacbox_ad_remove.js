/*
 * Flacbox 跨应用推广页拦截
 *
 * 原理：
 * 推广页为 WKWebView 模态弹窗，右上角关闭按钮协议为 action://close。
 * 若返回 204，WKWebView 规范不会导航也不会关闭模态，且因协商缓存继续显示旧广告；
 * 此处对 HTML 请求 Mock 返回极简 HTML 并自动触发 action://close，
 * 使 App 原生 WKNavigationDelegate 监听到关闭指令，毫秒级自动关闭弹窗。
 */

const requestUrl = String($request && $request.url || "");
const bannerRegex = /^https?:\/\/www\.everappz\.com\/banners\/evermusic_free_ios(?:[\/?#]|$)/i;

if (!bannerRegex.test(requestUrl)) {
    $done({});
} else {
    const isConfig = requestUrl.includes("config.json");
    const isPage = requestUrl.includes("index.html") || 
                  requestUrl.endsWith("/evermusic_free_ios/") || 
                  requestUrl.endsWith("/evermusic_free_ios") ||
                  !/\.(png|jpg|jpeg|gif|ttf|otf|woff|woff2|css|js|json)($|\?)/i.test(requestUrl);

    if (isConfig) {
        console.log("[Flacbox] 拦截广告配置 config.json: " + requestUrl);
        $done({
            response: {
                status: 200,
                headers: {
                    "Content-Type": "application/json; charset=utf-8",
                    "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0"
                },
                body: JSON.stringify({
                    clickUrl: "action://close",
                    closeUrl: "action://close",
                    screens: []
                })
            }
        });
    } else if (isPage) {
        console.log("[Flacbox] 拦截推广页面并注入自动关闭脚本: " + requestUrl);
        const autoCloseHtml = '<!DOCTYPE html><html><head><meta charset="utf-8"><script>window.location.replace("action://close");</script></head><body></body></html>';
        $done({
            response: {
                status: 200,
                headers: {
                    "Content-Type": "text/html; charset=utf-8",
                    "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0"
                },
                body: autoCloseHtml
            }
        });
    } else {
        console.log("[Flacbox] 拦截推广资源: " + requestUrl);
        $done({
            response: {
                status: 204,
                headers: {
                    "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0"
                },
                body: ""
            }
        });
    }
}
