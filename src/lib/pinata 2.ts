/**
 * Pinata IPFS Client for uploading files and JSON data
 * Uses Pinata's v3 API with JWT authentication
 */

const PINATA_JWT = process.env.PINATA_JWT!;
const PINATA_GATEWAY = "https://gateway.pinata.cloud/ipfs/";

if (!PINATA_JWT) {
    throw new Error("Missing PINATA_JWT environment variable");
}

/**
 * Upload a file to IPFS via Pinata
 */
export async function uploadFileToPinata(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);

    const metadata = JSON.stringify({
        name: file.name,
    });
    formData.append("pinataMetadata", metadata);

    const options = JSON.stringify({
        cidVersion: 1,
    });
    formData.append("pinataOptions", options);

    const response = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${PINATA_JWT}`,
        },
        body: formData,
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Pinata upload failed: ${error}`);
    }

    const data = await response.json();
    return data.IpfsHash;
}

/**
 * Upload JSON data to IPFS via Pinata
 */
export async function uploadJSONToPinata(jsonData: any, name: string): Promise<string> {
    const response = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${PINATA_JWT}`,
        },
        body: JSON.stringify({
            pinataContent: jsonData,
            pinataMetadata: {
                name,
            },
            pinataOptions: {
                cidVersion: 1,
            },
        }),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Pinata JSON upload failed: ${error}`);
    }

    const data = await response.json();
    return data.IpfsHash;
}

/**
 * Get IPFS content URL
 */
export function getIPFSUrl(hash: string): string {
    return `${PINATA_GATEWAY}${hash}`;
}

/**
 * Fetch JSON data from IPFS
 */
export async function fetchFromIPFS<T>(hash: string): Promise<T> {
    const response = await fetch(getIPFSUrl(hash));
    if (!response.ok) {
        throw new Error(`Failed to fetch from IPFS: ${hash}`);
    }
    return response.json();
}
