import { ethers, Overrides, Signer, BigNumber } from 'ethers';

import { TransactionResponse } from '@ethersproject/abstract-provider';
import constants from './constants';



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


async function wrapAndSwapETH(
	contractAddress: string,
	relayerFees: ContractRelayerFees,
	recipient: Recipient,
	tokenOut: string,
	tokenOutWChainId: number,
	criteria: Criteria,
	amountIn: BigNumber,
	signer: ethers.Signer,
	overrides?: Overrides,
): Promise<TransactionResponse> {
	const loopsoContract = new ethers.Contract(contractAddress, constants.LOOPSO_CONTRACT_ADDRESS, signer);
	return loopsoContract.wrapAndSwapETH(
		relayerFees, recipient, tokenOut, tokenOutWChainId, criteria,
		overrides ? { value: amountIn, ...overrides } : { value: amountIn });
}

