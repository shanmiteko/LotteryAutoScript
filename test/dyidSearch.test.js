const assert = require('assert');
const util = require('./util');
const d_storage = require('../lib/helper/d_storage');

(async () => {
    await util.par_run([0], [
        // 0
        async () => {
            assert(await d_storage.searchDyid('1234567901234568'));
            assert(!await d_storage.searchDyid('1234567901234569'));
        },
    ]);
    console.log('dyidSearch.test ... ok!');
})();