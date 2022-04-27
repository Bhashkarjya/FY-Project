import React, { Component } from 'react';
import { FormGroup, FormControl, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import history from '../history';

class AddProduct extends Component {
  state = { pId: 0, pName: '', price: 0, manufacturedDate: '',expiryDate: '', pOwner:'', knownAddresses: [] };

  componentDidMount() {
    fetch(`${document.location.origin}/api/known-addresses`)
      .then(response => response.json())
      .then(json => this.setState({ knownAddresses: json }));
  }

  updateId = event => {
    this.setState({ pId: Number(event.target.value) });
  }

  updateName = event => {
    this.setState( {pName: event.target.value});
  }

  updatePrice = event => {
    this.setState({ amount: Number(event.target.value) });
  }

  updateManufacturedDate = event => {
    this.setState( {manufacturedDate: event.target.value});
  }

  updateExpiryDate = event => {
    this.setState( {expiryDate: event.target.value});
  }

  updateOwner = event => {
    this.setState( {pOwner: event.target.value});
  }

  conductTransaction = () => {
    const  {pId, pName, price, manufacturedDate, expiryDate, pOwner} = this.state;

    fetch(`${document.location.origin}/api/transact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pId, pName, price, manufacturedDate, expiryDate, pOwner })
    }).then(response => response.json())
      .then(json => {
        alert(json.message || json.type);
        history.push('/transaction-pool');
      });
  }

  render() {
    return (
      <div className='ConductTransaction'>
        <Link to='/'>Home</Link>
        <h3>Add a Product</h3>
        <br />
        {
          this.state.knownAddresses.map(knownAddress => {
            return (
              <div key={knownAddress}>
                <div>{knownAddress}</div>
                <br />
              </div>
            );
          })
        }
        <br />
        <FormGroup>
          <FormControl
            input='text'
            placeholder='recipient'
            value={this.state.recipient}
            onChange={this.updateRecipient}
          />
        </FormGroup>
        <FormGroup>
          <FormControl
            input='number'
            placeholder='amount'
            value={this.state.amount}
            onChange={this.updateAmount}
          />
        </FormGroup>
        <div>
          <Button
            bsStyle="danger"
            onClick={this.conductTransaction}
          >
            Submit
          </Button>
        </div>
      </div>
    )
  }
};

export default AddProduct;