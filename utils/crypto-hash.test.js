const cryptoHash = require('./crypto-hash');

describe('cryptoHash', () => {
    it('returns a SHA-256 hash', () => {
        expect(cryptoHash('dummy-data')).toEqual('53e8d0fc15b575a1f8ba639b3039e73ac7bf6a31540c279cc5390ad7c52a9611');
    });

    it('returns the same hash value for the same inputs irrespective of the order of the input', () => {
        expect(cryptoHash('one','two','three')).toEqual(cryptoHash('three','one','two'));
    });

    it('produces a unique hash when the properties have changed on an input', () => {
        const foo = {};
        const originalHash = cryptoHash(foo);
        foo['a'] = 'a';
        expect(cryptoHash(foo)).not.toEqual(originalHash);
    });
});