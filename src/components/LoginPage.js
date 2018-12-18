/*
 * The login page, with lots of features for password recovery, etc.
 *
 * Reference: https://www.npmjs.com/package/react-signup-login-component
 */
import React from 'react'
import {withApollo} from 'react-apollo'

import ReactSignupLoginComponent from 'react-signup-login-component'
import { withStyles } from '@material-ui/core/styles';

import {getSessionId, setSessionId} from '../sessionId'

import {
  VALIDATE_USER_QUERY,
  LOGGED_IN_USER_QUERY,
  OPEN_SESSION_UPSERT
} from '../db'

class LoginPageComponent extends React.Component {
  /*
   * Attempt to sign up with a new username/password
   */
  _signupWasClickedCallback = (data) => {
    console.log(data);
    alert('Signup callback, see log on the console to see the data.');
  }

  /*
   * Attempt to log in. First see if we have a user with that name and
   * password. If so, attempt to upsert a session for that user.
   */
  _loginWasClickedCallback = async (data) => {
    const client = this.props.client

    const result = await client.query({
      query: VALIDATE_USER_QUERY,
      variables: {user: data.username, pass: data.password}
    })

    if(!result.data.user.length)
      return alert("Invalid username/password")

    const user = result.data.user[0].id

    const result2 = await client.mutate({
      mutation: OPEN_SESSION_UPSERT,
      variables: {user},
      refetchQueries: [
        {query: LOGGED_IN_USER_QUERY, variables: {session: getSessionId()}}
      ]
    })

    setSessionId(result2.data.insert_session.returning[0].id)
    window.location.reload()
  }

  /*
   * Initiate password recovery
   */
  _recoverPasswordWasClickedCallback = (data) => {
    console.log(data);
  }

  render () {
    return (
      <div style={{display: 'flex', justifyContent: 'center'}}>
        <ReactSignupLoginComponent
          title="GigBase"
          submitLoginCustomLabel="Login"
          handleSignup={this._signupWasClickedCallback}
          handleLogin={this._loginWasClickedCallback}
          handleRecoverPassword={this._recoverPasswordWasClickedCallback}
        />
      </div>
    )
  }
}

const styles = theme => ({
  mainWrapper: { backgroundColor: theme.palette.background.paper },
  /*
  mainTitle: { color: 'red' },
  flipper: { transition: '0.1s' },
  signup: {
    wrapper: { backgroundColor: 'yellow' },
    inputWrapper: { backgroundColor: 'AliceBlue' },
    buttonsWrapper: { backgroundColor: 'Aqua' },
    input: { backgroundColor: 'LavenderBlush' },
    recoverPassword: {},
    button: { backgroundColor: 'LightCoral' },
  },
  login: {
    wrapper: { backgroundColor: 'yellow' },
    inputWrapper: { backgroundColor: 'AliceBlue' },
    buttonsWrapper: { backgroundColor: 'Aqua' },
    input: { backgroundColor: 'LavenderBlush' },
    recoverPasswordWrapper: { backgroundColor: 'MediumBlue' },
    recoverPasswordButton: { backgroundColor: 'OldLace ' },
    button: { backgroundColor: 'LightCoral' },
  },
  recoverPassword: {
    wrapper: { backgroundColor: 'yellow' },
    inputWrapper: { backgroundColor: 'AliceBlue' },
    buttonsWrapper: { backgroundColor: 'Aqua' },
    input: { backgroundColor: 'LavenderBlush' },
    button: { backgroundColor: 'LightCoral' },
  },
  */
})

const LoginPage = withStyles(styles)(LoginPageComponent)
//const LoginPage = withStyles(styles)(withRouter(LoginPageComponent))

export default withApollo(LoginPage)
