[general]
server_check_url = http://www.gstatic.com/generate_204
server_check_timeout = 3000
profile_img_url = https://github.githubassets.com/images/modules/site/integrators/google.png

geo_location_checker = http://ip-api.com/json/?lang=zh-CN, https://raw.githubusercontent.com/KOP-XIAO/QuantumultX/master/Scripts/IP_API.js
resource_parser_url = https://raw.githubusercontent.com/KOP-XIAO/QuantumultX/master/Scripts/resource-parser.js

excluded_routes = 239.255.255.250/32, 24.105.30.129/32
udp_whitelist = 1-442, 444-65535

dns_exclusion_list = *.10099.com.cn, *.cmpassport.com, *.pingan.com.cn
udp_drop_list = 443, STUN, QUIC


[task_local]
39 11,18 * * * https://raw.githubusercontent.com/FboZhu/QX/refs/heads/main/js/MD_DailyBonus.js, tag=MDC, enabled=true


[rewrite_local]
^https:\/\/apiv2\.hichar\.cn\/api\/user\/user\/userInfo url script-response-body https://raw.githubusercontent.com/FboZhu/QX/refs/heads/main/js/MD_DailyBonus.js
^https:\/\/(raw|gist)\.githubusercontent\.com\/ url request-header (\r\n)Accept-Language:.+(\r\n) request-header $1Accept-Language: en-us$2
^https:\/\/github\.com\/ url request-header (\r\n)Accept-Language:.+(\r\n) request-header $1Accept-Language: en-us$2


[rewrite_remote]
# ===== 常用（性能优先） =====
https://ddgksf2013.top/rewrite/BiliBiliAds.conf, tag=哔哩哔哩, img-url=https://raw.githubusercontent.com/FboZhu/QX/main/Icon/BiliBili.png, update-interval=172800, opt-parser=true, enabled=true
https://github.com/ddgksf2013/Rewrite/raw/master/AdBlock/AmapAds.conf, tag=高德地图, img-url=https://raw.githubusercontent.com/FboZhu/QX/main/Icon/GaoDeMap.png, update-interval=172800, opt-parser=false, enabled=true
https://ddgksf2013.top/scripts/bdmap.ads.js, tag=百度地图, img-url=https://raw.githubusercontent.com/FboZhu/QX/main/Icon/BaiduMap.png, update-interval=172800, opt-parser=true, enabled=true
https://github.com/ddgksf2013/Rewrite/raw/master/AdBlock/GoofishAds.conf, tag=闲鱼, img-url=https://raw.githubusercontent.com/FboZhu/QX/main/Icon/Goofish.png, update-interval=172800, opt-parser=false, enabled=true
https://github.com/ddgksf2013/Rewrite/raw/master/AdBlock/SmzdmAds.conf, tag=什么值得买, img-url=https://raw.githubusercontent.com/FboZhu/QX/main/Icon/Smzdm.png, update-interval=172800, opt-parser=false, enabled=true
https://github.com/ddgksf2013/Rewrite/raw/master/AdBlock/WeiboAds.conf, tag=微博, img-url=https://raw.githubusercontent.com/FboZhu/QX/main/Icon/Weibo.png, update-interval=172800, opt-parser=false, enabled=true

https://ddgksf2013.top/rewrite/StartUpAds.conf, tag=墨鱼去开屏, img-url=https://raw.githubusercontent.com/FboZhu/QX/main/Icon/Default.png, update_interval=172800, opt-parser=true, enabled=true
https://ddgksf2013.top/scripts/suishouji.ads.js, tag=随手记, img-url=https://raw.githubusercontent.com/FboZhu/QX/main/Icon/SuiShouJiNote.png, update-interval=172800, opt-parser=true, enabled=true

# ===== 广告净化 =====
https://github.com/ddgksf2013/Rewrite/raw/master/AdBlock/XiaoHongShuAds.conf, tag=小红书, img-url=https://raw.githubusercontent.com/FboZhu/QX/main/Icon/XiaoHongShu.png, update-interval=172800, opt-parser=false, enabled=false
https://github.com/ddgksf2013/Rewrite/raw/master/AdBlock/Ximalaya.conf, tag=喜马拉雅, img-url=https://raw.githubusercontent.com/FboZhu/QX/main/Icon/Ximalaya.png, update-interval=172800, opt-parser=false, enabled=false
https://github.com/ddgksf2013/Rewrite/raw/master/AdBlock/NeteaseAds.conf, tag=网易云, img-url=https://raw.githubusercontent.com/FboZhu/QX/main/Icon/NeteaseMusic.png, update-interval=172800, opt-parser=false, enabled=false
https://github.com/ddgksf2013/Rewrite/raw/master/AdBlock/CaiYunAds.conf, tag=彩云天气, img-url=https://raw.githubusercontent.com/FboZhu/QX/main/Icon/CaiYunTianqi.png, update-interval=172800, opt-parser=false, enabled=false
https://github.com/ddgksf2013/Rewrite/raw/master/AdBlock/YoutubeAds.conf, tag=YouTube, img-url=https://raw.githubusercontent.com/FboZhu/QX/main/Icon/YouTube.png, update-interval=172800, opt-parser=false, enabled=false

https://ddgksf2013.top/scripts/bdpan.ads.js, tag=百度网盘, img-url=https://raw.githubusercontent.com/FboZhu/QX/main/Icon/BaiduNetdisk.png, update_interval=172800, opt-parser=true, enabled=true
https://ddgksf2013.top/scripts/123pan.ads.js, tag=123盘网页, img-url=https://raw.githubusercontent.com/FboZhu/QX/main/Icon/Cloud123.png, update_interval=172800, opt-parser=true, enabled=false
https://github.com/Moli-X/Resources/raw/main/QuantumultX/Rewrite/Keep.conf, tag=Keep, img-url=https://raw.githubusercontent.com/FboZhu/QX/main/Icon/Keep.png, update-interval=172800, opt-parser=true, enabled=false

# ===== 功能增强 / 解锁 =====
https://raw.githubusercontent.com/Maasea/sgmodule/master/WeRead.sgmodule, tag=微信阅读, img-url=https://raw.githubusercontent.com/FboZhu/QX/main/Icon/WeRead.png, update_interval=172800, opt-parser=true, enabled=false
https://raw.githubusercontent.com/NobyDa/Script/master/QuantumultX/Snippet/GoogleCAPTCHA.snippet, tag=Google搜索人机验证, img-url=https://raw.githubusercontent.com/FboZhu/QX/main/Icon/Google.png, update_interval=172800, opt-parser=true, enabled=false

https://github.com/ddgksf2013/Rewrite/raw/master/UnlockVip/Spotify.conf, tag=Spotify音乐, img-url=https://raw.githubusercontent.com/FboZhu/QX/main/Icon/Spotify.png, update-interval=172800, opt-parser=false, enabled=false
https://github.com/ddgksf2013/Scripts/raw/master/12306.js, tag=12306, img-url=https://raw.githubusercontent.com/FboZhu/QX/main/Icon/12306.png, update_interval=172800, opt-parser=true, enabled=false


# ===== 网页 / Safari 优化 =====
https://github.com/ddgksf2013/Rewrite/raw/master/Html/Q-Search.conf, tag=Safari超级搜索, img-url=https://raw.githubusercontent.com/FboZhu/QX/main/Icon/Safari.png, update-interval=172800, opt-parser=false, enabled=false
https://github.com/ddgksf2013/Rewrite/raw/master/Html/General.conf, tag=Google重定向, img-url=https://raw.githubusercontent.com/FboZhu/QX/main/Icon/Google.png, update-interval=172800, opt-parser=false, enabled=false
https://github.com/ddgksf2013/Rewrite/raw/master/Html/EndlessGoogle.conf, tag=谷歌自动翻页, img-url=https://raw.githubusercontent.com/FboZhu/QX/main/Icon/Google.png, update-interval=172800, opt-parser=false, enabled=false
https://github.com/ddgksf2013/Rewrite/raw/master/AdBlock/BingSimplify.conf, tag=必应首页简化, img-url=https://raw.githubusercontent.com/FboZhu/QX/main/Icon/BingSimplify.png, update-interval=172800, opt-parser=true, enabled=false

# ===== 其他 =====
https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/script/zheye/zheye.snippet, tag=知乎, img-url=https://raw.githubusercontent.com/FboZhu/QX/main/Icon/Zhihu.png, update_interval=172800, opt-parser=true, enabled=false
https://github.com/app2smile/rules/raw/master/module/tieba-qx.conf, tag=百度贴吧, img-url=https://raw.githubusercontent.com/FboZhu/QX/main/Icon/BaiduTieba.png, update_interval=172800, opt-parser=true, enabled=false

https://github.com/Moli-X/Resources/raw/main/QuantumultX/Rewrite/Collections.conf, tag=解锁合集, img-url=https://raw.githubusercontent.com/FboZhu/QX/main/Icon/Default.png, update_interval=172800, opt-parser=true, enabled=false




[server_local]



[server_remote]
https://msub.xn--m7r52rosihxm.com/api/v1/client/subscribe?token=be144515a4338d29676a6bc5f6207bb2, tag=MJ, update-interval=172800, opt-parser=false, enabled=true
https://e.hy2yydsapi.top/s/0cd8e5f041800d7f769c5494f03e45ab, tag=EMO, update-interval=172800, opt-parser=true, enabled=true


[dns]
no-system
server = 223.5.5.5
server = 119.29.29.29
server = /*.icloud.com/119.29.29.29
server = /*.apple.com/119.29.29.29


[policy]

static=苹果服务, direct, proxy, img-url=https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Apple.png
static=全球加速, direct, proxy, img-url=https://raw.githubusercontent.com/Orz-3/mini/master/Color/Global.png
static=哔哩哔哩, direct, proxy, img-url=https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/bilibili.png
static=声田音乐, direct, proxy, img-url=https://raw.githubusercontent.com/Orz-3/mini/master/Color/Spotify.png
static=国际媒体, direct, proxy, img-url=https://raw.githubusercontent.com/Orz-3/mini/master/Color/Streaming.png
static=兜底分流, direct, proxy, img-url=https://raw.githubusercontent.com/Orz-3/mini/master/Color/Final.png



[filter_remote]
https://raw.githubusercontent.com/ddgksf2013/Filter/master/Unbreak.list, tag=规则修正, img-url=https://github.com/Koolson/Qure/raw/master/IconSet/mini/Direct.png, force-policy=direct, update-interval=172800, opt-parser=true, enabled=true
https://raw.githubusercontent.com/Cats-Team/AdRules/main/qx.conf, tag=广告终结者, img-url=https://github.com/Koolson/Qure/raw/master/IconSet/mini/Advertising.png, force-policy=reject, update-interval=172800, opt-parser=true, enabled=true
https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/QuantumultX/WeChat/WeChat.list, tag=微信直连, img-url=https://github.com/Koolson/Qure/raw/master/IconSet/mini/WeChat.png, force-policy=direct, update-interval=172800, opt-parser=false, enabled=true
https://raw.githubusercontent.com/ddgksf2013/Filter/master/GoogleVoice.list, tag=Google Voice, img-url=https://raw.githubusercontent.com/ddgksf2013/Icon/master/qx/googlevoice.png, force-policy=全球加速, update-interval=172800, opt-parser=true, enabled=true
https://gist.githubusercontent.com/ddgksf2013/cb4121e8b5c5d865cc949cb8120320c4/raw/Ai.yaml, tag=Ai-All-In-One, img-url=https://raw.githubusercontent.com/ddgksf2013/Icon/master/qx/ai.png, force-policy=全球加速, update-interval=172800, opt-parser=true, enabled=true
https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/QuantumultX/Spotify/Spotify.list, tag=Spotify音乐, img-url=https://github.com/Koolson/Qure/raw/master/IconSet/mini/Spotify.png, force-policy=声田音乐, update-interval=172800, opt-parser=true, enabled=true
https://raw.githubusercontent.com/ddgksf2013/Filter/master/Streaming.list, tag=国际媒体, force-policy=国际媒体, img-url=https://github.com/Koolson/Qure/raw/master/IconSet/mini/GlobalMedia.png, update-interval=172800, opt-parser=true, enabled=true
https://raw.githubusercontent.com/ddgksf2013/Filter/master/StreamingSE.list, tag=哔哩哔哩, img-url=https://github.com/Koolson/Qure/raw/master/IconSet/mini/bilibili.png, force-policy=哔哩哔哩, update-interval=172800, opt-parser=true, enabled=true
https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/QuantumultX/Apple/Apple.list, tag=苹果服务, img-url=https://github.com/Koolson/Qure/raw/master/IconSet/mini/Apple.png, force-policy=direct, update-interval=172800, opt-parser=true, enabled=true
https://raw.githubusercontent.com/ConnersHua/RuleGo/master/Surge/Ruleset/Proxy.list, tag=全球加速, force-policy=全球加速, img-url=https://github.com/Koolson/Qure/raw/master/IconSet/mini/Global.png, update-interval=172800, opt-parser=true, enabled=true
https://raw.githubusercontent.com/VirgilClyne/GetSomeFries/main/ruleset/ASN.China.list, tag=国内网站, img-url=https://github.com/Koolson/Qure/raw/master/IconSet/mini/China.png, force-policy=direct, update-interval=172800, opt-parser=true, enabled=true




[filter_local]
host, ad.12306.cn, direct
geoip, cn, direct
final, 兜底分流


[http_backend]


[mitm]
passphrase = 2500BF54
p12 = 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

skip_validating_cert = true
force_sni_domain_name = false

hostname = -*.apple.com, raw.githubusercontent.com,gist.githubusercontent.com,github.com, apiv2.hichar.cn