import React, {Component} from "react";
import { Link } from 'react-router-dom';
import logo from "../assets/logo.jpeg";

class App extends Component {

    state = {walletInfo: {address: 'fooxv6', balance: 999}};

    componentDidMount(){
        fetch(`${document.location.origin}/api/wallet-info`)
            .then(response => response.json())
            .then(json => this.setState({walletInfo: json}));
    }

    render() {

        const {address, balance} = this.state.walletInfo;

        return (
            <div className="App">
                <img className="logo" src = {logo} ></img>
                <br />
                <div>
                    Welcome to the Blockchain based Supply Chain.
                </div>
                <br/>
                <div><Link to = '/blocks'>Blocks</Link></div>
                <div><Link to = '/conduct-transaction'>Conduct a Transaction </Link></div>
                <div><Link to = '/add-product'>Add A Product </Link></div>
                <div><Link to = '/transaction-pool'>Transaction Pool</Link></div>
                <div className="WalletInfo">
                    <div>Address : {address}</div>
                    <div>Balance : {balance}</div>
                </div>
            </div>
        )
    }
}

export default App;