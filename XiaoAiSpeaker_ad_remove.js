/*
 * 小爱音箱开屏广告与弹窗广告拦截脚本
 *
 * 拦截接口:
 * - marketing-aibox.v.mitvos.com / info.mina.xiaoaisound.com:
 *   - /advertise/v2/splash (开屏广告)
 *   - /advertise/tab/alert (Tab 切换弹窗)
 *   - /popup/home/v2 (首页弹窗)
 *
 * 原理:
 * 小爱音箱 iOS 端具有本地广告离线/弱网缓存机制。当开屏广告请求失败（如 reject / 0 字节 /
 * 缺少 code 字段的空字典 {}）时，客户端反序列化异常会触发 catch 分支，转而读取本地历史缓存广告进行兜底展示。
 * 本脚本在请求阶段（http-request）直接 Mock 返回符合业务数据模型的结构化成功响应：
 * {"code": 0, "message": "Success", "data": {"items": []}}
 * 客户端识别到数据成功且广告项为空，自动跳过开屏，彻底避免触发本地缓存广告回退展示。
 */

const url = $request.url || "";

// 若为首页 Banner 轮播，不予拦截，直接放行
if (url.indexOf("/advertise/banner") !== -1) {
    $done({});
} else {
    let mockData = {
        code: 0,
        message: "Success",
        data: {}
    };

    if (url.indexOf("/advertise/") !== -1 && url.indexOf("splash") !== -1) {
        // 开屏广告结构
        mockData.data = {
            totalMaxTimes: 0,
            items: []
        };
    } else if (url.indexOf("/advertise/tab/alert") !== -1) {
        // Tab 弹窗结构
        mockData.data = [];
    } else if (url.indexOf("/popup/") !== -1) {
        // 首页弹窗结构
        mockData.data = {
            popups: []
        };
    }

    const bodyStr = JSON.stringify(mockData);

    if (typeof $response !== "undefined") {
        $done({ body: bodyStr });
    } else {
        $done({
            response: {
                status: 200,
                headers: {
                    "Content-Type": "application/json; charset=utf-8"
                },
                body: bodyStr
            }
        });
    }
}
