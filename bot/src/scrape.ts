//a scraping thread will run as long as there is work available in the queue 
//(at least 1 url in the db with status 'queued')
//it picks the next url from the queue, scrapes and bundles into single html file 
//and finally writes the file to Arweave, tagged appropriately 
//when the queue is empty, the thread will terminate and decrease ACTIVE_THREAD_COUNT

import {db} from './db'
import {writePageToArweave} from './archive'
import {sleep} from './util'

import axios from "axios"
const injectableArchiverUrl = 'http://159.203.76.244:1888/scrape/'


const getTitle = (htmlStr) => {
    var start = htmlStr.indexOf('<title>') + 7
    var end = htmlStr.indexOf('</title>')

    if (start<7 || end < 0)
        return null
    else  
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
        `SELECT * from auto_dpl.scraped_urls 
         where status='queued'
         order by id asc
         limit 1`)
        
         if (result.rows && result.rows[0]) {
             const row = result.rows[0]
             try
             {
                console.log("scraping "+row.normalized_url)

                //setting the status on the record 'locks' it from being picked up by another scraping thread
                //however there's a small window for race condition btwn the query above and this one...
                //if running many scrapers we should rewrite this into sql transaction (not urgent) 
                await db.query(`update auto_dpl.scraped_urls set status='pending' where id = ${row.id}`)
                var html = await scrape(row.normalized_url)

                console.log("archiving "+row.normalized_url)
                var tags = [
                    {
                        "name": "page:url",
                        "value": row.normalized_url
                    }, 
                    {
                        "name": "page:title",
                        "value": getTitle(html) || row.normalized_url
                    },
                    {
                        "name": "page:timestamp",
                        "value": Date.now().toString()
                    },
                ]
                var txid = await writePageToArweave(html, tags)

                console.log("done archiving "+row.normalized_url)
                console.log("txid is "+txid)

                if (txid == null) {
                    console.log("the txid is null, throwing")
                    throw new Error("error on write to arweave (2.0 fastwrite)")
                } else {
                    console.log("before update db status")
                    await db.query(`update auto_dpl.scraped_urls 
                    set status='archived', arweave_tx_id='${txid}'   
                    where id = ${row.id}`)
                    console.log("after update db status")
                }
            } 
            catch (err) {
             console.log("ERROR in scraping / archiving... Flagging in DB. Error detail:")
             console.log(JSON.stringify(err))
             await db.query(`update auto_dpl.scraped_urls set status='error' where id = ${row.id}`)
            }

         } else {
             console.log("nothing to do... sleeping for 10 seconds")
             await sleep(10000)
         }
    }
}

export {startScrapingThread} 