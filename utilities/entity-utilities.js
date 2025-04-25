/**
 * Gets the platform/device the player is using.
 * @author Vyse
 * @param {Player} player
 * @returns {string}
 * @example
 * import { world } from "@minecraft/server"
 * 
 * const player = world.getPlayers()[0];
 * getDevice(player);
 */
export function getDevice(player) {
    const { platformType, memoryTier, maxRenderDistance } = player.clientSystemInfo;
    if (maxRenderDistance < 6 || maxRenderDistance > 96 || platformType === null) return "Bot";
    if (platformType === "Desktop") return "Windows";
    if (platformType === "Mobile") {
      return maxRenderDistance > 16 ? "Android" : "iOS";
    }
    if (platformType === "Console") {
      if (memoryTier === 3 && maxRenderDistance === 12) return "Nintendo Switch";
      if (memoryTier === 4 && maxRenderDistance === 36) return "Xbox Series S";
      if (memoryTier === 5 && maxRenderDistance === 36) return "Xbox Series X";
      if (memoryTier === 4) {
        if (player.name.match(/[_-]/g) && maxRenderDistance === 16) return "PS4";
        if (maxRenderDistance === 16) return "Xbox One";
        if (maxRenderDistance === 18) return "PS4 Pro";
        if (maxRenderDistance === 28) return "PS5";
      }
    }
    return "Unknown Device";
}

/**
 * Move an entity to a location using applyKnockback or applyImpulse

 * @author Coddy
 * @param {Entity} entity The entity to move towards a location
 * @param {Vector3} targetPos The location to move the entity to
 * @param {number} speed The speed of moving the entity
 * @returns {{x: number, z: number, strength: number, y: number} | {x: number, y: number, z: number}} Returns `{x, y, z}` if entity is not a player, otherwise returns `{ x, z, strength, y }`
 * @example
 * import { world } from "@minecraft/server"
 * 
 * const player = world.getPlayers()[0];
 * const values = moveToLocation(player, { x: 10, y: 200, z: 5 }, 0.5);
 * player.applyKnockback(values.x, values.z, values.strength, values.y);
 * @example
 * import { world } from "@minecraft/server"
 * 
 * const entity = world.getDimension("overworld").getEntities({ excludeTypes: ["minecraft:player"]})[0];
 * const values = moveToLocation(entity, { x: 10, y: 200, z: 5 }, 0.5);
 * entity.applyKnockback(values.x, values.z, values.strength, values.y);
*/
export function moveToLocation(entity, targetPos, speed) {
    const pos = entity.location;
    const dx = targetPos.x - pos.x, dy = targetPos.y - pos.y, dz = targetPos.z - pos.z;
    const mag = Math.sqrt(dx * dx + dy * dy + dz * dz);
    if (!mag) return null;
    const x = (dx / mag) * speed, y = (dy / mag) * speed, z = (dz / mag) * speed;
    if (entity.typeId === 'minecraft:player') {
      const hMag = Math.sqrt(x * x + z * z);
      return { x: x / hMag, z: z / hMag, strength: hMag, y };
    }
    return { x, y, z };
}

/**
 * Function to return boolean whether the player is underground or not
 * checks if player is in underground
 * @author Serty
 * @param {Player} player The player to test if they are underground
 * @returns {boolean}
 * @example
 * import { world } from "@minecraft/server"
 * 
 * const player = world.getPlayers()[0];
 * isUnderground(player);
 */
export function isUnderground(player) {
    if (player.dimension.heightRange.min > player.location.y) return true;
    if (player.dimension.heightRange.max < player.location.y) return false;
  
    let block = player.dimension.getTopmostBlock(player.location)
    if (player.location.y >= block.y) return false
    while (!block.isSolid && block.y > player.dimension.heightRange.min) {
      if (player.location.y >= block.y) return false
      block = block.below()
    }
    return true
}

/**
 * @author Eon
 * @param {Player} player The player to test if they are on surface
 * @returns {boolean} 
 * @example
 * import { world } from "@minecraft/server"
 * 
 * const player = world.getPlayers()[0];
 * isPlayerOnSurface(player);
 */
export function isPlayerOnSurface(player) {
    const location = player.location;
    const blockBelow = player.dimension.getBlock(new Vec3(player.location.x, player.location.y, player.location.z).subtract({ x: 0, y: 1, z: 0 }));
    const blockAbove = player.dimension.getBlock(new Vec3(location.x, location.y, location.z).add({ x: 0, y: 1, z: 0 }));

    const isSolidGround = blockBelow && blockBelow.typeId !== "minecraft:air";
    const hasOpenSky = !blockAbove || blockAbove.typeId === "minecraft:air";

    if (isSolidGround && hasOpenSky) {
        for (let y = Math.ceil(location.y) + 1; y < 320; y++) {
            const block = player.dimension.getBlock(new Vec3(location.x, y, location.z));
            if (block && block.typeId !== "minecraft:air") {
                return false;
            }
        }
        return true;
    }
    return false;
}

/**
 * Get the Cardinal direction of the player
 * @author GST378
 * @author finnafinest_
 * @param {Player} player The player to get the Cardinal direction of
 * @returns {"up"|"down"|"north"|"east"|"south"|"west"}
 */
export function getCardinalDirection(player) {
    const yaw = player.getRotation().y;
    const pitch = player.getRotation().x;
    if (pitch > 85) return 'down';
    if (pitch < -85) return 'up';
    if (yaw >= -45 && yaw < 45) return 'north';
    else if (yaw >= 45 && yaw < 135) return 'east';
    else if (yaw >= 135 || yaw < -135) return 'south';
    else return 'west';
};


//======================================
// ITEMS SECTION
//======================================

/**
 * Spawn an item in a location.
 * @param {Dimension} Dimension Dimension to spawn the item in
 * @param {string} typeId typeId of the item to spawn
 * @param {Vector3} location Location where to spawn the item
 * @param {number} amount Amount of items to spawn
 * @param {string} nameTag Nametag of the item
 * @returns {void}
 * @example
 * import { world } from "@minecraft/server"
 * 
 * const dimension = world.getDimension("overworld");
 * const location = {x: 0, y: 0, z: 0}
 * 
 * spawnItem(dimension, "minecraft:diamond", location, 64);
 * @throws If the Dimension is not valid.
 * @throws If the typeId is not a string.
 * @throws If the amount is not a positive integer.
 * @throws If the location is not valid.
 */
export function spawnItem(Dimension, typeId, location, amount = 1, nameTag = null) {
    // Error Handling
    if (!Dimension || typeof Dimension.spawnItem !== "function") {
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
        Dimension.spawnItem(item, location);
    }
    catch (error) {
        console.error("Error: Failed to spawn item.", error);
    }
}


//======================================
// EVENTS SECTION
//======================================


/**
 * Detects when a player shoots a projectile that hits another entity.
 * @param {function({player: Player, target: Entity, projectile: string})} callBack A callback function to call when a player shoots a projectile and hits another entity.
 * @param {Entity} [whom] An entity to watch for hits. If specified, the callback will only be called if the projectile hits this entity.
 * @example
 * import { world } from "@minecraft/server"
 * detectPlayerShootsEvent((event) => {
 *  console.log(`Player ${event.player.name} shot at ${event.target.name}`);
 * });
 */
export function detectPlayerShootsEvent(callBack, whom = null) {
    world.afterEvents.entitySpawn.subscribe(({ entity }) => {
        if (entity.typeId !== 'minecraft:arrow' && entity.typeId !== 'minecraft:trident')
            return;
        const callback = world.afterEvents.projectileHitEntity.subscribe((arg) => {
            const { source, projectile } = arg;
            const hitInfo = arg.getEntityHit();
            if (hitInfo?.entity && source instanceof Player && projectile === entity) {
                const shooter = source; // Who shot the projectile
                const target = hitInfo.entity; // Whom the projectile hit
                const projectileType = projectile.typeId; // What was shot
                // If 'whom' is specified, check if it matches the hit entity
                if (whom && target !== whom)
                    return;
                // Call the developer's callback with detailed event data
                callBack({ player: shooter, target: target, projectile: projectileType });
                // Play a sound (default behavior)
                shooter.playSound("random.orb", { volume: 0.4, pitch: 1.0 });
                // Unsubscribe after detecting the hit
                world.afterEvents.projectileHitEntity.unsubscribe(callback);
            }
        });
    });
}
/**
 * 
 * @param {function({player: Player})} callBack 
 * @example
 * import { world } from "@minecraft/server"
 * 
 * const player = world.getPlayers()[0];
 * detectDoubleJumpEvent((player) => {
 *  console.log(`Player ${player.name} did a double jump!`);
 * });
 */
export function detectDoubleJumpEvent(callBack) {
    system.runInterval(() => {
        world.getAllPlayers().forEach(player => {
            // Initialize jump tracking if not set
            if (!player.hasOwnProperty("jumpCount"))
                player.jumpCount = 0;
            if (!player.hasOwnProperty("lastJumping"))
                player.lastJumping = false;
            // Reset jump count when touching the ground
            if (player.isOnGround)
                player.jumpCount = 0;
            // Detect double jump: player jumps while airborne & wasn't jumping before
            if (player.isJumping && !player.lastJumping && !player.isOnGround) {
                player.jumpCount++;
                if (player.jumpCount === 2) {
                    callBack(player); // Execute developer's custom function
                }
            }
            // Store last jumping state
            player.lastJumping = player.isJumping;
        });
    });
}


//======================================
// IsDoing SECTION
//======================================

/**
 * Checks if a player is riding a specific entity type.
 * @param {Player} player Player to check if riding an entity
 * @param {string} entityType Type ID of the entity to check, example: "minecraft:horse"
 * @returns {boolean}
 * @example
 * import { world } from "@minecraft/server"
 * 
 * const player = world.getPlayers()[0];
 * const isRidingPlayer = isRidingEntity(player, "minecraft:horse");
 * @throws If player is not a Player.
 * @throws if Player doesn't have a `riding` component
 */
export function isRidingEntity(player, entityType) {
    // Validate the player object
    if (!player || typeof player.getComponent !== 'function') {
        throw new Error('Invalid player object provided. Player must have a `getComponent` method.');
    }
    // Safely get the 'riding' component
    const riding = player.getComponent('riding');
    // Validate the riding component and entityRidingOn
    if (!riding) {
        throw new Error('Player does not have a `riding` component.');
    }
    if (!riding.entityRidingOn) {
        throw new Error('Player is not riding any entity.');
    }
    // Compare the typeId of the entity being ridden with the provided entityType
    return riding.entityRidingOn.typeId === entityType;
}


/**
 * Checks if the player has a specified quantity of a certain item in their inventory.
 *
 * @param {Player} player - The player whose inventory is being checked.
 * @param {string} typeId - The typeId of the item to check for.
 * @param {number} required - The required quantity of the item.
 * @returns {boolean} - Returns true if the player has at least the required quantity of the item, false otherwise.
 * @example
 * import { world } from "@minecraft/server";
 * 
 * const player = world.getPlayers()[0];
 * const hasDiamonds = isHavingItemQuantity(player, "minecraft:diamond", 5);
 */
export function isHavingItemQuantity(player, typeId, required) {
    const inventoryComponent = player.getComponent("inventory");
    const container = inventoryComponent.container;
    if (container === undefined) {
        return false;
    }
    let total = 0;
    for (let slotId = 0; slotId < container.size; slotId++) {
        const itemStack = container.getItem(slotId);
        if (itemStack === undefined || itemStack.typeId !== typeId) {
            continue;
        }
        total += itemStack.amount;
    }
    return total >= required;
}

/**
 * Checks if player is creative
 * @param {Player} player The player to check
 * @returns {boolean}
 * @example 
 * import { world } from "@minecraft/server"
 * 
 * const player = world.getPlayers()[0];
 * if (isCreative(player)) {
 *  world.sendMessage(`${player.name} is in creative!`)
 * };
 */
export const isCreative = (player) => player.getGameMode() == GameMode.creative


//======================================
// TRANSFER PROPERTIES SECTION
//======================================

/**
 * Transfer enchantments from an item to another
 * @param {ItemStack} sourceItem Item to grab enchantments from
 * @param {ItemStack} destinationItem Item to transfer enchantments to
 * @returns {ItemStack}
 * @example
 * import { world } from "@minecraft/server"
 * 
 * const player = world.getPlayers()[0];
 * const sourceItem = player.getComponent("inventory").container.getItem(0);
 * const destinationItem = player.getComponent("inventory").container.getItem(1);
 * const transferedEnchants = transferEnchantments(sourceItem, destinationItem);
 * player.getComponent("inventory").container.setItem(1, transferedEnchants);
 * @throws If sourceItem is not enchantable
 * @throws If destinationItem is not enchantable
 */
export function transferEnchantments(sourceItem, destinationItem) {
    const sourceEnchantable = sourceItem.getComponent("enchantable");
    if (!sourceEnchantable)
        throw new Error("Source item is not enchantable");
    const destinationEnchantable = destinationItem.getComponent("enchantable");
    if (!destinationEnchantable)
        throw new Error("Destination item is not enchantable");
    for (const enchantment of sourceEnchantable.getEnchantments()) {
        if (!destinationEnchantable.canAddEnchantment(enchantment))
            continue;
        destinationEnchantable.addEnchantment(enchantment);
    }
    return destinationItem;
}
