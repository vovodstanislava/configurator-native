import './style/style.scss'
import './style/helpers.scss'
import 'materialize-css/sass/materialize.scss'
import 'material-icons/iconfont/material-icons.scss'
import 'materialize-css/dist/js/materialize.min.js'

const elems = document.querySelectorAll('.dropdown-trigger')

M.AutoInit()
M.Dropdown.init(elems, {})

const modal = document.querySelectorAll('.modal')
M.Modal.init(modal, {})

class App {
  constructor () {
    this.components = {}
    this.filteredComponents = {}
    this.goods = []
  }

  async loadDataFromJson () {
    try {
      const components = await import('./server/components.json')
      this.filteredComponents = Object.assign({}, components)
      this.components = Object.assign({}, components)
    } catch (err) {
      console.log(err)
    }
  }

  filtered () {
    const items = Object.assign({}, this.components)
    const processorIndex = this.goods.findIndex(item => item.type === 'processors')
    const motherboardIndex = this.goods.findIndex(item => item.type === 'motherboards')
    const ramIndex = this.goods.findIndex(item => item.type === 'ram')

    if (processorIndex !== -1) {
      const processor = this.goods[processorIndex].item
      items.motherboards = items.motherboards.filter(item => item.socket === processor.socket)
    }
    if (motherboardIndex !== -1) {
      const motherboard = this.goods[motherboardIndex].item
      items.processors = items.processors.filter(item => item.socket === motherboard.socket)
      items.ram = items.ram.filter(item => item.goods === motherboard.memoryType)
    }
    if (ramIndex !== -1) {
      const ram = this.goods[ramIndex].item
      items.motherboards = items.motherboards.filter(item => item.memoryType === ram.memoryType)
    }

    return items
  }

  printGoods () {
    const goodsContainer = document.getElementById('goods_container')
    const totalPrice = this.goods.reduce((sum, item) => (item.quantity * item.item.price) + sum, 0)

    goodsContainer.innerHTML = ''

    this.goods.forEach((product, index) => {
      goodsContainer.innerHTML += `
       <li class="collection-item avatar">
         <img src="../src/${product.item.image}" alt="" class="circle">
         <span class="black-text cart-row">
            ${product.item.name} ${product.quantity} x ${product.item.price}$
             <span class="delete_good" id="${'item_' + index}">🗙</span>
         </span>
       </li>
      `
    })
    goodsContainer.innerHTML += `
       <li class="collection-item black-tex cart-body">
         <span>${totalPrice}$</span>
         <span class="black-text cart-row ml50">
            <a class="waves-effect waves-light btn modal-trigger" href="#modal1">Checkout</a>
         </span>
       </li>
    `
  }

  printCards (cardName) {
    const cardsContainer = document.getElementById('cards_container')

    cardsContainer.innerHTML = ''

    this.filteredComponents[cardName].forEach((cardComponent, index) => {
      cardsContainer.innerHTML += `
        <div class="col s4">
          <div class="card custom-card">
            <div class="card-image">
              <img src="../src/${cardComponent.image}">
            </div>
            <span class="card-title black-text pl20"><b>${cardComponent.name}</b></span>
              <div class="card-content black-text">
                  <p>${cardComponent.description}</p>
              </div>
              <div class="row card-row">
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

  addListenersToSubmit () {
    const submit = document.getElementById('submit')
    submit.addEventListener('click', (e) => {
      e.preventDefault()

      const form = document.getElementById('form')
      if (form.reportValidity()) {
        const values = document.getElementsByClassName('validate')
        const fields = {}

        for (const field of values) {
          fields[field.id] = field.value
        }

        const offers = JSON.parse(localStorage.getItem('offers')) || []

        offers.push({
          credentials: fields,
          items: this.goods,
          total: this.goods.reduce((sum, item) => (item.quantity * item.item.price) + sum, 0)
        })

        localStorage.setItem('offers', JSON.stringify(offers))
        document.location.reload()
      }
    })
  }

  addListenersToNavButton () {
    const order = document.getElementById('orders_button')
    const product = document.getElementById('products_button')
    const products_container = document.getElementById('products')
    const orders_container = document.getElementById('orders')

    order.addEventListener('click', () => {
      products_container.setAttribute('style', 'display: none')
      orders_container.setAttribute('style', 'display: block')
    })
    product.addEventListener('click', () => {
      products_container.setAttribute('style', 'display: block')
      orders_container.setAttribute('style', 'display: none')
    })
  }

  loadOrders () {
    const table_body = document.getElementById('table-body')
    const orders = JSON.parse(localStorage.getItem('offers')) || []

    for (const order of orders) {
      table_body.innerHTML += `
        <tr>
          <td>${order.credentials.first_name}</td>
          <td>${order.credentials.last_name}</td>
          <td>${order.credentials.email}</td>
          <td>${
            order.items.map(item => `<div>${item.item.name}</div><hr>`).join('')
          }</td>
          <td>${order.total} $</td>
        </tr>
      `
    }
  }

  addToCart (product) {
    const [componentName, componentOrder] = product.split('_')

    const index = this.goods.findIndex((item) => item.type === componentName)

    if (index !== -1) {
      if (this.goods[index].item.id === this.components[componentName][componentOrder].id) {
        this.goods[index].quantity += 1
      } else {
        this.goods[index].quantity = 1
        this.goods[index].item = this.components[componentName][componentOrder]
      }
    } else {
      this.goods.push({
        type: componentName,
        item: this.components[componentName][componentOrder],
        quantity: 1
      })
    }
    this.printGoods()
    this.filteredComponents = Object.assign({}, this.filtered())
  }

  async main () {
    await this.loadDataFromJson()
    this.printCards('motherboards')
    this.loadOrders()
    this.addListenersToList()
    this.addListenersToBuyButtons()
    this.addListenersToSubmit()
    this.addListenersToNavButton()
  }
}

const app = new App()

app.main()
