import IPFSUploader from '../src/uploader';

describe('IPFSUploader', () => {
    let uploader: IPFSUploader;

    beforeAll(() => {
        uploader = new IPFSUploader();
    });

    afterAll(async () => {
        await uploader.stop();
    });

    test('uploadFile() should throw error for invalid file', async () => {
        await expect(uploader.uploadFile('invalid.txt')).rejects.toThrow("Invalid file path");
    });

    test('uploadDirectory() should throw error for invalid directory', async () => {
        await expect(uploader.uploadDirectory('invalid-dir')).rejects.toThrow("Invalid directory path");
    });
});
