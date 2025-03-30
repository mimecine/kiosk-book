import { PDFDocument, PageSizes } from 'pdf-lib';
import fs from 'fs';
import { Command } from 'commander';

// Define common paper sizes in inches
const PAPER_SIZES = {
    letter: { width: 8.5, height: 11 },
    a4: { width: 8.27, height: 11.69 },
    a3: { width: 11.69, height: 16.54 },
    '11x17': { width: 11, height: 17 }, // Add 11x17
};

async function imposePdf(inputPdfPath, outputPdfPath, paperWidthInches, paperHeightInches, signatureSize, creep) {
    try {
        const inputPdfData = fs.readFileSync(inputPdfPath);
        const pdfDoc = await PDFDocument.load(inputPdfData);
        const numPages = pdfDoc.getPageCount();
        console.log(`Number of pages in input PDF: ${numPages}`);

        if (numPages === 0) {
            console.error('Error: Input PDF is empty.');
            return;
        }

        if (signatureSize % 4 !== 0) {
            console.error('Error: Signature size must be a multiple of 4.');
            return;
        }

        const paperWidthPoints = paperWidthInches * 72;
        const paperHeightPoints = paperHeightInches * 72;
        const numSignatures = Math.ceil(numPages / signatureSize);
        const innerMargin = paperWidthPoints / 2;
        console.log(`Paper size: ${paperWidthInches} x ${paperHeightInches} inches (${paperWidthPoints} x ${paperHeightPoints} points)`);
        console.log(`Signatures: ${numSignatures}`);

        const imposedPdfDoc = await PDFDocument.create();

        for (let signatureIndex = 0; signatureIndex < numSignatures; signatureIndex++) {
            const firstPageInSignature = signatureIndex * signatureSize;
            const lastPageInSignature = Math.min((signatureIndex + 1) * signatureSize - 1, numPages - 1);

            const newPageFront = imposedPdfDoc.addPage([paperWidthPoints, paperHeightPoints]);
            const newPageBack = imposedPdfDoc.addPage([paperWidthPoints, paperHeightPoints]);

            let frontPageNumbers = [];
            let backPageNumbers = [];

            if (signatureSize === 4) {
                frontPageNumbers = [3, 0];
                backPageNumbers = [2, 1];
            } else if (signatureSize === 8) {
                frontPageNumbers = [2,5,1,6];
                backPageNumbers = [4,3,7,0];
            }
        else if (signatureSize === 16) {
            frontPageNumbers = [2,5,1,6];
            backPageNumbers = [4,3,7,0];
        }
        else {
                for (let i = 0; i < signatureSize; i++) {
                    const pageNumber = firstPageInSignature + i;
                    if (pageNumber > lastPageInSignature) {
                        frontPageNumbers.push(null);
                        backPageNumbers.push(null);
                    } else if (i % 2 === 0) {
                        frontPageNumbers.push(pageNumber);
                    } else {
                        backPageNumbers.unshift(pageNumber);
                    }
                }
            }


            // Function to calculate page offsets, rotation and flip
            const calculatePageLayout = (signatureSize, creep, innerMargin, isFront, paperWidth, paperHeight) => {
                const pageLayouts = [];
                const halfSignature = signatureSize / 2;
                const pageHalfWidth = paperWidth / 2;
                const pageHalfHeight = paperHeight / 2;
                let scale = 1;

                if (signatureSize === 4) {
                    scale = 0.49;
                } else if (signatureSize === 8) {
                    scale = 0.32;
                }
                else if (signatureSize === 12) {
                    scale = 0.24;
                }
                else if (signatureSize === 16) {
                    scale = 0.24;
                }
                else{
                    scale = 1;
                }

                for (let i = 0; i < signatureSize; i++) {
                    const pageNumberInSignature = i;
                    const creepAdjustment = (halfSignature - 0.5 - Math.abs(pageNumberInSignature - (signatureSize - 1) / 2)) * creep;
                    let xOffset, yOffset, rotation, flip;

                    if (pageNumberInSignature < halfSignature) {
                        xOffset =  creepAdjustment;
                        flip = false;
                    } else {
                        xOffset = pageHalfWidth -  creepAdjustment;
                        flip = true;
                    }

                    // Calculate yOffset to position pages in top or bottom half
                    yOffset = (pageNumberInSignature < halfSignature) ? 0 : pageHalfHeight;
                    rotation = 0;

                    // Adjust rotation for back pages and flipping.
                    if (!isFront) {
                        rotation = 180;
                    }
                    if (flip) {
                        rotation = (rotation + 180) % 360;
                    }
                    if(signatureSize === 4){
                         if (i === 0 || i === 3) { // 1st and 4th page
                            rotation += 180;
                        }
                        if(i===1){
                           rotation += 90;
                        }
                        if(i===2){
                           rotation += 270;
                        }
                    }
                    if(signatureSize === 8){
                        if (i === 1 || i === 2 || i === 5 || i === 6) {
                            rotation = (rotation + 180) % 360;
                        }
                    }
                    if (signatureSize === 16) {
                        if (i === 1 || i === 2 || i === 5 || i === 6 || i === 9 || i === 10 || i=== 13 || i === 14) {
                            rotation = (rotation + 180) % 360;
                        }
                    }

                    // Add Logging
                    console.log(`Page ${isFront ? 'Front' : 'Back'} - Page Number in Signature: ${pageNumberInSignature}, xOffset: ${xOffset}, yOffset: ${yOffset}, rotation: ${rotation}, flip: ${flip}, scale: ${scale}`);

                    pageLayouts.push({ x: xOffset, y: yOffset, rotation, flip, scale });
                }
                return pageLayouts;
            };

            const frontPageLayouts = calculatePageLayout(signatureSize, creep, innerMargin, true, paperWidthPoints, paperHeightPoints);
            for (let i = 0; i < frontPageNumbers.length; i++) {
                const pageNumber = frontPageNumbers[i];
                if (pageNumber !== null) {
                    const sourcePageIndex = pageNumber - firstPageInSignature;
                    const [copiedPage] = await imposedPdfDoc.copyPages(pdfDoc, [pageNumber]);
                    const embeddedPage = await imposedPdfDoc.embedPage(copiedPage);
                    const { x, y, rotation, flip, scale } = frontPageLayouts[i];
                    const offsetX = (copiedPage.width * scale) / 2;
                    const offsetY = (copiedPage.height * scale) / 2;
                    // Add Logging
                    console.log(`Drawing Front Page: ${pageNumber}, source page: ${pageNumber}, x: ${x}, y: ${y}, rotation: ${rotation}, flip: ${flip}, scale: ${scale}`);
                    newPageFront.drawPage(embeddedPage, {
                        x: x,
                        y: y,
                        rotation: rotation * Math.PI / 180,
                        xScale: scale,
                        yScale: scale,
                    });
                }
            }

            const backPageLayouts = calculatePageLayout(signatureSize, creep, innerMargin, false, paperWidthPoints, paperHeightPoints);
            for (let i = 0; i < backPageNumbers.length; i++) {
                const pageNumber = backPageNumbers[i];
                if (pageNumber !== null) {
                    const sourcePageIndex = backPageNumbers.indexOf(pageNumber);
                    const [copiedPage] = await imposedPdfDoc.copyPages(pdfDoc, [pageNumber]);
                    const embeddedPage = await imposedPdfDoc.embedPage(copiedPage);
                    const { x, y, rotation, flip, scale } = backPageLayouts[i];
                    const offsetX = (copiedPage.width * scale) / 2;
                    const offsetY = (copiedPage.height * scale) / 2;
                    // Add Logging
                    console.log(`Drawing Back Page: ${pageNumber}, source page: ${pageNumber}, x: ${x}, y: ${y}, rotation: ${rotation}, flip: ${flip}, scale: ${scale}`);
                    newPageBack.drawPage(embeddedPage, {
                        x: x,
                        y: y,
                        rotation: rotation * Math.PI / 180,
                        xScale: scale,
                        yScale: scale,
                    });
                }
            }
        }

        const pdfBytes = await imposedPdfDoc.save();
        fs.writeFileSync(outputPdfPath, pdfBytes);
        console.log(`Imposed PDF saved to ${outputPdfPath}`);

    } catch (error) {
        console.error('Error:', error);
    }
}

const program = new Command();

program
    .version('1.0.0')
    .description('Impose PDF for printing in signatures with creep adjustment')
    .requiredOption('--input <inputPdfPath>', 'Path to the input PDF file')
    .requiredOption('--output <outputPdfPath>', 'Path to the output PDF file')
    .requiredOption(
        '--papersize <paperSize>',
        'Paper size in inches (e.g., 11x17, a4, letter, a3, or numeric value)',
        (value) => {
            const lowerCaseValue = value.toLowerCase();
            if (PAPER_SIZES[lowerCaseValue]) {
                return PAPER_SIZES[lowerCaseValue];
            }
            const parts = value.split('x').map(Number);
            if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
                return { width: parts[0], height: parts[1] };
            }
            const numericValue = Number(value); //try to parse as a single number
            if (!isNaN(numericValue)) {
                return { width: numericValue, height: numericValue }
            }

            throw new Error(
                'Invalid paper size format. Use <width>x<height> (e.g., 11x17), a predefined size (e.g., a4, letter, a3), or a single numeric value for square format.');
        }
    )
    .requiredOption('--signaturesize <signatureSize>', 'Number of pages per signature (e.g., 16). Must be a multiple of 4.', (value) => {
        const parsedValue = parseInt(value, 10);
        if (isNaN(parsedValue)) {
            throw new Error('Signature size must be a number.');
        }
        return parsedValue;
    })
    .requiredOption('--creep <creep>', 'Creep amount in points (e.g., 0.125)', (value) => {
        const parsedValue = parseFloat(value);
        if (isNaN(parsedValue)) {
            throw new Error('Creep amount must be a number.');
        }
        return parsedValue;
    })
    .action((options) => {
        const { input, output, papersize, signaturesize, creep } = options;
        imposePdf(input, output, papersize.width, papersize.height, signaturesize, creep);
    });

program.parse(process.argv);
