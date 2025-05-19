const { send } = require('./net/http');
const { strToJson, download, try_for_each } = require('./utils');
const { version, checkVersion, log } = require('./utils');

const
    platform = new Map([
        ['win32', 'win'],
        ['linux', 'linux'],
        ['darwin', 'macos']
    ]).get(process.platform),
    arch = new Map([
        ['x64', 'x64'],
        ['arm', 'armv7'],
        ['arm64', 'arm64']
    ]).get(process.arch);

/**
 * 获取下载链接
 * @param {string} owner
 * @param {string} repo
 * @returns {Promise<{ tag_name:string, assets:Object, text:string }>}
 */
function getLatestRelease(owner, repo) {
    return new Promise((resolve, reject) => {
        send({
            url: `https://api.github.com/repos/${owner}/${repo}/releases/latest`,
            headers: {
                'accept': 'application/vnd.github.v3+json'
            },
            config: {
                retry: false
            },
            success: ({ body }) => {
                const release = strToJson(body);
                if (release.tag_name) {
                    resolve(release);
                } else {
                    reject(body);
                }
            },
            failure: error => {
                reject(error);
            }
        });
    });
}

/**
 * @param {string} releases
 * @return {boolean}
*/
function checkPlatform(releases) {
    return releases.includes(platform)
        && releases.includes(arch);
}

/**
 * 半自动更新
 * @param {boolean} isDdownload
 */
async function update(isDdownload) {
    try {
        const { tag_name, assets, body: text } = await getLatestRelease('shanmiteko', 'LotteryAutoScript');
        if (checkVersion(version) < checkVersion(tag_name)) {
            const download_url = assets
                .filter(({ name }) => checkPlatform(name))
                .map(({ browser_download_url }) => browser_download_url);
            if (download_url.length) {
                if (isDdownload) {
                    await try_for_each(download_url.entries(), async ([i, url]) => {
                        let proxy_url = 'https://mirror.ghproxy.com/';
                        proxy_url += url;
                        log.warn('自动下载', `切换代理${proxy_url}`);
                        await download(proxy_url, `latest_version${i}.zip`)
                            .catch(async err => {
                                log.error('自动下载', err);
                                proxy_url = url;
                                log.warn('自动下载', `使用原始链接${proxy_url}`);
                                await download(proxy_url, `latest_version${i}.zip`);
                            });
                        return false;
                    });
                    log.info('自动下载', '成功下载到当前目录');
                    log.info('检查更新', '请手动解压替换可执行文件');
                }
                log.notice('更新说明', '\n' + text + '\n');
            } else {
                throw `未找到能在此平台(${process.platform})-(${process.arch})上运行的版本,建议以源码运行`;
            }
        } else {
            throw '当前已是最新版本';
        }
    } catch (error) {
        log.warn('更新脚本', error);
    }
}


module.exports = { update };