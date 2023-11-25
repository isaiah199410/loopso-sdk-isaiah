import { ethers, TransactionResponse, Signer } from "ethers";
import {
	ERC20_ABI,
	ERC721_ABI,
	LOOPSO_ABI,
	WRAPPED_ABI,
	ADDRESSES,
} from "./constants";
import {
	checkNftApproval,
	checkTokenAllowance,
	getAttestationIDHash,
	getContractAddressFromChainId,
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
	const contractAddressDst = await getContractAddressFromChainId(dstChain);
	let convertedAmount = amount * BigInt(10 ** 18);
	await checkTokenAllowance(
		signer,
		tokenContract,
		contractAddressSrc,
		convertedAmount
	);
	try {
		if (loopsoContractOnSrc && contractAddressDst) {
			const isWrappedTokenInfo = await getWrappedTokenInfo(
				contractAddressSrc,
				signer,
				tokenAddress
			);
			const attestationId = getAttestationIDHash(
				isWrappedTokenInfo.tokenAddress,
				isWrappedTokenInfo.srcChain
			);
			if (isWrappedTokenInfo.name) {
				const bridgeTx = await loopsoContractOnSrc.bridgeTokensBack(
					convertedAmount,
					dstAddress,
					attestationId
				);
				if (!bridgeTx) {
					throw new Error("Bridge transaction failed");
				} else return bridgeTx;
			} else {
				const bridgeTx = await loopsoContractOnSrc.bridgeTokens(
					tokenAddress,
					convertedAmount,
					dstChain,
					dstAddress
				);
				if (!bridgeTx) {
					throw new Error("Bridge transaction failed");
				} else return bridgeTx;
			}
		} else return null;
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

export async function wrapNativeToken(
	signerOrProvider: ethers.Signer | ethers.JsonRpcProvider,
	chainId: number,
	amount: bigint
) {
	let wrappedContract;
	amount = amount * BigInt(10 ** 18);

	switch (chainId) {
		case 80001:
			wrappedContract = new ethers.Contract(
				ADDRESSES.WRAPPED_MATIC_ADDRESS_MUMBAI,
				WRAPPED_ABI,
				signerOrProvider
			);
			break;
		case 4201:
			wrappedContract = new ethers.Contract(
				ADDRESSES.WRAPPED_LYX_ADDRESS_LUKSO,
				WRAPPED_ABI,
				signerOrProvider
			);
			break;
		default:
			return new Error("Invalid ChainId");
	}

	const tx = await wrappedContract.deposit({ value: amount });
	await tx.wait();

	return tx;
}

export async function unwrapNativeToken(
	signerOrProvider: ethers.Signer | ethers.JsonRpcProvider,
	chainId: number,
	amount: bigint
) {
	let wrappedContract;
	amount = amount * BigInt(10 ** 18);

	switch (chainId) {
		case 80001:
			wrappedContract = new ethers.Contract(
				ADDRESSES.WRAPPED_MATIC_ADDRESS_MUMBAI,
				WRAPPED_ABI,
				signerOrProvider
			);
			break;
		case 4201:
			wrappedContract = new ethers.Contract(
				ADDRESSES.WRAPPED_LYX_ADDRESS_LUKSO,
				WRAPPED_ABI,
				signerOrProvider
			);
			break;
		default:
			return new Error("Invalid ChainId");
	}

	const tx = await wrappedContract.withdraw(amount);
	await tx.wait();

	return tx;
}
