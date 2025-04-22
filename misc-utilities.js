export class MiscUtils {

  /**
    * @author frostice482
    * 
    * Renames function name
    * @param fn Function
    * @param name New function name
    * @returns function
    */
  static renameFn(fn, name) {
	  return Object.defineProperty(fn, "name", { value: name })
  }
  
}
