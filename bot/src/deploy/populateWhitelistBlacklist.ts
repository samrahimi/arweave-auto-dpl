import {db} from '../db'
var fs=require('fs')

import {whitelist, blacklist} from '../moderation'
const initialWhitelist= fs.readFileSync('../../../data/whitelist.txt', "utf8").split('\n')
const initialBlacklist= fs.readFileSync('../../../data/blacklist.txt', "utf8").split('\n')

initialWhitelist.forEach(item => {
    whitelist(item)
})

initialBlacklist.forEach(item => {
    blacklist(item)
})