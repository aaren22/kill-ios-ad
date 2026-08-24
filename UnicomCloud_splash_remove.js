/*
 * 联通云盘开屏广告与首页弹窗广告拦截脚本
 *
 * 拦截接口:
 * - s.pan.wo.cn/wohome/open/v1/resource/query/open-screen/app
 * - s.pan.wo.cn/api/bff/resource/query/popupAndFlow
 *
 * 原理:
 * 返回标准的接口成功结构 {"meta":{"code":"200","message":"成功"},"result":null}，
 * 使 App 正常完成反序列化并识别到广告列表为空，从而直接跳过开屏广告，
 * 避免因直接 reject/返回空数据导致 App 捕获解析异常而回退展示本地历史缓存广告。
 */

const emptyBody = JSON.stringify({
    meta: {
        code: "200",
        message: "成功"
    },
    result: null
});

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
