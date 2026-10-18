/********************************
 * HeMa_ad_remove.js - 盒马 App 首页/我的页/信息流广告过滤
 *
 * 逻辑来源：zirawell/R-Store 的 freshippo.js (Version 1.0)
 * https://github.com/zirawell/R-Store/blob/main/Res/Scripts/AntiAd/freshippo.js
 * 本地化收录原因：原脚本托管在第三方仓库，URL 失效则插件失效；
 * 收进本仓库后由本仓库版本控制，与 HeMa.lpx 同步更新。
 * 适配：逻辑未改，仅加头部注释；Loon 下以 http-response + requires-body=true 运行。
 *
 * 作用：
 * - queryindexpage（首页）：只保留 sceneTemplateId 509/738 的栏目，清空 secondFloor
 * - querymypage（我的页）：只保留白名单内的 sceneTemplateId 栏目
 * - querytabfeedstream（信息流）："盒马商家"页直接掏空，过滤 sceneType 100004
 *
 * 注意：白名单是硬编码的栏目 ID，盒马 App 更新后 ID 可能漂移；
 * 若某天首页/我的页出现大片空白，先停用 HeMa.lpx 的 [Script] 段再排查。
 ********************************/

const url = $request.url;

if (!$response.body) $done({});

let obj = JSON.parse($response.body);

// 首页
if (url.indexOf("queryindexpage") != -1) {
  const sceneTemplateId = [
    "509",
    "738"
  ];

  const spmcCode = [
    "waterfall",          //瀑布流
    //"channelsite",      //推荐坑位
    //"growthhacking",    //用户增长
    "category"            //分类
  ];

  /************* App *************/
  // 首页栏目优化
  if (obj?.data?.scenes?.length > 0) {
    obj.data.scenes = obj.data.scenes.filter(scene => sceneTemplateId.includes(scene.sceneTemplateId));
  }
  // 首页顶屏
  if (obj.data?.secondFloor) {
    obj.data.secondFloor = {};
  }

  /******** Wechat Applet ********/
  // 首页栏目优化
  if (obj?.data?.model?.scenes?.length > 0) {
    obj.data.model.scenes = obj.data.model.scenes.filter(scene => spmcCode.includes(scene.spmc));
  }

// 我的页
} else if (url.indexOf("querymypage") != -1) {
  const sceneTemplateId = [
    "906",
    "907",
    "198",
    "286",
    "431",
    "185",
    "230",
    "978",
    "709",
    "432",
    "403",
    "350"
  ];
  if (obj?.data?.scenes?.length > 0) {
    obj.data.scenes = obj.data.scenes.filter(scene => sceneTemplateId.includes(scene.sceneTemplateId));
  }

} else if (url.indexOf("querytabfeedstream") != -1) {
  // 我的页及购物车页推荐信息流
  if (obj?.data?.pageName && obj.data.pageName.includes("盒马商家")) {
    obj.data = {};
  }
  // 首页顶屏
  if (obj.data?.scenes?.length > 0) {
    obj.data.scenes = obj.data.scenes.filter(item => item.sceneType !== "100004");
  }
} else {
  $done({});
}

$done({body: JSON.stringify(obj)});
