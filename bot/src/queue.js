const queuedForScraping = []

module.exports = {
     isWhitelisted: (url, whitelist) => {
        return (whitelist.filter(hostname => url.indexOf(hostname)> -1).length > 0)
    }
    ,
    //if the url is already archived or is queued, we want to skip it. just a stub for now
     isDuplicate: (url) => {
        return queuedForScraping.indexOf(url) > -1
    },
    
    //adds a url to the queue to be scraped and archived
    //this will use a DB in production
    enqueue: (url) => {
        queuedForScraping.push(url)
        console.log('queued: '+url)
    }
}
