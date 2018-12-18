/*
 * If we have a session, display the children. Else show the login page.
 */
import React from 'react'
import PropTypes from 'prop-types'

import LoginPage from './LoginPage'
import {getSessionId} from '../sessionId'

const HasSession = (props) => (getSessionId() ? props.children : <LoginPage {...props}/>)

HasSession.propTypes = {
  children: PropTypes.element.isRequired
}

export default HasSession
