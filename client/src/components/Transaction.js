import React, {Component} from 'react';

class Transaction extends Component {

  get displayTransaction()
  {
    const { input, outputMap } = this.props.transaction;
    const {product} = input;
    const recipients = Object.keys(outputMap);

    if(product)
      {
        return(
          <div className='Transaction'>
            Product details<br/>
            Product Id: {product.pId} <br/>
            Product Name: {product.pName} <br/>
            Product Price: {product.price} <br/>
            Product Owner: {product.pOwner} <br/>
            QR CODE ID: {product.qrid} <br/>
            Manufacturer's Address : {product.source} <br />
            <div>From: {`${input.address.substring(0, 20)}...`} | Balance: {input.amount}</div>
            {
              recipients.map(recipient => 
              (
                <div key ={recipient}>
                  To: {`${recipient.substring(0, 20)}...`} | Sent: {outputMap[recipient]}
                </div>
              ))
            }
          </div>
        );
      }
      else{
        return(
          <div className='Transaction'>
            <div>From: {`${input.address.substring(0, 20)}...`} | Balance: {input.amount}</div>
            {
              recipients.map(recipient => 
              (
                <div key ={recipient}>
                  To: {`${recipient.substring(0, 20)}...`} | Sent: {outputMap[recipient]}
                </div>
              ))
            }
          </div>
        )
      }
    }

    render(){
      return(
        <div>
          {this.displayTransaction}
        </div>
      )
    }
      
  };

export default Transaction;