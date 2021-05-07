const Base = require("./Base");
const GihubAPI = require("./GithubAPI");

const MyStorage = {
    /**
     * 初始化dyid.txt
     */
    init: () => {
        return new Promise((resolve) => {
            GihubAPI.listArtifacts().then(async artifact => {
                const { id, size_in_bytes } = artifact;
                if (size_in_bytes) {
                    GihubAPI.downloadArtifacts(id).then(async status => {
                        if (status) {
                            Base.tooltip.log('存储初始化成功');
                        } else {
                            Base.tooltip.log('存储初始化失败');
                            await Base.createFile('dyid.txt', '', 'a')
                        }
                        resolve()
                    })
                } else {
                    await Base.createFile('dyid.txt', '', 'a')
                    resolve()
                }
            })
        });
    },
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
                Base.tooltip.log(err)
                resolve(status)
            })
        })
    },
    /**
     * 更新dyid
     * @param {string} dyid
     */
    updateDyid: (dyid) => {
        Base.tooltip.log('写入已转发过的动态信息');
        return new Promise((resolve) => {
            const ws = Base.writeDyidFile(Number(process.env.NUMBER));
            ws.write(dyid + ',', () => {
                ws.destroy();
                resolve()
            })
            ws.on('error', err => {
                Base.tooltip.log(err)
                resolve()
            })
        });
    }
}

module.exports = MyStorage;