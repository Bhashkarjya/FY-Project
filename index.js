const bodyParser = require('body-parser');
const express = require('express');
const request = require('request');
const path = require('path');
const uuid = require('uuid/v1');
const Blockchain = require('./blockchain/blockchain');
const TransactionPool = require('./wallet/transaction-pool');
const Wallet = require('./wallet');
const PubSub = require('./app/pubsub');
const TransactionMiner = require('./app/transaction-miner'); 
const Product = require('./product');

const isDevelopment = process.env.ENV === 'development';

const app = express();
const blockchain = new Blockchain();
const transactionPool = new TransactionPool();
const wallet = new Wallet();
const pubsub = new PubSub({blockchain, transactionPool, wallet});
const transactionMiner = new TransactionMiner({ blockchain, transactionPool, wallet, pubsub });
const productList = new Product();
const DEFAULT_PORT = 3000;
const ROOT_ADDRESS_NODE =  `http://localhost:${DEFAULT_PORT}`;


app.use(bodyParser.json());
app.use(express.static(path.join(__dirname,'client/dist')));

app.get('/api/blocks', (req,res) => {
    res.json(blockchain.chain);
});

app.post('/api/mine', (req,res) => {
    const {data} = req.body;
    blockchain.addBlock(data);
    pubsub.broadcastChain();
    res.redirect('/api/blocks');
});

app.post('/api/transact', (req,res) => {
    const {recipient, amount, product} = req.body;
    const newProduct = productList.productDatabase.get(product);
    //take care of the testcase when the user enters a product not present in the database
    let transaction = transactionPool.existingTransaction({ inputAddress: wallet.publicKey});
    try{
        if(transaction){
            transaction.update({senderWallet: wallet, recipient, amount, product : newProduct});
        }
        else{
            transaction = wallet.createTransaction({
                recipient,
                amount,
                chain: blockchain.chain,
                product : newProduct
            });
        }
    } catch(error){
        return res.status(400).json({type: 'error', message: error.message})
    }

    transactionPool.setTransaction(transaction);

    pubsub.broadcastTransaction(transaction);

    res.json({ type: 'success' , transaction });
});

app.post('/api/addProduct', (req,res) => {
    let product = req.body;
    product.qrid = uuid();
    const signedDetails = wallet.sign(product); //product Details signed by the manufactured's public key
    product.source = wallet.publicKey;
    product.signedDetails = signedDetails;
    const data = {data: [req.body]};
    productList.addProduct(product.pId, product);
    blockchain.addBlock(data);
    pubsub.broadcastBlock();
    res.redirect('/api/blocks');
  });

app.get('/api/transaction-pool-map', (req,res) => {
    res.json(transactionPool.transactionMap);
});

app.get('/api/mine-transactions', (req, res) => {
    transactionMiner.mineTransactions();
    
    res.redirect('/api/blocks');
});

app.get('/api/wallet-info', (req, res) => {
    const address = wallet.publicKey;
    res.json({ 
        address,
        balance: Wallet.calculateBalance({ chain: blockchain.chain, address})
    });
});

app.get('/api/known-addresses', (req, res) => {
    const addressMap = {};
  
    for (let block of blockchain.chain) {
      for (let transaction of block.data) {
        if(transaction.outputMap)
        {
            const recipient = Object.keys(transaction.outputMap);
            recipient.forEach(recipient => addressMap[recipient] = recipient);
        }
      }
    }
  
    res.json(Object.keys(addressMap));
  });

app.get('*',(req,res) => {
    res.sendFile(path.join(__dirname,'./client/dist/index.html'));
});

if(isDevelopment)
{
    const walletFoo = new Wallet();
    const walletBar = new Wallet();

    const generateWalletTransaction = ({wallet, recipient, amount}) => {
        const transaction = wallet.createTransaction({
            recipient, amount, chain: blockchain.chain
        });

        transactionPool.setTransaction(transaction);
    };

    const walletAction = () => generateWalletTransaction({
        wallet, recipient: walletFoo.publicKey, amount: 5
    });

    const walletFooAction = () => generateWalletTransaction({
        wallet, recipient: walletBar.publicKey, amount: 10
    });

    const walletBarAction = () => generateWalletTransaction({
        wallet, recipient: walletFoo.publicKey, amount: 15
    });

    for(let i = 0; i < 10; i++)
    {
        if(i%3 == 0){
            walletAction();
            walletFooAction();
        }
        else if(i%3 == 1){
            walletAction();
            walletBarAction();
        }
        else{
            walletBarAction();
            walletFooAction();
        }

        transactionMiner.mineTransactions();
    }
}

var PEER_PORT;

if(process.env.GENERATE_PEER_PORT === 'true'){
    PEER_PORT = DEFAULT_PORT + Math.ceil(Math.random()*1000);
}
const PORT = process.env.PORT || PEER_PORT || DEFAULT_PORT;

const syncWithRootState = () => {
    request({url: `${ROOT_ADDRESS_NODE}/api/blocks`}, (error,response,body) => {
        if(!error && response.statusCode === 200){
            const rootChain = JSON.parse(body);
            blockchain.replaceChain(rootChain);
        }
        else{
            console.log(error);
        }
    });

    request({url: `${ROOT_ADDRESS_NODE}/api/transaction-pool-map`}, (error, response, body) => {
        if(!error && response.statusCode === 200){
            const rootTransactionPoolMap = JSON.parse(body);
            transactionPool.setMap(rootTransactionPoolMap);
        }
    });
}

app.listen(PORT, () => {
    console.log(`listening at localhost:${PORT}`);
    if(PORT != DEFAULT_PORT){
        syncWithRootState();
    }
});