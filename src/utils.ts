import { ethers } from "ethers";
import { ADDRESSES, LOOPSO_ABI } from "./constants";
import { ContractInstance } from "./types";
import { Contract } from "ethers";

export async function checkTokenAllowance(
	signer: ethers.Signer,
	tokenContract: ethers.Contract,
	contractAddressSrc: string,
	convertedAmount: bigint
): Promise<void> {
	const currentAllowance = await tokenContract.allowance(
		await signer.getAddress(),
		contractAddressSrc
	);

	if (currentAllowance < convertedAmount) {
		const approvalTx = await tokenContract.approve(
			contractAddressSrc,
			convertedAmount
		);
		if (!approvalTx) {
			throw new Error("Approval transaction failed");
		}
	}
}

export async function checkNftApproval(
	signer: ethers.Signer,
	erc721Contract: ethers.Contract,
	contractAddressSrc: string,
	tokenId: number
): Promise<string | null> {
	console.log("GOT HRE???");
	//const hasApproved = await erc721Contract.getApproved(tokenId)
	//if(hasApproved === await signer.getAddress())
	//console.log(hasApproved, await signer.getAddress(), 'HAS APPRÖÖÖÖVVVED?')
	const approvalTx = await erc721Contract.approve(contractAddressSrc, tokenId);

	if (approvalTx) {
		return approvalTx;
	} else return null;
}

export function getLoopsoContractFromChainId(
	chainId: number,
	signerOrProvider: ethers.Signer | ethers.JsonRpcProvider
): Contract | null {
	let contract: Contract | null = null;

	switch (chainId) {
		case 4201:
			contract = new ethers.Contract(
				ADDRESSES.LOOPSO_LUKSO_CONTRACT_ADDRESS,
				LOOPSO_ABI,
				signerOrProvider
			);
			break;
		case 80001:
			contract = new ethers.Contract(
				ADDRESSES.LOOPSO_MUMBAI_CONTRACT_ADDRESS,
				LOOPSO_ABI,
				signerOrProvider
			);
			break;
		// TODO: add more cases
		default:
			break;
	}

	return contract;
}

export function getLoopsoContractFromContractAddr(
	contractAddress: string,
	signerOrProvider: ethers.Signer | ethers.JsonRpcProvider
): Contract | null {
	let contract: Contract | null = null;

	switch (contractAddress) {
		case ADDRESSES.LOOPSO_LUKSO_CONTRACT_ADDRESS:
			contract = new ethers.Contract(
				contractAddress,
				LOOPSO_ABI,
				signerOrProvider
			);
			break;
		case ADDRESSES.LOOPSO_MUMBAI_CONTRACT_ADDRESS:
			contract = new ethers.Contract(
				contractAddress,
				LOOPSO_ABI,
				signerOrProvider
			);
			break;
		// TODO: add more cases as we deploy on more chains
		default:
			// Return null if no matching case
			break;
	}

	return contract;
}

export function getContractAddressFromChainId(chainId: number): string | null {
	let contractAddress: string | null = null;
	switch (chainId) {
		case 4201:
			contractAddress = ADDRESSES.LOOPSO_LUKSO_CONTRACT_ADDRESS;
			break;
		case 80001:
			contractAddress = ADDRESSES.LOOPSO_MUMBAI_CONTRACT_ADDRESS;
			break;
		// TODO: add more cases as you deploy on more chains
		default:
			// return null if no matching case
			break;
	}
	if (contractAddress) {
		return contractAddress;
	}
	return null;
}