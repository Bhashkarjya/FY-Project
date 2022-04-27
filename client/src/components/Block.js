import React, { Component } from 'react';
import {Button} from "react-bootstrap";
import Transaction from './Transaction';

class Block extends Component {
  state = { displayTransaction: false };

  toggleTransaction = () => {
    this.setState({displayTransaction: !this.state.displayTransaction})
  }

  get displayTransaction() {
    const { data } = this.props.block;
    const product = data[0];
    console.log(data[0]);

    const stringifiedData = JSON.stringify(data);
    let dataDisplay;
    dataDisplay = stringifiedData.length > 35 ?
      `${stringifiedData.substring(0, 35)}...` :
      stringifiedData;

    if(data.length>0 && product.pId)
    {
      dataDisplay = stringifiedData;
      return(
        <div>
          Product details<br/>
          Product Id: {product.pId} <br/>
          Product Name: {product.pName} <br/>
          Product Price: {product.price} <br/>
          Product Owner: {product.pOwner} <br/>
        </div>
      )
    }

    if (this.state.displayTransaction) {
      return (
        <div>
          {
            data.map(transaction => (
              <div key={transaction.id}>
                <hr />
                <Transaction transaction={transaction} />
              </div>
            ))
          }
          <br />
          <Button
            bsStyle="danger"
            bsSize="small"
            onClick={this.toggleTransaction}
          >
            Show Less
          </Button>
        </div>
      )
    }

    return (
      <div>
        <div>Data: {dataDisplay}</div>
        <Button
          bsStyle="danger"
          bsSize="small"
          onClick={this.toggleTransaction}
        >
          Show More
        </Button>
      </div>
    );
  }

  render() {
    const { timestamp, hash } = this.props.block;

    const hashDisplay = `${hash.substring(0, 15)}...`;

    return (
      <div className='Block'>
        <div>Hash: {hashDisplay}</div>
        <div>Timestamp: {new Date(timestamp).toLocaleString()}</div>
        {this.displayTransaction}
      </div>
    );
  }
};

export default Block;