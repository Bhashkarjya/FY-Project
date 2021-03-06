const Transaction = require('../wallet/transaction');

class TransactionMiner {

    constructor({ blockchain, transactionPool, wallet, pubsub}) {
        this.blockchain = blockchain;
        this.transactionPool = transactionPool;
        this.wallet = wallet;
        this.pubsub = pubsub;
    }

    mineTransactions() {
        // Get the transaction pool's valid transactions
        const validTransactions = this.transactionPool.validTransaction();
        // Generate the miner's rewards
        validTransactions.push(
            Transaction.rewardTransaction({ minerWallet: this.wallet })
        );
        

        // add a block consisting of these transactions to the blockchain
        this.blockchain.addBlock({ data: validTransactions });

        // Broadcast the updated blockchain
        this.pubsub.broadcastChain();


        // Clear the pool
        this.transactionPool.clear();
    }
}

module.exports = TransactionMiner;