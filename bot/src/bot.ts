const fs = require('fs')
const creds = require('../../data/creds.json')
const whitelist= fs.readFileSync('../../data/whitelist.txt', "utf8").split('\n')
const accounts = fs.readFileSync('../../data/accounts.txt', 'utf8').split('\n')
import {startListening, getUserIds} from './twitter'

const replaceAll = function (str, stringToFind, stringToReplace) {
    if (stringToFind === stringToReplace) return str;
    var temp = str;
    var index = temp.indexOf(stringToFind);
    while (index != -1) {
        temp = temp.replace(stringToFind, stringToReplace);
        index = temp.indexOf(stringToFind);
    }
    return temp;
};

//per twitter docs, when searching for a partial URL, replace the . with a space (e.g. 'cnn com')
const urlFilterString = whitelist.slice(0, 400).map(u => replaceAll(u, '.', ' ')).join(',')
console.log(urlFilterString)

/* 
//find the user ids for the accounts to follow and start listening
const screennames = accounts.map(a => a.replace('@', '')).join(',')
getUserIds(screennames, creds, (userIds) => {
    startListening(whitelist, {follow: userIds}, creds, "ACCOUNTS")
}) */

startListening(whitelist, {track: urlFilterString}, creds, "WHITELIST_01")