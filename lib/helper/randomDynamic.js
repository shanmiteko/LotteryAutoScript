const config = require("../data/config");
const bili = require("../net/bili");
const utils = require("../utils");

/**
 * 随机动态
 * @param {number} num
 * @returns
 */
async function randomDynamic(num) {
    const { create_dy_type, dy_contents } = config;

    if (create_dy_type === -1 || create_dy_type === 0 || typeof create_dy_type === 'undefined') {
        for (let index = 0; index < num; index++) {
            await bili.createDynamic(utils.getRandomOne(dy_contents));
            await utils.delay(2000);
        }
    }

    if (create_dy_type === -1 || create_dy_type === 1) {
        let videos = await bili.getTopRcmd()
        for (let index = 0; videos.length < num; index++) {
            videos.push(...await bili.getTopRcmd())
        }

        await utils.try_for_each(videos, async ([uid, aid]) => {
            if (num--) {
                await bili.shareVideo(uid, aid)
                await utils.delay(2000)
                return false
            } else {
                return true
            }
        })
    }
}


module.exports = { randomDynamic }