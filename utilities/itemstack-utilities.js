import { world, BlockPermutation, ItemStack, EquipmentSlot, system } from "@minecraft/server";

export class ItemStackUtils {

    /**
      * @author GegaMC
      * @description Determine if ItemStack is a type of block
      * @param {ItemStack} itemStack
      * @returns {Boolean}
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
     * @description Get an EquipmentSlot that this ItemStack can be put into.
     * @param {ItemStack} itemStack
     * @returns {EquipmentSlot}
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

}
