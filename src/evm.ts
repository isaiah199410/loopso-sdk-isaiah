import { ethers, TransactionResponse } from 'ethers';
import { ERC20_ABI, LOOPSO_ABI } from './constants';


async function bridgeTokens(
	contractAddressSrc: string,
	signerOrProvider: ethers.Signer | ethers.Provider,
	tokenAddress: string,
	amount: number,
	dstAddress: string,
	dstChain: number
): Promise<TransactionResponse | null> {
	const loopsoContractOnSrc = new ethers.Contract(contractAddressSrc, LOOPSO_ABI, signerOrProvider);
	const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, signerOrProvider);
	let convertedAmount = amount * (10 ^ 18);
	try {
		const approvalTx = await tokenContract.approve(contractAddressSrc, convertedAmount);
		if (approvalTx) {
			return loopsoContractOnSrc.bridgeTokens(
				tokenAddress,
				convertedAmount,
				dstChain,
				dstAddress
			);
		} else throw new Error("Could not approve contract spending");
	} catch (error) {
		return null;
	}
}


export async function bridgeNonFungibleTokens(
	contractAddress: string,
	signerOrProvider: ethers.Signer | ethers.Provider,
	tokenAddress: string,
	tokenId: number,
	tokenChain: number,
	tokenURI: string,
	dstAddress: string,
	dstChain: number
): Promise<TransactionResponse> {
	const loopsoContract = new ethers.Contract(contractAddress, LOOPSO_ABI);
	/* 	const isSupported = await loopsoContract.isTokenSupported(tokenAddress, tokenChain)
		if (isSupported) { */
	const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, signerOrProvider);
	const approvalTx = await tokenContract.approve(contractAddress, tokenId)
	if (approvalTx) {
		return loopsoContract.bridgeNonFungibleTokens(tokenAddress, tokenId, tokenURI, dstChain, dstAddress);
	}
	else throw new Error("Could not approve contract spending");
	/* 	} else throw new Error("Token you are trying to bridge is not supported yet");
	 */

}

export async function bridgeNonFungibleTokensBack(
	contractAddress: string,
	signerOrProvider: ethers.Signer | ethers.Provider,
	tokenId: number,
	dstAddress: string,
	attestationId: number) {
	const loopsoContract = new ethers.Contract(contractAddress, LOOPSO_ABI, signerOrProvider);
	return loopsoContract.bridgeNonFungibleTokensBack(tokenId, dstAddress, attestationId);

}

export async function bridgeTokensBack(
	contractAddress: string,
	signerOrProvider: ethers.Signer | ethers.Provider,
	tokenId: number,
	dstAddress: string,
	attestationId: number) {
	const loopsoContract = new ethers.Contract(contractAddress, LOOPSO_ABI, signerOrProvider);
	return loopsoContract.bridgeTokensBack(tokenId, dstAddress, attestationId);

}


export async function getAllSupportedTokens(
	contractAddress: string,
	signerOrProvider: ethers.Signer | ethers.Provider) {
	const loopsoContract = new ethers.Contract(contractAddress, LOOPSO_ABI, signerOrProvider);
	return loopsoContract.getAllSupportedTokens();

}

