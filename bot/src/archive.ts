import Arweave from "arweave/node";
const fs= require('fs')
const WALLET_FILE = process.env.WALLET_FILE || '../../data/key_file.json'
const privateKey = JSON.parse(fs.readFileSync(WALLET_FILE))

const client = Arweave.init({host: 'arweave.net', port: 443, protocol: 'https' });
client.api.config.timeout = 1000 * 60 * 1.5;


const writePageToArweave =async(htmlbundle: string, tags: Array<any>) => {
    try 
    {
        const tx = await client.createTransaction({data: htmlbundle}, privateKey)
        tx.addTag("Content-Type", "text/html")
        tx.addTag("User-Agent", "ArweaveAutoDPL/0.1")

        tags.forEach(tag => {
            tx.addTag(tag.name, tag.value)
        })

        await client.transactions.post(tx);
        console.log(`Transaction is posted and will be mined shortly. Check status at https://viewblock.io/arweave/tx/${tx.id}`);
        return tx.id
    }
    catch (err){
        console.log('Error, transaction not posted')
        console.log(JSON.stringify(err))
        return null
    }


}


export { client, writePageToArweave }