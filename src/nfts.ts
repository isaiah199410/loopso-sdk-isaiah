import fetch from "cross-fetch";

export interface NftMetadata {
    id: string;
    contractAddress: string;
    metadata: {
        description: string;
        image: string;
        name: string;
        // Add other properties as needed
    };
}

export const getLuksoNftMetadata = async (filteredData: any[]): Promise<NftMetadata[] | null> => {
    try {
        const metadataPromises = filteredData.map(async (item) => {
            console.log(item, 'this is item')
            const response = await fetch(`https://api.explorer.execution.testnet.lukso.network/api/v2/tokens/${item.address}/instances`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                },
            });


            if (!response.ok) {
                throw new Error(`Failed to fetch data: ${response.statusText}`);
            }

            const allMetaData: any = await response.json();
            const extractedMetadata = allMetaData.items.map((metadataItem: any) => ({
                contractAddress: item.address,
                id: metadataItem.id,
                metadata: {
                    description: metadataItem?.metadata?.description,
                    image: metadataItem?.metadata?.image,
                    name: metadataItem?.metadata?.name,
                },
            }));

            console.log(extractedMetadata, 'Extracted Metadata');

            return extractedMetadata;
        });

        const metadataArray = await Promise.all(metadataPromises);
        const flattenedMetadataArray = metadataArray.flat();

        return flattenedMetadataArray;
    } catch (error) {
        console.error('Error fetching data:', error);
        return null
    }
};


export const fetchLuksoNfts = async (searchText: string): Promise<NftMetadata[] | null> => {
    try {
        const response = await fetch(`https://api.explorer.execution.testnet.lukso.network/api/v2/search?q=${searchText}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch data: ${response.statusText}`);
        }

        const data: any = await response.json();

        // filter data so we only get ERC-721, no ERC20s
        const filteredData = data.items.filter((item: { type: string; token_type: string; }) => item.type === 'token' && item.token_type === 'ERC-721');
        const nftMetaData = await getLuksoNftMetadata(filteredData);
        return nftMetaData

    } catch (error) {
        console.error('Error fetching data:', error);
        return null
    }
};