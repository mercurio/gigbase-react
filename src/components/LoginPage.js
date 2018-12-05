/*
 * The login page, with lots of features for password recovery, etc.
 *
 * Reference: https://www.npmjs.com/package/react-signup-login-component
 */
import React from 'react'
import ReactSignupLoginComponent from 'react-signup-login-component'
import { withStyles } from '@material-ui/core/styles';


const LoginPage = (props) => {
  const signupWasClickedCallback = (data) => {
    console.log(data);
    alert('Signup callback, see log on the console to see the data.');
  }

  const loginWasClickedCallback = (data) => {
    props.history.push('/songs');
    console.log(data);
  }

  const recoverPasswordWasClickedCallback = (data) => {
    console.log(data);
  }

  return (
    <div style={{display: 'flex', justifyContent: 'center'}}>
      <ReactSignupLoginComponent
        title="GigBase"
        submitLoginCustomLabel="Login"
        handleSignup={signupWasClickedCallback}
        handleLogin={loginWasClickedCallback}
        handleRecoverPassword={recoverPasswordWasClickedCallback}
      />
    </div>
  )
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
export default withStyles(styles)(LoginPage)
