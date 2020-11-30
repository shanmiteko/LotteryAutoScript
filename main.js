import { main,isMe } from './lottery-in-nodejs.js';
/**@type {string}*/
const COOKIE = process.env.COOKIE;
const SCKEY = process.env.SCKEY;
main(COOKIE);
isMe(SCKEY);