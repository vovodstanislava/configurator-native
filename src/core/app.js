class App {
  constructor () {
    this.app = document.getElementById('app')
  }

  #privateMethod() {
    console.log('work')
  }

  publicMethod () {
    this.#privateMethod()
  }
}

export default App
