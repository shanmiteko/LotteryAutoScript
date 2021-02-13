const { getDyid } = require("../lib/MyStorage");

(async () => {
    let alldyid = await getDyid();
    console.log(alldyid);
})()