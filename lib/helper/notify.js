const { log } = require('../utils');
const { send } = require('../net/http');
const { createTransport } = require('nodemailer');

// =======================================微信server酱通知设置区域===========================================
//此处填你申请的SCKEY.
//注：此处设置github action用户填写到Settings-Secrets里面(Name输入SCKEY)
let SCKEY = '';
//Turbo
let SENDKEY = '';

// =======================================QQ酷推通知设置区域===========================================
//此处填你申请的SKEY(具体详见文档 https://cp.xuthus.cc/)
//注：此处设置github action用户填写到Settings-Secrets里面(Name输入QQ_SKEY)
let QQ_SKEY = '';
//此处填写私聊或群组推送，默认私聊(send[私聊]、group[群聊]、wx[个微]、ww[企微])
let QQ_MODE = 'send';

// =======================================Bark App通知设置区域===========================================
//此处填你BarkAPP的信息(IP/设备码，例如：https://api.day.app/XXXXXXXX)
//注：此处设置github action用户填写到Settings-Secrets里面（Name输入BARK_PUSH）
let BARK_PUSH = '';
//BARK app推送铃声,铃声列表去APP查看复制填写
//注：此处设置github action用户填写到Settings-Secrets里面（Name输入BARK_SOUND , Value输入app提供的铃声名称，例如:birdsong）
let BARK_SOUND = '';

// =======================================pushdeer通知设置区域===========================================
let PUSHDEER_URL = '';
let PUSHDEER_PUSHKEY = '';

// =======================================telegram机器人通知设置区域===========================================
//此处填你telegram bot 的Token，例如：1077xxx4424:AAFjv0FcqxxxxxxgEMGfi22B4yh15R5uw
//注：此处设置github action用户填写到Settings-Secrets里面(Name输入TG_BOT_TOKEN)
let TG_BOT_TOKEN = '';
//此处填你接收通知消息的telegram用户的id，例如：129xxx206
//注：此处设置github action用户填写到Settings-Secrets里面(Name输入TG_USER_ID)
let TG_USER_ID = '';
//代理主机
let TG_PROXY_HOST = '';
//代理端口
let TG_PROXY_PORT = '';
// =======================================钉钉机器人通知设置区域===========================================
//此处填你钉钉 bot 的webhook，例如：5a544165465465645d0f31dca676e7bd07415asdasd
//注：此处设置github action用户填写到Settings-Secrets里面(Name输入DD_BOT_TOKEN)
let DD_BOT_TOKEN = '';
//密钥，机器人安全设置页面，加签一栏下面显示的SEC开头的字符串
let DD_BOT_SECRET = '';

// ================================企业微信应用通知设置区域====================================
// 此处填你企业微信应用消息的值(详见文档 https://work.weixin.qq.com/api/doc/90000/90135/90236)
// 环境变量名 QYWX_AM 依次填入 corpid,corpsecret,touser(注：多个成员ID使用|隔开),agentid,消息类型(选填，不填默认文本消息类型)
// 注意用,号隔开(英文输入法的逗号)，例如：wwcff56746d9adwers,B-791548lnzXBE6_BWfxdf3kSTMJr9vFEPKAbh6WERQ,mingcheng,1000001,2COXgjH2UIfERF2zxrtUOKgQ9XklUqMdGSWLBoW_lSDAdafat
let QYWX_AM = '';

// =======================================企业微信机器人通知设置区域===========================================
//此处填你企业微信机器人的 webhook(详见文档 https://work.weixin.qq.com/api/doc/90000/90136/91770)，例如：693a91f6-7xxx-4bc4-97a0-0ec2sifa5aaa
//注：此处设置github action用户填写到Settings-Secrets里面(Name输入QYWX_KEY)
let QYWX_KEY = '';

// =======================================iGot聚合推送通知设置区域===========================================
//此处填您iGot的信息(推送key，例如：https://push.hellyw.com/XXXXXXXX)
//注：此处设置github action用户填写到Settings-Secrets里面（Name输入IGOT_PUSH_KEY）
let IGOT_PUSH_KEY = '';

// =======================================push+设置区域=======================================
//官方文档：https://pushplus.hxtrip.com/
//PUSH_PLUS_TOKEN：微信扫码登录后一对一推送或一对多推送下面的token(您的Token)，不提供PUSH_PLUS_USER则默认为一对一推送
//PUSH_PLUS_USER： 一对多推送的“群组编码”（一对多推送下面->您的群组(如无则新建)->群组编码，如果您是创建群组人。也需点击“查看二维码”扫描绑定，否则不能接受群组消息推送）
let PUSH_PLUS_TOKEN = '';
let PUSH_PLUS_USER = '';

// ===========================================QMSG===========================================
let QMSG_SOCKET = '';
let QMSG_KEY = '';
let QMSG_QQ = '';

// ===========================================邮件推送===============================================
let SMTP_HOST = '';
let SMTP_PORT = '';
let SMTP_USER = '';
let SMTP_PASS = '';
let SMTP_TO_USER = '';

// ====================================Gotify======================================
// 官方文档：https://gotify.net/docs/pushmsg
// 此处填你的Gotify消息推送地址（例如：http://localhost/message）
let GOTIFY_URL = '';
// 此处填你想推送的Application的Token（不包含推送时额外添加的前缀 Bearer ）
let GOTIFY_APPKEY = '';

// =======================================飞书机器人通知设置区域===========================================
// 此处填你飞书机器人的 webhook（详见文档 https://open.feishu.cn/document/client-docs/bot-v3/add-custom-bot）
// 注：此处设置github action用户填写到Settings-Secrets里面(Name输入FS_BOT_WEBHOOK)
let FS_BOT_WEBHOOK = '';
// 签名密钥（如果在飞书机器人安全设置里开启了“签名校验”）
// 注：此处设置github action用户填写到Settings-Secrets里面(Name输入FS_BOT_SECRET)
let FS_BOT_SECRET = '';

//==========================云端环境变量的判断与接收=========================
if (process.env.SCKEY) {
    SCKEY = process.env.SCKEY;
}

if (process.env.SENDKEY) {
    SENDKEY = process.env.SENDKEY;
}

if (process.env.QQ_SKEY) {
    QQ_SKEY = process.env.QQ_SKEY;
}

if (process.env.QQ_MODE) {
    QQ_MODE = process.env.QQ_MODE;
}

if (process.env.BARK_PUSH) {
    if (process.env.BARK_PUSH.indexOf('https') > -1 || process.env.BARK_PUSH.indexOf('http') > -1) {
        //兼容BARK自建用户
        BARK_PUSH = process.env.BARK_PUSH;
    } else {
        BARK_PUSH = `https://api.day.app/${process.env.BARK_PUSH}`;
    }
    if (process.env.BARK_SOUND) {
        BARK_SOUND = process.env.BARK_SOUND;
    }
} else {
    if (BARK_PUSH && BARK_PUSH.indexOf('https') === -1 && BARK_PUSH.indexOf('http') === -1) {
        //兼容BARK本地用户只填写设备码的情况
        BARK_PUSH = `https://api.day.app/${BARK_PUSH}`;
    }
}

if (process.env.PUSHDEER_URL) {
    PUSHDEER_URL = process.env.PUSHDEER_URL;
} else {
    PUSHDEER_URL = 'https://api2.pushdeer.com/message/push';
}

if (process.env.PUSHDEER_PUSHKEY) {
    PUSHDEER_PUSHKEY = process.env.PUSHDEER_PUSHKEY;
}

if (process.env.TG_BOT_TOKEN) {
    TG_BOT_TOKEN = process.env.TG_BOT_TOKEN;
}

if (process.env.TG_USER_ID) {
    TG_USER_ID = process.env.TG_USER_ID;
}

if (process.env.TG_PROXY_HOST) {
    TG_PROXY_HOST = process.env.TG_PROXY_HOST;
}

if (process.env.TG_PROXY_PORT) {
    TG_PROXY_PORT = process.env.TG_PROXY_PORT;
}

if (process.env.DD_BOT_TOKEN) {
    DD_BOT_TOKEN = process.env.DD_BOT_TOKEN;
    if (process.env.DD_BOT_SECRET) {
        DD_BOT_SECRET = process.env.DD_BOT_SECRET;
    }
}

if (process.env.QYWX_AM) {
    QYWX_AM = process.env.QYWX_AM;
}

if (process.env.QYWX_KEY) {
    QYWX_KEY = process.env.QYWX_KEY;
}

if (process.env.IGOT_PUSH_KEY) {
    IGOT_PUSH_KEY = process.env.IGOT_PUSH_KEY;
}

if (process.env.PUSH_PLUS_TOKEN) {
    PUSH_PLUS_TOKEN = process.env.PUSH_PLUS_TOKEN;
}
if (process.env.PUSH_PLUS_USER) {
    PUSH_PLUS_USER = process.env.PUSH_PLUS_USER;
}

if (process.env.QMSG_SOCKET) {
    QMSG_SOCKET = process.env.QMSG_SOCKET;
} else {
    QMSG_SOCKET = 'qmsg.zendee.cn';
}

if (process.env.QMSG_KEY) {
    QMSG_KEY = process.env.QMSG_KEY;
}

if (process.env.QMSG_QQ) {
    QMSG_QQ = process.env.QMSG_QQ;
}

if (process.env.SMTP_HOST) {
    SMTP_HOST = process.env.SMTP_HOST;
}
if (process.env.SMTP_PORT) {
    SMTP_PORT = process.env.SMTP_PORT;
}
if (process.env.SMTP_USER) {
    SMTP_USER = process.env.SMTP_USER;
}
if (process.env.SMTP_PASS) {
    SMTP_PASS = process.env.SMTP_PASS;
}
if (process.env.SMTP_TO_USER) {
    SMTP_TO_USER = process.env.SMTP_TO_USER;
}

if (process.env.GOTIFY_URL) {
    GOTIFY_URL = process.env.GOTIFY_URL;
    if (process.env.GOTIFY_APPKEY) {
        GOTIFY_APPKEY = process.env.GOTIFY_APPKEY;
    }
}

if (process.env.FS_BOT_WEBHOOK) {
    FS_BOT_WEBHOOK = process.env.FS_BOT_WEBHOOK;
}

if (process.env.FS_BOT_SECRET) {
    FS_BOT_SECRET = process.env.FS_BOT_SECRET;
}

//==========================云端环境变量的判断与接收=========================

async function sendNotify(text, desp, params = {}) {
    if (process.env.NOTE) {
        desp = `帐号备注: ${process.env.NOTE}\n${desp}`;
    }
    //提供多种通知方式
    await Promise.all([
        //微信server酱
        serverNotify(text, desp),
        //微信server酱Turbo版
        serverNotifyTurbo(text, desp),
        //pushplus(推送加)
        pushPlusNotify(text, desp),
        //iOS Bark APP
        barkNotify(text, desp, params),
        // Pushdeer
        pushdeerNotify(text, desp),
        //telegram 机器人
        tgBotNotify(text, desp),
        //钉钉机器人
        ddBotNotify(text, desp),
        //企业微信应用
        qywxAmNotify(text, desp),
        //企业微信机器人
        qywxBotNotify(text, desp),
        //iGot
        iGotNotify(text, desp, params),
        //QQ酷推
        coolPush(text, desp),
        // Qmsg
        qmsg(text, desp),
        //电子邮件
        email(text, desp),
        // Gotify
        gotifyNotify(text, desp),
        // 飞书机器人
        feishuNotify(text, desp)
    ]);
}

function serverNotify(text, desp) {
    return new Promise(resolve => {
        if (SCKEY) {
            send({
                method: 'GET',
                url: `https://sc.ftqq.com/${SCKEY}.send`,
                query: {
                    text,
                    desp
                },
                config: {
                    retry: false
                },
                headers: {
                    accept: 'application/json, text/plain, */*',
                },
                success: res => {
                    try {
                        const data = JSON.parse(res.body);
                        if (data.errno === 0) {
                            log.info('发送通知', 'server酱发送通知消息成功');
                        } else if (data.errno === 1024) {
                            // 一分钟内发送相同的内容会触发
                            log.error('发送通知', `server酱发送通知消息异常: ${data.errmsg}`);
                        } else {
                            log.error('发送通知', `server酱发送通知消息异常\n${JSON.stringify(data)}`);
                        }
                    } catch (error) {
                        log.error('发送通知', error);
                    } finally {
                        resolve();
                    }
                },
                failure: err => {
                    log.error('发送通知', 'server酱 发送通知调用API失败！！' + err);
                    resolve();
                }
            });
        } else {
            log.debug('发送通知', '您未提供server酱的SCKEY，取消微信推送消息通知');
            resolve();
        }
    });
}

function serverNotifyTurbo(text, desp) {
    return new Promise(resolve => {
        if (SENDKEY) {
            send({
                method: 'POST',
                url: `https://sctapi.ftqq.com/${SENDKEY}.send`,
                contents: {
                    text,
                    desp
                },
                config: {
                    retry: false
                },
                headers: {
                    accept: 'application/json, text/plain, */*',
                },
                success: res => {
                    try {
                        const data = JSON.parse(res.body);
                        if (data.code === 0) {
                            log.info('发送通知', 'server酱(Turbo版)发送通知消息成功');
                        } else {
                            log.error('发送通知', `server酱(Turbo版)发送通知消息异常\n${JSON.stringify(data)}`);
                        }
                    } catch (error) {
                        log.error('发送通知', error);
                    } finally {
                        resolve();
                    }
                },
                failure: err => {
                    log.error('发送通知', 'server酱(Turbo版) 发送通知调用API失败！！' + err);
                    resolve();
                }
            });
        } else {
            log.debug('发送通知', '您未提供server酱(Turbo版)的SCKEY，取消微信推送消息通知');
            resolve();
        }
    });
}

function coolPush(text, desp) {
    return new Promise(resolve => {
        if (QQ_SKEY) {
            let pushMode = function (t) {
                switch (t) {
                    case 'send':
                        return '个人';
                    case 'group':
                        return 'QQ群';
                    case 'wx':
                        return '微信';
                    case 'ww':
                        return '企业微信';
                    default:
                        return '未知方式';
                }
            };
            send({
                method: 'POST',
                url: `https://push.xuthus.cc/${QQ_MODE}/${QQ_SKEY}`,
                contents: `${text}\n${desp}`,
                config: {
                    retry: false
                },
                headers: {
                    accept: 'application/json, text/plain, */*',
                    'content-type': 'text/plain'
                },
                success: res => {
                    try {
                        const data = JSON.parse(res.body);
                        if (data.code === 200) {
                            log.info('发送通知', `酷推发送${pushMode(QQ_MODE)}通知消息成功`);
                        } else if (data.code === 400) {
                            log.error('发送通知', `QQ酷推(Cool Push)发送${pushMode(QQ_MODE)}推送失败：${data}`);
                        } else {
                            log.error('发送通知', `酷推推送异常: ${data.msg}`);
                        }
                    } catch (error) {
                        log.error('发送通知', error);
                    } finally {
                        resolve();
                    }
                },
                failure: err => {
                    log.error('发送通知', `酷推 发送${pushMode(QQ_MODE)}通知调用API失败！！${err}`);
                    resolve();
                }
            });
        } else {
            log.debug('发送通知', '您未提供酷推的SKEY，取消QQ推送消息通知');
            resolve();
        }
    });
}

function barkNotify(text, desp, params = {}) {
    return new Promise(resolve => {
        if (BARK_PUSH) {
            send({
                method: 'GET',
                url: `${BARK_PUSH}/${encodeURIComponent(text)}/${encodeURIComponent(desp)}`,
                query: {
                    ...params,
                    sound: BARK_SOUND,
                },
                config: {
                    retry: false
                },
                headers: {
                    accept: 'application/json, text/plain, */*',
                },
                success: res => {
                    try {
                        const data = JSON.parse(res.body);
                        if (data.code === 200) {
                            log.info('发送通知', 'Bark APP发送通知消息成功');
                        } else {
                            log.error('发送通知', `${data.message}`);
                        }
                    } catch (error) {
                        log.error('发送通知', error);
                    } finally {
                        resolve();
                    }
                },
                failure: err => {
                    log.error('发送通知', 'Bark APP发送通知调用API失败！！' + err);
                    resolve();
                }
            });
        } else {
            log.debug('发送通知', '您未提供Bark的APP推送BARK_PUSH，取消Bark推送消息通知');
            resolve();
        }
    });
}

function pushdeerNotify(text, desp) {
    return new Promise(resolve => {
        if (PUSHDEER_URL && PUSHDEER_PUSHKEY) {
            send({
                method: 'POST',
                url: PUSHDEER_URL,
                contents: {
                    pushkey: PUSHDEER_PUSHKEY,
                    text,
                    desp,
                    type: 'markdown'
                },
                config: {
                    retry: false
                },
                success: res => {
                    try {
                        const data = JSON.parse(res.body);
                        if (data.code === 0) {
                            log.info('发送通知', 'Pushdeer推送发送通知消息成功');
                        } else {
                            log.error('发送通知', `Pushdeer推送发送通知消息异常\n${JSON.stringify(data)}`);
                        }
                    } catch (error) {
                        log.error('发送通知', error);
                    } finally {
                        resolve();
                    }
                },
                failure: err => {
                    log.error('发送通知', 'Pushdeer推送发送通知调用API失败！！' + err);
                    resolve();
                }
            });
        } else {
            log.debug('发送通知', '您未提供Pushdeer推送所需的PUSHDEER_URL 和 PUSHDEER_PUSHKEY, 取消Pushdeer推送消息通知');
            resolve();
        }
    });
}

function tgBotNotify(text, desp) {
    return new Promise(resolve => {
        if (TG_BOT_TOKEN && TG_USER_ID) {
            let options = {
                method: 'POST',
                url: `https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage`,
                config: {
                    retry: false
                },
                contents: {
                    chat_id: TG_USER_ID,
                    text,
                    desp,
                    disable_web_page_preview: true
                },
                headers: {
                    accept: 'application/json, text/plain, */*',
                    'content-type': 'application/json'
                },
                success: res => {
                    try {
                        const data = JSON.parse(res.body);
                        if (data.ok) {
                            log.info('发送通知', 'Telegram发送通知消息完成。');
                        } else if (data.error_code === 400) {
                            log.error('发送通知', '请主动给bot发送一条消息并检查接收用户ID是否正确。');
                        } else if (data.error_code === 401) {
                            log.error('发送通知', 'Telegram bot token 填写错误。');
                        }
                    } catch (error) {
                        log.error('发送通知', error);
                    } finally {
                        resolve();
                    }
                },
                failure: err => {
                    log.error('发送通知', 'telegram发送通知消息失败！！' + err);
                    resolve();
                }
            };
            if (TG_PROXY_HOST && TG_PROXY_PORT) {
                options.proxy = {
                    url: 'http://' + TG_PROXY_HOST + ':' + TG_PROXY_PORT,
                    auth_headers: []
                };
            }
            send(options);
        } else {
            log.debug('发送通知', '您未提供telegram机器人推送所需的TG_BOT_TOKEN和TG_USER_ID，取消telegram推送消息通知');
            resolve();
        }
    });
}

function ddBotNotify(text, desp) {
    return new Promise(resolve => {
        if (DD_BOT_TOKEN && DD_BOT_SECRET) {
            const crypto = require('crypto');
            const dateNow = Date.now();
            const hmac = crypto.createHmac('sha256', DD_BOT_SECRET);
            hmac.update(`${dateNow}\n${DD_BOT_SECRET}`);
            const result = encodeURIComponent(hmac.digest().toString('base64'));
            send({
                method: 'POST',
                url: 'https://oapi.dingtalk.com/robot/send',
                query: {
                    access_token: DD_BOT_TOKEN,
                    timestamp: dateNow,
                    sign: result
                },
                config: {
                    retry: false
                },
                contents: {
                    msgtype: 'text',
                    text: {
                        content: `${text}\n\n${desp}`
                    }
                },
                headers: {
                    accept: 'application/json, text/plain, */*',
                    'content-type': 'application/json',
                },
                success: res => {
                    try {
                        const data = JSON.parse(res.body);
                        if (data.errcode === 0) {
                            log.info('发送通知', '钉钉发送通知消息完成。');
                        } else {
                            log.error('发送通知', `${data.errmsg}`);
                        }
                    } catch (e) {
                        log.error('发送通知', e);
                    } finally {
                        resolve();
                    }
                },
                failure: err => {
                    log.error('发送通知', '钉钉发送通知消息失败！！' + err);
                    resolve();
                }
            });
        } else if (DD_BOT_TOKEN) {
            send({
                method: 'POST',
                url: 'https://oapi.dingtalk.com/robot/send',
                query: {
                    access_token: DD_BOT_TOKEN
                },
                config: {
                    retry: false
                },
                contents: {
                    msgtype: 'text',
                    text: {
                        content: `${text}\n\n${desp}`
                    }
                },
                headers: {
                    accept: 'application/json, text/plain, */*',
                    'content-type': 'application/json',
                },
                success: res => {
                    try {
                        const data = JSON.parse(res.body);
                        if (data.errcode === 0) {
                            log.info('发送通知', '钉钉发送通知消息完成。');
                        } else {
                            log.error('发送通知', `${data.errmsg}`);
                        }
                    } catch (e) {
                        log.error('发送通知', e);
                    } finally {
                        resolve();
                    }
                },
                failure: err => {
                    log.error('发送通知', '钉钉发送通知消息失败！！' + err);
                    resolve();
                }
            });
        } else {
            log.debug('发送通知', '您未提供钉钉机器人推送所需的DD_BOT_TOKEN或者DD_BOT_SECRET，取消钉钉推送消息通知');
            resolve();
        }
    });
}

function qywxAmNotify(text, desp) {
    return new Promise(resolve => {
        desp = desp.replace(/\n/g, '<br>');
        if (QYWX_AM) {
            const QYWX_AM_AY = QYWX_AM.split(',');
            send({
                method: 'POST',
                url: 'https://qyapi.weixin.qq.com/cgi-bin/gettoken',
                contents: {
                    corpid: `${QYWX_AM_AY[0]}`,
                    corpsecret: `${QYWX_AM_AY[1]}`,
                },
                config: {
                    retry: false
                },
                headers: {
                    accept: 'application/json, text/plain, */*',
                    'content-type': 'application/json',
                },
                success: res => {
                    try {
                        const data = JSON.parse(res.body);
                        let accesstoken = data.access_token;
                        send({
                            method: 'POST',
                            url: `https://qyapi.weixin.qq.com/cgi-bin/message/send?access_token=${accesstoken}`,
                            contents: {
                                touser: `${QYWX_AM_AY[2]}`,
                                agentid: `${QYWX_AM_AY[3]}`,
                                safe: '0',
                                msgtype: 'mpnews',
                                mpnews: {
                                    articles: [
                                        {
                                            title: `${text}`,
                                            thumb_media_id: `${QYWX_AM_AY[4]}`,
                                            content: `${desp}`,
                                        }
                                    ]
                                },
                            },
                            config: {
                                retry: false
                            },
                            headers: {
                                accept: 'application/json, text/plain, */*',
                                'content-type': 'application/json',
                            },
                            success: res => {
                                try {
                                    const data = JSON.parse(res.body);
                                    if (data.errcode === 0) {
                                        log.info('发送通知', '企业微信应用发送通知消息完成。');
                                    } else {
                                        log.error('发送通知', `${data.errmsg}`);
                                    }
                                } catch (e) {
                                    log.error('发送通知', e);
                                } finally {
                                    resolve();
                                }
                            },
                            failure: err => {
                                log.error('发送通知', '企业微信应用发送通知消息失败！！' + err);
                                resolve();
                            }
                        });
                    } catch (e) {
                        log.error('发送通知', e);
                    } finally {
                        resolve();
                    }
                },
                failure: err => {
                    log.error('发送通知', '企业微信应用发送通知消息失败！！' + err);
                    resolve();
                }
            });
        } else {
            log.debug('发送通知', '您未提供企业微信应用所需的QYWX_AM，取消企业微信应用推送消息通知');
            resolve();
        }
    });
}

function qywxBotNotify(text, desp) {
    return new Promise(resolve => {
        if (QYWX_KEY) {
            send({
                method: 'POST',
                url: `https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=${QYWX_KEY}`,
                contents: {
                    msgtype: 'text',
                    text: {
                        content: `${text}\n\n${desp}`,
                    },
                },
                config: {
                    retry: false
                },
                headers: {
                    accept: 'application/json, text/plain, */*',
                    'content-type': 'application/json',
                },
                success: res => {
                    try {
                        const data = JSON.parse(res.body);
                        if (data.errcode === 0) {
                            log.info('发送通知', '企业微信发送通知消息完成。');
                        } else {
                            log.error('发送通知', `${data.errmsg}`);
                        }
                    } catch (e) {
                        log.error('发送通知', e);
                    } finally {
                        resolve();
                    }
                },
                failure: err => {
                    log.error('发送通知', '企业微信发送通知消息失败！！' + err);
                    resolve();
                }
            });
        } else {
            log.debug('发送通知', '您未提供企业微信机器人推送所需的QYWX_KEY，取消企业微信推送消息通知');
            resolve();
        }
    });
}

function iGotNotify(text, desp, params = {}) {
    return new Promise(resolve => {
        if (IGOT_PUSH_KEY) {
            // 校验传入的IGOT_PUSH_KEY是否有效
            const IGOT_PUSH_KEY_REGX = new RegExp('^[a-zA-Z0-9]{24}$');
            if (!IGOT_PUSH_KEY_REGX.test(IGOT_PUSH_KEY)) {
                log.error('发送通知', '您所提供的IGOT_PUSH_KEY无效');
                resolve();
                return;
            }
            send({
                method: 'POST',
                url: `https://push.hellyw.com/${IGOT_PUSH_KEY.toLowerCase()}`,
                contents: {
                    ...params,
                    title: text,
                    content: desp
                },
                config: {
                    retry: false
                },
                headers: {
                    accept: 'application/json, text/plain, */*',
                    'content-type': 'application/json'
                },
                success: res => {
                    try {
                        const data = JSON.parse(res.body);
                        if (data.ret === 0) {
                            log.info('发送通知', 'iGot发送通知消息成功');
                        } else {
                            log.error('发送通知', `iGot发送通知消息失败：${data.errMsg}`);
                        }
                    } catch (e) {
                        log.error('发送通知', e);
                    } finally {
                        resolve();
                    }
                },
                failure: err => {
                    log.error('发送通知', 'iGot 发送通知调用API失败！！' + err);
                    resolve();
                }
            });
        } else {
            log.debug('发送通知', '您未提供iGot的推送IGOT_PUSH_KEY，取消iGot推送消息通知');
            resolve();
        }
    });
}

function pushPlusNotify(text, desp) {
    return new Promise(resolve => {
        if (PUSH_PLUS_TOKEN) {
            send({
                method: 'POST',
                url: 'http://www.pushplus.plus/send',
                contents: {
                    token: PUSH_PLUS_TOKEN,
                    title: text,
                    content: desp,
                    topic: PUSH_PLUS_USER
                },
                config: {
                    retry: false
                },
                headers: {
                    accept: 'application/json, text/plain, */*',
                    'content-type': 'application/json',
                },
                success: res => {
                    try {
                        const data = JSON.parse(res.body);
                        if (data.code === 200) {
                            log.info('发送通知', `push+发送${PUSH_PLUS_USER ? '一对多' : '一对一'}通知消息完成。`);
                        } else {
                            log.error('发送通知', `push+发送${PUSH_PLUS_USER ? '一对多' : '一对一'}通知消息失败：${data.msg}`);
                        }
                    } catch (e) {
                        log.error('发送通知', e);
                    } finally {
                        resolve();
                    }
                },
                failure: err => {
                    log.error('发送通知', `push+发送${PUSH_PLUS_USER ? '一对多' : '一对一'}通知消息失败！！${err}`);
                    resolve();
                }
            });
        } else {
            log.debug('发送通知', '您未提供push+推送所需的PUSH_PLUS_TOKEN，取消push+推送消息通知');
            resolve();
        }
    });
}

function gotifyNotify(text, desp) {
    return new Promise(resolve => {
        if (GOTIFY_APPKEY) {
            send({
                method: 'POST',
                url: GOTIFY_URL,
                contents: {
                    title: text,
                    message: desp,
                },
                config: {
                    retry: false
                },
                headers: {
                    accept: 'application/json, text/plain, */*',
                    'content-type': 'application/json',
                    'authorization': 'Bearer ' + GOTIFY_APPKEY
                },
                success: () => {
                    // HTTP 响应码 200 就说明成功了
                    log.info('发送通知', 'Gotify 发送通知消息成功');
                    resolve();
                },
                failure: err => {
                    log.error('发送通知', 'Gotify 发送通知调用API失败！！' + err);
                    resolve();
                }
            });
        } else {
            log.debug('发送通知', '您未提供Gotify推送所需的GOTIFY_APPKEY，取消Gotify推送消息通知');
            resolve();
        }
    });
}

function feishuNotify(text, desp) {
    return new Promise(resolve => {
        if (FS_BOT_WEBHOOK) {
            const payload = {
                msg_type: 'text',
                content: {
                    text: `${text}\n\n${desp}`
                }
            };

            if (FS_BOT_SECRET) {
                const crypto = require('crypto');
                const timestamp = Math.floor(Date.now() / 1000);
                const signStr = `${timestamp}\n${FS_BOT_SECRET}`;
                const sign = crypto
                    .createHmac('sha256', FS_BOT_SECRET)
                    .update(signStr)
                    .digest('base64');
                payload.timestamp = `${timestamp}`;
                payload.sign = sign;
            }

            send({
                method: 'POST',
                url: FS_BOT_WEBHOOK,
                contents: payload,
                config: {
                    retry: false
                },
                headers: {
                    accept: 'application/json, text/plain, */*',
                    'content-type': 'application/json',
                },
                success: res => {
                    try {
                        const data = JSON.parse(res.body);
                        if (data.code === 0) {
                            log.info('发送通知', '飞书机器人发送通知消息完成。');
                        } else {
                            log.error('发送通知', `${data.msg || '飞书机器人发送通知异常'}`);
                        }
                    } catch (e) {
                        log.error('发送通知', e);
                    } finally {
                        resolve();
                    }
                },
                failure: err => {
                    log.error('发送通知', '飞书机器人发送通知消息失败！！' + err);
                    resolve();
                }
            });
        } else {
            log.debug('发送通知', '您未提供飞书机器人推送所需的FS_BOT_WEBHOOK，取消飞书机器人推送消息通知');
            resolve();
        }
    });
}

async function qmsg(text, desp) {
    return new Promise(resolve => {
        if (QMSG_KEY) {
            send({
                method: 'POST',
                url: `https://${QMSG_SOCKET}/send/${QMSG_KEY}`,
                contents: {
                    msg: text + '\n\n' + desp,
                    qq: QMSG_QQ
                },
                config: {
                    retry: false
                },
                headers: {
                    accept: 'application/json, text/plain, */*',
                    'content-type': 'application/x-www-form-urlencoded',
                },
                success: res => {
                    try {
                        const data = JSON.parse(res.body);
                        if (data.code === 200) {
                            log.info('发送通知', 'qmsg发送通知消息完成。');
                        } else {
                            log.error('发送通知', `qmsg通知消息失败: ${data.reason}`);
                        }
                    } catch (e) {
                        log.error('发送通知', e);
                    } finally {
                        resolve();
                    }
                },
                failure: err => {
                    log.error('发送通知', 'qmsg通知消息失败！！' + err);
                    resolve();
                }
            });
        } else {
            log.debug('发送通知', '您未提供qmsg推送所需的QMSG_KEY，取消qmsg推送消息通知');
            resolve();
        }
    });
}

async function email(text, desp) {
    if (SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS && SMTP_TO_USER) {
        try {
            await createTransport({
                host: SMTP_HOST,
                port: Number(SMTP_PORT),
                auth: {
                    user: SMTP_USER,
                    pass: SMTP_PASS
                }
            }).sendMail({
                from: SMTP_USER,
                to: SMTP_TO_USER,
                subject: text,
                text: desp,
            });
        } catch (e) {
            log.error('发送通知', `email发送失败 原因: ${e.message}`);
            return;
        }
        log.info('发送通知', 'email发送成功');
    } else {
        log.debug('发送通知', '您未提供email推送所需的所有参数故取消email推送消息通知');
    }
}

module.exports = { sendNotify };
