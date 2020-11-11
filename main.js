import { main } from './lottery-in-nodejs.js';
/**@type {string}*/
const COOKIE = (process.argv.slice(2))[0].substr(7);
main(COOKIE);