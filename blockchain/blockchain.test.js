const Blockchain = require('./blockchain');
const Block = require('./block');
const cryptoHash = require('../utils/crypto-hash');
const Wallet = require('../wallet');
const Transaction = require('../wallet/transaction');

describe('Blockchain', () => {
    let blockchain,newChain,originalChain, errorMock;

    beforeEach(() => {
        blockchain = new Blockchain();
        newChain = new Blockchain();
        originalChain = blockchain.chain;

        errorMock = jest.fn();
        global.console.error = errorMock;
    });

    it('contains a `chain` Array instance', () => {
        expect(blockchain.chain instanceof Array).toBe(true);
    });

    it('starts off with a genesis block', () => {
        expect(blockchain.chain[0]).toEqual(Block.genesis());
    })

    it('adds a new block to the blockchain', () => {
        const newData = 'new-data';
        blockchain.addBlock({data: newData});
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

        describe('and the `validateTransactions` flag is true', () => {
            it('calls validTransactionData()', () => {
                const validTransactionDataMock = jest.fn();
                blockchain.validTransactionData = validTransactionDataMock;

                newChain.addBlock({ data: 'foo'});
                blockchain.replaceChain(newChain.chain, true);

                expect(validTransactionDataMock).toHaveBeenCalled();
            });
        });
        
    });

    describe('validTransactionData()', () => {
        let transaction, rewardTransaction, wallet;

        beforeEach(() => {
            wallet = new Wallet();
            transaction = wallet.createTransaction({ recipient: 'foo-address', amount: 65});
            rewardTransaction = Transaction.rewardTransaction({ minerWallet: wallet});
        });

        describe('and the transaction data is valid', () => {
            it('returns true', () => {
                newChain.addBlock({ data: [transaction, rewardTransaction]});

                expect(blockchain.validTransactionData({ chain: newChain.chain})).toBe(true);
                expect(errorMock).not.toHaveBeenCalled();
            });
        });

        describe('and the transaction data has multiple rewards', () => {
            it('returns false and logs and error', () => {
                newChain.addBlock({ data: [transaction, rewardTransaction, rewardTransaction]});
                expect(blockchain.validTransactionData({ chain: newChain.chain})).toBe(false);
                expect(errorMock).toHaveBeenCalled();
            });
        });

        describe('and the transaction data has at least one malformed outputMap', () => {
            describe('and the transaction is not a reward transaction', () => {
                it('returns false and logs and error', () => {
                    transaction.outputMap[wallet.publicKey] = 999999;

                    newChain.addBlock({ data: [transaction, rewardTransaction]});
                    expect(blockchain.validTransactionData({ chain: newChain.chain})).toBe(false);
                    expect(errorMock).toHaveBeenCalled();
                });
            });

            describe('and the transaction is a reward transaction', () => {
                it('returns false and logs and error', () => {
                    rewardTransaction.outputMap[wallet.publicKey] = 999999;

                    newChain.addBlock({ data: [transaction, rewardTransaction]});

                    expect(blockchain.validTransactionData({ chain: newChain.chain})).toBe(false);
                    expect(errorMock).toHaveBeenCalled();
                });
            });
        });

        describe('and the transaction data has at least one malformed input', () => {
            it('returns false and logs and error', () => {
                wallet.balance = 9000;
                
                const evilOutputMap = {
                    [wallet.publicKey]: 8900,
                    fooRecipient: 100
                };

                const evilTransaction = {
                    input: {
                        timestamp: Date.now(),
                        amount: wallet.balance,
                        address: wallet.publicKey,
                        signature: wallet.sign(evilOutputMap)
                    },
                    outputMap: evilOutputMap
                }
                
                newChain.addBlock({ data: [evilTransaction, rewardTransaction]});
                expect(blockchain.validTransactionData({ chain: newChain.chain})).toBe(false);
                expect(errorMock).toHaveBeenCalled();
            });
        });

        describe('and a block contains multiple identical transactions', () => {
            it('returns false and logs and error', () => {
                newChain.addBlock({
                    data: [transaction, transaction, transaction, rewardTransaction]
                });

                expect(blockchain.validTransactionData({ chain: newChain.chain})).toBe(false);
                expect(errorMock).toHaveBeenCalled();
            }); 
        });
    });
})