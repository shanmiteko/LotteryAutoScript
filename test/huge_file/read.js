const { createReadStream, createWriteStream } = require('fs');

const file = 'test/huge_file/dyid.txt';
const test = 'test/huge_file/test.txt';

const ws = createReadStream(file, { encoding: 'utf8', highWaterMark: 19 * 1000 })

const rs = createWriteStream(test, { flags: 'a' })

rs.write(Date.now() + '->', () => {
    console.log('写入完毕');
    rs.destroy()
})

let i = 0;
ws.on('data', chunk => {
    i++;
    if (/000000000000000000/.test(chunk)) {
        console.log('success')
        console.log('in ' + i)
        // 14764824 bytes
        // success
        // in 778
        // [Done] exited with code=0 in 0.331 seconds
    }
})