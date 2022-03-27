const Blockchain = require('./blockchain');
const Block = require('./block');
const cryptoHash = require('../utils/crypto-hash');

describe('Blockchain', () => {
    let blockchain,newChain,originalChain;
    beforeEach(() => {
        blockchain = new Blockchain();
        newChain = new Blockchain();
        originalChain = blockchain.chain;
    })
    it('contains a `chain` Array instance', () => {
        expect(blockchain.chain instanceof Array).toBe(true);
    });

    it('starts off with a genesis block', () => {
        expect(blockchain.chain[0]).toEqual(Block.genesis());
    })

    it('adds a new block to the blockchain', () => {
        const newData = 'new-data';
        blockchain.addBlock(newData);
        expect(blockchain.chain[blockchain.chain.length - 1].data).toEqual(newData);
    });

    describe('isValidChain()', () => {
        describe('when the blockchain does not start with a genesis block', () => {
            it("returns false", () => {
                blockchain.chain[0] = {data:"fake-genesis"};
                expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
            });
        });

        describe('when the blockchain does start with a genesis block and contains multiple blocks', () => {
            beforeEach(() => {
                blockchain.addBlock("Geralt Of Rivia");
                blockchain.addBlock("Princess Cirilla");
                blockchain.addBlock("Yennefer of Vengerberg");
            });
            describe('and the lastHash reference has changed', () => {
                it('returns false', () => {
                    blockchain.chain[2].lastHash = 'fake-hash-value';
                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
                });
            });

            describe('and one of the block contains an invalid field', () => {
                it('returns false', () => {
                    blockchain.chain[1].data = 'garbage data';
                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
                });
            });

            describe('and one of the blocks contains a jumped difficulty', () => {
                it('returns false', () => {
                    const lastBlock = blockchain.chain[blockchain.chain.length-1];
                    const lastHash = lastBlock.hash;
                    const timestamp = Date.now();
                    const data = [];
                    const nonce = 0;
                    const difficulty = lastBlock.difficulty + 3;
                    const hash = cryptoHash(lastHash,data,difficulty,timestamp,nonce);
                    const newBlock = new Block({timestamp,lastHash,hash,data,nonce,difficulty});
                    blockchain.chain.push(newBlock);
                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
                });
            });

            describe('and the chain does not contains any invalid blocks', () => {
                it('returns true', () => {
                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(true);
                });
            });
        });
    });

    describe('replaceChain()',() => {
        describe('when the incoming chain is not longer than the existing chain', () => {
            it('does not replace the chain', () => {
                newChain[0] = {data: 'new chain'};
                blockchain.replaceChain(newChain.chain);
                expect(blockchain.chain).toEqual(originalChain);
            });
        });

        describe('when the incoming chain is longer than the existing chain', () => {
            beforeEach(() => {
                newChain.addBlock("Geralt Of Rivia");
                newChain.addBlock("Princess Cirilla");
                newChain.addBlock("Yennefer of Vengerberg");
            });
            describe('and the chain is invalid', () => {
                it('does not replace the chain', () => {
                    newChain.chain[2].lastHash = 'fake-hash';
                    blockchain.replaceChain(newChain.chain);
                    expect(blockchain.chain).toEqual(originalChain);
                });
            });
            describe('and the chain is valid', () => {
                it('replaces the chain', () => {
                    blockchain.replaceChain(newChain.chain);
                    expect(blockchain.chain).toEqual(newChain.chain);
                });
            });
        });
        
    });
})