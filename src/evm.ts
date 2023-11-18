import { ethers, TransactionResponse, Signer } from 'ethers';
import { ERC20_ABI, ERC721_ABI, LOOPSO_ABI } from './constants';
import { checkNftApproval, checkTokenAllowance, getLoopsoContractFromContractAddr } from './utils';


export async function bridgeTokens(
	contractAddressSrc: string,
	signer: ethers.Signer,
	tokenAddress: string,
	amount: bigint,
	dstAddress: string,
	dstChain: number
): Promise<TransactionResponse | null> {

	const loopsoContractOnSrc = await getLoopsoContractFromContractAddr(contractAddressSrc, signer)
	const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);

	try {
		let convertedAmount = amount * BigInt(10 ** 18);
		await checkTokenAllowance(signer, tokenContract, contractAddressSrc, convertedAmount)

		const bridgeTx = loopsoContractOnSrc.bridgeTokens(
			tokenAddress,
			convertedAmount,
			dstChain,
			dstAddress
		);
		if (!bridgeTx) {
			throw new Error("Bridge transaction failed");
		}
		return bridgeTx;
	} catch (error) {
		console.error("Error bridging tokens:", error);
		return null;
	}
}

async function bridgeNonFungibleTokens(
	contractAddressSrc: string,
	signer: ethers.Signer | ethers.JsonRpcProvider,
	tokenAddress: string,
	dstAddress: string,
	dstChain: number,
	tokenId: number,
	tokenUri: string,
): Promise<TransactionResponse | null> {
	const loopsoContractOnSrc = await getLoopsoContractFromContractAddr(contractAddressSrc, signer)
	const tokenContract = new ethers.Contract(tokenAddress, ERC721_ABI, signer);
	try {
		const approved = await checkNftApproval(tokenContract, contractAddressSrc, tokenId)
		if (approved) {
			const bridgeTx = loopsoContractOnSrc?.bridgeNonFungibleTokens(tokenAddress, tokenId, tokenUri, dstChain, dstAddress);
			if (!bridgeTx) {
				throw new Error("Bridge transaction failed");
			}
			return bridgeTx;
		} else {
			throw new Error("Approval failed");
		}
	} catch (error) {
		console.error("Error bridging tokens:", error);
		return null;
	}
}


export async function bridgeNonFungibleTokensBack(
	contractAddress: string,
	signerOrProvider: ethers.Signer | ethers.JsonRpcProvider,
	tokenId: number,
	dstAddress: string,
	attestationId: number) {
	const loopsoContract = new ethers.Contract(contractAddress, LOOPSO_ABI, signerOrProvider);
	return loopsoContract.bridgeNonFungibleTokensBack(tokenId, dstAddress, attestationId);

}

export async function bridgeTokensBack(
	contractAddress: string,
	signerOrProvider: ethers.Signer | ethers.JsonRpcProvider,
	tokenId: number,
	dstAddress: string,
	attestationId: number) {
	const loopsoContract = new ethers.Contract(contractAddress, LOOPSO_ABI, signerOrProvider);
	return loopsoContract.bridgeTokensBack(tokenId, dstAddress, attestationId);

}


export async function getAllSupportedTokens(
	contractAddress: string,
	signerOrProvider: ethers.Signer | ethers.JsonRpcProvider) {
	const loopsoContract = new ethers.Contract(contractAddress, LOOPSO_ABI, signerOrProvider);
	return loopsoContract.getAllSupportedTokens();

}

