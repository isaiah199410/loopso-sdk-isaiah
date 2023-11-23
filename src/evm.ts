import { ethers, TransactionResponse, Signer } from "ethers";
import { ERC20_ABI, ERC721_ABI, LOOPSO_ABI } from "./constants";
import {
	checkNftApproval,
	checkTokenAllowance,
	getLoopsoContractFromContractAddr,
} from "./utils";
import { WrappedTokenInfo } from "./types";

export async function bridgeTokens(
	contractAddressSrc: string,
	signer: ethers.Signer,
	tokenAddress: string,
	amount: bigint,
	dstAddress: string,
	dstChain: number
): Promise<TransactionResponse | null> {
	const loopsoContractOnSrc = await getLoopsoContractFromContractAddr(
		contractAddressSrc,
		signer
	);
	const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);

	try {
		let convertedAmount = amount * BigInt(10 ** 18);
		await checkTokenAllowance(
			signer,
			tokenContract,
			contractAddressSrc,
			convertedAmount
		);

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

export async function bridgeNonFungibleTokens(
	contractAddressSrc: string,
	signer: ethers.Signer,
	tokenAddress: string,
	dstAddress: string,
	dstChain: number,
	tokenId: number,
	tokenUri: string
): Promise<TransactionResponse | null> {
	const loopsoContractOnSrc = getLoopsoContractFromContractAddr(
		contractAddressSrc,
		signer
	);
	const tokenContract = new ethers.Contract(tokenAddress, ERC721_ABI, signer);
	try {
		const approved = await checkNftApproval(
			signer,
			tokenContract,
			contractAddressSrc,
			tokenId
		);
		if (approved) {
			const bridgeTx = loopsoContractOnSrc?.bridgeNonFungibleTokens(
				tokenAddress,
				tokenId,
				tokenUri,
				dstChain,
				dstAddress
			);
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
	attestationId: number
) {
	const loopsoContract = new ethers.Contract(
		contractAddress,
		LOOPSO_ABI,
		signerOrProvider
	);
	return loopsoContract.bridgeNonFungibleTokensBack(
		tokenId,
		dstAddress,
		attestationId
	);
}

export async function bridgeTokensBack(
	contractAddress: string,
	signerOrProvider: ethers.Signer | ethers.JsonRpcProvider,
	tokenId: number,
	dstAddress: string,
	attestationId: number
) {
	const loopsoContract = new ethers.Contract(
		contractAddress,
		LOOPSO_ABI,
		signerOrProvider
	);
	return loopsoContract.bridgeTokensBack(tokenId, dstAddress, attestationId);
}

export async function getAllSupportedTokens(
	contractAddress: string,
	signerOrProvider: ethers.Signer | ethers.JsonRpcProvider
) {
	const loopsoContract = new ethers.Contract(
		contractAddress,
		LOOPSO_ABI,
		signerOrProvider
	);
	return loopsoContract.getAllSupportedTokens();
}

export async function getFee(
	contractAddressDst: string,
	signerOrProvider: ethers.Signer | ethers.JsonRpcProvider,
	isFungible: boolean
): Promise<number> {
	const destLoopsoContract = new ethers.Contract(
		contractAddressDst,
		LOOPSO_ABI,
		signerOrProvider
	);

	if (isFungible) {
		const bpFee: number = await destLoopsoContract.FEE_FUNGIBLE();
		const decimalFee = bpFee / 10000;
		return decimalFee;
	} else {
		const etherFee: number = await destLoopsoContract.FEE_NON_FUNGIBLE();
		return etherFee;
	}
}

export async function isTokenSupported(
	contractAddressDst: string,
	signerOrProvider: ethers.Signer | ethers.JsonRpcProvider,
	tokenAddress: string,
	srcChain: number
): Promise<boolean> {
	const destLoopsoContract = new ethers.Contract(
		contractAddressDst,
		LOOPSO_ABI,
		signerOrProvider
	);

	return await destLoopsoContract.isTokenSupported(tokenAddress, srcChain);
}

export async function getWrappedTokenInfo(
	contractAddressOnSrc: string,
	signerOrProvider: ethers.Signer | ethers.JsonRpcProvider,
	wrappedTokenAddress: string
) {
	const loopsoContract = new ethers.Contract(
		contractAddressOnSrc,
		LOOPSO_ABI,
		signerOrProvider
	);

	const tokenInfo = await loopsoContract.wrappedTokenInfo(wrappedTokenAddress);

	const wrappedTokenInfo: WrappedTokenInfo = {
		tokenAddress: tokenInfo[0],
		srcChain: tokenInfo[1],
		tokenType: tokenInfo[2],
		decimals: tokenInfo[3],
		symbol: tokenInfo[4],
		name: tokenInfo[5],
		wrappedTokenAddress: tokenInfo[6],
	};

	return wrappedTokenInfo;
}
