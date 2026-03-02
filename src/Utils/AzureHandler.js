import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Now use require to import azure-storage
const azure = require('azure-storage');

// Function to upload files to Azure Blob Storage
export default function ScraawlBlob(blobName, stream, streamLength) {
    const blobService = azure.createBlobService(
        process.env.STORAGE_ACCOUNT,
        process.env.ACCESS_KEY
    );

    return new Promise((resolve, reject) => {
        blobService.createBlockBlobFromStream(
            process.env.CONTAINER_NAME,
            blobName,
            stream,
            streamLength,
            (err) => {
                if (err) {
                    console.error(`Error uploading blob ${blobName}:`, err);
                    reject(err);
                } else {
                    console.log(`Blob uploaded successfully: ${blobName}`);
                    resolve(blobName);
                }
            }
        );
    });
}

// Function to delete files from Azure Blob Storage
export function deleteBlob(blobName) {
    const blobService = azure.createBlobService(
        process.env.STORAGE_ACCOUNT,
        process.env.ACCESS_KEY
    );

    return new Promise((resolve, reject) => {
        blobService.deleteBlobIfExists(
            process.env.CONTAINER_NAME,
            blobName,
            (err, result) => {
                if (err) {
                    console.error(`Error deleting blob ${blobName}:`, err);
                    reject(err);
                } else if (result) {
                    console.log(`Blob deleted successfully: ${blobName}`);
                    resolve(result);
                } else {
                    console.log(`Blob ${blobName} does not exist or was already deleted.`);
                    resolve(result);
                }
            }
        );
    });
}

