import './style/style.scss'
import './style/helpers.scss'
import 'materialize-css/sass/materialize.scss'
import 'material-icons/iconfont/material-icons.scss'
import 'materialize-css/dist/js/materialize.min.js'

const elems = document.querySelectorAll('.dropdown-trigger')

M.AutoInit()
M.Dropdown.init(elems, {})

class App {
  constructor () {
    this.components = {}
    this.goods = []
  }

  async loadDataFromJson () {
    try {
      this.components = await import('./server/components.json')
    } catch (err) {
      console.log(err)
    }
  }

  printGoods () {
    const goodsContainer = document.getElementById('goods_container')

    goodsContainer.innerHTML = ''

    this.goods.forEach((product) => {
      goodsContainer.innerHTML += `
       <li class="collection-item avatar">
         <img src="../src/${product.image}" alt="" class="circle">
         <span class="black-text">${product.name}</span>
       </li>
      `
    })
  }

  printCards (cardName) {
    const cardsContainer = document.getElementById('cards_container')

    cardsContainer.innerHTML = ''

    this.components[cardName].forEach((cardComponent, index) => {
      cardsContainer.innerHTML += `
        <div class="col s4">
          <div class="card">
            <div class="card-image">
              <img src="../src/${cardComponent.image}">
            </div>
            <span class="card-title black-text pl20"><b>${cardComponent.name}</b></span>
              <div class="card-content black-text">
                  <p>${cardComponent.description}</p>
              </div>
              <div class="row">
                <div class="black-text pl20 pb10 col s10">${cardComponent.price} $</div>
                <div class="buy_button">
                  <i class="material-icons deep-purple-text col s2" id="${cardName}_${index}">shopping_cart</i>
                </div>
              </div>
            </div>
          </div>
      `
    })
  }

  addListenersToList () {
    const productMenu = document.getElementById('product_menu')

    productMenu.addEventListener('click', (e) => {
      this.printCards(e.target.id)
      this.addListenersToBuyButtons()
    })
  }

  addListenersToBuyButtons () {
    const allBuyButtons = document.getElementsByClassName('buy_button')

    for (const button of allBuyButtons) {
      button.addEventListener('click', (e) => {
        this.addToCart(e.target.id)
      })
    }
  }

  addToCart (product) {
    const [componentName, componentOrder] = product.split('_')

    this.goods.push(this.components[componentName][componentOrder])
    this.printGoods()
  }

  async main () {
    await this.loadDataFromJson()
    this.printCards('motherboards')
    this.addListenersToList()
    this.addListenersToBuyButtons()
  }
}

const app = new App()

app.main()
