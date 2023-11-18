
import { ethers } from 'ethers';
import { ADDRESSES, LOOPSO_ABI } from './constants';
import { ContractInstance } from './types';


export async function checkAllowance(signer: ethers.Signer, tokenContract: ethers.Contract, contractAddressSrc: string, convertedAmount: bigint): Promise<void> {
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

export async function getLoopsoContractFromChainId(chainId: number, signerOrProvider: ethers.Signer | ethers.Provider): Promise<ethers.Contract> | null {
	let contract: ethers.Contract | null = null;

	switch (chainId) {
		case 4201:
			contract = new ethers.Contract(ADDRESSES.LOOPSO_LUKSO_CONTRACT_ADDRESS, LOOPSO_ABI, signerOrProvider);
			break;
		case 80001:
			contract = new ethers.Contract(ADDRESSES.LOOPSO_MUMBAI_CONTRACT_ADDRESS, LOOPSO_ABI, signerOrProvider);
			break;
		// TODO: add more cases
		default:
			break;
	}

	if (contract) {
		return {
			contract,
		};
	}

	return null;
}



export async function getLoopsoContractFromContractAddr(contractAddress: string, signerOrProvider: ethers.Signer | ethers.Provider): Promise<ethers.Contract> | null {
	let contract: ethers.Contract | null = null;
	switch (contractAddress) {
		case ADDRESSES.LOOPSO_LUKSO_CONTRACT_ADDRESS:
			contract = new ethers.Contract(contractAddress, LOOPSO_ABI, signerOrProvider);
			break;
		case ADDRESSES.LOOPSO_MUMBAI_CONTRACT_ADDRESS:
			contract = new ethers.Contract(contractAddress, LOOPSO_ABI, signerOrProvider);
			break;
		// TODO: add more cases as we deploy on more chains
		default:
			//return null if no matching case
			break;
	}
	if (contract) {
		return {
			contract,
		};
	}
	return null;
}


