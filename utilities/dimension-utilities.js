import { Dimension, ItemStack, system, world } from "@minecraft/server";

export class DimensionUtils {

    /**
      * Spawn an item in a location.
      * 
      * @param {Dimension} dimension - Dimension to spawn the item in
      * @param {string} typeId - typeId of the item to spawn
      * @param {Vector3} location - Location where to spawn the item
      * @param {number} amount - Amount of items to spawn
      * @param {string} nameTag - Nametag of the item
      * @returns {void}
      * 
      * @throws If the dimension is not valid.
      * @throws If the typeId is not a string.
      * @throws If the amount is not a positive integer.
      * @throws If the location is not valid.
      * 
      * @example
      * import { world } from "@minecraft/server"
      * 
      * const dimension = world.getDimension("overworld");
      * const location = {x: 0, y: 0, z: 0}
      * 
      * DimensionUtils.spawnItem(dimension, "minecraft:diamond", location, 64);
      * 
      */
    static spawnItem(dimension, typeId, location, amount = 1, nameTag = null) {
        // Error Handling
        if (!dimension || typeof dimension.spawnItem !== "function") {
            console.error("Error: Invalid Dimension object. Ensure it has a spawnItem method.");
            return;
        }
        if (!typeId || typeof typeId !== "string") {
            console.error("Error: Invalid typeId. It should be a non-empty string.");
            return;
        }
        if (!Number.isInteger(amount) || amount <= 0) {
            console.error("Error: Invalid amount. It should be a positive integer.");
            return;
        }
        if (!location || typeof location !== "object") {
            console.error("Error: Invalid location. It should be an object.");
            return;
        }
        // Create the item
        const item = new ItemStack(typeId, amount);
        // Apply nameTag if provided
        if (nameTag)
            item.nameTag = nameTag;
        // Spawn the item
        try {
            dimension.spawnItem(item, location);
        }
        catch (error) {
            console.error("Error: Failed to spawn item.", error);
        }
    }

    /**
      * Gets a block from any dimension & location in world asynchronously (Even if the chunk is unloaded)
      * @param {Vector3} location 
      * @param {Dimension} dim
      * @returns {Promise<Block>}
      * @example
      * getBlock(loc, world.getDimension('overworld')).then(block => {})
      * 
      */
    static async getBlock(location, dim = world.getDimension("overworld")) {
        let block, { x, y, z } = location;
        const getBlock = dim.getBlock.bind(dim, location);
        try { if (!(block = getBlock())) throw null; else return block }
        catch {
            dim.runCommand(`tickingarea add circle ${~~x} ${~~y} ${~~z} 0 "${x},${y},${z}"`);
            let remove = () => dim.runCommand(`tickingarea remove "${x},${y},${z}"`);
            return new Promise(async resolve => {
                system.runJob(function* () {

                    let trials = 1e3;
                    do {
                        block = getBlock();
                        if (!--trials) yield void remove();
                    } while (!block);
                    remove();
                    return resolve(block);
                }())
            })
        }
    };
}
