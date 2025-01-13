import Sharp from "sharp";
import fg from "fast-glob";

const images = await fg('src/content/products/a*/*0.{jpg,jpeg,png}');

// images.map(image=>{
//     new Sharp(image)
//         //.resize(250, 250)
//         .resize(500,500)
//         .clahe({width:100,height:100})
//         //.grayscale()
//         //.toColorspace('rgb')
//         .tint({ r: 255, g: 200, b: 200 })
//         .toFile(image.replace(/\.(\w{3,4})$/,'-test.$1'), function(err) {
//             if(err) console.log(err);
//     }); 
// })

images.map(image=>{
    processImage(image,image.replace(/\.(\w{3,4})$/,'-test.$1'));
});


async function processImage(inputPath, outputPath) {
    try {
        const image = Sharp(inputPath);
        const metadata = await image.metadata();

        const { data, info } = await image
            .sharpen()
            .normalise({ lower: 1, upper: 100 })
            .grayscale()
            .raw() // Get raw pixel data
            .toBuffer({ resolveWithObject: true });

        const newData = Buffer.alloc(info.width * info.height * 3); // RGB output

        for (let i = 0; i < data.length; i++) {
            const grayValue = data[i];

            // Corrected mapping: Darkest gray (0) becomes red, lightest (255) stays white
            newData[i * 3] = 255; // Red (always maximum)
            newData[i * 3 + 1] = Math.round((255 * grayValue) / 255); // Green (increasing with grayValue)
            newData[i * 3 + 2] = Math.round((255 * grayValue) / 255); // Blue (increasing with grayValue)
        }

        await Sharp(newData, { raw: { width: info.width, height: info.height, channels: 3 } })
            //.clahe({width: 100, height: 100})
            //.linear(1, -0.5)
            .toFile(outputPath);
        console.log(`Image processed successfully: ${outputPath}`);

    } catch (error) {
        console.error(`Error processing image: ${error}`);
    }
}