# Luna ☾

![luna-b](https://github.com/user-attachments/assets/4071642d-c1e3-4393-beec-eae6635f5239)

> A TypeScript SDK for uploading files & directories to IPFS using Helia.

[![NPM](https://img.shields.io/badge/NPM-%23CB3837.svg?style=for-the-badge&logo=npm&logoColor=white)](https://www.npmjs.com/package/luna-ipfs) 

## Features

- File Upload
    - ✅ NodeJs (Backend)
    - ✅ Browser (React, NextJs, etc.)
- Folder Upload
    - ✅ NodeJs (Backend)
- Fetch File
    - ✅ NodeJs (Backend)
    - ✅ Browser (React, NextJs, etc.)

## Install

```sh
npm i luna-ipfs
```

or

```sh
yarn add luna-ipfs
```
or similar for `pnpm`, `bun`, etc.

## **Usage**

### Import and Initialize
```ts
import IPFSUploader from "luna-ipfs";

const uploader = new IPFSUploader(); // Uses default storage path "./ipfs-blocks" in /var/folders
await uploader.init(); // Initialize Luna
```

### Upload a File
#### **Node.js**
```ts
const fileCid = await uploader.uploadFile("./example.txt");
console.log("File uploaded to IPFS:", fileCid);
```

#### Browser
```ts
const fileInput = document.querySelector("input[type='file']");
fileInput.addEventListener("change", async (event) => {
    const file = event.target.files[0];
    const fileCid = await uploader.uploadFile(file);
    console.log("File uploaded to IPFS:", fileCid);
});
```

### Upload a Directory (Node.js only)
```ts
const folderCid = await uploader.uploadDirectory("./my-folder");
console.log("Folder uploaded to IPFS:", folderCid);
```

### Fetch a File from IPFS
```ts
const fileContent = await uploader.fetchFile("<CID>");
console.log("Fetched file content:", fileContent);
```

### Stop Helia

Helia instance should be stopped when done using:

```ts
await uploader.stop();
```

This will also cleanup the temp folder used. But your files are permanently saved in IPFS.

---

> 💡 Check for [available public gateways](https://ipfs.github.io/public-gateway-checker/).

---

## Dev

```sh
npm i
```

### Build

```sh
npm run build
```

### Test Dev mode

Update file and folder path on test file before proceeding:

```sh
npm run test:dev
```

---

**⚠️ Under Development ⚠️**
