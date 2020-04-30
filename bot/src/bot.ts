const fs = require('fs')
const creds = require(process.env.TWITTER_CREDENTIALS || '../../data/creds.json') 
const whitelist= fs.readFileSync('../../data/whitelist.txt', "utf8").split('\n')
const accounts = fs.readFileSync('../../data/accounts.txt', 'utf8').split('\n')
import {startListening, getUserIds} from './twitter'
import {replaceAll} from './util'



const startTwitterBot = () => {
    //per twitter docs, when searching for a partial URL, replace the . with a space (e.g. 'cnn com')
    const urls1 = whitelist.slice(0, 400).map(u => replaceAll(u, '.', ' ')).join(',')
    const urls2 = whitelist.slice(400, 800).map(u => replaceAll(u, '.', ' ')).join(',')

    //find the user ids for the accounts to follow and start listening
    const screennames = accounts.map(a => a.replace('@', '')).join(',')
    getUserIds(screennames, creds[0], (userIds) => {
        startListening(whitelist, {follow: userIds, track: urls1}, creds[0], "INSTANCE_01")
        startListening(whitelist, {follow: userIds, track: urls2}, creds[1], "INSTANCE_02")
    }) 
    //startListening(whitelist, {track: urlFilterString}, creds, "WHITELIST_01")
}

export {startTwitterBot}
