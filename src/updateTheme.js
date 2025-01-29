const fs = require('fs');
const http = require('http');
const https = require('https');

function downloadFile(url, filePath) {
    const file = fs.createWriteStream(filePath);
    const protocol = url.startsWith('https') ? https : http;
  
    return new Promise((resolve, reject) => {
        protocol.get(url, (response) => {
            response.pipe(file);
            file.on('finish', () => {
            file.close(resolve);
            });
        }).on('error', (error) => {
            fs.unlink(filePath, () => {
            reject(error);
            });
        });
    });
}

const jsonUrl = 'https://raw.githubusercontent.com/siyuan-note/bazaar/main/stage/themes.json';
const jsonFilePath = './src/themes.json';

downloadFile(jsonUrl, jsonFilePath);