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

        const imposedPdfDoc = await PDFDocument.create();

        for (let signatureIndex = 0; signatureIndex < numSignatures; signatureIndex++) {
            const firstPageInSignature = signatureIndex * signatureSize;
            const lastPageInSignature = Math.min((signatureIndex + 1) * signatureSize - 1, numPages - 1);

            const newPageFront = imposedPdfDoc.addPage([paperWidthPoints, paperHeightPoints]);
            const newPageBack = imposedPdfDoc.addPage([paperWidthPoints, paperHeightPoints]);

            let frontPageNumbers = [];
            let backPageNumbers = [];

            // Generalized approach for all signature sizes
            for (let i = 0; i < signatureSize / 2; i++) {
                frontPageNumbers.push(signatureSize - i - 1);
                frontPageNumbers.push(i);
            }
            for (let i = 0; i < signatureSize / 2; i++) {
                backPageNumbers.push(signatureSize / 2 - i - 1);
                backPageNumbers.push(signatureSize / 2 + i);
            }

            // Function to calculate page offsets, rotation and flip
            const calculatePageLayout = (signatureSize, creep, innerMargin, isFront, paperWidth, paperHeight) => {
                const pageLayouts = [];
                const halfSignature = signatureSize / 2;
                const pageHalfWidth = paperWidth / 2;
                const pageHalfHeight = paperHeight / 2;
                let scale = 1;

                scale = 2 / signatureSize;

                for (let i = 0; i < signatureSize / 2; i++) {
                    const pageNumberInSignature = i;
                    const creepAdjustment = (halfSignature / 2 - 0.5 - Math.abs(pageNumberInSignature - (signatureSize / 2 - 1) / 2)) * creep;
                    let xOffset, yOffset, rotation, flip;

                    if (i < signatureSize / 4) {
                        xOffset = creepAdjustment;
                        yOffset = 0;
                        rotation = 0;
                        flip = false;
                    } else {
                        xOffset = pageHalfWidth - creepAdjustment;
                        yOffset = pageHalfHeight;
                        rotation = 180;
                        flip = false;
                    }

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
                    const sourcePageIndex = backPageNumber - firstPageInSignature;
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
