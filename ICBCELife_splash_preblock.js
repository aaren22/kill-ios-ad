/*
 * 工银E生活 - 开屏广告请求阶段秒杀预拦截
 *
 * 检查请求 URL 中的图片 Hash 是否已被记录为开屏广告：
 * - 若在黑名单中：直接返回 404 (0 延迟秒杀，不下载图片)
 * - 若不在黑名单：放行给响应阶段做尺寸识别学习
 */

const url = $request.url;
const hashMatch = url.match(/\/([a-f0-9]{32})\.\w+$/i);
const fileHash = hashMatch ? hashMatch[1] : "";

// 默认内置的已知开屏广告 Hash 列表
const defaultHashes = ["b8687dc04fdc435695e7f768a2dd79f8"];

if (fileHash) {
    const saved = $persistentStore.read("icbc_splash_hashes");
    let blockedHashes = saved ? JSON.parse(saved) : defaultHashes;
    
    if (blockedHashes.includes(fileHash)) {
        console.log("[工银E生活] 请求阶段秒杀已知广告: " + fileHash);
        $done({
            response: {
                status: 404,
                headers: { "Content-Type": "text/plain" },
                body: "Not Found"
            }
        });
    } else {
        $done({});
    }
} else {
    $done({});
}
