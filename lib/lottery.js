const utils = require('./utils');
const bili = require('./net/bili');
const event_bus = require('./helper/event_bus');
const global_var = require('./data/global_var');
const { Searcher } = require('./core/searcher');
const { Monitor } = require('./core/monitor');
const config = require('./data/config');
const { log } = utils;

async function createRandomDynamic(num) {
    if (config.create_dy) {
        log.info('随机动态', `准备创建${num}条随机动态`);
        const Dynamic = await Searcher.checkAllDynamic(global_var.get("myUID"), 1);
        if ((Dynamic.allModifyDynamicResArray[0] || { type: 0 }).type === 1) {
            for (let index = 0; index < num; index++) {
                await bili.createDynamic(utils.getRandomOne(config.dy_contents));
                await utils.delay(2000);
            }
        } else {
            log.info('随机动态', '已有非抽奖动态故无需创建');
        }
    }
}

/**
 * 抽奖主函数
 * @param {string} cookie
 * @returns {Promise<void>}
 */
function start() {
    return new Promise(resolve => {
        let times = utils.counter();
        /* 注册事件 */
        event_bus.on('Turn_on_the_Monitor', async () => {
            const lotterys = global_var.get("Lottery");
            if (lotterys.length === 0) {
                log.info('抽奖', '抽奖信息为空');
                resolve();
                return;
            }
            if (times.value() === lotterys.length) {
                await createRandomDynamic(config.create_dy_num);
                log.info('抽奖', '所有动态转发完毕');
                times.clear();
                event_bus.emit('Turn_off_the_Monitor', '目前无抽奖信息,过一会儿再来看看吧')
                return;
            }
            const lottery = lotterys[times.next()];

            await (new Monitor(lottery)).init();
        });
        event_bus.on('Turn_off_the_Monitor', async (msg) => {
            await createRandomDynamic(config.create_dy_num);
            log.info('结束抽奖', '原因: ' + msg);
            event_bus.flush();
            resolve();
        })
        event_bus.emit('Turn_on_the_Monitor');
    });
}


module.exports = { start }