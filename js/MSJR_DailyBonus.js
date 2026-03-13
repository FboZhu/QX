/*
美素佳儿 签到

[task_local]
# 签到       
39 11 * * * https://raw.githubusercontent.com/FboZhu/QX/refs/heads/main/js/MSJR_DailyBonus.js, tag=MSJR, enabled=true

[rewrite_local]
# 获取Token
^https:\/\/metaverse\.rfc-friso\.com\/exchange\/userInfo url script-response-body https://raw.githubusercontent.com/FboZhu/QX/refs/heads/main/js/MSJR_DailyBonus.js

[mitm]
hostname = metaverse.rfc-friso.com

*/

// 配置常量
const CONFIG = {
    LOG_DETAILS: false,
    STOP_DELAY: '0',
    TIMEOUT: 0,
    MIN_WAIT_TIME: 2000,
    MAX_WAIT_TIME: 5000,
    SKIP: false
};

// API配置
const API_CONFIG = {
    BASE_URL: 'https://metaverse.rfc-friso.com',
    ENDPOINTS: {
        USER_INFO: '/exchange/userInfo',
        SIGN: '/task/signIn',
        TASK: '/point/pointOperate',
        INTERACTION: '/organicRanch/findInteraction'
    },
    TASK_GROUPS: [
        [202, 203, 204, 205, 206],
        [502, 503, 504]
    ]
};

// 默认请求头
const DEFAULT_HEADERS = {
    'Host': 'metaverse.rfc-friso.com',
    'accept': 'application/json, text/plain, */*',
    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36 MicroMessenger/7.0.20.1781(0x6700143B) NetType/WIFI MiniProgramEnv/Mac MacWechat/WMPF MacWechat/3.8.7(0x13080712) UnifiedPCMacWechat(0xf2641701) XWEB/18788',
    'content-type': 'application/json; charset=utf-8',
    'referer': 'https://servicewechat.com/wx6c4fe3c0fee2c581/123/page-frame.html',
    'sec-fetch-site': 'cross-site',
    'sec-fetch-mode': 'cors',
    'sec-fetch-dest': 'empty',
    'accept-language': 'zh-CN,zh;q=0.9',
    'priority': 'u=1, i'
};

let $nobyda = nobyda();
let merge = {};
let KEY = '';

function shouldSkip() {
    return CONFIG.SKIP === true;
}

function getRandomWaitTime(minTime = CONFIG.MIN_WAIT_TIME) {
    return Math.floor(Math.random() * (CONFIG.MAX_WAIT_TIME - minTime + 1)) + minTime;
}

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function Wait(readDelay, isInit = false) {
    if (!readDelay || readDelay === '0') return 0;
    if (typeof readDelay === 'string') {
        const cleanDelay = readDelay.replace(/"|＂|'|＇/g, '');
        if (!cleanDelay.includes('-')) return parseInt(cleanDelay) || 0;
        const [min, max] = cleanDelay.split("-").map(Number);
        return isInit ? readDelay : Math.floor(Math.random() * (max - min + 1)) + min;
    }
    if (typeof readDelay === 'number') return readDelay > 0 ? readDelay : 0;
    return 0;
}

/**
 * 获取用户信息
 */
function UserInfo(name) {
    merge.TotalMoney = merge.TotalMoney || {};
    merge.MSJRUserInfo = {};
    return new Promise(resolve => {
        if (shouldSkip()) {
            resolve();
            return;
        }
        $nobyda.get({
            url: `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USER_INFO}`,
            headers: {
                token: KEY,
                ...DEFAULT_HEADERS
            }
        }, (error, response, data) => {
            try {
                if (error) throw new Error(error);
                const result = JSON.parse(data);
                if (result.result === 1 && result.mdata?.userInfo) {
                    const points = result.mdata.userInfo.pointAmount || 0;
                    merge.TotalMoney[name] = points;
                    merge.MSJRUserInfo.notify = `美素佳儿-查询成功，积分: ${points}`;
                    merge.MSJRUserInfo.success = 1;
                } else {
                    CONFIG.SKIP = true;
                    const msg = result.message || '未知';
                    merge.MSJRUserInfo.notify = "美素佳儿-查询失败: " + msg;
                    merge.MSJRUserInfo.fail = 1;
                }
            } catch (e) {
                CONFIG.SKIP = true;
                $nobyda.AnError("用户信息-查询", "MSJRUserInfo", e, response, data);
            } finally {
                resolve();
            }
        });
        if (CONFIG.TIMEOUT) setTimeout(resolve, CONFIG.TIMEOUT);
    });
}

/**
 * 签到
 */
function MSJRSign(delay) {
    merge.MSJRSign = {};
    return new Promise(resolve => {
        if (shouldSkip()) {
            resolve();
            return;
        }
        setTimeout(() => {
            $nobyda.post({
                url: `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SIGN}`,
                headers: {
                    token: KEY,
                    ...DEFAULT_HEADERS
                },
                body: JSON.stringify({ isLoading: false })
            }, (error, response, data) => {
                try {
                    if (error) throw new Error(error);
                    const result = JSON.parse(data);
                    const msg = result.message || '未知';
                    if (result.result === 1) {
                        merge.MSJRSign.notify = "美素佳儿-签到成功";
                        merge.MSJRSign.success = 1;
                    } else {
                        merge.MSJRSign.notify = "美素佳儿-签到失败: " + msg;
                        merge.MSJRSign.fail = 1;
                    }
                } catch (e) {
                    $nobyda.AnError("美素佳儿-签到", "MSJRSign", e, response, data);
                } finally {
                    resolve();
                }
            });
        }, delay);
        if (CONFIG.TIMEOUT) setTimeout(resolve, CONFIG.TIMEOUT + delay);
    });
}

/**
 * 单个任务执行
 */
function MSJRTask(delay, taskType) {
    merge.MSJRTask = merge.MSJRTask || { success: 0, fail: 0 };
    return new Promise(resolve => {
        if (shouldSkip()) {
            resolve();
            return;
        }
        setTimeout(() => {
            $nobyda.post({
                url: `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TASK}`,
                headers: {
                    token: KEY,
                    ...DEFAULT_HEADERS,
                    'content-type': 'application/x-www-form-urlencoded'
                },
                body: `taskType=${taskType}&isLoading=false`
            }, (error, response, data) => {
                try {
                    if (error) throw new Error(error);
                    const result = JSON.parse(data);
                    const msg = result.message || '未知';
                    if (result.result === 1) {
                        merge.MSJRTask.success = (merge.MSJRTask.success || 0) + 1;
                    } else {
                        merge.MSJRTask.fail = (merge.MSJRTask.fail || 0) + 1;
                        merge.MSJRTask.failDetail = merge.MSJRTask.failDetail || [];
                        merge.MSJRTask.failDetail.push(`任务${taskType}失败: ${msg}`);
                    }
                } catch (e) {
                    $nobyda.AnError("美素佳儿-任务", "MSJRTask", e, response, data);
                } finally {
                    resolve();
                }
            });
        }, delay);
        if (CONFIG.TIMEOUT) setTimeout(resolve, CONFIG.TIMEOUT + delay);
    });
}

function shuffleArray(arr) {
    const shuffled = [...arr];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

/**
 * 按分组随机顺序执行所有任务
 */
async function randomDelayTask(delay) {
    if (shouldSkip()) return;

    merge.MSJRTask = { success: 0, fail: 0 };

    for (const group of API_CONFIG.TASK_GROUPS) {
        const shuffled = shuffleArray(group);
        for (const taskType of shuffled) {
            if (shouldSkip()) break;

            const waitTime = getRandomWaitTime();
            await wait(waitTime);

            await MSJRTask(delay, taskType);
        }
        if (shouldSkip()) break;
    }
}

/**
 * 牧场互动任务
 */
function MSJRInteraction(delay) {
    merge.MSJRInteraction = {};
    return new Promise(resolve => {
        if (shouldSkip()) {
            resolve();
            return;
        }
        setTimeout(() => {
            $nobyda.post({
                url: `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.INTERACTION}`,
                headers: {
                    token: KEY,
                    ...DEFAULT_HEADERS,
                    'content-type': 'application/x-www-form-urlencoded'
                },
                body: ''
            }, (error, response, data) => {
                try {
                    if (error) throw new Error(error);
                    const result = JSON.parse(data);
                    const msg = result.message || '未知';
                    if (result.result === 1) {
                        merge.MSJRInteraction.notify = "美素佳儿-牧场互动成功";
                        merge.MSJRInteraction.success = 1;
                    } else {
                        merge.MSJRInteraction.notify = "美素佳儿-牧场互动失败: " + msg;
                        merge.MSJRInteraction.fail = 1;
                    }
                } catch (e) {
                    $nobyda.AnError("美素佳儿-牧场互动", "MSJRInteraction", e, response, data);
                } finally {
                    resolve();
                }
            });
        }, delay);
        if (CONFIG.TIMEOUT) setTimeout(resolve, CONFIG.TIMEOUT + delay);
    });
}

/**
 * 通知
 */
function notify() {
    return new Promise(resolve => {
        try {
            const lines = [];
            const beforeMoney = merge.TotalMoney?.before ?? 0;
            const afterMoney = merge.TotalMoney?.after ?? 0;
            lines.push(`美素佳儿任务完成，余额：${beforeMoney} -> ${afterMoney}`);
            if (merge.MSJRSign && merge.MSJRSign.notify) {
                lines.push(merge.MSJRSign.notify);
            }
            if (merge.MSJRTask) {
                const taskSuccess = merge.MSJRTask.success ?? 0;
                const taskFail = merge.MSJRTask.fail ?? 0;
                lines.push(`美素佳儿-任务：成功${taskSuccess}次，失败${taskFail}次`);
                if (merge.MSJRTask.failDetail?.length) {
                    lines.push(...merge.MSJRTask.failDetail);
                }
            }
            if (merge.MSJRInteraction && merge.MSJRInteraction.notify) {
                lines.push(merge.MSJRInteraction.notify);
            }
            if (shouldSkip()) {
                lines.unshift('⚠️ 检测到Token失效，已跳过后续操作');
            }
            console.log(lines.join('\n'));
            $nobyda.notify('', '', lines.join('\n'));
        } catch (e) {
            $nobyda.notify('通知模块 ' + e.name + '‼️', '', e.message);
        } finally {
            resolve();
        }
    });
}

/**
 * 主流程
 */
async function all(cookie) {
    try {
        KEY = cookie.token;
        merge = {};
        $nobyda.num++;

        await UserInfo("before");
        if (shouldSkip()) {
            await notify();
            return;
        }
        await wait(getRandomWaitTime());

        await MSJRSign(Wait(CONFIG.STOP_DELAY));
        await wait(getRandomWaitTime());

        await randomDelayTask(Wait(CONFIG.STOP_DELAY));
        await wait(getRandomWaitTime());

        await MSJRInteraction(Wait(CONFIG.STOP_DELAY));
        await wait(getRandomWaitTime());

        await UserInfo("after");
        await notify();
    } catch (error) {
        $nobyda.AnError("主执行流程", "all", error);
    }
}

/**
 * 从响应/请求中获取 Cookie（Token）
 */
function GetCookie() {
    const req = $request;
    const resp = $response;
    if (!req || req.method === 'OPTIONS') return;
    try {
        const url = req.url || '';
        let body = resp.body || '';
        let bodyData = null;
        if (body) {
            try {
                bodyData = typeof body === 'string' ? JSON.parse(body) : body;
            } catch (e) {
                bodyData = null;
            }
        }
        let token = req.headers?.token || req.headers?.Token || '';
        if (/metaverse\.rfc-friso\.com\/exchange\/userInfo/.test(url)) {
            const isSuccess = bodyData && bodyData.result === 1 && bodyData.mdata?.userInfo;
            if (isSuccess || token) {
                if (token) {
                    let existedRaw = $nobyda.read('MSJRCookies');
                    let existed = null;
                    try {
                        existed = typeof existedRaw === 'string' ? JSON.parse(existedRaw) : existedRaw;
                    } catch (e) {
                        existed = null;
                    }
                    if (existed && existed.token === token) return;
                    const tokenData = { token };
                    const writeResult = $nobyda.write(JSON.stringify(tokenData, null, 2), 'MSJRCookies');
                    console.log('美素佳儿 获取 token 成功: ' + JSON.stringify(tokenData));
                    $nobyda.notify('美素佳儿', '', `写入 Token ${writeResult ? '成功 🎉' : '失败 ‼️'}`);
                } else {
                    throw new Error('Cookie 中未获取到 token');
                }
            }
        }
    } catch (e) {
        $nobyda.notify('GetCookie', '', e?.message || String(e));
    }
}

(async function ReadCookie() {
    try {
        const cookiesInfo = "MSJRCookies";
        const cookiesData = $nobyda.read(cookiesInfo);
        if ($nobyda.isRequest) {
            GetCookie();
        } else if (cookiesData) {
            let cookies;
            try {
                cookies = typeof cookiesData === 'string' ? JSON.parse(cookiesData) : cookiesData;
            } catch (e) {
                throw new Error('Cookie 数据格式错误');
            }
            const timeout = parseInt($nobyda.read("TimeOut")) || CONFIG.TIMEOUT;
            const delay = Wait($nobyda.read("Delay"), true) || Wait(CONFIG.STOP_DELAY, true);
            CONFIG.TIMEOUT = timeout;
            CONFIG.STOP_DELAY = delay;
            $nobyda.num = 0;
            if (cookies && cookies.token) {
                // 主流程启动前随机等待 0-15 分钟
                const initWaitMin = 0;                 // 0 分钟（毫秒）
                const initWaitMax = 15 * 60 * 1000;   // 15 分钟（毫秒）
                const initWaitMs = Math.floor(Math.random() * (initWaitMax - initWaitMin + 1)) + initWaitMin;
                console.log('美素佳儿 主流程将在 ' + Math.round(initWaitMs / 60000) + ' 分钟后开始');
                await wait(initWaitMs);
                await all(cookies);
            } else {
                throw new Error('Cookie 中缺少 token');
            }
            $nobyda.time();
        } else {
            throw new Error('脚本终止, 未获取 Cookie ‼️');
        }
    } catch (error) {
        $nobyda.notify("美素佳儿 签到", "", error.message || JSON.stringify(error));
    } finally {
        if ($nobyda.isJSBox) $intents.finish($nobyda.st);
        $nobyda.done();
    }
})();

function nobyda() {
    const start = Date.now();
    const isRequest = typeof $request !== "undefined";
    const isSurge = typeof $httpClient !== "undefined";
    const isQuanX = typeof $task !== "undefined";
    const isLoon = typeof $loon !== "undefined";
    const isJSBox = typeof $app !== "undefined" && typeof $http !== "undefined";
    const isNode = typeof require === "function" && !isJSBox;
    const NodeSet = 'MSJRSet.json';

    const node = (() => {
        if (isNode) {
            const request = require('request');
            const fs = require("fs");
            const path = require("path");
            return { request, fs, path };
        }
        return null;
    })();

    const notify = (title, subtitle, message, rawopts) => {
        const Opts = (rawopts) => {
            if (!rawopts) return rawopts;
            if (typeof rawopts === 'string') {
                if (isLoon) return rawopts;
                if (isQuanX) return { 'open-url': rawopts };
                if (isSurge) return { url: rawopts };
                return undefined;
            }
            if (typeof rawopts === 'object') {
                if (isLoon) return { openUrl: rawopts.openUrl || rawopts.url || rawopts['open-url'], mediaUrl: rawopts.mediaUrl || rawopts['media-url'] };
                if (isQuanX) return { 'open-url': rawopts['open-url'] || rawopts.url || rawopts.openUrl, 'media-url': rawopts['media-url'] || rawopts.mediaUrl };
                if (isSurge) return { url: rawopts.url || rawopts.openUrl || rawopts['open-url'] };
            }
            return undefined;
        };
        if (isQuanX) $notify(title, subtitle, message, Opts(rawopts));
        if (isSurge) $notification.post(title, subtitle, message, Opts(rawopts));
        if (isJSBox) $push.schedule({ title: title, body: subtitle ? subtitle + "\n" + message : message });
    };

    const write = (value, key) => {
        if (isQuanX) return $prefs.setValueForKey(value, key);
        if (isSurge) return $persistentStore.write(value, key);
        if (isNode) {
            try {
                const filePath = node.path.resolve(__dirname, NodeSet);
                if (!node.fs.existsSync(filePath)) node.fs.writeFileSync(filePath, '{}');
                const dataValue = JSON.parse(node.fs.readFileSync(filePath));
                if (value) dataValue[key] = value;
                if (!value) delete dataValue[key];
                return node.fs.writeFileSync(filePath, JSON.stringify(dataValue));
            } catch (e) {
                return AnError('Node.js持久化写入', null, e);
            }
        }
        if (isJSBox) {
            if (!value) return $file.delete(`shared://${key}.txt`);
            return $file.write({ data: $data({ string: value }), path: `shared://${key}.txt` });
        }
    };

    const read = (key) => {
        if (isQuanX) return $prefs.valueForKey(key);
        if (isSurge) return $persistentStore.read(key);
        if (isNode) {
            try {
                const filePath = node.path.resolve(__dirname, NodeSet);
                if (!node.fs.existsSync(filePath)) return null;
                return JSON.parse(node.fs.readFileSync(filePath))[key];
            } catch (e) {
                return AnError('Node.js持久化读取', null, e);
            }
        }
        if (isJSBox) {
            if (!$file.exists(`shared://${key}.txt`)) return null;
            return $file.read(`shared://${key}.txt`).string;
        }
    };

    const adapterStatus = (response) => {
        if (response) {
            if (response.status) response.statusCode = response.status;
            else if (response.statusCode) response.status = response.statusCode;
        }
        return response;
    };

    const get = (options, callback) => {
        options.headers = options.headers || {};
        if (isQuanX) {
            if (typeof options === "string") options = { url: options };
            options.method = "GET";
            $task.fetch(options).then(r => callback(null, adapterStatus(r), r.body), err => callback(err.error, null, null));
        }
        if (isSurge) {
            options.headers['X-Surge-Skip-Scripting'] = false;
            $httpClient.get(options, (err, r, body) => callback(err, adapterStatus(r), body));
        }
        if (isNode) node.request(options, (err, r, body) => callback(err, adapterStatus(r), body));
        if (isJSBox) {
            if (typeof options === "string") options = { url: options };
            options.header = options.headers;
            options.handler = function (resp) {
                let err = resp.error ? JSON.stringify(resp.error) : null;
                let body = resp.data;
                if (typeof body === "object") body = JSON.stringify(body);
                callback(err, adapterStatus(resp.response), body);
            };
            $http.get(options);
        }
    };

    const post = (options, callback) => {
        options.headers = options.headers || {};
        const hasCT = Object.prototype.hasOwnProperty.call(options.headers, 'Content-Type') || Object.prototype.hasOwnProperty.call(options.headers, 'content-type');
        if (!hasCT && options.body) {
            options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
        }
        if (isQuanX) {
            if (typeof options === "string") options = { url: options };
            options.method = "POST";
            $task.fetch(options).then(r => callback(null, adapterStatus(r), r.body), err => callback(err.error, null, null));
        }
        if (isSurge) {
            options.headers['X-Surge-Skip-Scripting'] = false;
            $httpClient.post(options, (err, r, body) => callback(err, adapterStatus(r), body));
        }
        if (isNode) node.request.post(options, (err, r, body) => callback(err, adapterStatus(r), body));
        if (isJSBox) {
            if (typeof options === "string") options = { url: options };
            options.header = options.headers;
            options.handler = function (resp) {
                let err = resp.error ? JSON.stringify(resp.error) : null;
                let body = resp.data;
                if (typeof body === "object") body = JSON.stringify(body);
                callback(err, adapterStatus(resp.response), body);
            };
            $http.post(options);
        }
    };

    const AnError = (name, keyname, error, resp, body) => {
        if (typeof merge !== "undefined" && keyname) {
            if (!merge[keyname].notify) merge[keyname].notify = `${name}: 异常, 已输出日志 ‼️`;
            else merge[keyname].notify += `\n${name}: 异常 ‼️`;
            merge[keyname].error = 1;
        }
    };

    const time = () => {};

    const done = (value = {}) => {
        if (isQuanX) return $done(value);
        if (isSurge) return isRequest ? $done(value) : $done();
    };

    return { AnError, isRequest, isJSBox, isSurge, isQuanX, isLoon, isNode, notify, write, read, get, post, time, done };
}
