const fs = require('fs')
const creds = require('../../data/creds.json')
const whitelist= fs.readFileSync('../../data/whitelist.txt', "utf8").split('\n')
const accounts = fs.readFileSync('../../data/accounts.txt', 'utf8').split('\n')
const twitter = require('./twitter')

//per twitter docs, when searching for a partial URL, replace the . with a space (e.g. 'cnn com')
const urlFilterString = whitelist.slice(0, 400).map(u => u.replace('.', ' ')).join(',')
const screennames = accounts.map(a => a.replace('@', '')).join(',')

//find the user ids for the accounts to follow and start listening
twitter.getUserIds(screennames, creds, (userIds) => {
    twitter.startListening(whitelist, {follow: userIds}, creds, "ACCOUNTS")
})

twitter.startListening(whitelist, {track: urlFilterString}, creds, "WHITELIST_01")
//twitter.startListening(whitelist, {track: 'en wikipedia org'}, creds, "WHITELIST_01")