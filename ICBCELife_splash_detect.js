/*
 * 工银E生活开屏广告拦截脚本
 *
 * 拦截 image*.elife.icbc.com.cn 的图片响应
 * 解析图片二进制头部获取尺寸，当检测到超大竖屏图片时返回404
 *
 * 开屏广告特征：1125×2436（iPhone全屏，宽≥1000 且 高>宽×1.5）
 * 应用内卡片：340×454（宽<1000，不受影响）
 * 正常素材：横屏/方形（不受影响）
 *
 * binary-body-mode=true 时 $response.body 为 base64
 */

const url = $request.url;
const body = $response.body;

if (!body || body.length === 0) {
    $done({});
}

let raw;
try {
    raw = atob(body);
} catch (e) {
    raw = body;
}

const len = raw.length;

function B(pos) {
    return raw.charCodeAt(pos) & 0xFF;
}

let w = 0, h = 0;

if (B(0) === 0xFF && B(1) === 0xD8) {
    // JPEG
    let pos = 2;
    while (pos < len - 9) {
        if (B(pos) !== 0xFF) { pos++; continue; }
        let marker = B(pos + 1);
        if (marker === 0xFF) { pos++; continue; }
        if (marker === 0xD9) break;
        if (marker === 0x00 || marker === 0xD8 || (marker >= 0xD0 && marker <= 0xD7)) {
            pos += 2; continue;
        }
        let segLen = (B(pos + 2) << 8) | B(pos + 3);
        if ((marker >= 0xC0 && marker <= 0xCF) && marker !== 0xC4 && marker !== 0xC8 && marker !== 0xCC) {
            h = (B(pos + 5) << 8) | B(pos + 6);
            w = (B(pos + 7) << 8) | B(pos + 8);
            break;
        }
        pos += 2 + segLen;
    }
} else if (B(0) === 0x89 && B(1) === 0x50 && B(2) === 0x4E && B(3) === 0x47) {
    // PNG
    if (len >= 24) {
        w = (B(16) << 24) | (B(17) << 16) | (B(18) << 8) | B(19);
        h = (B(20) << 24) | (B(21) << 16) | (B(22) << 8) | B(23);
    }
} else if (B(0) === 0x47 && B(1) === 0x49 && B(2) === 0x46) {
    // GIF
    if (len >= 10) {
        w = B(6) | (B(7) << 8);
        h = B(8) | (B(9) << 8);
    }
}

// 开屏广告：宽≥1000 且 竖屏(高>宽×1.5)
if (w >= 1000 && h > w * 1.5) {
    console.log("[工银E生活] 拦截开屏广告: " + w + "x" + h + " " + url);
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
