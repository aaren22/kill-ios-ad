/*
 * 漫步者 Edifier Connect 开屏活动与跑马灯广告拦截脚本
 *
 * 拦截接口:
 * - admin-app.edifier.com/edifier_provider/public/getAppMarqueeForApp
 *
 * 原理:
 * 漫步者 iOS 客户端具有本地广告持久化缓存机制（SQLite/UserDefaults）。
 * 客户端在启动时首先读取本地缓存中未过期的广告记录（如 id: 1120，有效截止时间至 2026-09-18）。
 * 若本地存在未过期的记录，客户端会在启动时进入开屏广告容器（显示“跳过”倒计时按钮）。
 *
 * 如果拦截时仅返回空数组 []，客户端的增量更新循环无法遍历到旧广告记录，导致本地缓存中的 1120 无法被覆盖清除，
 * 从而在后续每次冷启动时仍会唤起开屏容器（呈现为无广告素材、但残留“跳过”按钮的 2 秒黑屏/启动图）。
 *
 * 本脚本通过 Mock 返回一组将对应广告 ID（覆盖 1100~1150 等已知及邻近广告位）显式标记为已下线、已过期且不在任何区域展示的结构体：
 * - publish: false
 * - publish_end_timestamp: 0
 * - show_area: 0 (不在开屏展示)
 * 客户端收到后会执行 update 逻辑，将本地持久化缓存中的广告状态全部刷新为失效。
 * 在下次冷启动时，本地已无有效开屏广告记录，从而彻底跳过开屏页，秒进主界面。
 */

const items = [];
for (let id = 1100; id <= 1150; id++) {
    items.push({
        id: id,
        material_id: 0,
        event: 0,
        img: "",
        title_text_color: "#FFFFFF",
        title: "",
        remark: "",
        app: "EdifierConnect",
        weight: 0,
        publish: false,
        publish_start_time: "1970-01-01 00:00:00",
        publish_end_time: "1970-01-01 00:00:00",
        lock_status: 1,
        route_path: "",
        auth: false,
        show_area: 0,
        create_time: "1970-01-01 00:00:00",
        link_type: "post",
        link_id: 0,
        link_title: "",
        link_data: "null",
        publish_start_timestamp: 0,
        publish_end_timestamp: 0
    });
}

const emptyBody = JSON.stringify(items);

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
