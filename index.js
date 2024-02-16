const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const sourceDir = './sourceImages';
const destinationDir = './resizedImages';
const MAX_SIZE = 150 * 1024; // 150 KB in Bytes

// Ensure the destination directory exists
if (!fs.existsSync(destinationDir)) {
    fs.mkdirSync(destinationDir, { recursive: true });
}

const files = fs.readdirSync(sourceDir);

const compressImageWithMaxSize = (inputPath, outputPath) => {
    let currentQuality = 90; // Starting quality

    const compressAndCheck = () => {
        return sharp(inputPath)
            .webp({ quality: currentQuality })
            .toBuffer()
            .then(buffer => {
                if (buffer.length > MAX_SIZE && currentQuality > 10) {
                    currentQuality -= 5; // Decrease quality by 5%
                    return compressAndCheck(); // Try again recursively
                }
                return fs.promises.writeFile(outputPath, buffer);
            });
    };

    return compressAndCheck();
};

// Process each file in the source directory
if (files.length > 0) {
    const processFiles = files.filter(file => ['.jpg', '.png'].includes(path.extname(file).toLowerCase())).map(file => {
        const filePath = path.join(sourceDir, file);
        const outputPath = path.join(destinationDir, `${path.basename(file, path.extname(file))}.webp`);
        return compressImageWithMaxSize(filePath, outputPath).catch(err => {
            console.error(`Error processing ${file}:`, err);
        });
    });

    Promise.all(processFiles).then(() => {
        console.log('All images have been processed and saved in the folder resizedImages.');
    }).catch(err => {
        console.error('An error occurred:', err);
    });
} else {
    console.log('No images found.');
}