//const queuedForScraping = []
import {db} from './db'

const normalizeUrl = (rawurl) => {
    var url = new URL(rawurl)
    url.hash = ''
    //TODO: selectively remove tracking querystrings but leave the result... url.search = '' 
    return url.toString()
}

const isWhiteListed = (url, whitelist) => {
        return (whitelist.filter(hostname => url.indexOf(hostname)> -1).length > 0)
}

const isDuplicate = async(url) => {
        var normalizedUrl= normalizeUrl(url)
        var result = await db.query(`SELECT count(*) from auto_dpl.scraped_urls where normalized_url='${normalizedUrl}'`)
        console.log(result.rows)
        return (result.rows[0].count > 0)
}
    
//adds url to db in queued state
//assumes that the user has called isWhiteListed before
const enqueue= async(url) => {
    var dupe = await isDuplicate(url)
    if (!dupe) {
        var normalizedUrl= normalizeUrl(url)
        var result = await db.query(`
            insert into auto_dpl.scraped_urls (raw_url, normalized_url, status) 
            values ('${url}','${normalizedUrl}','queued')`
            )
        return result
    } else {
        console.log('duplicate url: '+url)
        return null
    }
}

export {normalizeUrl, isWhiteListed, isDuplicate, enqueue}