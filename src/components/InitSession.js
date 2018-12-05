/*
 * Initialize the session, then display children.
 * Calls onLogin prop with session id.
 */
import React from 'react'
import PropTypes from 'prop-types'
import {Query} from 'react-apollo'

import {GET_SESSION_QUERY} from '../db'


export const InitSession = ({children, onLogin}) => (
  <Query query={GET_SESSION_QUERY} variables={{email: 'neon@leadbone.com'}}>
    {({loading, error, data}) => {
      if(loading) return null
      if(error) return null

      if(data.user.length && data.user[0].sessionsByuser.length) {
        onLogin(data.user[0].sessionsByuser[0].id);
      }

      return children
    }}
  </Query>
)

InitSession.propTypes = {
  children: PropTypes.element.isRequired,
  onLogin: PropTypes.func.isRequired
}
