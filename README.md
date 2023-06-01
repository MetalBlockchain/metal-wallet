# Metal Blockchain (METAL) Wallet

This is the frontend Vue.js application for the Metal Wallet.

## Prerequisites

-   Yarn (https://classic.yarnpkg.com/en/docs/install/)
-   Recent version of npm (7.4.0)
-   Node v16
-   Gecko, Metal client in Golang (https://github.com/MetalBlockchain/metalgo)

## Installation

1. Clone the repo `git clone https://github.com/MetalBlockchain/metal-wallet.git`
2. Go to root of the project `cd metal-wallet`
3. Install javascript dependencies with `yarn install`.

## Running The Project

In order for the wallet to work, it needs the Metal network to operate on. By default the wallet will connect to the Metal mainnet.

1. If you want to connect to a local network, make sure you have installed and able to run a MetalGo node properly.
2. Run the project with hot reloading `yarn serve`

When you go to the website on your browser, you might get a warning saying
"Site is not secure". This is because we are signing our own SSL Certificates. Please ignore and continue to the website.

## Deployment

1.  Compile and minify to have a production ready application with `yarn build`.
2.  Serve from the `/dist` directory.

## Changing the Network

By default the wallet will connect to the Metal mainnet. You can change to another network by clicking the button labeled `TestNet` on the navigation bar and selecting another network, or add a custom network.

## Explorer API

A valid explorer API is required to correctly display balances for Mnemonic and Ledger type wallets.
The wallet uses the Metal Explorer API to display wallet transaction history.

WARNING: This history might be out of order and incomplete.

## Browser Support

We suggest using Google Chrome to view the Metal Wallet website.

### Firefox and https

Firefox does not allow https requests to localhost. But the Metal Wallet uses https by default, so we will need to change this to http. Make this switch by editing the `vue.config.js` file in the root directory and change

```
devServer: {
    https: true
},
```

to

```
devServer: {
    https: false
},
```

and run `yarn serve` to reflect the change.

# Accounts

The wallet can encrypt your private keys into a secure file encrypted by a password.

```json
{
    "accounts": iUserAccountEncrypted[]
}
```

# Language Setting

Saved into local storage as a 2 letter code.

```
"lang": "en"
```

# Dependencies

##### Metal Node (https://github.com/MetalBlockchain/metalgo)

To get utxos and to send transactions.

#### Explorer API Node (https://github.com/ava-labs/ortelius)

To check if an address was used before, and to get activity history.

# Default Connections

The wallet needs to connect to a Metal node, and an explorer node to operate properly.

By default, there are two network options to connect to: `Mainnet` and `Tahoe`.

##### Mainnet

-   Metal API: `https://api.metalblockchain.org:443`
-   Explorer API: `https://explorerapi.metalblockchain.org`

##### Tahoe (Testnet)

-   Metal API: `https://tahoe.metalblockchain.org:443`
-   Explorer API: `https://tahoe-explorerapi.metalblockchain.org`

