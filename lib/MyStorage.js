const BiliAPI = require("./BiliAPI");

/**@type {number} */
let aid;

/**
 * 获取草稿的id
 * @param {number} pn
 * @returns {Promise<number>}
 */
async function getDraftid(pn = 1) {
    if (typeof aid === 'number') return aid;
    const list = await BiliAPI.showDraftList(pn);
    if (Object.keys(list).length === 0) {
        aid = await BiliAPI.addDraft('');
        return aid;
    } else {
        const { drafts, page } = list;
        const { pn } = page;
        for (let index = 0; index < drafts.length; index++) {
            const draft = drafts[index];
            if (draft.title === '转发过的动态') {
                aid = draft.id;
                break;
            }
        }
        if (typeof aid === 'number') return aid;
        await getDraftid(pn + 1);
    }
}

/**
 * 获取dyid
 * @returns {Promise<string>}
 */
async function getDyid() {
    const draftId = await getDraftid();
    console.log(`[获取专栏草稿]id:${draftId}`);
    return await BiliAPI.getDraftView(draftId);
}

/**
 * 更新dyid
 * @param {string} dyid
 * @returns
 */
async function updateDyid(dyid) {
    const _dyid = await getDyid();
    if (typeof aid === 'number' && aid !== -1) {
        if (_dyid === '' && dyid === '') return;
        console.log(`[更新专栏草稿]id:${aid}`);
        await BiliAPI.addDraft(_dyid + dyid, aid);
    }
}

/**
 * 清空dyid
 * @param {string} dyid
 * @returns
 */
async function clearDyid() {
    const draftId = await getDraftid();
    console.log(`[清空专栏草稿]id:${draftId}`);
    await BiliAPI.addDraft('', draftId);
}

const MyStorage = {
    getDyid,
    updateDyid,
    clearDyid
};

module.exports = MyStorage;