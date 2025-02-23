'use strict';
import { IPFSUploader } from '../src/uploader.js';
import path from 'path';
import os from 'os';

async function Test() {
    try {
        // Define file and folder paths
        const imagePath = path.join(os.homedir(), 'Desktop', 'pokemon', '001.webp');
        const folderPath = path.join(os.homedir(), 'Desktop', 'pokemon');

        // Initialize IPFSUploader (adjust config if needed)
        const uploader = new IPFSUploader();

        console.log('Uploading single image...');
        const imageCID = await uploader.uploadFile(imagePath);
        console.log(`Image uploaded to IPFS: ${imageCID}`);

        console.log('Uploading entire folder...');
        const folderCID = await uploader.uploadDirectory(folderPath);
        console.log(`Folder uploaded to IPFS: ${folderCID}`);

        process.exit(0);
    } catch (error) {
        console.error('Error during IPFS upload:', error);
    }
}

Test();
