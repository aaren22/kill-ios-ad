/*
 * 工银E生活开屏广告拦截脚本
 *
 * 拦截 image*.elife.icbc.com.cn 的图片响应
 * 解析图片二进制数据获取尺寸，当检测到超大竖屏图片 (宽≥1000 且 高>宽×1.5) 时返回404错误
 *
 * 兼容 Loon / Quantumult X 的各种 body 类型 (Base64, Uint8Array, ArrayBuffer, BinaryString)
 */

const url = $request.url;
const body = $response.body;

if (!body) {
    $done({});
}

function getBytes(data) {
    if (!data) return null;
    if (data instanceof Uint8Array) return data;
    if (data instanceof ArrayBuffer) return new Uint8Array(data);
    if (typeof data === 'string') {
        try {
            const cleanStr = data.replace(/[\r\n\s]/g, '');
            const decodedStr = atob(cleanStr);
            const bytes = new Uint8Array(decodedStr.length);
            for (let i = 0; i < decodedStr.length; i++) {
                bytes[i] = decodedStr.charCodeAt(i) & 0xFF;
            }
            return bytes;
        } catch (e) {
            const bytes = new Uint8Array(data.length);
            for (let i = 0; i < data.length; i++) {
                bytes[i] = data.charCodeAt(i) & 0xFF;
            }
            return bytes;
        }
    }
    return null;
}

const bytes = getBytes(body);
if (!bytes || bytes.length < 24) {
    $done({});
}

let w = 0, h = 0;

// JPEG
if (bytes[0] === 0xFF && bytes[1] === 0xD8) {
    let pos = 2;
    while (pos < bytes.length - 9) {
        if (bytes[pos] !== 0xFF) { pos++; continue; }
        let marker = bytes[pos + 1];
        if (marker === 0xFF) { pos++; continue; }
        if (marker === 0xD9) break;
        if (marker === 0x00 || marker === 0xD8 || (marker >= 0xD0 && marker <= 0xD7)) {
            pos += 2; continue;
        }
        let segLen = (bytes[pos + 2] << 8) | bytes[pos + 3];
        if ((marker >= 0xC0 && marker <= 0xCF) && marker !== 0xC4 && marker !== 0xC8 && marker !== 0xCC) {
            h = (bytes[pos + 5] << 8) | bytes[pos + 6];
            w = (bytes[pos + 7] << 8) | bytes[pos + 8];
            break;
        }
        pos += 2 + segLen;
    }
}
// PNG
else if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47) {
    w = (bytes[16] << 24) | (bytes[17] << 16) | (bytes[18] << 8) | bytes[19];
    h = (bytes[20] << 24) | (bytes[21] << 16) | (bytes[22] << 8) | bytes[23];
}
// GIF
else if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) {
    w = bytes[6] | (bytes[7] << 8);
    h = bytes[8] | (bytes[9] << 8);
}

// 判定开屏广告：宽≥1000 且 竖屏(高 > 宽 × 1.5)
if (w >= 1000 && h > w * 1.5) {
    console.log("[工银E生活] 成功拦截开屏广告图片: " + w + "x" + h + " " + url);
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
