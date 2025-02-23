import * as chai from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon from "sinon";
import mockFs from "mock-fs";
import IPFSUploader from "../src/uploader.js";

// Use chai-as-promised
chai.use(chaiAsPromised);
const expect = chai.expect;

describe("IPFSUploader", function () {
    let uploader: IPFSUploader;
    let initStub: sinon.SinonStub;
    let addFileStub: sinon.SinonStub;
    let addDirectoryStub: sinon.SinonStub;
    let stopStub: sinon.SinonStub;

    beforeEach(async function () {
        uploader = new IPFSUploader();

        // Stub `init()` so it doesn't actually create Helia
        initStub = sinon.stub(uploader, "init").resolves();

        // Mock the `fsHelia.addFile` method
        addFileStub = sinon.stub().resolves("QmFakeFileCID");
        uploader["fsHelia"] = { addFile: addFileStub, addAll: sinon.stub().resolves("QmFakeDirCID") };

        // Stub `stop()`
        stopStub = sinon.stub(uploader, "stop").resolves();
    });

    afterEach(function () {
        sinon.restore();
        mockFs.restore();
    });

    describe("Initialization", function () {
        it("should initialize without errors", async function () {
            await expect(uploader.init()).to.not.be.rejected;
        });
    });

    describe("Upload File", function () {
        beforeEach(function () {
            mockFs({
                "/tmp/test-file.txt": "Hello, IPFS!",
            });
        });

        it("should upload a file successfully", async function () {
            const cid = await uploader.uploadFile("/tmp/test-file.txt");
            expect(cid).to.equal("https://ipfs.io/ipfs/QmFakeFileCID");
            expect(addFileStub.calledOnce).to.be.true;
        });

        it("should handle file read errors", async function () {
            await expect(uploader.uploadFile("/tmp/nonexistent.txt")).to.be.rejectedWith(Error);
        });

        it("should reject if file is invalid", async function () {
            await expect(uploader.uploadFile("")).to.be.rejectedWith("Invalid file path or object");
        });
    });

    describe("Upload Directory", function () {
        beforeEach(function () {
            mockFs({
                "/tmp/test-dir": {
                    "file1.txt": "File 1 content",
                    "file2.txt": "File 2 content",
                },
            });
        });

        it("should upload a directory successfully", async function () {
            const cid = await uploader.uploadDirectory("/tmp/test-dir");
            expect(cid).to.equal("https://ipfs.io/ipfs/QmFakeDirCID");
        });

        it("should reject when called in browser environment", async function () {
            (global as any).window = {}; // Mock browser
            await expect(uploader.uploadDirectory("/tmp/test-dir")).to.be.rejectedWith("uploadDirectory() is only supported in Node.js");
            delete (global as any).window;
        });

        it("should handle errors when directory does not exist", async function () {
            await expect(uploader.uploadDirectory("/tmp/missing-dir")).to.be.rejectedWith(Error);
        });
    });

    describe("Stop Helia", function () {
        it("should stop without errors", async function () {
            await expect(uploader.stop()).to.not.be.rejected;
        });
    });
});
