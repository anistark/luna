'use strict';
import { IPFSUploader } from '../src/uploader.js';
import path from 'path';
import os from 'os';

// Define file and folder paths
const imagePath = path.join(os.homedir(), 'Desktop', 'pokemon', '001.webp');
const folderPath = path.join(os.homedir(), 'Desktop', 'pokemon');
const cid = "bafkreia6t4ikkp4gvn5cj4nv7bmlfv74iaypxwqsbnv3usatjexb7tquoy";

async function Test() {
    try {
        // Initialize IPFSUploader (adjust config if needed)
        const uploader = new IPFSUploader();

        console.log('Uploading single image...');
        const imageCID = await uploader.uploadFile(imagePath);
        console.log(`Image uploaded to IPFS: ${imageCID}`);

        // console.log('Uploading entire folder...');
        // const folderCID = await uploader.uploadDirectory(folderPath);
        // console.log(`Folder uploaded to IPFS: ${folderCID}`);

        // const buffer = await uploader.fetchFile(cid);
        // console.log("File retrieved from IPFS:", buffer.toString());

        process.exit(0);
    } catch (error) {
        console.error('Error during IPFS upload:', error);
    }
}

Test();
