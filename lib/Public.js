const Base = require('./Base');
const BiliAPI = require('./BiliAPI');
/**
 * 基础功能
 */
class Public {
    constructor() { }
    /**
     * 检查所有的动态信息
     * @param {string} UID
     * 指定的用户UID
     * @param {number} pages
     * 读取页数
     * @returns {
        Promise<{
            uid: number;
            dynamic_id: string;
            description: string;
            type: string;
            origin_uid: string;
            origin_uname: string;
            origin_rid_str: string;
            origin_dynamic_id: string;
            origin_hasOfficialLottery: boolean;
            origin_description: string;
            origin_type: string;
        }[]>
    } 获取前 pages*12 个动态信息
     */
    async checkAllDynamic(hostuid, pages, time = 0) {
        console.log(`准备读取${pages}页自己的动态信息`);
        const mDR = this.modifyDynamicRes,
            getOneDynamicInfoByUID = BiliAPI.getOneDynamicInfoByUID,
            curriedGetOneDynamicInfoByUID = Base.curryify(getOneDynamicInfoByUID); /* 柯里化的请求函数 */
        /**
         * 储存了特定UID的请求函数
         */
        let hadUidGetOneDynamicInfoByUID = curriedGetOneDynamicInfoByUID(hostuid);
        /**
         * 储存所有经过整理后信息
         * [{}{}...{}]
         */
        let allModifyDynamicResArray = [];
        let offset = '0';
        for (let i = 0; i < pages; i++) {
            console.log(`正在读取第${i + 1}页动态`);
            let OneDynamicInfo = await hadUidGetOneDynamicInfoByUID(offset);
            const mDRdata = mDR(OneDynamicInfo);
            if (mDRdata === null) {
                break;
            }
            /**
             * 储存一片动态信息
             * [{}{}...{}]
             */
            const mDRArry = mDRdata.modifyDynamicResArray,
                nextinfo = mDRdata.nextinfo;
            if (nextinfo.has_more === 0) {
                console.log(`成功读取${i + 1}页信息(已经是最后一页了故无法读取更多)`);
                break;
            } else {
                allModifyDynamicResArray.push.apply(allModifyDynamicResArray, mDRArry);
                i + 1 < pages ? console.log(`开始读取第${i + 2}页动态信息`) : console.log(`${pages}页信息全部成功读取完成`);
                offset = nextinfo.next_offset;
            }
            await Base.delay(time);
        }
        return (allModifyDynamicResArray);
    }
    /**
     * 互动抽奖
     * 处理来自动态页面的数据
     * @param {String} res
     * @returns {
        {
            modifyDynamicResArray: {
                uid: number;
                uname: string;
                rid_str: string;
                dynamic_id: string;
                type: number;
                description: string;
                hasOfficialLottery: boolean;
                origin_uid: number;
                origin_uname: string;
                origin_rid_str: string;
                origin_dynamic_id: string;
                orig_type: number;
                origin_description: string;
                origin_hasOfficialLottery: boolean;
            }[];
            nextinfo: {
                has_more: number;
                next_offset: string;
            };
        } | null
    } 返回对象,默认为null
     */
    modifyDynamicRes(res) {
        const strToJson = Base.strToJson,
            jsonRes = strToJson(res),
            { data } = jsonRes;
        if (jsonRes.code !== 0) {
            console.log('获取动态数据出错,可能是访问太频繁');
            return null;
        }
        /* 字符串防止损失精度 */
        const offset = typeof data.offset === 'string' ? data.offset : /(?<=next_offset":)[0-9]*/.exec(res)[0],
            next = {
                has_more: data.has_more,
                next_offset: offset
            };
        /**
         * 储存获取到的一组动态中的信息
         */
        let array = [];
        if (next.has_more === 0) {
            console.log('动态数据读取完毕');
        } else {
            /**
             * 空动态无cards
             */
            const Cards = data.cards;
            Cards.forEach(onecard => {
                /**临时储存单个动态中的信息 */
                let obj = {};
                const { desc, card } = onecard,
                    { info } = desc.user_profile,
                    cardToJson = strToJson(card);
                obj.uid = info.uid; /* 转发者的UID */
                obj.uname = info.uname; /* 转发者的name */
                obj.rid_str = desc.rid_str; /* 用于发送评论 */
                obj.type = desc.type; /* 动态类型 */
                obj.orig_type = desc.orig_type; /* 源动态类型 */
                obj.dynamic_id = desc.dynamic_id_str; /* 转发者的动态ID !!!!此为大数需使用字符串值,不然JSON.parse()会有丢失精度 */
                const { extension } = onecard;
                obj.hasOfficialLottery = (typeof extension === 'undefined') ? false : typeof extension.lott === 'undefined' ? false : true; /* 是否有官方抽奖 */
                const item = cardToJson.item || {};
                obj.description = item.content || item.description || ''; /* 转发者的描述 */
                if (obj.type === 1) {
                    obj.origin_uid = desc.origin.uid; /* 被转发者的UID */
                    obj.origin_rid_str = desc.origin.rid_str; /* 被转发者的rid(用于发评论) */
                    obj.origin_dynamic_id = desc.orig_dy_id_str; /* 被转发者的动态的ID !!!!此为大数需使用字符串值,不然JSON.parse()会有丢失精度 */
                    const { origin, origin_extension } = cardToJson || {};
                    obj.origin_hasOfficialLottery = typeof origin_extension === 'undefined' ? false : typeof origin_extension.lott === 'undefined' ? false : true; /* 是否有官方抽奖 */
                    const { user, item } = typeof origin === 'undefined' ? {} : strToJson(origin);
                    obj.origin_uname = typeof user === 'undefined' ? '' : user.name || user.uname || ''; /* 被转发者的name */
                    obj.origin_description = typeof item === 'undefined' ? '' : item.content || item.description || ''; /* 被转发者的描述 */
                }
                array.push(obj);
            });
        }
        return {
            modifyDynamicResArray: array,
            nextinfo: next
        };
    }
    /**
     * 获取tag下的抽奖信息(转发母动态)
     * 并初步整理
     * @returns {
        Promise<{
            uid: number;
            dyid: string;
            befilter: boolean;
            rid: string;
            des: string;
            type: number;
            hasOfficialLottery: boolean
        }[] | null>
    }
     */
    async getLotteryInfoByTag() {
        const self = this,
            tag_name = self.tag_name,
            tag_id = await BiliAPI.getTagIDByTagName(tag_name),
            hotdy = await BiliAPI.getHotDynamicInfoByTagID(tag_id),
            modDR = self.modifyDynamicRes(hotdy);
        if (modDR === null)
            return null;
        console.log(`开始获取带话题#${tag_name}#的动态信息`);
        let mDRdata = modDR.modifyDynamicResArray;
        const newdy = await BiliAPI.getOneDynamicInfoByTag(tag_name, modDR.nextinfo.next_offset);
        mDRdata.push.apply(mDRdata, self.modifyDynamicRes(newdy).modifyDynamicResArray);
        const fomatdata = mDRdata.map(o => {
            const hasOrigin = o.type === 1;
            return {
                uid: o.uid,
                dyid: o.dynamic_id,
                befilter: hasOrigin,
                rid: o.rid_str,
                des: o.description,
                type: o.type,
                hasOfficialLottery: o.hasOfficialLottery
            };
        });
        console.log(`成功获取带话题#${tag_name}#的动态信息`);
        return fomatdata;
    }
    /**
     * 获取最新动态信息(转发子动态)
     * 并初步整理
     * @returns {
        Promise<{
            uid: number;
            dyid: string;
            befilter: boolean;
            rid: string;
            des: string;
            type: number;
            hasOfficialLottery: boolean
        }[] | null>
    }
     */
    async getLotteryInfoByUID() {
        const self = this,
            dy = await BiliAPI.getOneDynamicInfoByUID(self.UID, 0),
            modDR = self.modifyDynamicRes(dy);
        if (modDR === null)
            return null;
        const mDRdata = modDR.modifyDynamicResArray,
            _fomatdata = mDRdata.map(o => {
                return {
                    uid: o.origin_uid,
                    dyid: o.origin_dynamic_id,
                    befilter: false,
                    rid: o.origin_rid_str,
                    des: o.origin_description,
                    type: o.orig_type,
                    hasOfficialLottery: o.origin_hasOfficialLottery
                };
            });
        const fomatdata = _fomatdata.filter(a => {
            if (a.type === 0) {
                return false;
            }
            return true;
        });
        return fomatdata;
    }
}

module.exports = Public;
