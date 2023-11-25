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
	const loopsoContractOnSrc = getLoopsoContractFromContractAddr(
		contractAddressSrc,
		signer
	);
	const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
	const contractAddressDst = getContractAddressFromChainId(dstChain);
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
				await bridgeTx.wait();
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
				await bridgeTx.wait();
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
): Promise<any | null> {
	const loopsoContractOnSrc = getLoopsoContractFromContractAddr(
		contractAddressSrc,
		signer
	);
	const contractAddressDst = getContractAddressFromChainId(dstChain);
	const erc721Contract = new ethers.Contract(tokenAddress, ERC721_ABI, signer);
	try {
		const approved = await checkNftApproval(
			signer,
			erc721Contract,
			contractAddressSrc,
			tokenId
		);

		if (approved && loopsoContractOnSrc && contractAddressDst) {
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
				const bridgeTx = await loopsoContractOnSrc.bridgeNonFungibleTokensBack(
					tokenId,
					dstAddress,
					attestationId
				);
				await bridgeTx.wait();
				if (!bridgeTx) {
					throw new Error("Bridge transaction failed");
				} else return bridgeTx;
			} else {
				const bridgeTx = await loopsoContractOnSrc.bridgeNonFungibleTokens(
					tokenAddress,
					tokenId,
					tokenUri,
					dstChain,
					dstAddress,
					{ value: 0 }
				);
				await bridgeTx.wait();
				if (!bridgeTx) {
					throw new Error("Bridge transaction failed");
				} else return bridgeTx;
			}
		} else throw new Error("Missing fields to perform bridge");
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
	const tx = await loopsoContract.bridgeNonFungibleTokensBack(
		tokenId,
		dstAddress,
		attestationId
	);
	await tx.wait();
	return tx;
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
	contractAddress: string,
	signerOrProvider: ethers.Signer | ethers.JsonRpcProvider,
	isFungible: boolean
): Promise<number> {
	const loopsoContract = new ethers.Contract(
		contractAddress,
		LOOPSO_ABI,
		signerOrProvider
	);

	if (isFungible) {
		const bpFee = await loopsoContract.FEE_FUNGIBLE();
		const decimalFee = Number(bpFee) / 10000;
		return decimalFee;
	} else {
		const etherFee = await loopsoContract.FEE_NON_FUNGIBLE();
		return Number(etherFee);
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
