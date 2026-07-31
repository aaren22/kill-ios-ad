/*
 * i百联开屏广告拦截脚本
 *
 * 拦截接口: mobile.bl.com/app/site/queryCutAdDeployv2.htm
 *
 * 逻辑:
 * 精确只清空开屏广告位 (resourceId === "259") 的广告列表，
 * 绝不影响 259003(美妆)、259005(到家) 等正常的首页频道金刚位图标。
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
                // 仅拦截开屏广告位 resourceId === "259"
                if (String(res.resourceId) === "259") {
                    if (res.advList && res.advList.length > 0) {
                        console.log("[i百联] 精确清空开屏广告 (resourceId=259, 数量=" + res.advList.length + ")");
                        res.advList = [];
                        modified = true;
                    }
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
