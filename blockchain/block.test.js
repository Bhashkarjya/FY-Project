const Block = require('./block');
const {GENESIS_DATA,MINE_RATE} = require('../config');
const cryptoHash = require('../utils/crypto-hash');
const hexToBinary = require('hex-to-binary');

describe('Block', () => {
    const timestamp = 2000;
    const data = ['Counterfeit','Goods'];
    const lastHash = 'foo-lastHash';
    const hash = 'foo-hash';
    const difficulty = 1;
    const nonce = 1;

    const block = new Block({timestamp,lastHash,hash,data,nonce,difficulty});

    it('has a timestamp,data,lastHash and a hash', () => {
        expect(block.timestamp).toEqual(timestamp);
        expect(block.data).toEqual(data);
        expect(block.lastHash).toEqual(lastHash);
        expect(block.hash).toEqual(hash);
        expect(block.nonce).toEqual(nonce);
        expect(block.difficulty).toEqual(difficulty);
    });

    describe('Genesis()', () => {
        const genesisBlock = Block.genesis();

        it('returns a Block instance', () => {
            expect(genesisBlock instanceof Block).toBe(true);
        });

        it('returns the genesis data', () => {
            expect(genesisBlock).toEqual(GENESIS_DATA);
        });
    });

    describe('mineBlock', () => {
        const lastBlock = Block.genesis();
        const data = "mined data";
        const minedBlock = Block.mineBlock({lastBlock,data});

        it('returns a Block instance', () => {
            expect(minedBlock instanceof Block).toBe(true);
        });

        it('sets the `lastHash` of be the `hash` of the current block', () => {
            expect(minedBlock.lastHash).toEqual(lastBlock.hash);
        });

        it('sets the `data` of the minedBlock', () => {
            expect(minedBlock.data).toEqual(data);
        });

        it('sets the timestamp of the minedBlock', () => {
            expect(minedBlock.timestamp).not.toEqual(undefined);
        });

        it('sets the `hash` of the minedBlock', () => {
            expect(minedBlock.hash).toEqual(cryptoHash(minedBlock.timestamp,lastBlock.hash,data,minedBlock.nonce,minedBlock.difficulty));
        });

        it('sets the `hash` that matches the difficulty criteria', () => {
            expect(hexToBinary(minedBlock.hash).substring(0,minedBlock.difficulty)).toEqual('0'.repeat(minedBlock.difficulty));
        });

        it('adjusts the difficulty', () => {
            const possibleResults = [lastBlock.difficulty+1,lastBlock.difficulty-1];
            expect(possibleResults.includes(minedBlock.difficulty)).toBe(true);
        });

    });

    describe('adjustDifficulty()', () => {
        it('it raises the difficulty for a quickly mined block', () => {
            expect(Block.adjustDifficulty(
                {originalBlock:block, timestamp:block.timestamp + MINE_RATE - 100}
            )).toEqual(block.difficulty+1);
        });

        it('it lowers the difficulty for a slowly mined block', () => {
            expect(Block.adjustDifficulty({
                originalBlock:block, timestamp:block.timestamp + MINE_RATE + 100
            })).toEqual(block.difficulty-1);
        });

        it('sets a lower limit difficulty of 1', () => {
            block.difficulty = -1;
            expect(Block.adjustDifficulty({originalBlock:block})).toEqual(1);
        });
    });
});