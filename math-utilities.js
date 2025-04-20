/**
 * Function to get a random number between min and max.
 * @remarks
 * This can return a negative number if min is higher than max.
 * @param {number} min
 * @param {number} max
 * @returns {number}
 * @example
 * import { world } from "@minecraft/server"
 * 
 * world.sendMessage(`${getRandomNumber(1, 10)}`);
 */
export function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min; 
}
