import Sharp from "sharp";
import fg from "fast-glob";

const images = await fg('src/content/products/*/*.{jpg,jpeg,png}');

images.map(image=>{
    new Sharp(image)
        .resize(250, 250)
        .tint({ r: 255, g: 0, b: 0 })
        .toFile(image.replace(/\..*$/,'-thumb.'), function(err) {
    }); 
})

  