import React from 'react'
import {Route, Router} from 'react-router-dom'

import ApolloClient from 'apollo-client'
import {createHttpLink} from 'apollo-link-http'
import {setContext} from 'apollo-link-context'
import {ApolloProvider} from 'react-apollo'
import {InMemoryCache} from 'apollo-cache-inmemory'
import {persistCache} from 'apollo-cache-persist'

import Grid from '@material-ui/core/Grid'

import {history} from './history'
import App from './App'
import Callback from './Callback/Callback'
import Auth from './Auth/Auth'

const httpLink = createHttpLink({
  uri: process.env.REACT_APP_GIGBASE_ENDPOINT,
})

const authLink = setContext((_, {headers}) => {
  // Use REACT_APP_HASURA_KEY if it's available (development only)
  if(process.env.hasOwnProperty('REACT_APP_HASURA_KEY')) {
    return {
      headers: {
        ...headers,
        'X-Hasura-Access-Key': process.env.REACT_APP_HASURA_KEY
      }
    }
  } else {
    // get the authentication token from local storage if it exists
    const token = localStorage.getItem('auth0:id_token');

    // return the headers to the context so httpLink can read them
    return {
      headers: {
        ...headers,
        authorization: token ? `Bearer ${token}` : ""
      }
    }
  }
})

/*
 * Create the cache and persist it in localStorage
 */
const cache = new InMemoryCache({addTypename: false})

persistCache({
  cache,
  storage: window.localStorage
})

const client = new ApolloClient({
  cache,
  link: authLink.concat(httpLink)
})

/*
 * Create and handle authentication
 */
const auth = new Auth();

const handleAuthentication = ({location}) => {
  if (/access_token|id_token|error/.test(location.hash)) {
    auth.handleAuthentication();
  }
}

/* 
 * Wrap a page in the routes below
 */
const wrap = (page, props) => { 
  return (
    <ApolloProvider client={client}>
      <App auth={auth} page={page} {...props} />
    </ApolloProvider>
  )
}

/*
 * Function that generates the top level of the UI, rendered in index.js
 */
export const makeMainRoutes = () => {
  return ( 
    <Router history={history}>
      <Grid container justify="center">
        <Route exact path="/" render={(props) => wrap('songs', props)} />
        <Route path="/songs" render={(props) => wrap('songs', props)} />
        <Route path="/user" render={(props) => wrap('user', props)} />
        <Route path="/gigs" render={(props) => wrap('gigs', props)} />
        <Route path="/gig/:id" render={(props) => wrap('gig', props)} />
        <Route path="/song/:id" render={(props) => wrap('song', props)} />
        <Route path="/addperf/:perf/:gig/:song" render={(props) => wrap('addperf', props)} />

        <Route path="/callback" render={(props) => {
          handleAuthentication(props);
          return <Callback {...props}/>
        }}/>
      </Grid>
    </Router>
  );
}