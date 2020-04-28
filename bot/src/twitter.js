const Twitter = require('twitter');
const queue = require('./queue')

module.exports = {
    //given a comma separated list of screennames (e.g. '@2020WriteIn') returns the corresponding user ids
    getUserIds: (screennames, creds, cb) =>{
        var client = new Twitter(creds);
        client.get('users/lookup', {screen_name: screennames}, function(error, users, response) {
            if (!error) {
              var userids = users.map(x => x.id_str).join(',')
              console.log(userids)
              cb(userids)
            } else {
                throw error
            }
        })
    },
    startListening: (whitelist, filter, creds, instanceId) => {
        var client = new Twitter(creds);
        var stream = client.stream('statuses/filter', filter);
        console.log(`[${instanceId}] listening started...`)
        
        stream.on('data', function(event) {
            if (event) {
                console.log(`[${instanceId}] ${event.id}`)
        
                if (event.entities && event.entities.urls && event.entities.urls.length > 0) {
                    event.entities.urls.forEach(url => {
                        //console.log(url.expanded_url)
                        //console.log('whitelisted: '+queue.isWhitelisted(url.expanded_url, whitelist))
                        //console.log('duplicate: '+isDuplicate(url.expanded_url))
        
                        if (queue.isWhitelisted(url.expanded_url, whitelist) && !queue.isDuplicate(url.expanded_url)) {
                            queue.enqueue(url.expanded_url)
                            console.log(`[${instanceId}] added to queue: ${url.expanded_url}`)
                        }
                    })
                }
            }
        });
         
        stream.on('error', function(error) {
          console.log(`[${instanceId}] ERROR: `+JSON.stringify(error))
        });        
    }
}