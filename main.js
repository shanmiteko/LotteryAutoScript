// import { main } from './lottery-in-nodejs.js';
// /**@type {string}*/
// const COOKIE = (process.argv.slice(2))[0].substr(7);
// main(COOKIE);
import fs from 'fs';
fs.writeFile('test.txt', 'test',()=>{
    fs.readFile('test.txt',(err,data)=>{
        if (err) {
            console.error(err);
        } else {
            console.log(data.toString());
        }
    })
});