import React, {Component, Fragment} from 'react'
import Async from 'react-async'
import {withApollo} from 'react-apollo'

import './App.css'
import 'typeface-roboto'

import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import CssBaseline from '@material-ui/core/CssBaseline'

import SongTable from './components/SongTable'
import UserProfile from './components/UserProfile'
import GigTable from './components/GigTable'
import Gig from './components/Gig'
import Song from './components/Song'
import AddPerformance from './components/AddPerformance'

import history from './history'
import {hasSessionId, setSessionId} from './sessionId'

import {
  GET_USERID_QUERY,
  OPEN_SESSION_UPSERT
} from './db'


import TopBar from './components/TopBar'

class App extends Component {
  pages = {
    songs: SongTable,
    user: UserProfile,
    gigs: GigTable,
    gig: Gig,
    song: Song,
    addperf: AddPerformance
  }

  goTo = (route) => history.replace(`/$route`)
  login = () => this.props.auth.login()
  logout = () => this.props.auth.logout()

  /*
   * Initialize the session if it's not already there,
   * first finding the logged in user's email and then
   * upserting a session for that user.
   * 
   * We should already be authenticated, so we should
   * at least have the email in local storage. In
   * development, we should already have a session
   * (create the user and session rows by hand).
   */
  initSession = async () => {
    if(hasSessionId()) return true

    const result = await this.props.client.query({
      query: GET_USERID_QUERY,
      variables: {email: localStorage.getItem('auth0:email')}
    })

    const userid = result.data.user[0].id

    const result2 = await this.props.client.mutate({
      mutation: OPEN_SESSION_UPSERT,
      variables: {user: userid},
      refetchQueries: []
    })

    setSessionId(result2.data.insert_session.returning[0].id)
  }

  render(props) {
    const {isAuthenticated} = this.props.auth

    const Page = this.pages[this.props.page || 'songs']

    if(isAuthenticated() || hasSessionId()) return (
      <Async promiseFn={this.initSession}>
        <Async.Loading>Loading...</Async.Loading>
        <Async.Resolved>
          {data => (
            <Fragment>
              <CssBaseline />
              <TopBar {...props} onLogOut={this.logout}/>
              <Grid container justify="center">
                  <Page {...props} />
              </Grid>
            </Fragment>
          )}
        </Async.Resolved>
        <Async.Rejected>{error => error.message}</Async.Rejected>
      </Async>
    )

    // Not logged in, show login button instead
    return (
      <Fragment>
        <CssBaseline />
        <Button 
          id="qsLoginBtn"
          variant="contained"
          color="primary"
          className="btn-margin"
          onClick={this.login}
        >
        Log In
        </Button>
      </Fragment>
    )
  }
}

export default withApollo(App)
