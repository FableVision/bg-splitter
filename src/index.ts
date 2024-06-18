import jimp from 'jimp';
import {argv} from 'process';
import {writeFile} from 'fs/promises';

main();

async function main()
{
    const src = argv[2];

    const srcImage = await jimp.read(src);
    const width = srcImage.getWidth();
    const height = srcImage.getHeight();
    const minTiles = Math.ceil(width / height);
    // console.log('width', width, 'min tiles', minTiles);
    const totalOverlap = Math.ceil(minTiles * height - width);
    const overlapPerTile = totalOverlap > 0 ? Math.ceil(totalOverlap / (minTiles - 1)) : 0;
    // console.log('totalOverlap', totalOverlap, 'overlapPerTile', overlapPerTile);
    let nextTile = 0;
    let remainingOverlap = totalOverlap;

    let log = `Reading ${src}`;

    for (let i = 0; i < minTiles; ++i)
    {
        const tile = srcImage.clone();
        // console.log('cropping at', nextTile);
        tile.crop(nextTile, 0, height, height);
        log += `\nTile #${i+1} placed at ${nextTile}`;
        nextTile += height - Math.min(remainingOverlap, overlapPerTile);
        remainingOverlap -= overlapPerTile;

        await tile.writeAsync(src.replace('.png', `_tile${i+1}.png`));
    }

    await writeFile(src.replace('png', 'txt'), log);
}