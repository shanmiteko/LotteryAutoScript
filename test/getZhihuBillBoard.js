const { getZhihuBillBoard } = require("../lib/Base");

getZhihuBillBoard().then(x => {
    console.log(x);
})