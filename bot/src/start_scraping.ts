import {startScrapingThread} from './scrape'
import {sleep} from './util'

const MAX_THREADS = process.env.MAX_THREADS || 5
const STAGGER_INTERVAL = 1000

const start = async() => {
    console.log("Scraper threads starting up...")
    for (var i=0; i < MAX_THREADS; i++) {
        startScrapingThread()
        await sleep(STAGGER_INTERVAL)
    }
    console.log("Scraper startup complete")
}

start()