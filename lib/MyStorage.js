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
                if (PAT && size_in_bytes) {
                    GihubAPI.downloadArtifacts(PAT, id, size_in_bytes).then(async status => {
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
     * 获取dyid
     */
    getDyid: () => {
        console.log('获取已转发过的动态信息');
        return Base.readDyidFile()
    },
    /**
     * 更新dyid
     * @param {string} dyid
     */
    updateDyid: (dyid) => {
        console.log('更新已转发过的动态信息');
        return Base.writeDyidFile(dyid)
    }
}

module.exports = MyStorage;