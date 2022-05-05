const {STARTING_BALANCE} = require('../config');
const { ec } = require('../utils');
const cryptoHash = require('../utils/crypto-hash');
const Transaction = require('./transaction');

class Wallet{
    constructor(){
        this.balance = STARTING_BALANCE;

        this.keyPair = ec.genKeyPair();

        this.publicKey = this.keyPair.getPublic().encode('hex');
    }

    sign(data){
        return this.keyPair.sign(cryptoHash(data));
    }

    createTransaction({amount, recipient, chain, product}){
        if( chain ) {
            this.balance = Wallet.calculateBalance({
                chain,
                address: this.publicKey
            });
        }

        if(amount > this.balance)
            throw new Error('Amount exceeds balance');

        return new Transaction({
            senderWallet: this,
            amount,
            recipient,
            product
        });
    }

    static calculateBalance({ chain, address }) {
        let hasConductedTransaction = false;
        let outputsTotal = 0;

        for(let i=chain.length-1; i>0; i--){
            const block = chain[i];
            for(let transaction of block.data) {
                console.log(transaction.input);
                if(transaction.input)
                {
                    if(transaction.input.address === address){
                        hasConductedTransaction = true;
                    }
                    
                    const addressOutput = transaction.outputMap[address];
    
                    if(addressOutput) {
                        outputsTotal = outputsTotal + addressOutput;
                    }
                }
            }

            if (hasConductedTransaction){
                break;
            }
        }

        return hasConductedTransaction ? outputsTotal : STARTING_BALANCE + outputsTotal;
    }
};

module.exports = Wallet;