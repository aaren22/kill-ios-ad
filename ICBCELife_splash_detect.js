/*
 * 工银E生活 - 开屏广告响应阶段尺寸识别与自动学习
 *
 * 首次遇到新的素材图时，解析图片尺寸:
 * - 宽≥1000 且 竖屏(高 > 宽 × 1.5) = 开屏广告
 * - 自动将其 Hash 写入 $persistentStore ("icbc_splash_hashes")
 * - 返回 404 触发跳过
 * - 下次打开 APP 时，该广告就会在请求阶段直接被秒杀拦截！
 */

const url = $request.url;
const body = $response.body;

if (!body) {
    $done({});
}

const hashMatch = url.match(/\/([a-f0-9]{32})\.\w+$/i);
const fileHash = hashMatch ? hashMatch[1] : "";

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
    console.log("[工银E生活] 识别到新开屏广告: " + w + "x" + h + " " + url);
    
    // 将 Hash 保存到持久化存储
    if (fileHash) {
        const saved = $persistentStore.read("icbc_splash_hashes");
        let blockedHashes = saved ? JSON.parse(saved) : ["b8687dc04fdc435695e7f768a2dd79f8"];
        if (!blockedHashes.includes(fileHash)) {
            blockedHashes.push(fileHash);
            if (blockedHashes.length > 20) {
                blockedHashes = blockedHashes.slice(-20);
            }
            $persistentStore.write(JSON.stringify(blockedHashes), "icbc_splash_hashes");
            console.log("[工银E生活] 已自动学习广告 Hash: " + fileHash);
        }
    }

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
