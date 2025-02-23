import { createHelia } from 'helia';
import { unixfs } from '@helia/unixfs';
import { FsBlockstore } from 'blockstore-fs';
import { MemoryBlockstore } from 'blockstore-core';

const isNode = typeof window === 'undefined';

export class IPFSUploader {
    private helia: any;
    private fsHelia: any;

    constructor(private storagePath: string = './ipfs-blocks') {
        this.helia = null;
        this.fsHelia = null;
    }

    /**
     * Initializes Helia with appropriate storage
     */
    async init(): Promise<void> {
        if (!this.helia) {
            const blockstore = isNode ? new FsBlockstore(this.storagePath) : new MemoryBlockstore();
            this.helia = await createHelia({ blockstore });
            this.fsHelia = unixfs(this.helia);
            console.log("🚀 Helia initialized!", isNode ? `Storage: ${this.storagePath}` : "Running in Browser (Memory)");
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
            const fs = await import('fs');
            fileBuffer = new Uint8Array(fs.readFileSync(file as string));
        } else {
            fileBuffer = new Uint8Array(await (file as File).arrayBuffer());
        }

        const cid = await this.fsHelia.addFile(fileBuffer);
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
        const fs = await import('fs');
        const path = await import('path');

        async function* getFilesRecursively(dir: string): AsyncIterable<{ path: string; content: Uint8Array }> {
            const files = fs.readdirSync(dir);
            for (const file of files) {
                const filePath = path.join(dir, file);
                const stat = fs.statSync(filePath);

                if (stat.isDirectory()) {
                    yield* getFilesRecursively(filePath);
                } else {
                    yield { path: filePath.replace(dir, ''), content: new Uint8Array(fs.readFileSync(filePath)) };
                }
            }
        }

        const files = [];
        for await (const file of getFilesRecursively(dirPath)) {
            files.push(file);
        }

        const rootCID = await this.fsHelia.addDirectory(files);
        return `https://ipfs.io/ipfs/${rootCID.toString()}/`;
    }

    /**
     * Stops Helia instance
     */
    async stop(): Promise<void> {
        if (this.helia) {
            await this.helia.stop();
            console.log("🛑 Helia instance stopped.");
        }
    }
}

export default IPFSUploader;
