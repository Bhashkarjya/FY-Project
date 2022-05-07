class localAuthentication{
    constructor({blockchain, product})
    {
        this.blockchain = blockchain;
        this.product = product;
    }

    detectModification()
    {
        const pDetails = this.product.pDetails;
        const key = this.product.keyPair;
        const signedPDetails = this.product.signedDetails;
        const derSign = signedPDetails.toDER();
        console.log("Verify :" , key.verify(pDetails,derSign ));
    }
}

module.exports = localAuthentication;