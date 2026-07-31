/*
 * 工银E生活 - 开屏广告请求阶段秒杀预拦截
 *
 * 检查请求 URL 中的图片 Hash 是否已被记录为开屏广告：
 * - 若在黑名单中：返回 1x1 透明 GIF (HTTP 200)，促使 APP 认为图片无效/透明并快速关闭开屏
 */

const url = $request.url;
const hashMatch = url.match(/\/([a-f0-9]{32})\.\w+$/i);
const fileHash = hashMatch ? hashMatch[1] : "";

const defaultHashes = ["b8687dc04fdc435695e7f768a2dd79f8"];

// 1x1 透明 GIF 的 Base64 编码
const transparentGifBase64 = "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

if (fileHash) {
    const saved = $persistentStore.read("icbc_splash_hashes");
    let blockedHashes = saved ? JSON.parse(saved) : defaultHashes;
    
    if (blockedHashes.includes(fileHash)) {
        console.log("[工银E生活] 请求阶段秒杀已知广告: " + fileHash);
        $done({
            response: {
                status: 200,
                headers: { 
                    "Content-Type": "image/gif",
                    "Cache-Control": "no-cache"
                },
                body: transparentGifBase64
            }
        });
    } else {
        $done({});
    }
} else {
    $done({});
}
