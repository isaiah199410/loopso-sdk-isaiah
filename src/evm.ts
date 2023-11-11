import { ethers, Overrides, Signer, BigNumber } from 'ethers';

import { TransactionResponse } from '@ethersproject/abstract-provider';
import { ERC20_ABI, LOOPSO_ABI } from './constants';



export type ContractRelayerFees = {
	swapFee: ethers.BigNumber,
	redeemFee: ethers.BigNumber,
	refundFee: ethers.BigNumber,
}

export type Criteria = {
	transferDeadline: ethers.BigNumber,
	swapDeadline: ethers.BigNumber,
	amountOutMin: ethers.BigNumber,
	gasDrop: ethers.BigNumber,
	unwrap: boolean,
	customPayload: string,
}

export type Recipient = {
	auctionAddr: string,
	referrer: string,
	destAddr: string,
	destChainId: number,
	refundAddr: string,
};

export async function swapFromEvm() { }


async function swap(
	contractAddress: string,
	relayerFees: ContractRelayerFees,
	recipient: Recipient,
	tokenOut: string,
	tokenOutWChainId: number,
	criteria: Criteria,
	tokenIn: string,
	amountIn: BigNumber,
	signer: ethers.Signer,
	overrides?: Overrides
): Promise<void> {

}



async function bridgeTokens(
	contractAddress: string,
	signerOrProvider: ethers.Signer | ethers.providers.Provider,

	token: string,
	amount: number,
	dstAddress: string,
	dstChain: number
): Promise<TransactionResponse> {
	const loopsoContract = new ethers.Contract(contractAddress, LOOPSO_ABI, signerOrProvider);
	//step1 check if token is supported:
	//const isSupported = await loopsoContract.isTokenSupported()
	//step2 check approval for ERC20 on openzeppelin, or set approval
	const tokenContract = new ethers.Contract(token, ERC20_ABI, signerOrProvider);
	const approvalTx = tokenContract.approve(contractAddress, amount)
	if (approvalTx) {
		return loopsoContract.bridgeTokens(token, amount, dstAddress, dstChain);

	}
	else throw new Error("Could not approve contract spending");

}

async function bridgeNonFungibleTokens(
	contractAddress: string,
	signerOrProvider: ethers.Signer | ethers.providers.Provider,
	token: string,
	tokenId: number,
	tokenURI: string,
	dstAddress: string,
	dstChain: number
): Promise<TransactionResponse> {
	const loopsoContract = new ethers.Contract(contractAddress, LOOPSO_ABI);

	//step1 check if token is supported:
	//const isSupported = await loopsoContract.isTokenSupported()
	//step2 check approval for ERC20 on openzeppelin, or set approval
	const tokenContract = new ethers.Contract(token, ERC20_ABI, signerOrProvider);
	const approvalTx = await tokenContract.approve(contractAddress, tokenId)
	if (approvalTx) {
		return loopsoContract.bridgeNonFungibleTokens(token, tokenId, tokenURI, dstChain, dstAddress);

	}
	else throw new Error("Could not approve contract spending");

}

