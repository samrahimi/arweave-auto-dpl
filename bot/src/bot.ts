const fs = require('fs')
import {db} from './db'
const creds = require(process.env.TWITTER_CREDENTIALS || '../../data/creds.json') 
import {startListening, getUserIds} from './twitter'
import {replaceAll} from './util'

const getWhiteList = async() => {
    var result = await db.query(
        `SELECT * from auto_dpl.whitelist`)

    return result.rows.map(row => row.hostname)
}

const getAccounts = async() => {
    return fs.readFileSync('../../data/accounts.txt', 'utf8').split('\n')
}

const startTwitterBot = async() => {

    const whitelist= await getWhiteList()
    const accounts = await getAccounts()

    //per twitter docs, when searching for a partial URL, replace the . with a space (e.g. 'cnn com')
    const urls1 = whitelist.slice(0, 400).map(u => replaceAll(u, '.', ' ')).join(',')
    const urls2 = whitelist.slice(400, 800).map(u => replaceAll(u, '.', ' ')).join(',')

    //find the user ids for the accounts to follow and start listening
    const screennames = accounts.map(a => a.replace('@', '')).join(',')
    getUserIds(screennames, creds[0], (userIds) => {
        startListening({follow: userIds, track: urls1}, creds[0], "INSTANCE_01")
        startListening({track: urls2}, creds[1], "INSTANCE_02")
    }) 
    //startListening(whitelist, {track: urlFilterString}, creds, "WHITELIST_01")
}

export {startTwitterBot}