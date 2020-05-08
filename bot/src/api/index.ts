const MOD_KEY = "Arweave66928374DPL"

//Moderation API for DPL
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import {moderateHostname, getItemForReview} from '../moderation' 

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

if (process.env.PORT && parseInt(process.env.PORT)) {
  app.listen(parseInt(process.env.PORT), () => console.log(`Listening on ${process.env.PORT}`));
} else {
  app.listen(3000, () => console.log(`Listening on localhost:3000`));
}

//pulls an item (hostname or twitter account) from the moderation queue
app.get('/moderation/hostname/next', async(req, res, next) => {
    var hostDetails = await getItemForReview()
    res.contentType('application/json')
    res.send(hostDetails)
})

//add an item to whitelist or blacklist, and remove it from the queue
app.post('/moderation/hostname', async(req, res, next) => {
    var hostname = req.body.hostname                    //the moderation queue id (as returned by GET / moderation/item/next)
    var approved = req.body.approved                    //true or false
    var moderated_by = req.body.moderated_by || ''      //optional moderator name / userid
    var comments = req.body.comments || ''              //optional comments textmagic
    
    var result = await moderateHostname(hostname, approved, moderated_by, comments)
    res.contentType('application/json')
    res.send(result)
  })