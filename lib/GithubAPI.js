const { createReadStream, createWriteStream } = require('fs')
const unzip = require('unzipper');
const { strToJson } = require("./Base")
const { HttpRequest } = require("./HttpRequest")

const { GITHUB_REPOSITORY } = process.env;


const GihubAPI = {
    /**
     * 列出第一个构件
     * @returns {Promise<{id: number, size_in_bytes: number}>}
     */
    listArtifacts: () => {
        return new Promise((resolve) => {
            HttpRequest({
                method: 'GET',
                url: `https://api.github.com/repos/${GITHUB_REPOSITORY}/actions/artifacts`,
                config: {
                    retry: false
                },
                query: {
                    page: 1,
                    per_page: 5
                },
                headers: {
                    Accept: 'application/json, text/plain, */*',
                },
                success: res => {
                    const data = strToJson(res.body);
                    if (data.total_count) {
                        resolve(data.artifacts[0])
                    } else {
                        resolve({})
                        console.log('之前无构件');
                    }
                },
                failure: err => {
                    console.log(err);
                    resolve({})
                }
            })
        });
    },
    /**
     * 下载构件
     * @param {string} PAT
     * @param {number} id 
     * @returns {Promise<boolean>} success: true
     */
    downloadArtifacts: (PAT, id) => {
        return new Promise((resolve) => {
            HttpRequest({
                method: 'GET',
                url: `https://api.github.com/repos/${GITHUB_REPOSITORY}/actions/artifacts/${id}/zip`,
                headers: {
                    accept: 'application/vnd.github.v3+json',
                    Authorization: `token ${PAT}`
                },
                config: {
                    redirect: true,
                },
                stream: true,
                success: res => {
                    let recv_length = 0;
                    const wtbs = createWriteStream('dyid.zip');
                    res.resStream.on('data', chuck => {
                        recv_length += chuck.length
                        console.log(`已收到:${recv_length} Bytes`)
                    })
                    res.resStream.pipe(wtbs)
                    wtbs.on('finish', () => {
                        console.log('下载完成开始解压')
                        createReadStream('dyid.zip').pipe(unzip.Extract({
                            path: 'lib'
                        }).on('close', () => {
                            console.log('解压完成')
                            resolve(true)
                        }))
                    }).on('error', () => {
                        wtbs.destroy()
                        resolve(false)
                    })
                },
                failure: err => {
                    console.log(err);
                    resolve(false)
                }
            })
        });
    },
    /**
     * 检查是否正在抽奖或取关
     * @returns {Promise<boolean>}
     */
    hasLotteryRun: () => {
        return new Promise((resolve) => {
            HttpRequest({
                method: 'GET',
                url: `https://api.github.com/repos/${GITHUB_REPOSITORY}/actions/runs`,
                query: {
                    status: "in_progress"
                },
                headers: {
                    accept: 'application/vnd.github.v3+json',
                },
                success: res => {
                    const { workflow_runs } = strToJson(res.body);
                    if (workflow_runs instanceof Array) {
                        workflow_runs.filter(wr => /sweepstakes|clear/.test(wr.name)).length > 1 ?
                            resolve(true) : resolve(false)
                    } else {
                        resolve(true)
                    }
                },
                failure: err => {
                    console.log(err);
                    resolve(true)
                }
            })
        });
    }
}

module.exports = GihubAPI;