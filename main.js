const { main,isMe } = require('./lottery-in-nodejs.js');
const COOKIE = process.env.COOKIE;
const SCKEY = process.env.SCKEY;
main(COOKIE);
isMe(SCKEY);