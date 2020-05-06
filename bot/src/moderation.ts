import {db} from './db'
import {getHostname, whitelisted, blacklisted} from './discovery'

const moderateHostname = async(hostname, approved: boolean, moderator: string, comments: string) => {
        var isInQueue = await db.query(`SELECT count(*) from auto_dpl.moderation_queue where resource_value='${hostname}'`)
        if (isInQueue.rows[0].count == 0) {
            var result = await db.query(`
                update auto_dpl.moderation_queue
                set status='${approved ? 'whitelisted': 'blacklisted'}', moderated_by='${moderator}',  comments='${comments}'
                where resource_value='${hostname}'`
            )
        
            return true
        } else {
            return false
        }
    }

const normalizeUrl = (rawurl) => {
    var url = new URL(rawurl)
    url.hash = ''
    //TODO: selectively remove tracking querystrings but leave the result... url.search = '' 
    return url.toString()
}
    

//given a url, adds the hostname to the moderation queue, 
//if and only if it has not been previously moderated or added to the queue
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
                    (resource_type, resource_value, 'added_by', 'moderation_status')
                    values 
                    ('host','${hostname}','DPL_BOT' 'needs_review')`
                )
            
                return true
            } else {
                return false
            }
        }
}
