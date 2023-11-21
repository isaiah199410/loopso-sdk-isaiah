# Loopso Bridge SDK

A wrapper typescript package that wraps the Loopso smart contracts. Intended to be used for dapps.

## Installation:

```bash
npm install --save loopso-bridge-sdk
```

## Usage:

Import the necessary functions and models:

```javascript
import { bridgeTokens } from 'loopso-bridge-sdk';
```

Then you will need to get a quote:

### Getting Quote:

```javascript
const _txHash = await bridgeTokens(
	contractAddressSrc,
	signer,
	srcChainId,
	amount,
	dstAddress,
	dstChain
);
```
