/*
 * 漫步者 Edifier Connect 广告拦截脚本
 *
 * 拦截接口:
 * - admin-app.edifier.com/edifier_provider/public/getAppMarqueeForApp
 *
 * 原理:
 * 漫步者 iOS 客户端在启动时请求 getAppMarqueeForApp 获取跑马灯与开屏活动广告。
 * 当请求携带的时间戳命中服务端时，服务端返回 {"code": 1, "msg": "无更新"}，
 * 客户端会直接调取本地历史持久化广告进行兜底展示（在埋点中体现为持续 2 秒的“广告页”）。
 * 若接口直接断开连接或报错，客户端解析异常也会导致回退加载本地历史缓存。
 *
 * 该接口在正常下发数据时的真实模型为顶层 JSON 数组（Array of Marquee Objects）。
 * 本脚本在请求阶段（http-request）直接短路并 Mock 返回合法的空数组 "[]"（HTTP 200），
 * 客户端反序列化成功且识别到广告列表为空，会自动刷新并清空本地历史广告缓存，
 * 从而彻底跳过活动广告页与跑马灯展示。
 */

const emptyBody = "[]";

if (typeof $response !== "undefined") {
    $done({ body: emptyBody });
} else {
    $done({
        response: {
            status: 200,
            headers: {
                "Content-Type": "application/json; charset=utf-8"
            },
            body: emptyBody
        }
    });
}
