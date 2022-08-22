const env = require("../lib/data/env");
const global_var = require("../lib/data/global_var");
const { log } = require('../lib/utils');
const fs = require('fs');

log._level = 0
env.init()
global_var.init(process.env["COOKIE"], 1)

fs.readdirSync(module.path)
    .filter(file => file.endsWith(".test.js"))
    .forEach(file => require(`${module.path}/${file}`))