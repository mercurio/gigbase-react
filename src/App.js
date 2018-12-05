import React, {Component, Fragment} from 'react'
import PropTypes from 'prop-types'
import {Switch, Route} from 'react-router-dom'
import './App.css'
import 'typeface-roboto'

import CssBaseline from '@material-ui/core/CssBaseline'
import { ApolloClient } from 'apollo-client'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { HttpLink } from 'apollo-link-http'
import { ApolloProvider } from 'react-apollo'
import {persistCache} from 'apollo-cache-persist'
import createHistory from "history/createHashHistory"
import Grid from '@material-ui/core/Grid'

import {InitSession} from './components/InitSession'
import TopBar from './components/TopBar'
import SongTable from './components/SongTable'
import LoginPage from './components/LoginPage'
import {UserProfile} from './components/UserProfile'
import {GigTable} from './components/GigTable'
import Gig from './components/Gig'
import Song from './components/Song'
import AddPerformance from './components/AddPerformance'


const history = createHistory()
const cache = new InMemoryCache()

persistCache({
  cache,
  storage: window.localStorage
})

const client = new ApolloClient({
  cache,
  link: new HttpLink({
    uri: process.env.REACT_APP_GIGBASE_ENDPOINT,
    headers: {
      "Content-Type": "application/json",
      "X-Hasura-Access-Key": process.env.REACT_APP_GIGBASE_KEY
    }
  })
})

class App extends Component {
  constructor(props) {
    super(props)

    this.sessionId = process.env.REACT_APP_GIGBASE_SESSION_ID   // temporarily always connect to the same session
  }

  getChildContext() {
    return {
      sessionId: this.sessionId
    }
  }

  render(props) {
    let xprops = {...props, history, client}

    return (
      <ApolloProvider client={client}>
        <InitSession onLogin={id => this.sessionId = id}>
          <Fragment>
            <CssBaseline />
            <TopBar {...xprops} />
            <Grid container justify="center">
              <Switch>
                <Route exact path='/' component={() => (<LoginPage {...xprops} />)}/>
                <Route exact path='/songs' component={() => (<SongTable {...xprops} />)}/>
                <Route exact path='/user' component={() => (<UserProfile {...xprops} />)}/>
                <Route exact path='/gigs' component={() => (<GigTable {...xprops} />)}/>
                <Route exact path='/gig/:id' component={() => (<Gig {...xprops} />)}/>
                <Route exact path='/song/:id' component={() => (<Song {...xprops} />)}/>
                <Route exact path='/addperf/:perf/:gig/:song' component={() => (<AddPerformance {...xprops} />)}/>
              </Switch>
            </Grid>
          </Fragment>
        </InitSession>
      </ApolloProvider>
    )
  }
}

App.childContextTypes = {
  sessionId: PropTypes.string
}

export default App
