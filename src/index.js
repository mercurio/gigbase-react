import ReactDOM from 'react-dom'
import {makeMainRoutes} from './routes'

import registerServiceWorker from './registerServiceWorker'
import './index.css'

require('dotenv').config()

const routes = makeMainRoutes()

ReactDOM.render(
  routes,
  document.getElementById('root')
)

registerServiceWorker();
