const config = require("../data/config");
const bili = require("../net/bili");
const utils = require("../utils");

/**
 * 随机动态
 * @param {number} num
 * @returns
 */
async function randomDynamic(num) {
    let dynamics = []
    const
        { create_dy_type, dy_contents, random_dynamic_wait } = config,
        hasShareVideo = create_dy_type === -1 || create_dy_type === 1,
        hasRandomCreate = create_dy_type === -1 || create_dy_type === 0 || typeof create_dy_type === 'undefined';

    if (hasShareVideo) {
        dynamics = await bili.getTopRcmd()
        for (let index = 0; dynamics.length < num; index++) {
            dynamics.push(...await bili.getTopRcmd())
        }
    }

    if (hasRandomCreate) {
        for (let index = 0; index < num; index++) {
            dynamics.push(utils.getRandomOne(dy_contents))
        }
    }

    await utils.try_for_each(
        utils.shuffle(dynamics).slice(0, num),
        async (dynamic) => {
            await utils.delay(random_dynamic_wait);
            if (dynamic instanceof Array && dynamic.length === 2 && typeof dynamic[0] === "number") {
                await bili.shareVideo(...dynamic)
            } else {
                await bili.createDynamic(dynamic)
            }
        }
    )
}

module.exports = { randomDynamic }