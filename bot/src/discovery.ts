//const queuedForScraping = []
import {db} from './db'

const normalizeUrl = (rawurl) => {
    var url = new URL(rawurl)
    url.hash = ''
    //TODO: selectively remove tracking querystrings but leave the result... url.search = '' 
    return url.toString()
}

const getHostname = (urlString) => {
    var url = new URL(urlString)
    return url.hostname.replace('www.','')
}

const whitelisted = async(hostname) => {
    var result = await db.query(`SELECT count(*) from auto_dpl.whitelist where hostname='${hostname}'`)
    return (result.rows[0].count > 0) 

}

const blacklisted = async(hostname) => {
    var result = await db.query(`SELECT count(*) from auto_dpl.blacklist where hostname='${hostname}'`)
    return (result.rows[0].count > 0) 

}

//if url contains a new hostname not previously moderated or enqueued, add to the moderation queue
const updateModerationQueue = async(url, itemSource) => {
        var hostname = getHostname(normalizeUrl(url))
        var w = await whitelisted(hostname)
        var b = await blacklisted(hostname)
        if (!w && !b)
        {
            var isInQueue = await db.query(`SELECT count(*) from auto_dpl.moderation_queue where resource_value='${hostname}'`)
            if (isInQueue.rows[0].count == 0) {
                var result = await db.query(`
                    insert into auto_dpl.moderation_queue 
                    (resource_type, resource_value, added_by, moderation_status)
                    values 
                    ('host','${hostname}','DPL_BOT', 'needs_review')`
                )
            
                return true
            } else {
                return false
            }
        }
}
    
//call this without AWAIT 
const logUrlDiscovery= async(url, twitterUserId, twitterUsername, tweetId) => {
        //while we normally want to log all urls (even if blacklisted) 
        //we exclude twitter urls from the logging, because they are just wasting space - we don't need every RT logged if not a real URL
        if (url.indexOf('twitter.com') >=0)
            return

        var normalizedUrl= normalizeUrl(url)
        var result = await db.query(`
            insert into auto_dpl.all_urls (raw_url, normalized_url, hostname, twitter_username, twitter_user_id, source_tweet_id) 
            values ('${url}','${normalizedUrl}','${getHostname(normalizedUrl)}', '${twitterUsername}',${twitterUserId},${tweetId})`
            )
        return result
}

export {getHostname, logUrlDiscovery, updateModerationQueue, whitelisted, blacklisted}