import React, { Component } from 'react';
import { FormGroup, FormControl, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

class AddProduct extends Component {
  state = { pId: 10, pName: 'abc', price: 20, pOwner:'xyz'};

  updateId = event => {
    this.setState({ pId: Number(event.target.value) });
  }

  updateName = event => {
    this.setState( {pName: event.target.value});
  }

  updatePrice = event => {
    this.setState({ price: Number(event.target.value) });
  }

  updateOwner = event => {
    this.setState( {pOwner: event.target.value});
  }

  addNewProduct = () => {
    const  {pId, pName, price,pOwner} = this.state;
    fetch(`${document.location.origin}/api/addProduct`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pId, pName, price, pOwner} )
    }).then(response => response.json())
      .then(json => {
        alert(json.message || json.type);
      });
    }

  render() {
    console.log("wallet", this.state.walletInfo);
    return (
      <div className='ConductTransaction'>
        <Link to='/'>Home</Link>
        <h3>Add a Product</h3>
        <br />
        <FormGroup>
          <FormControl
            input='number'
            placeholder='Product Id'
            value={this.state.pId}
            onChange={this.updateId}
          />
        </FormGroup>
        <FormGroup>
          <FormControl
            input='text'
            placeholder='Product Name'
            value={this.state.pName}
            onChange={this.updateName}
          />
        </FormGroup>
		    <FormGroup>
          <FormControl
            input='number'
            placeholder='Price'
            value={this.state.price}
            onChange={this.updatePrice}
          />
        </FormGroup>
        <FormGroup>
          <FormControl
            input='number'
            placeholder='Product Owner'
            value={this.state.pOwner}
            onChange={this.updateOwner}
          />
        </FormGroup>
        <div>
          <Button
            bsStyle="danger"
            onClick={this.addNewProduct}
          >
            Submit
          </Button>
        </div>
      </div>
    )
  }
};

export default AddProduct;