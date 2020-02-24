import {createBrowserHistory} from 'history'

const history = createBrowserHistory()

const routeGo = (route) => history.replace(route)
const routePush = (route) => history.push(route)
const routePop = () => history.goBack()

/*
const routeGo = (route) => {console.log('go'); console.log(`$process.env.PUBLIC_URL/$route`); history.replace(`$process.env.PUBLIC_URL/$route`)}
const routePush = (route) => {console.log('push'); console.log(`$process.env.PUBLIC_URL/$route`); history.push(`$process.env.PUBLIC_URL/$route`)}
*/
export {history, routeGo, routePush, routePop}
