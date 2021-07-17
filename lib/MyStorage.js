const Base = require("./Base");
const { log } = Base;

const MyStorage = {
    /**
     * 搜索dyid
     * @param {string} dyid
     * @returns {Promise<boolean>}
     */
    searchDyid: (dyid) => {
        return new Promise((resolve) => {
            const Rdyid = new RegExp(dyid);
            const rs = Base.readDyidFile(Number(process.env.NUMBER));
            let status = false;
            rs.on('data', chunk => {
                if (Rdyid.test(chunk)) {
                    status = true
                }
            })
            rs.on('end', () => {
                resolve(status)
            })
            rs.on('error', err => {
                log.error('搜索dyid', err)
                resolve(status)
            })
        })
    },
    /**
     * 更新dyid
     * @param {string} dyid
     */
    updateDyid: (dyid) => {
        log.info('更新dyid', `写入${dyid}`);
        return new Promise((resolve) => {
            const ws = Base.writeDyidFile(Number(process.env.NUMBER));
            ws.write(dyid + ',', () => {
                ws.destroy();
                resolve()
            })
            ws.on('error', err => {
                log.error('更新dyid', err)
                resolve()
            })
        });
    }
}

module.exports = MyStorage;