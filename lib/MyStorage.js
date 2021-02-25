const Base = require("./Base");
const { ifNotExistCreateFile } = require("./Base");
const GihubAPI = require("./GithubAPI");

const MyStorage = {
    /**
     * 初始化dyid.txt
     */
    init: (PAT) => {
        return new Promise((resolve) => {
            GihubAPI.listArtifacts().then(async artifact => {
                const { id, size_in_bytes } = artifact;
                if (size_in_bytes) {
                    GihubAPI.downloadArtifacts(PAT, id).then(async status => {
                        if (status) {
                            console.log('存储初始化成功');
                        } else {
                            console.log('存储初始化失败');
                            await ifNotExistCreateFile('dyid.txt')
                        }
                        resolve()
                    })
                } else {
                    await ifNotExistCreateFile('dyid.txt')
                    resolve()
                }
            })
        });
    },
    /**
     * 搜索dyid
     * @returns {Promise<boolean>}
     */
    searchDyid: (dyid) => {
        return new Promise((resolve) => {
            const Rdyid = new RegExp(dyid);
            const rs = Base.readDyidFile();
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
                console.log(err)
                resolve(status)
            })
        })
    },
    /**
     * 更新dyid
     * @param {string} dyid
     */
    updateDyid: (dyid) => {
        console.log('写入已转发过的动态信息');
        return new Promise((resolve) => {
            const ws = Base.writeDyidFile();
            ws.write(dyid + ',', () => {
                ws.destroy();
                resolve()
            })
            ws.on('error', err => {
                console.log(err)
                resolve()
            })
        });
    }
}

module.exports = MyStorage;