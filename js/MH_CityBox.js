/*
CityBox 签到

[task_local]
# 签到       
39 11 * * * https://raw.githubusercontent.com/FboZhu/QX/refs/heads/main/js/MH_CityBox.js, tag=MHCityBox, enabled=true

[rewrite_local]
# 获取Token
^https:\/\/api\.icitybox\.cn\/api\/user\/get_user_info url script-response-body https://raw.githubusercontent.com/FboZhu/QX/refs/heads/main/js/MH_CityBox.js

[mitm]
hostname = api.icitybox.cn

*/

// 配置常量
const CONFIG = {
    LOG_DETAILS: false,
    STOP_DELAY: '0',
    INIT_DELAY: '0-120000',
    TIMEOUT: 0,
    MIN_WAIT_TIME: 2000,  // 接口间最小等待(毫秒)
    MAX_WAIT_TIME: 5000,  // 接口间最大等待(毫秒)
    MAX_CONCURRENCY: 3, // 多账号最大并行数
    SKIP: false
};

const WX_PUSHER = {
    URL: 'https://wxpusher.zjiecode.com/api/send/message',
    APP_TOKEN: 'AT_boG9xcxlPdixmvmDJYjuesBxH1OMpgLL',
    UID: 'UID_BnvuCofAsHE7FWAuUNAOyVLwCTLk'
};

// API配置
const API_CONFIG = {
    BASE_URL: 'https://api.icitybox.cn',
    ENDPOINTS: {
        USER_INFO: '/api/user/get_user_info',
        SIGN: '/api/user/up_sign',
        DRAW_RESULTS: '/api/roulette_draw/draw_results'
    },
    // 抓包得到的 sign，若服务端按请求校验可改为按算法生成
    SIGN: 'd7f1086401306ebdfd494b9be389c28c'
};

// 默认请求头(与小程序一致)，sign 由缓存或 API_CONFIG.SIGN 提供
const DEFAULT_HEADERS = {
    'Host': 'api.icitybox.cn',
    'accept': 'application/json, text/plain, */*',
    'xweb_xhr': '1',
    'cb-mini-version': '8.1.49',
    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36 MicroMessenger/7.0.20.1781(0x6700143B) NetType/WIFI MiniProgramEnv/Mac MacWechat/WMPF MacWechat/3.8.7(0x13080712) UnifiedPCMacWechat(0xf26415f0) XWEB/17078',
    'channel': 'mini',
    'content-type': 'application/x-www-form-urlencoded',
    'platform-id': '1',
    'platform': 'wap',
    'sec-fetch-site': 'cross-site',
    'sec-fetch-mode': 'cors',
    'sec-fetch-dest': 'empty',
    'referer': 'https://servicewechat.com/wx8434e31068c20849/854/page-frame.html',
    'accept-language': 'zh-CN,zh;q=0.9',
    'priority': 'u=1, i'
};

let $nobyda = nobyda();
function getPayload(result) {
    return result?.body || result?.data || result || {};
}

function getUserIdFromUserInfo(bodyData) {
    const payload = getPayload(bodyData);
    return payload?.id != null ? String(payload.id) : '';
}

function loadTokenStore(rawData) {
    const data = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
        throw new Error('Cookie 数据格式错误');
    }
    return data;
}

function shuffleEntries(entries) {
    const list = Array.isArray(entries) ? [...entries] : [];
    for (let i = list.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [list[i], list[j]] = [list[j], list[i]];
    }
    return list;
}

async function runWithConcurrency(items, worker, limit) {
    // 使用固定数量的 worker，保持多账号并行，同时避免一次发起过多请求
    let nextIndex = 0;
    const workerCount = Math.min(Math.max(1, limit), items.length);
    await Promise.all(Array.from({ length: workerCount }, async () => {
        while (nextIndex < items.length) {
            const item = items[nextIndex++];
            await worker(item);
        }
    }));
}

function shouldSkip(ctx) {
    return ctx.skip;
}

function markExecutionFailure(ctx) {
    ctx.merge.EXECUTION_FAILED = true;
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
function UserInfo(name, ctx) {
    const { merge } = ctx;
    merge.TotalMoney = merge.TotalMoney || {};
    merge.CityBoxUserInfo = {};
    return new Promise(resolve => {
        let timeoutTimer;
        let timedOut = false; // 超时后忽略迟到的请求回调
        if (shouldSkip(ctx)) {
            resolve();
            return;
        }
        const opts = {
            url: `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USER_INFO}`,
            headers: {
                token: ctx.key,
                sign: ctx.sign,
                ...DEFAULT_HEADERS
            }
        };
        $nobyda.get(opts, (error, response, data) => {
            if (timedOut) return;
            if (timeoutTimer) clearTimeout(timeoutTimer);
            try {
                if (error) throw new Error(error);
                const result = JSON.parse(data);
                const msg = result.message || result.msg || '';
                if (result.status === false) {
                    merge.CityBoxUserInfo.notify = "CityBox-查询失败: " + (msg || '未知');
                    merge.CityBoxUserInfo.fail = 1;
                } else {
                    const userData = getPayload(result);
                    const hasUser = result.id != null || userData.id != null || userData.modou != null;
                    if (hasUser) {
                        const points = userData.modou ?? userData.points ?? result.modou ?? 0;
                        merge.TotalMoney[name] = points;
                        merge.CityBoxUserInfo.notify = `CityBox-查询成功，积分: ${points}`;
                        merge.CityBoxUserInfo.success = 1;
                    } else {
                        merge.CityBoxUserInfo.notify = "CityBox-查询失败: " + (msg || '未知');
                        merge.CityBoxUserInfo.fail = 1;
                    }
                }
            } catch (e) {
                markExecutionFailure(ctx);
                $nobyda.AnError("用户信息-查询", "CityBoxUserInfo", e, response, data, ctx);
            } finally {
                resolve();
            }
        });
        if (CONFIG.TIMEOUT) timeoutTimer = setTimeout(() => {
            timedOut = true;
            markExecutionFailure(ctx);
            resolve();
        }, CONFIG.TIMEOUT);
    });
}

/**
 * 签到
 */
function CityBoxSign(delay, ctx) {
    const { merge } = ctx;
    merge.CityBoxSign = {};
    return new Promise(resolve => {
        let timeoutTimer;
        let timedOut = false;
        if (shouldSkip(ctx)) {
            resolve();
            return;
        }
        const ts = Date.now();
        const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SIGN}?ts=${ts}`;
        setTimeout(() => {
            $nobyda.get({
                url,
                headers: {
                    token: ctx.key,
                    sign: ctx.sign,
                    ...DEFAULT_HEADERS
                }
            }, (error, response, data) => {
                if (timedOut) return;
                if (timeoutTimer) clearTimeout(timeoutTimer);
                try {
                    if (error) throw new Error(error);
                    const result = JSON.parse(data);
                    const msg = result.message || result.msg || '';
                    if (result.status === false) {
                        merge.CityBoxSign.notify = "CityBox-签到失败: " + (msg || '未知');
                        merge.CityBoxSign.fail = 1;
                    } else {
                        const data = getPayload(result);
                        const points = data.modou ?? result.modou ?? 0;
                        merge.CityBoxSign.notify = points ? `CityBox-签到成功，积分: ${points}` : "CityBox-签到成功";
                        merge.CityBoxSign.success = 1;
                    }
                } catch (e) {
                    markExecutionFailure(ctx);
                    $nobyda.AnError("CityBox-签到", "CityBoxSign", e, response, data, ctx);
                } finally {
                    resolve();
                }
            });
        }, delay);
        if (CONFIG.TIMEOUT) timeoutTimer = setTimeout(() => {
            timedOut = true;
            markExecutionFailure(ctx);
            resolve();
        }, CONFIG.TIMEOUT + delay);
    });
}

/**
 * 任务（转盘/抽奖）click_num 为 1～9 的随机数
 */
function DrawResults(delay, clickNum, ctx) {
    const { merge } = ctx;
    merge.CityBoxTask = merge.CityBoxTask || { success: 0, fail: 0 };
    return new Promise(resolve => {
        let timeoutTimer;
        let timedOut = false;
        if (shouldSkip(ctx)) {
            resolve();
            return;
        }
        setTimeout(() => {
            $nobyda.post({
                url: `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.DRAW_RESULTS}`,
                headers: {
                    token: ctx.key,
                    sign: ctx.sign,
                    ...DEFAULT_HEADERS
                },
                body: `click_num=${clickNum}`
            }, (error, response, data) => {
                if (timedOut) return;
                if (timeoutTimer) clearTimeout(timeoutTimer);
                try {
                    if (error) throw new Error(error);
                    const result = JSON.parse(data);
                    const msg = result.message || result.msg || '';
                    if (result.status === false) {
                        merge.CityBoxTask.fail = (merge.CityBoxTask.fail || 0) + 1;
                        merge.CityBoxTask.failDetail = merge.CityBoxTask.failDetail || [];
                        merge.CityBoxTask.failDetail.push(`任务失败(click_num=${clickNum}): ${msg || '未知'}`);
                    } else {
                        merge.CityBoxTask.success = (merge.CityBoxTask.success || 0) + 1;
                    }
                } catch (e) {
                    markExecutionFailure(ctx);
                    $nobyda.AnError("CityBox-任务", "CityBoxTask", e, response, data, ctx);
                } finally {
                    resolve();
                }
            });
        }, delay);
        if (CONFIG.TIMEOUT) timeoutTimer = setTimeout(() => {
            timedOut = true;
            markExecutionFailure(ctx);
            resolve();
        }, CONFIG.TIMEOUT + delay);
    });
}

/**
 * 通知
 */
async function sendWxPusher(summary, content) {
    try {
        await new Promise(resolve => {
            $nobyda.post({
                url: WX_PUSHER.URL,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ appToken: WX_PUSHER.APP_TOKEN, summary, content, contentType: 1, uids: [WX_PUSHER.UID], verifyPay: false, verifyPayType: 0 })
            }, (error, response, body) => {
                if (error || !response || response.statusCode < 200 || response.statusCode >= 300) console.log(`WxPusher 发送失败: ${error || body || '未知错误'}`);
                resolve();
            });
        });
    } catch (error) {
        console.log(`WxPusher 发送异常: ${error.message || error}`);
    }
}

async function notify(ctx) {
    const { merge } = ctx;
    try {
            const lines = [];
            const beforeMoney = merge.TotalMoney?.before ?? 0;
            const afterMoney = merge.TotalMoney?.after ?? 0;
            const moneyDiff = Number(afterMoney) - Number(beforeMoney);
            const diffText = Number.isFinite(moneyDiff) && moneyDiff !== 0 ? `（${moneyDiff > 0 ? '+' : ''}${moneyDiff}）` : '';
            lines.push('CityBox 任务完成');
            lines.push(`账号：${ctx.user || '未知'}`);
            lines.push(`余额：${beforeMoney} -> ${afterMoney}${diffText}`);
            if (merge.CityBoxSign && merge.CityBoxSign.notify) {
                lines.push(`签到：${merge.CityBoxSign.notify.replace(/^CityBox-签到/, '')}`);
            }
            const success = merge.CityBoxTask?.success ?? 0;
            const fail = merge.CityBoxTask?.fail ?? 0;
            lines.push(`任务：draw_results 成功${success}次，失败${fail}次`);
            if (merge.CityBoxTask?.failDetail?.length) {
                lines.push('失败详情：');
                lines.push(...merge.CityBoxTask.failDetail);
            }
            if (shouldSkip(ctx)) {
                lines.unshift('⚠️ 检测到Token失效，已跳过后续操作');
            }
        const hasFailure = shouldSkip(ctx)
            || merge.EXECUTION_FAILED
            || merge.CityBoxUserInfo?.fail
            || merge.CityBoxSign?.fail
            || fail > 0;
        const content = hasFailure ? lines.join('\n') : [
            `账号：${ctx.user || '未知'}`,
            `余额：${beforeMoney} -> ${afterMoney}${diffText}`,
            `签到：${merge.CityBoxSign?.notify?.replace(/^CityBox-签到/, '') || '成功'}`,
            `任务：成功${success}次，失败${fail}次`
        ].join('\n');
        const title = `CityBox执行${hasFailure ? '失败' : '成功'}`;
        console.log(content);
        // $nobyda.notify('', '', content);
        await sendWxPusher(title, content);
    } catch (e) {
        const content = e.message || String(e);
        // $nobyda.notify('通知模块 ' + e.name + '‼️', '', content);
        await sendWxPusher('CityBox执行失败', content);
    }
}

/**
 * 主流程：用户信息 -> 等待 ->（签到 / 任务随机开始）-> 用户信息 -> 通知
 */
async function all(cookie) {
    // 每个账号独立保存 token、跳过状态和执行结果，确保并行执行互不影响
    const ctx = { key: cookie.token, user: cookie.userId || '', sign: cookie.sign || API_CONFIG.SIGN, merge: {}, skip: false };
    try {
        const { merge } = ctx;
        $nobyda.num++;

        await UserInfo("before", ctx);
        await wait(getRandomWaitTime());

        const clickNum1 = Math.floor(Math.random() * 9) + 1;
        let clickNum2 = Math.floor(Math.random() * 9) + 1;
        while (clickNum2 === clickNum1) {
            clickNum2 = Math.floor(Math.random() * 9) + 1;
        }

        // 随机决定签到和任务的先后，任务内部仍按两个抽奖请求的顺序执行
        const actions = shuffleEntries([
            async () => {
                await CityBoxSign(Wait(CONFIG.STOP_DELAY), ctx);
            },
            async () => {
                await DrawResults(0, clickNum1, ctx);
                await wait(getRandomWaitTime());
                await DrawResults(0, clickNum2, ctx);
            }
        ]);

        for (const action of actions) {
            await action();
            await wait(getRandomWaitTime());
        }

        await UserInfo("after", ctx);
        await notify(ctx);
    } catch (error) {
        markExecutionFailure(ctx);
        $nobyda.AnError("主执行流程", "all", error, null, null, ctx);
        await sendWxPusher('CityBox执行失败', error?.message || String(error));
    }
}

/**
 * 从响应/请求中获取 Cookie（Token）
 */
async function GetCookie() {
    const req = $request;
    const resp = $response;
    if (!req || req.method === 'OPTIONS') return;
    try {
        const url = req.url || '';
        let body = resp?.body || '';
        let bodyData = null;
        if (body) {
            try {
                bodyData = typeof body === 'string' ? JSON.parse(body) : body;
            } catch (e) {
                bodyData = null;
            }
        }
        let token = req.headers?.token || req.headers?.Token || '';
        let sign = req.headers?.sign || req.headers?.Sign || '';
        if (/api\.icitybox\.cn\/api\/user\/get_user_info/.test(url)) {
            const userId = getUserIdFromUserInfo(bodyData);
            if (userId || token) {
                const payload = getPayload(bodyData);
                if (!token && payload?.token) token = payload.token;
                if (!sign && payload?.sign) sign = payload.sign;
                if (userId && token) {
                    let existed = {};
                    try {
                        existed = loadTokenStore($nobyda.read('MHCityBoxCookies'));
                    } catch (e) {
                        existed = {};
                    }
                    const existedInfo = existed[userId] || {};
                    const tokenInfo = { token, sign: sign || existedInfo.sign || '' };
                    if (existedInfo.token === tokenInfo.token && existedInfo.sign === tokenInfo.sign) return;

                    const tokenData = { ...existed, [userId]: tokenInfo };
                    const writeResult = $nobyda.write(JSON.stringify(tokenData, null, 2), 'MHCityBoxCookies');
                    console.log('CityBox 获取 token/sign 成功: ' + JSON.stringify(tokenData));
                    const content = [
                        `账号ID: ${userId}`,
                        `状态: Token、Sign 写入${writeResult ? '成功 🎉' : '失败 ‼️'}`,
                        `Token: ${tokenInfo.token}`,
                        `Sign: ${tokenInfo.sign || '未获取到'}`,
                        `已保存: ${Object.keys(tokenData).length} 个账号`
                    ].join('\n');
                    // $nobyda.notify('CityBox', '', content);
                    await sendWxPusher(writeResult ? 'CityBox获取用户成功' : 'CityBox获取用户失败', content);
                } else {
                    throw new Error(`Cookie 中缺少信息,userID:${userId},token:${token}`);
                }
            }
        }
    } catch (e) {
        const content = e?.message || String(e);
        // $nobyda.notify('GetCookie', '', content);
        await sendWxPusher('CityBox获取用户失败', content);
    }
}

(async function ReadCookie() {
    try {
        const cookiesInfo = "MHCityBoxCookies";
        const cookiesData = $nobyda.read(cookiesInfo);
        if ($nobyda.isRequest) {
            await GetCookie();
        } else if (cookiesData) {
            let cookies;
            try {
                cookies = loadTokenStore(cookiesData);
            } catch (e) {
                throw new Error('Cookie 数据格式错误');
            }
            const timeout = parseInt($nobyda.read("TimeOut")) || CONFIG.TIMEOUT;
            const delay = Wait($nobyda.read("Delay"), true) || Wait(CONFIG.STOP_DELAY, true);
            CONFIG.TIMEOUT = timeout;
            CONFIG.STOP_DELAY = delay;
            $nobyda.num = 0;
            const tokenEntries = shuffleEntries(Object.entries(cookies || {}));
            if (tokenEntries.length > 0) {
                const initDelay = $nobyda.read("InitDelay") || CONFIG.INIT_DELAY;
                await runWithConcurrency(tokenEntries, async ([userId, tokenValue]) => {
                    if (!tokenValue || !tokenValue.token) return Promise.resolve();
                    const initWaitMs = Wait(initDelay);
                    console.log(`CityBox账号 ${userId} 将在 ${initWaitMs} 毫秒后开始`);
                    await wait(initWaitMs);
                    return all({ userId, token: tokenValue.token, sign: tokenValue.sign });
                }, CONFIG.MAX_CONCURRENCY);
            } else {
                throw new Error('Cookie 中缺少可执行的 token 信息');
            }
            $nobyda.time();
        } else {
            throw new Error('脚本终止, 未获取 Cookie ‼️');
        }
    } catch (error) {
        // $nobyda.notify("CityBox 签到", "", error.message || JSON.stringify(error));
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
    const NodeSet = 'MHCityBoxSet.json';

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

    const AnError = (name, keyname, error, resp, body, context) => {
        const targetMerge = context?.merge;
        if (targetMerge && keyname) {
            targetMerge[keyname] = targetMerge[keyname] || {};
            if (!targetMerge[keyname].notify) targetMerge[keyname].notify = `${name}: 异常, 已输出日志 ‼️`;
            else targetMerge[keyname].notify += `\n${name}: 异常 ‼️`;
            targetMerge[keyname].error = 1;
        }
    };

    const time = () => {};

    const done = (value = {}) => {
        if (isQuanX) return $done(value);
        if (isSurge) return isRequest ? $done(value) : $done();
        if (isLoon) return isRequest ? $done(value) : $done();
    };

    return { AnError, isRequest, isJSBox, isSurge, isQuanX, isLoon, isNode, notify, write, read, get, post, time, done };
}
