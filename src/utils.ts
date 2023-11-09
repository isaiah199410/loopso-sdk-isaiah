
import { Buffer } from 'buffer';

export const isValidAptosType = (str: string): boolean =>
	/^(0x)?[0-9a-fA-F]+::\w+::\w+$/.test(str);

export function nativeAddressToHexString(
	address: string, wChainId: number) {

}

export function hexToUint8Array(input): Uint8Array {
	return new Uint8Array(Buffer.from(input.substring(2), "hex"));
}


