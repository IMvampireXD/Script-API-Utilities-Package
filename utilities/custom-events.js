import { world, system, Player } from "@minecraft/server"

export class CustomEvents {
    
    /**
      * Detects when player picks up any item.
      * @param {function({player: player, pickedItem: item})} callBack
      * @author Carchi77
      * GitHub: https://github.com/Carchi777/detect-who-picked-up-an-item
      * 
      * @example
      * import { world } from "@minecraft/server"
      * detectPlayerPickupItem((event) => {
      *  console.log(`Player ${player.nameTag} picked up ${item.amount} amount of ${item.typeId.slice(10)}`);
      * });
      * 
      */
    static detectPlayerPickupItem(callBack) {
        world.beforeEvents.entityRemove.subscribe(e => {
            const { removedEntity: entity } = e;
            const item = entity.getComponent("item")?.itemStack
            if (!item) return
            const players = entity.dimension.getEntities(
                { maxDistance: 1.5, location: entity.location, type: "player" }
            )
            players.forEach(player => {
                const inv = player.getComponent('inventory').container
                const items = Array
                    .from({ length: inv.size }, (_, i) => inv.getItem(i))
                    .filter(k => k != null);
                system.run(() => {
                    const valid = Array
                        .from({ length: inv.size }, (_, i) => inv.getItem(i))
                        .filter(k => k != null)
                        .some((k, i) => k.typeId === item.typeId && k.amount != items[i]?.amount);
                    if (valid) {
                        callBack({ player: player, pickedItem: item })
                    }
                })
            })
        })
    }

    /**
      * Detects when player drops any item.
      * @param {function({player: player, droppedItem: item})} callBack
      * @author Minato (Minecraft Bedrock Arabic)
      * 
      * @example
      * import { world } from "@minecraft/server"
      * detectPlayerDropItem((event) => {
      *  world.sendMessage(`§a${item.typeId}§r was dropped by §2${player.nameTag}§r!`)
      * });
      * 
      */
    static detectPlayerDropItem(callBack) {
        world.afterEvents.entitySpawn.subscribe((event) => {
            const {entity} = event
            if (entity.typeId !== "minecraft:item") return;
            const closestPlayers = entity.dimension.getEntities({
                type: "minecraft:player",
                location: entity.location,
                maxDistance: 2,
            });
            if (closestPlayers.length == 0) return;
            const player = closestPlayers.find(p=> 
                p.getRotation().x === entity.getRotation().x &&
                p.getRotation().y === entity.getRotation().y
            );
            if (!player) return;
            const item = entity.getComponent("item").itemStack

            callBack({ player: player, droppedItem: item });
        })
    }
    
}
