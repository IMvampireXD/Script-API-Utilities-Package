export class DimensionUtils {

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
