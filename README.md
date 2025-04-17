# Script-API-Utilities
Useful functions for helping with creating scripts in Minecraft Bedrock Script API  

# List of functions:
block-utilities.js:
- breakBlocksFromStartBlock (Breaks block from a starting block with provided width, height and depth)
- placeBlockAboveWater (Function to place a block directly above water, replicating behaviour of lily pads.)

entity-utilities.js:
- getCardinalDirection (Gets the cardinal direction of an Entity - "up"|"down"|"north"|"east"|"south"|"west")
- isUnderground (Function to return boolean whether the player is underground or not.)
- isPlayerOnSurface (Function to return boolean whether the player is on surface or not.)
- moveToLocation (Moves the entity to specified location using applyKnockback or applyImpulse)
- getDevice (Gets the platform/device the player is using.)
- detectPlayerShootsEvent (Detects when a player shoots a projectile that hits another entity.)
- detectDoubleJumpEvent (Detects when a player does a double jump.)
- isRidingEntity (Checks if a player is riding a specific entity type.)
- isCreative (Checks if player is in creative.)
- isSurvival (Checks if the player is in survival.)
- isPlayer (Checks if the entity is player or not.)
- detectItemDrop (Fires an event if the player has dropped an item.)
- detectPickingUpItem (Fires an event if the player has picked up an item.)

math-utilities.js:
- getRandomNumber (Returns a random number between min and max)

ItemStack-utilities.js:
- saveInventory (Saves everything of Inventory into a dynamic property.)
- loadInventory (Load the saved inventory.)
- addEnchantment (Adds enchantment to an item.)
- transferEnchantments (Transfer enchantments from an item to another.)
- spawnItem (Spawn an item in a location.)
- isHavingItemQuantity (Returns true if the player has the specified amount of item in the inventory. Otherwise false.)

# Usage
Download the utlities files as your need.
and import the functions you need, in your script, like this:
```js
import { getRandomNumber, detectDoubleJump } from "./utilities.js"
```
