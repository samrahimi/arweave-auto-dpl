const Twitter = require('twitter');
const creds = require('../../data/creds.json')
const fs = require('fs')

const whitelist= fs.readFileSync('../../data/whitelist.txt', "utf8").split('\n')
const queuedForScraping = []

const isWhitelisted = (url) => {
    return (whitelist.filter(hostname => url.indexOf(hostname)> -1).length > 0)
}

//adds a url to the queue to be scraped and archived
//this will use a DB in production
const enqueue= (url) => {
    queuedForScraping.push(url)
    console.log('queued: '+url)
}

//per twitter docs, when searching for a partial URL, replace the . with a space (e.g. 'cnn com')
const searchterms = whitelist.slice(0, 400).map(u => u.replace('.', ' ')).join(',')

var client = new Twitter(creds);
var stream = client.stream('statuses/filter', {track: searchterms});

stream.on('data', function(event) {
    if (event) {
        console.log(event.id)

        if (event.entities && event.entities.urls && event.entities.urls.length > 0) {
            event.entities.urls.forEach(url => {
                console.log(url.expanded_url)
                console.log('whitelisted: '+isWhitelisted(url.expanded_url))
                if (isWhitelisted(url.expanded_url))
                    enqueue(url.expanded_url)
            })
        }
    }
});
 
stream.on('error', function(error) {
  throw error;
});

/*
var params = {screen_name: 'nodejs'};
client.get('statuses/user_timeline', params, function(error, tweets, response) {
  if (!error) {
    console.log(tweets);
  } else {console.log(error)}
}); */
