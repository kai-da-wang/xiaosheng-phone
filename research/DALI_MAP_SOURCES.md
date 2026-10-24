# 大理地图数据

提取时间：2026-10-24。来源：OpenStreetMap contributors，经 Overpass API 获取。

- 查询接口：https://overpass-api.de/api/interpreter
- 洱海湖面：OSM relation 254433，包含外边界与岛屿内环。
- 大理古城范围：OSM way 767449039。
- 才村：OSM node 1303133718。
- 双廊：OSM node 13816802951。
- 龙龛码头：OSM way 298035384，地点标记位于原始边界框中心。
- 道路：查询区域内1726段 motorway/trunk/primary/secondary/tertiary 级别的实际OSM道路，按道路类别合并绘制，不包含实时路况或路线规划。
- 地图使用固定区域的本地矢量数据，未使用或打包OpenStreetMap瓦片。

原始查询：

```overpass
[out:json][timeout:45];
(
 nwr["name"="洱海"](25.5,100.0,26.1,100.5);
 way["highway"~"^(motorway|trunk|primary|secondary|tertiary)$"](25.5,99.98,26.03,100.4);
 nwr["name"~"^(大理古城|才村|龙龛|龙龛码头|喜洲|双廊|下关|苍山)$"](25.5,99.98,26.03,100.4);
);
out geom;
```

## 转换与使用

`dist/dali-map-data.js` 为查询结果的本地几何提取。经纬度映射为固定地区的等距近似坐标，x=(lon−100.02)×2500，y=(26.02−lat)×2765；用于游戏内选点和浏览。缩放不请求第三方服务。地图位置标记代表所选地点，不代表人物真实行程或访客GPS位置。

几何数据基于 OpenStreetMap，© OpenStreetMap contributors，按 Open Data Commons Open Database License (ODbL) 1.0 提供：https://opendatacommons.org/licenses/odbl/1-0/ 。原始数据库/版权说明：https://www.openstreetmap.org/copyright 。本项目提取的地理数据继续遵循ODbL；界面、样式和说明文字独立维护。地图内持续显示可点击署名。
