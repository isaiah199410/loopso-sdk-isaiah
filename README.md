# Loopso Bridge SDK

A wrapper typescript package that wraps the Loopso smart contracts. Intended to be used for dapps.

## Installation:

```bash
npm install --save loopso-sdk-isaiah
```

## Usage:

Import the necessary functions and models:

```javascript
import { bridgeTokens } from 'loopso-sdk-isaiah';
```

Then you will need to get a quote:

### Bridging:

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
