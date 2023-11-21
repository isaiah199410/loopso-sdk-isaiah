import { ethers } from "ethers";

export type ChainName = "ethereum" | "polygon" | "lukso";

export type Token = {
	name: string;
	symbol: string;
	mint: string;
	contract: string;
	chainId: number;
	wChainId?: number;
	decimals: number;
	logoURI: string;
	coingeckoId: string;
	realOriginChainId?: number;
	realOriginContractAddress?: string;
};

export interface ContractInstance {
	contract: ethers.Contract;
}

export type WrappedTokenInfo = {
	tokenAddress: string;
	srcChain: number;
	tokenType: number;
	decimals: number;
	symbol: string;
	name: string;
	wrappedTokenAddress: string;
};
