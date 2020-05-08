import {db} from './db'
import {getHostname, whitelisted, blacklisted} from './discovery'

const moderateHostname = async(hostname, approved: boolean, moderator="", comments="") => {
            var result = await db.query(`
                update auto_dpl.moderation_queue
                set moderation_status='${approved ? 'whitelisted': 'blacklisted'}', moderated_by='${moderator}',  comments='${comments}'
                where resource_value='${hostname}'`
            )

            if (approved) 
                await whitelist(hostname, moderator, comments)
            else
                await blacklist(hostname, moderator, comments)
        
            return {success: true}
}

const lockWhileInProgress = async(hostname) => {
    var result = await db.query(`
                update auto_dpl.moderation_queue
                set moderation_status='pending'
                where resource_value='${hostname}'`
            )
    return result

}
//returns the next item in the queue, marking it's status so it is locked until disposition
const getItemForReview = async() => {
    //todo: prioritize by count of all_urls with matching hostname
    var result = await db.query(`
    select * from auto_dpl.moderation_queue 
    where moderation_status='needs_review'
    order by id asc limit 1`)

    var queued_item = result.rows[0]

    var urls_result = await db.query(`select * from auto_dpl.all_urls where hostname ='${queued_item.resource_value}'`)
    await lockWhileInProgress(queued_item.resource_value)

    var obj = {
            id: queued_item.id,
            hostname: queued_item.resource_value,
            added_at: queued_item.added_at,
            added_by: queued_item.added_by,
            urls: urls_result.rows
    }
    return obj
}
const normalizeUrl = (rawurl) => {
    var url = new URL(rawurl)
    url.hash = ''
    //TODO: selectively remove tracking querystrings but leave the result... url.search = '' 
    return url.toString()
}

const whitelist = async(hostname, added_by='', comments='') => {
    var result = await db.query(`
    insert into auto_dpl.whitelist 
    (hostname, comments, added_by)
    values 
    ('${hostname}','${comments}', '${added_by}')`)

    return result

}


const blacklist = async(hostname, added_by='', comments='') => {
    var result = await db.query(`
    insert into auto_dpl.blacklist 
    (hostname, comments, added_by)
    values 
    ('${hostname}','${comments}', '${added_by}')`)

    return result

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
                    (resource_type, resource_value, added_by, moderation_status)
                    values 
                    ('host','${hostname}','DPL_BOT' 'needs_review')`
                )
            
                return true
            } else {
                return false
            }
        }
}
export {updateModerationQueue, whitelist, blacklist, moderateHostname, getItemForReview}