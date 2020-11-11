// import { main } from './lottery-in-nodejs.js';
// /**@type {string}*/
// const COOKIE = (process.argv.slice(2))[0].substr(7);
// main(COOKIE);
// import fs from 'fs';
const delay = time => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve()
        }, time)
    })
};
const P = new Promise((resolve) => {
    (async ()=>{
        for (let index = 0; index < 100; index++) {
            console.log(new Date(Date.now()).toLocaleString());
            await delay(1000)
        }
        resolve()
    })()
});
P.then(()=>{
    console.log('运行结束');
})