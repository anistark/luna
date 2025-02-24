import { createHelia } from 'helia';
import { unixfs } from '@helia/unixfs';
import { FsBlockstore } from 'blockstore-fs';
import { MemoryBlockstore } from 'blockstore-core';
import os from 'os';
import fs from 'fs/promises';
import path from 'path';
import { CID } from 'multiformats/cid';

const isNode = typeof window === 'undefined';

export class IPFSUploader {
    private helia: any;
    private fsHelia: any;
    private storagePath: string;
    private apiUrl: string | null;

    constructor(apiUrl?: string) {
        this.helia = null;
        this.fsHelia = null;
        this.storagePath = isNode ? path.join(os.tmpdir(), 'ipfs-blocks') : '';
        this.apiUrl = apiUrl || null;
    }

    async init(): Promise<void> {
        if (!this.helia) {
            await fs.mkdir(this.storagePath, { recursive: true }); // Create temp dir if needed
            const blockstore = isNode ? new FsBlockstore(this.storagePath) : new MemoryBlockstore();
            this.helia = await createHelia({ blockstore });
            this.fsHelia = unixfs(this.helia);
            // console.log("🌙 Luna initialised!", isNode ? `Storage: ${this.storagePath}` : "Running in Browser (Memory)");
            console.log("🌙 Luna initialised!");
        }
    }

    /**
     * Uploads a single file (Works in Node.js & Browser)
     * @param file - File path (Node.js) or File object (Browser)
     * @returns IPFS CID URL
     */
    async uploadFile(file: string | File): Promise<string> {
        await this.init();
        let fileBuffer: Uint8Array;
    
        if (isNode) {
            const fs = await import('fs/promises');
            fileBuffer = new Uint8Array(await fs.readFile(file as string));
        } else {
            fileBuffer = new Uint8Array(await (file as File).arrayBuffer());
        }
        // console.log('fileBuffer:', fileBuffer);
        if (fileBuffer.length === 0) {
            throw new Error("File is empty, cannot upload.");
        }
        const cid = await this.fsHelia.addBytes(fileBuffer);
        console.log("cid:", cid);
        await this.cleanup();
        // Pin the CID to ensure it remains accessible
        const pinned = await this.pinCID(cid.toString());
        console.log('pinned:', pinned);
        return `https://ipfs.io/ipfs/${cid.toString()}`;
    }

    /**
     * Uploads a directory as a single CID (Only Works in Node.js)
     * @param dirPath - Path to the directory
     * @returns Root CID URL
     */
    async uploadDirectory(dirPath: string): Promise<string> {
        if (!isNode) {
            throw new Error("uploadDirectory() is only supported in Node.js");
        }
    
        await this.init();
    
        async function* getFilesRecursively(dir: string): AsyncIterable<{ path: string; content: Uint8Array }> {
            const files = await fs.readdir(dir);
            for (const file of files) {
                const filePath = path.join(dir, file);
                const stat = await fs.stat(filePath);
    
                if (stat.isDirectory()) {
                    yield* getFilesRecursively(filePath);
                } else {
                    yield {
                        path: filePath.replace(dirPath, '').replace(/^\/+/, ''), // Ensure relative paths
                        content: new Uint8Array(await fs.readFile(filePath))
                    };
                }
            }
        }
    
        const files: { path: string; content: Uint8Array }[] = [];
        for await (const file of getFilesRecursively(dirPath)) {
            files.push(file);
        }
    
        if (files.length === 0) {
            throw new Error("No files found in directory.");
        }
    
        const cidIterator = this.fsHelia.addAll(files.map(file => ({
            path: file.path,
            content: file.content
        })));
    
        let lastCID = null;
        for await (const cid of cidIterator) {
            lastCID = cid;
        }
    
        if (!lastCID) {
            throw new Error("Failed to retrieve CID for the uploaded directory.");
        }
        await this.cleanup();
        // Pin the CID to ensure it remains accessible
        const pinned = await this.pinCID(lastCID.cid);
        console.log('pinned:', pinned);
        return `https://ipfs.io/ipfs/${lastCID.cid.toString()}/`;
    }

    /**
     * Fetches a file from IPFS using its CID
     * @param cid - Content Identifier (CID) of the file
     * @returns File content as a Buffer (Node.js) or Blob (Browser)
     */
    async fetchFile(cid: string): Promise<Buffer | Blob | any> {
        await this.init();
        // const fileChunks = [];
        
        // for await (const chunk of this.fsHelia.cat(cid)) {
        //     fileChunks.push(chunk);
        // }

        // const fileBuffer = Buffer.concat(fileChunks);

        // if (isNode) {
        //     return fileBuffer; // Return as Buffer in Node.js
        // } else {
        //     return new Blob([fileBuffer]); // Return as Blob in Browser
        // }
        const decoder = new TextDecoder()
        let text = ''

        for await (const chunk of this.fsHelia.cat(cid)) {
        text += decoder.decode(chunk, {
            stream: true
        })
        }

        console.log('Added file contents:', text)
        return;
    }

    async cleanup(): Promise<void> {
        if (isNode && this.storagePath) {
            try {
                await fs.rm(this.storagePath, { recursive: true, force: true });
                console.log("🗑️ Cleaned up temp storage:", this.storagePath);
            } catch (err) {
                console.error("⚠️ Error cleaning up temp storage:", err);
            }
        }
    }

    async stop(): Promise<void> {
        if (this.helia) {
            await this.helia.stop();
            console.log("🛑 Helia instance stopped.");
        }
        await this.cleanup(); // Cleanup temp storage on stop
    }

    async pinCID(cid: string): Promise<boolean | string> {
        try {
            // Validate CID format
            if (!CID.parse(cid)) {
                return "Invalid CID format.";
            }
    
            // Check if Helia supports pinning
            if (!this.fsHelia.pin) {
                return "Pin API is not available in Helia.";
            }
    
            // Pin the CID
            await this.fsHelia.pin.add(CID.parse(cid));
            console.log(`Successfully pinned CID: ${cid}`);
            return true;
        } catch (error: any) {
            console.error(`Error pinning CID: ${cid}`, error);
            return `Error: ${error.message || error}`;
        }
    }

    async pinCIDViaAPI(cid: string): Promise<boolean | string> {
        if (!this.apiUrl) {
            console.warn("Pinning is disabled because no API URL was provided.");
            return false;
        }
        try {
            const response = await fetch(`${this.apiUrl}/pin/add?arg=${cid}`, { method: 'POST' });
    
            if (!response.ok) {
                return `Failed to pin CID. Status: ${response.status}`;
            }
    
            console.log(`Successfully pinned CID: ${cid}`);
            return true;
        } catch (error: any) {
            console.error(`Error pinning CID: ${cid}`, error);
            return `Error: ${error.message || error}`;
        }
    }
}

export default IPFSUploader;
