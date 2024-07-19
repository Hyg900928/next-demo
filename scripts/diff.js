const fs = require('fs-extra');
const path = require('path');
const crypto = require('crypto');


// 文件夹比较
async function getFilesInDirectoryRecursive(dir) {
    let results = [];
    const list = await fs.readdir(dir);
    for (const file of list) {
        const filePath = path.join(dir, file);
        const stat = await fs.stat(filePath);
        if (stat && stat.isDirectory()) {
            results = results.concat(await getFilesInDirectoryRecursive(filePath));
        } else {
            results.push(filePath);
        }
    }
    return results;
}

function getFileHash(filePath) {
    return new Promise((resolve, reject) => {
        const hash = crypto.createHash('sha256');
        const stream = fs.createReadStream(filePath);
        stream.on('data', data => hash.update(data));
        stream.on('end', () => resolve(hash.digest('hex')));
        stream.on('error', reject);
    });
}

/**
 * 将两个文件夹进行比较
 * 比较规则:
 * 1. 以dir1 为参照物
 * 2. 如果dir1 和 dir2 都存在,则比较文件哈希
 * 3. 如果dir2 中有, dir1 中没有, 则删除dir2中文件
 * 4. 如果dir2 没有, dir1 有, 则新增
 * @param dir1
 * @param dir2
 * @returns {Promise<*[]>}
 */
async function findModifiedFiles(dir1, dir2) {
    try {
        const filesDir1 = await getFilesInDirectoryRecursive(dir1);
        const filesDir2 = await getFilesInDirectoryRecursive(dir2);

        const relativeFilesDir1 = filesDir1.map(file => path.relative(dir1, file));
        const relativeFilesDir2 = filesDir2.map(file => path.relative(dir2, file));

        const allFiles = new Set([...relativeFilesDir1, ...relativeFilesDir2]);
        const modifiedFiles = [];

        for (const relativeFilePath of allFiles) {
            const filePathDir1 = path.join(dir1, relativeFilePath);
            const filePathDir2 = path.join(dir2, relativeFilePath);
            const isExistFilePathDir1 = await fs.pathExists(filePathDir1);
            const isExistFilePathDir2 = await fs.pathExists(filePathDir2);
            if (isExistFilePathDir1 && isExistFilePathDir2) {
                const hashDir1 = await getFileHash(filePathDir1);
                const hashDir2 = await getFileHash(filePathDir2);
                if (hashDir1 !== hashDir2) {
                    modifiedFiles.push(relativeFilePath);
                }
            } else {
                //
                modifiedFiles.push(relativeFilePath);
                // if(!isExistFilePathDir1 && isExistFilePathDir2) {
                //     fs.removeSync(filePathDir2);
                // } else {
                //     modifiedFiles.push(relativeFilePath);
                // }
            }
        }

        return modifiedFiles;
    } catch (err) {
        console.error('Error reading directories:', err);
    }
}


module.exports = {
    findModifiedFiles
};