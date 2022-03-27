const bodyParser = require('body-parser');
const express = require('express');
const request = require('request');
const Blockchain = require('./blockchain/blockchain');
const PubSub = require('./app/pubsub');

const app = express();
const blockchain = new Blockchain();
const pubsub = new PubSub(blockchain);

const DEFAULT_PORT = 3000;
const ROOT_ADDRESS_NODE =  `http://localhost:${DEFAULT_PORT}`;


app.use(bodyParser.json());

app.get('/api/blocks', (req,res) => {
    res.json(blockchain.chain);
});

app.post('/api/mine', (req,res) => {
    const {data} = req.body;
    blockchain.addBlock(data);
    pubsub.broadcastChain();
    res.redirect('/api/blocks');
});

var PEER_PORT;

if(process.env.GENERATE_PEER_PORT === 'true'){
    PEER_PORT = DEFAULT_PORT + Math.ceil(Math.random()*1000);
}
const PORT = PEER_PORT || DEFAULT_PORT;

const syncChains = () => {
    request({url: `${ROOT_ADDRESS_NODE}/api/blocks`}, (error,response,body) => {
        if(!error && response.statusCode === 200){
            const rootChain = JSON.parse(body);
            blockchain.replaceChain(rootChain);
        }
        else{
            console.log(error);
        }
    })
}

app.listen(PORT, () => {
    console.log(`listening at localhost:${PORT}`);
    if(PORT != DEFAULT_PORT){
        syncChains();
    }
});