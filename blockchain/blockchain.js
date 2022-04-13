const Block = require('./block');
const Transaction = require('../wallet/transaction');
const Wallet = require('../wallet');
const cryptoHash = require('../utils/crypto-hash');
const { MINING_REWARD, REWARD_INPUT } = require('../config');

class Blockchain{
    constructor()
    {
        this.chain = [Block.genesis()];
    }

    addBlock(data){
        const newBlock = Block.mineBlock({
            lastBlock:this.chain[this.chain.length-1],
            data
        });
        this.chain.push(newBlock);
    }

    static isValidChain(chain)
    {
        if(JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis()))
            return false;
        
        for(let i=1;i<chain.length;i++)
        {
            const block = chain[i];
            const actualLastHash = chain[i-1].hash;
            const {timestamp, hash,lastHash,data,nonce,difficulty} = block;
            if(lastHash !== actualLastHash)
                return false;
            const validatedHash = cryptoHash(timestamp,lastHash,data,nonce,difficulty);
            if(hash !== validatedHash)
                return false;
            const difference = Math.abs(difficulty - chain[i-1].difficulty);
            if(difference !== 1)
                return false;
        }
        return true;
    }

    replaceChain(chain, validateTransactions, onSuccess){
        if(chain.length <= this.chain.length) {
            console.log('The incoming chain must be longer.');
            return;
        }
        
        if(Blockchain.isValidChain(chain) == false) {
            console.log('The incoming chain must be valid');
            return;
        }

        if (validateTransactions && !this.validTransactionData({chain})) {
            console.error('The incoming chain has invalid data');
            return;
        }

        if (onSuccess) onSuccess();
        console.log('replacing chain with ' ,chain);
        this.chain = chain;
    }

    validTransactionData({ chain }) {
        for(let i=1;i<chain.length;i++){
            const block = chain[i];
            const transactionSet = new Set(); 
            let rewardTransactionCount = 0;

            for(let transaction of block.data) {
                if (transaction.input.address === REWARD_INPUT.address) {
                    rewardTransactionCount += 1;

                    if (rewardTransactionCount > 1) {
                        console.error('Miner rewards exceed limit');
                        return false;
                    }

                    if (Object.values(transaction.outputMap)[0] !== MINING_REWARD) {
                        console.error('Miner reward amount is invalid');
                        return false;
                    }
                } else {
                    if(!Transaction.validTransaction(transaction)) {
                        console.error('Invalid Transaction');
                        return false;
                    }

                    const trueBalance = Wallet.calculateBalance({
                        chain: this.chain,
                        address: transaction.input.address
                    });

                    if (transaction.input.amount !== trueBalance) {
                        console.error('Invalid Input Amount');
                        return false;
                    }


                    if (transactionSet.has(transaction)) {
                        console.error('An identical transaction appears more than once the the block');
                        return false;
                    } else {
                        transactionSet.add(transaction);
                    }
                }
            }

        }
        
        return true;
    }
}

module.exports = Blockchain;