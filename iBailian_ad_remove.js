/*
 * i百联开屏广告及应用内广告拦截脚本
 *
 * 拦截接口: mobile.bl.com/app/site/queryCutAdDeployv2.htm
 *
 * 核心逻辑:
 * 当请求开屏广告位(resourceId=259)及其他广告位时，
 * 将返回数据中所有 advList 数组清空为 []。
 * APP收到空广告列表后，直接跳过开屏过程，快速进入应用。
 */

let body = $response.body;

if (!body) {
    $done({});
}

try {
    let resp;
    try {
        resp = JSON.parse(body);
    } catch (e) {
        resp = JSON.parse(atob(body));
    }

    if (resp && resp.obj) {
        let obj = typeof resp.obj === 'string' ? JSON.parse(resp.obj) : resp.obj;
        let modified = false;

        if (obj && obj.otherResource && Array.isArray(obj.otherResource)) {
            obj.otherResource.forEach(function(res) {
                if (res.advList && res.advList.length > 0) {
                    console.log("[i百联] 成功清空广告位 resourceId=" + res.resourceId + " (" + res.advList.length + " 条广告)");
                    res.advList = [];
                    modified = true;
                }
            });
        }

        if (modified) {
            resp.obj = JSON.stringify(obj);
            $done({ body: JSON.stringify(resp) });
        } else {
            $done({});
        }
    } else {
        $done({});
    }
} catch (err) {
    console.log("[i百联] 脚本执行异常: " + err.message);
    $done({});
}
