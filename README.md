# Metal Blockchain (METAL) Wallet

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur) + [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin).

## Prerequisites

-   npm (https://classic.yarnpkg.com/en/docs/install/)
-   Recent version of npm
-   Node v22
-   Gecko, Metal client in Golang (https://github.com/MetalBlockchain/metalgo)
## Installation

1. Clone the repo `git clone https://github.com/MetalBlockchain/metal-wallet.git`
2. Go to root of the project `cd metal-wallet`
3. Install javascript dependencies with `npm install`.
## Running The Project

In order for the wallet to work, it needs the Metal network to operate on. By default the wallet will connect to the Metal mainnet.

1. If you want to connect to a local network, make sure you have installed and able to run a MetalGo node properly.
2. Run the project with hot reloading `npm run dev`

When you go to the website on your browser, you might get a warning saying
"Site is not secure". This is because we are signing our own SSL Certificates. Please ignore and continue to the website.

## Deployment

1.  Compile and minify to have a production ready application with `npm run build`.
2.  Serve from the `/dist` directory.

## Changing the Network

By default the wallet will connect to the Metal mainnet. You can change to another network by clicking the button labeled `TestNet` on the navigation bar and selecting another network, or add a custom network.

## Explorer API

A valid explorer API is required to correctly display balances for Mnemonic and Ledger type wallets.
The wallet uses the Metal Explorer API to display wallet transaction history.

WARNING: This history might be out of order and incomplete.

## Browser Support

We suggest using Google Chrome to view the Metal Wallet website.

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


## Customize configuration

See [Vite Configuration Reference](https://vitejs.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

