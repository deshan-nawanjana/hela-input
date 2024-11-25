import { Hela } from "./assets/modules/Hela.js"

// initiate hela convert module
await Hela.init("assets/objects/converters/")

// load suggestions array
const suggestions = await Hela.fetch("assets/objects/suggestions.json")

new Vue({
  el: "#app",
  data: {
    // text input mode
    mode: "single",
    // convert direction
    direction: "SIN_UNI",
    // interface theme
    theme: "dark",
    // input and output text
    text: { input: "", output: "" },
    // word suggestions
    suggest: { text: "", start: 0, end: 0, index: 0, list: [] }
  },
  methods: {
    keyUp(event) {
      // check convert mode
      if (this.mode === "double") {
        // convert into output
        this.text.output = Hela.convert(this.direction, this.text.input)
      } else {
        // get target element
        const element = event.target
        // get caret position
        const position = element.selectionStart
        // check input character
        if (event.key === "Escape") {
          // clear suggestions
          this.clearSuggestions()
        } else if (event.key === " " || event.key === "Enter") {
          // clear suggestions
          this.clearSuggestions()
          // get last word end position
          const end = position - 1
          // get previous substring
          const wordPre = this.text.input.substring(0, end)
          // get last word
          const word = wordPre.split(" ").pop()
          // return if no word
          if (!word) { return }
          // get last word start position
          const start = end - word.length
          // get converted text
          const text = Hela.convert(this.direction, word)
          // replace input text
          this.replaceText(text, start, end, 1)
        } else {
          // get previous substring
          const wordPre = this.text.input.substring(0, position)
          // get next string
          const wordNxt = this.text.input.substring(position)
          // get before word part
          const wordBef = wordPre.split(" ").pop()
          // get after word part
          const wordAft = wordNxt.split(" ")[0]
          // get current word
          const word = wordBef + wordAft
          // check current word
          if (!word) {
            // clear suggestions
            this.clearSuggestions()
          } else {
            // get converted text by direction
            const text = this.direction === "UNI_ASCII"
              ? word
              : this.direction === "SIN_ASCII"
                ? Hela.convert("SIN_UNI", word)
                : Hela.convert(this.direction, word)
            // get first character
            const char = text[0]
            // get suggestion array
            const array = suggestions[char]
            // check array
            if (!array) {
              // clear suggestions
              this.clearSuggestions()
            } else if (this.suggest.text !== text) {
              // create items array
              const items = [text]
              // for each suggestion
              for (let i = 0; i < array.length; i++) {
                // current suggestion
                const item = array[i]
                // check word index
                if (item.indexOf(text) === 0 && item !== text) {
                  // push to items
                  items.push(item)
                  // break if maximum suggestions
                  if (items.length === 8) { break }
                }
              }
              // update suggestion data
              this.suggest.text = text
              this.suggest.list = items
              this.suggest.index = 0
              this.suggest.start = position - wordBef.length
              this.suggest.end = position + wordAft.length
            }
          }
        }
      }
    },
    keyDown(event) {
      // get suggest data
      const data = this.suggest
      // check event key
      if (event.key === "Tab" || event.key === "Enter") {
        // prevent tab key event
        if (event.key === "Tab") { event.preventDefault() }
        // return if double mode
        if (this.mode === "double") { return }
        // return if no suggestions
        if (data.list.length === 0) { return }
        // prevent tab key event
        event.preventDefault()
        // apply suggestion
        this.applySuggestion()
      } else if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        // return if double mode
        if (this.mode === "double") { return }
        // return if no suggestions
        if (data.list.length === 0) { return }
        // prevent arrow key event
        event.preventDefault()
        // check key direction
        if (event.key === "ArrowLeft" && data.index > 0) {
          // decrease suggest index
          data.index -= 1
        } else if (event.key === "ArrowRight" && data.index < data.list.length - 1) {
          // increase suggest index
          data.index += 1
        }
      }
    },
    replaceText(text, start, end, caret) {
      // get input element
      const element = this.$refs.input
      // get text before word
      const head = this.text.input.substring(0, start)
      // get text after word
      const tail = this.text.input.substring(end)
      // update text values
      this.text.input = `${head}${text}${tail}`
      // get final caret position
      const final = head.length + text.length + caret
      // delay to update values
      setTimeout(() => {
        // focus on element
        element.focus()
        // set caret position
        element.setSelectionRange(final, final)
      }, 5)
    },
    clearSuggestions() {
      // reset suggestion data
      this.suggest = { text: "", start: 0, end: 0, index: 0, list: [] }
    },
    applySuggestion(index) {
      // get suggest word
      const word = this.suggest.list[index ?? this.suggest.index]
      // get text to replace
      const text = this.direction === "ASCII_UNI"
        ? word : Hela.convert(this.direction, word)
      // replace text
      this.replaceText(text + " ", this.suggest.start, this.suggest.end, 0)
      // clear suggestions
      this.clearSuggestions()
    }
  }
})
