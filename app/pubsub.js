const PubNub = require('pubnub');

const credentials = {
    publishKey : 'pub-c-db9cc074-3c3d-4fb3-933d-7a1a7231acff',
    subscribeKey : 'sub-c-f8197ad0-fcf9-11eb-bf4c-22908b043f7e',
    secretKey : 'sec-c-MzczZTIxNGUtNDllMy00YmQwLWExZGQtYWQ0ZDc2ODNjNTVi'
};

const CHANNELS = {
    TEST : 'TEST',
    BLOCKCHAIN : 'BLOCKCHAIN',
    TRANSACTION : 'TRANSACTION',
    PRODUCT : 'PRODUCT'
};

class PubSub {
    constructor({blockchain, transactionPool, wallet})
    {
        this.blockchain = blockchain;
        this.transactionPool = transactionPool;
        this.wallet = wallet;
        this.pubnub = new PubNub(credentials);
        //this instance of pubsub will subscribe to the different channels
        this.pubnub.subscribe({channels : Object.values(CHANNELS)});
        //listen to the messages published by different channels
        this.pubnub.addListener(this.listener());
    }

    listener(){
        return {
            message: messageObject => {
                const {message,channel} = messageObject;
                //console.log(`Channel : ${channel}. Message : ${message}`);

                const parsedMessage = JSON.parse(message);

                switch(channel) {
                    case CHANNELS.BLOCKCHAIN:
                        this.blockchain.replaceChain(parsedMessage, true, () => {
                            this.transactionPool.clearBlockchainTransactions({
                                chain: parsedMessage
                            });
                        });
                        break;
                    case CHANNELS.TRANSACTION:
                        if(!this.transactionPool.existingTransaction({
                            inputAddress: this.wallet.publicKey
                        })) {
                            this.transactionPool.setTransaction(parsedMessage);
                        }
                        break;
                    case CHANNELS.PRODUCT:
                        this.blockchain.replaceChain(parsedMessage);
                        break;
                    default:
                        return;
                }   
            }
        }
    }

    publish({channel,message}){
        this.pubnub.publish({channel,message});
    }

    broadcastChain(){
        this.publish({channel:CHANNELS.BLOCKCHAIN, message: JSON.stringify(this.blockchain.chain) })
    }

    broadcastTransaction(transaction){
        this.publish({channel: CHANNELS.TRANSACTION, message: JSON.stringify(transaction)})
    }

    broadcastBlock(){
        this.publish({channel: CHANNELS.PRODUCT, message: JSON.stringify(this.blockchain.chain)})
    }
}

module.exports = PubSub;