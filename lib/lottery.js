const utils = require('./utils');
const event_bus = require('./helper/event_bus');
const global_var = require('./data/global_var');
const { Searcher } = require('./core/searcher');
const { Monitor } = require('./core/monitor');
const config = require('./data/config');
const { randomDynamic } = require('./helper/randomDynamic');
const { sendNotify } = require('./helper/notify');
const { log } = utils;

async function createRandomDynamic(num) {
    if (config.create_dy) {
        log.info('随机动态', `准备创建${num}条随机动态`);
        const
            { allModifyDynamicResArray } = (await utils.retryfn(
                3,
                [null],
                () => Searcher.checkAllDynamic(global_var.get("myUID"), 1)
            )) || { allModifyDynamicResArray: [] },
            { type, origin_type } = allModifyDynamicResArray[0] || {};
        if (type === 1 && origin_type !== 8) {
            await randomDynamic(num)
        } else {
            log.info('随机动态', '已有非抽奖动态故无需创建');
        }
    }
}

/**
 * 抽奖主函数
 * @param {string} num
 * @returns {Promise<void>}
 */
function start(num) {
    return new Promise(resolve => {
        let times = utils.counter();
        /* 注册事件 */
        event_bus.on('Turn_on_the_Monitor', async () => {
            const lotterys = global_var.get("Lottery");
            if (lotterys.length === 0) {
                log.info('抽奖', '抽奖信息为空');
                event_bus.emit('Turn_off_the_Monitor', '抽奖信息为空')
                return;
            }
            if (times.value() === lotterys.length) {
                log.info('抽奖', '所有动态转发完毕');
                times.clear();
                event_bus.emit('Turn_off_the_Monitor', '目前无抽奖信息,过一会儿再来看看吧')
                return;
            }
            const lottery = lotterys[times.next()];

            await (new Monitor(lottery)).init();
        });
        event_bus.on('Turn_off_the_Monitor', async (msg) => {
            log.info('结束抽奖', '原因: ' + msg);
            if (config.notice_running_state) {
                sendNotify(
                    `动态抽奖-帐号${num}结束抽奖`,
                    `${log._cache.filter(it => /抽奖\]|Error|\s抽奖信息\]/.test(it)).join('\n')}`
                );
            }
            await createRandomDynamic(config.create_dy_num);
            event_bus.flush();
            resolve();
        })
        event_bus.emit('Turn_on_the_Monitor');
    });
}


module.exports = { start }