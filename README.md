# Loopso Bridge SDK

A wrapper typescript package that wraps the Loopso smart contracts. Intended to be used for dapps.

## Installation:

```bash
npm install --save loopso-bridge-sdk
```

## Usage:

Import the necessary functions and models:

```javascript
import { fetchQuote, bridgeTokens } from 'loopso-bridge-sdk';
```

Then you will need to get a quote:

### Getting Quote:

```javascript
const quote = await fetchQuote({
	amount: 250,
	fromToken: fromToken.contract,
	toToken: toToken.contract,
	fromChain: 'lukso',
	toChain: 'ethereum',
	slippage: 3,
	gasDrop: 0.04, // optional
	referrer: 'Your ETH mainnet address', // optional
});
```
