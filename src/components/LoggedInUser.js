/*
 * The currently logged-in user, showing, in order of preference:
 *  stage name
 *  full name
 *  email
 *
 * Note: we need to include the id in the list of values returned or else
 * caching doesn't work and we get an error. See https://github.com/apollographql/react-apollo/issues/1003
 */
import React from 'react'
import PropTypes from 'prop-types'
import {Query} from 'react-apollo'

import {LOGGED_IN_USER_QUERY} from '../db'


export const LoggedInUser = (props,{sessionId}) => (
  <Query query={LOGGED_IN_USER_QUERY} variables={{session: sessionId}}>
    {({loading, error, data}) => {
      if(loading) return "Loading...";
      if(error) return "Please log in";

      const u = data.session_by_pk.userByuser;
      return u.stageName || u.fullName || u.email
    }}
  </Query>
)

LoggedInUser.contextTypes = {
  sessionId: PropTypes.string
}
