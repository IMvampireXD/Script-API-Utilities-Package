import { world, BlockPermutation, ItemStack, EquipmentSlot, system } from "@minecraft/server";

export class ItemStackUtils {

    /**
      * Transfer enchantments from an item to another
      * 
      * @param {ItemStack} sourceItem Item to grab enchantments from
      * @param {ItemStack} destinationItem Item to transfer enchantments to
      * @returns {ItemStack}
      * 
      * @example
      * import { world } from "@minecraft/server"
      * 
      * const player = world.getPlayers()[0];
      * const sourceItem = player.getComponent("inventory").container.getItem(0);
      * const destinationItem = player.getComponent("inventory").container.getItem(1);
      * const transferedEnchants = transferEnchantments(sourceItem, destinationItem);
      * player.getComponent("inventory").container.setItem(1, transferedEnchants);
      * 
      * @throws If sourceItem is not enchantable
      * @throws If destinationItem is not enchantable
      */
    static transferEnchantments(sourceItem, destinationItem) {
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

    /**
     * @author GegaMC
     * @remarks Check if ItemStack is a block. For example, a minecraft:stone is a block, but minecraft:iron_shovel isn't.
     * @param {ItemStack} itemStack
     * @returns {Boolean}
     * @example
     * import { world } from "@minecraft/server";
     * 
     * world.afterEvents.itemUse.subcscribe((event)=>{
     *     const { source, itemStack } = event;
     *     if (isBlock(itemStack)) {
     *         source.sendMessage("Im a placeable block!")
     *     }
     * })
     */
    static isBlock(itemStack) {
        try {
            BlockPermutation.resolve(itemStack.typeId)
            return true;
        } catch {}
        return false
    }

    /**
     * @author GegaMC
     * @remarks Retrieve the EquipmentSlot that this ItemStack can be worn into. For example, an iron chestplate will return "Chest", a totem of undying return "Offhand", whilst a diamond sword which can't be worn or offhanded will defaults to "Mainhand"
     * @param {ItemStack} itemStack
     * @returns {EquipmentSlot}
     * @example
     * import { world } from "@minecraft/server";
     * 
     * world.afterEvents.itemUse.subcscribe((event)=>{
     *     const { source, itemStack } = event;
     *     const equipmentSlot = getWearableSlot(itemStack);
     *     
     *     source.sendMessage(`This item is worn on the ${equipmentSlot} Slot`)
     * })
     */
    static getWearableSlot(itemStack) {
        //sacrifice random player >:D
        const rPlayer = world.getPlayers()[0];
        const equippable = rPlayer.getComponent("equippable");
        const slots = ["Head", "Chest", "Legs", "Feet","Offhand","Mainhand"];
        const prevItemStack = slots.map(s=>equippable.getEquipment(s));
        let slot;
        for (const s of slots)
        if (equippable.setEquipment(s,itemStack)) {
            slot = s;
            break;
        }
        prevItemStack.forEach((e,i)=>{
            equippable.setEquipment(slots[i],e)
        })
        system.waitTicks(2).then(()=>{
            [
                "armor.equip_chain",
                "armor.equip_diamond",
                "armor.equip_generic",
                "armor.equip_gold",
                "armor.equip_iron",
                "armor.equip_leather",
                "armor.equip_netherite"
            ].forEach(sound=>rPlayer.runCommand(`stopsound @s ${sound}`))
        })
        return slot
    }

    /**
      * @author GegaMC
      * @description Get the item contents of an Item. For example, items inside a shulkerbox and bundles
      * @param {ItemStack} itemStack
      * @returns {ItemStack[]}
      * @example
      * import { world } from '@minecraft/server';
      * 
      * //Get shulker contents
      * world.afterEvents.itemUse.subscribe((evd)=>{
      * 	const player = evd.source;
      *     if (evd.itemStack.typeId.endsWith("shulker_box")) {
      * 		const itemStackContents = ItemStackUtils.getStoredItems(evd.itemStack)
      * 		for (const itemStack of itemStackContents) {
      * 			evd.source.sendMessage(`Shulkerbox has: ${itemStack.amount}x ${itemStack.typeId}`)
      * 		}
      *     }
      * })
      */
    static getStoredItems(itemStack) {
        const {dimension,location} = world.getPlayers()[0];
        const height = dimension.heightRange;
        const spawnLocation = {
            ...location,
            y: height.min
        }

        //Exclude existing item entity & Safeguard againts any hopper-like entities
        const excludeEntity = dimension.getEntitiesAtBlockLocation(spawnLocation)
        excludeEntity.forEach(e=>{
            e.initialPos = e.location;
            e.teleport({
                ...e.location,
                y: e.location.y + 5
            })
        })
        dimension.spawnItem(itemStack,spawnLocation).applyDamage(5,{cause:"lava"})
        excludeEntity.forEach(e=>{
            e.teleport(e.initialPos)
        })
        return dimension.getEntitiesAtBlockLocation(spawnLocation).filter(e=>{
            if (e.initialPos) {
                delete e.initialPos
                return;
            } else return true;
        })
        .map((e,slot)=>{
            const itemStack = e.getComponent("item").itemStack;
            e.remove()
            return itemStack
        })
    }
}
