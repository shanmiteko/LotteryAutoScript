const { log, readDyidFile, writeDyidFile, dyid_length } = require('../utils');

const d_storage = {
    /**
     * 搜索dyid
     * @param {string} dyid
     * @returns {Promise<boolean>}
     */
    searchDyid: (dyid) => {
        return new Promise((resolve) => {
            const Rdyid = new RegExp(dyid);
            const rs = readDyidFile(Number(process.env.NUMBER));
            let status = false;
            rs.on('data', chunk => {
                if (Rdyid.test(chunk)) {
                    status = true;
                }
            });
            rs.on('end', () => {
                resolve(status);
            });
            rs.on('error', err => {
                log.error('搜索dyid', err);
                resolve(status);
            });
        });
    },
    /**
     * 更新dyid
     * @param {string} dyid
     */
    updateDyid: (dyid) => {
        log.info('更新dyid', `写入${dyid}`);
        if (dyid.length !== dyid_length) {
            log.error('更新dyid', `dyid(${dyid})长度不为18 若出现此问题请即时通知开发者`);
        }
        return new Promise((resolve) => {
            const ws = writeDyidFile(Number(process.env.NUMBER));
            ws.write(dyid + ',', () => {
                ws.destroy();
                resolve();
            });
            ws.on('error', err => {
                log.error('更新dyid', err);
                resolve();
            });
        });
    }
};


module.exports = d_storage;