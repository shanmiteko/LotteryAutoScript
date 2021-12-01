const { send } = require('./net/http')
const { strToJson, download, try_for_each } = require('./utils')
const { version, checkVersion, log } = require('./utils')

/**
 * 获取下载链接
 * @param {string} owner
 * @param {string} repo
 * @returns {Promise<{ download_url: string[], text: string }>}
 */
function getLatestReleaseDownloadUrl(owner, repo) {
    return new Promise((resolve, reject) => {
        send({
            url: `https://api.github.com/repos/${owner}/${repo}/releases/latest`,
            headers: {
                "accept": 'application/vnd.github.v3+json'
            },
            config: {
                retry: false
            },
            success: ({ body }) => {
                const { tag_name, assets, body: text } = strToJson(body)
                if (tag_name) {
                    if (checkVersion(version) < checkVersion(tag_name)) {
                        const platform = new Map([
                            ['win32', 'win'],
                            ['linux', 'linux'],
                            ['darwin', 'macos']
                        ]).get(process.platform)
                        const arch = new Map([
                            ['x64', 'x64'],
                            ['arm', 'armv7'],
                            ['arm64', 'arm64']
                        ]).get(process.arch)
                        if (platform && arch) {
                            try {
                                const download_url = assets
                                    .filter(({ name }) => name.includes(platform) && name.includes(arch))
                                    .map(({ browser_download_url }) => browser_download_url)
                                if (!download_url.length) {
                                    reject(`未找到能在此平台(${process.platform})-(${process.arch})上运行的版本`)
                                }
                                resolve({ download_url, text })
                            } catch (err) {
                                reject(err)
                            }
                        } else {
                            reject(`未找到能在此平台(${process.platform})-(${process.arch})上运行的版本`)
                        }
                    } else {
                        reject('当前已是最新版本')
                    }
                } else {
                    reject(body)
                }
            },
            failure: error => {
                reject(error)
            }
        })
    });
}

/**
 * 半自动更新
 */
async function update() {
    try {
        const { download_url, text } = await getLatestReleaseDownloadUrl('shanmiteko', 'LotteryAutoScript')
        await try_for_each(download_url.entries(), async ([i, url]) => {
            let proxy_url = new URL(url)
            proxy_url.host = 'download.fastgit.org'
            await download(proxy_url.href, `latest_version${i}.zip`)
            return false
        })

        log.info('自动下载', '成功下载到当前目录')
        log.info('更新说明', '\n' + text + '\n')
    } catch (error) {
        log.error('更新脚本', error)
    }
}


module.exports = { update }