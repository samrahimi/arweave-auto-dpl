//a scraping thread will run as long as there is work available in the queue 
//(at least 1 url in the db with status 'queued')
//it picks the next url from the queue, scrapes and bundles into single html file 
//and finally writes the file to Arweave, tagged appropriately 
//when the queue is empty, the thread will terminate and decrease ACTIVE_THREAD_COUNT

import {db} from './db'
import {writePageToArweave} from './archive'
import axios from "axios"
const injectableArchiverUrl = 'http://159.203.76.244:1888/scrape/'

const sleep = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}

const getTitle = (htmlStr) => {
    var start = htmlStr.indexOf('<title>') + 7
    var end = htmlStr.indexOf('</title>')

    if (start<0 || end < 0)
        return null
    else return 
        return htmlStr.substring(start, end)
}
var ACTIVE_THREAD_COUNT = 0

const scrape = async(urlToScrape) => {
    var ax = axios.create()
    const response = await ax.get(injectableArchiverUrl+urlToScrape, {timeout: 300000 }); 
    if (response.status === 200) {
        console.log('scrape success for '+urlToScrape)
        return response.data;
    } else {
        throw new Error("HTTP error "+response.status+" on scrape "+urlToScrape)
    }
}

const startScrapingThread = async() => {
    ACTIVE_THREAD_COUNT++
     while (true) {
        //get the oldest item in the queue 
        var result = await db.query(
        `SELECT top 1 * from auto_dpl.scraped_urls 
         where status='queued'
         order by id asc`)

         if (result[0] && result[0].normalized_url) {
             try
             {
             console.log("scraping "+result[0].normalized_url)
             await db.query(`update auto_dpl.scraped_urls set status='pending' where id = ${result[0].id}`)
             var html = await scrape(result[0].normalized_url)

             console.log("archiving "+result[0].normalized_url)
             var tags = [
                 {
                    "name": "page:url",
                    "value": result[0].normalized_url
                 }, 
                 {
                     "name": "page:title",
                     "value": getTitle(html) || result[0].normalized_url
                 },
                 {
                     "name": "page:timestamp",
                     "value": Date.now().toString()
                 },
             ]
             var txid = await writePageToArweave(html, tags)
             
             if (txid == null) throw new Error("error on write to arweave (2.0 fastwrite)")
             console.log("done archiving "+result[0].normalized_url+" (txid "+txid+")")
             
             await db.query(`update auto_dpl.scraped_urls 
             set status='archived', arweave_tx_id='${txid}'   
             where id = ${result[0].id}`)

            } 
            catch (err) {
             console.log("ERROR in scraping / archiving... Flagging in DB. Error detail:")
             console.log(JSON.stringify(err))
             await db.query(`update auto_dpl.scraped_urls set status='error' where id = ${result[0].id}`)
            }

         } else {
             console.log("nothing to do... sleeping for 10 seconds")
             await sleep(10000)
         }
    }
}

export {startScrapingThread} 