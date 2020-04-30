# arweave-auto-dpl
Twitter bot and news archiver
# Auto-DPL

This package consists of 2 programs that run independently of each other but connect to a shared database. The twitter bot extracts URLs from a filtered stream of tweets if they match the whitelist. The scraper / archiver downloads the contents of these URLs, bundles the resources into a single html page, and uploads them to Arweave using the 2.0 "fastwrite" protocol

## Config

MAX_THREADS - the number of concurrent scraper / archiver threads to run. Set this depending on what the injectable-archiver service can handle
DATABASE_URL - postgres connection string
TWITTER_CREDENTIALS - custom location of twitter credentials file
WALLET_FILE - custom location of Arweave JSON wallet to use
INJECTABLE_ARCHIVER_URL - endpoint to hit when scraping URLs

## Run

1. Start the twitter bot: `npm run start-twitter-bot`
2. Start the scraper / archiver: `npm run start-scraping`

## Create files and folders

The file explorer is accessible using the button in left corner of the navigation bar. You can create a new file by clicking the **New file** button in the file explorer. You can also create folders by clicking the **New folder** button.

## DB setup

TBD - ask Sam or Aidan


## Known Issues

The code that splits up the whitelist into 2 chunks of 400 urls and listens for them on separate twitter API connections will have to change if the whitelist grows larger than 800 urls, which it will.

Each Twitter API key can listen for 400 search terms (in this case, URLs) and follow 5000 accounts. So we will need to obtain additional keys soon.