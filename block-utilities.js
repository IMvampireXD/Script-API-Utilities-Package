/**
 * Breaks blocks from start block
 * @param {Block} startBlock The block to start breaking from
 * @param {number} volumeWidth The width of the volume
 * @param {number} volumeHeight The height of the volume
 * @param {number} volumeDepth The depth of the volume
 * @param {string} replacementBlockType The block to replace the broken blocks with
 * @example
 * import { world, system } from "@minecraft/server"
 * 
 * const block = world.getDimension("overworld").getBlock({x: 0, y: 0, z: 0});
 * breakBlocksFromStartBlock(block, 5, 5, 5, "stone"); // Fills a 5x5x5 cube with stone
 */
function breakBlocksFromStartBlock(startBlock, volumeWidth = 3, volumeHeight = 3, volumeDepth = 3, replacementBlockType = 'air') {
    const { brokenBlockPermutation, block, dimension } = startBlock;
    const typeId = brokenBlockPermutation.type.id;
    const item = new ItemStack(typeId, 1);
    // Calculate the bounds of the volume to reduce overhead
    const halfWidth = Math.floor(volumeWidth / 2);
    const halfHeight = Math.floor(volumeHeight / 2);
    const halfDepth = Math.floor(volumeDepth / 2);
    const minX = block.location.x - halfWidth;
    const minY = block.location.y - halfHeight;
    const minZ = block.location.z - halfDepth;
    const maxX = block.location.x + halfWidth;
    const maxY = block.location.y + halfHeight;
    const maxZ = block.location.z + halfDepth;
    // Iterate directly within the volume bounds
    for (let x = minX; x <= maxX; x++) {
        for (let y = minY; y <= maxY; y++) {
            for (let z = minZ; z <= maxZ; z++) {
                const location = { x, y, z };
                const currentBlock = dimension.getBlock(location);
                dimension.setBlockType(location, replacementBlockType); // Replace with the specified block type
                dimension.spawnItem(item, location);
            }
        }
    }
}
