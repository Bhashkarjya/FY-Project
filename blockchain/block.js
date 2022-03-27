// const hexToBinary = require('hexToBinary');
const {GENESIS_DATA,MINE_RATE} = require('../config');
const cryptoHash = require('../utils/crypto-hash');
const hexToBinary = require('hex-to-binary');

class Block{
    constructor({timestamp,hash,data,lastHash,nonce,difficulty}){
        this.lastHash = lastHash;
        this.hash = hash;
        this.data = data;
        this.timestamp = timestamp;
        this.nonce = nonce;
        this.difficulty = difficulty;
    }

    static genesis(){
        return new Block(GENESIS_DATA);
    }

    static mineBlock({lastBlock,data})
    {
        const lastHash = lastBlock.hash;
        let {difficulty} = lastBlock;
        let nonce = 0;
        let hash,timestamp;
        
        do{
            nonce++;
            timestamp = Date.now();
            difficulty = this.adjustDifficulty({originalBlock:lastBlock,timestamp});
            hash = cryptoHash(timestamp,nonce,difficulty,lastHash,data);
        }while(hexToBinary(hash).substring(0,difficulty) !== '0'.repeat(difficulty));

        return new Block({timestamp,hash,data,lastHash,nonce,difficulty});
    }

    static adjustDifficulty({originalBlock,timestamp})
    {
        const {difficulty} = originalBlock;

        if(difficulty<1)
            return 1;

        const difference = timestamp - originalBlock.timestamp;
        if(difference>MINE_RATE)
            return difficulty - 1;
        return difficulty + 1;
    }
}

module.exports = Block;