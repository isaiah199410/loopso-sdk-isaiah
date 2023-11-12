import { ethers, TransactionResponse } from 'ethers';
import { ERC20_ABI, LOOPSO_ABI } from './constants';



export async function bridgeTokens(
	contractAddress: string,
	signerOrProvider: ethers.Signer | ethers.Provider,
	tokenAddress: string,
	tokenChain: number,
	amount: number,
	dstAddress: string,
	dstChain: number
): Promise<TransactionResponse> {
	const loopsoContract = new ethers.Contract(contractAddress, LOOPSO_ABI, signerOrProvider);
	/* 	const isSupported = await loopsoContract.isTokenSupported(tokenAddress, tokenChain)
		if (isSupported) { */
	const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, signerOrProvider);
	console.log(tokenContract, 'ERC20 token contract SDK')
	console.log(loopsoContract, 'Loopso bridge contract SDK')

	const approvalTx = tokenContract.approve(contractAddress, amount)
	console.log(approvalTx, 'ApprovalTX SDK')
	if (approvalTx) {
		return loopsoContract.bridgeTokens(tokenAddress, amount, dstAddress, dstChain);

	}
	else throw new Error("Could not approve contract spending");
	/* 	} else throw new Error("Token you are trying to bridge is not supported yet");
	 */
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

