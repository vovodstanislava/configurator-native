/*
* This is application entry point
* */

import App from '@/core/app'
import './style/style.scss'
import './style/helpers.scss'
import 'materialize-css/sass/materialize.scss'
import 'material-icons/iconfont/material-icons.scss'
import 'materialize-css/dist/js/materialize.min.js'

const app = new App()

const elems = document.querySelectorAll('.dropdown-trigger')

M.AutoInit()
M.Dropdown.init(elems, {})

app.publicMethod()
