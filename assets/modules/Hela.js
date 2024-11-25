// helper to replace all text
const replaceAll = (array, text) => {
  // for each item in array
  for (let i = 0; i < array.length; i++) {
    // replace current item text
    text = text.replaceAll(array[i][0], array[i][1])
  }
  // return replaced text
  return text
}

// convert data objects
const data = {}

/** Hela converter module */
export const Hela = {
  /**
   * Initiates module resources
   * @param {string} base 
   */
  async init(base) {
    data.ASCII_UNI = await this.fetch(base + "ASCII_UNI.json")
    data.UNI_ASCII = await this.fetch(base + "UNI_ASCII.json")
    data.SIN_UNI = await this.fetch(base + "SIN_UNI.json")
  },
  /**
   * Converts text input
   * @param {'ASCII_UNI' | 'UNI_ASCII' | 'SIN_UNI' | 'SIN_ASCII'} type 
   * @param {string} text 
   */
  convert(type, text) {
    // check convert type
    if(type === "SIN_ASCII") {
      // return reconverted text by type
      return replaceAll(data.UNI_ASCII, replaceAll(data.SIN_UNI, text))
    } else {
      // return converted text by type
      return replaceAll(data[type], text)
    }
  },
  /**
   * Fetches data into parsed format
   * @param {*} path 
   */
  async fetch(path) {
    return fetch(path).then(resp => resp.json())
  }
}
