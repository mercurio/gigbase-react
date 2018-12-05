/*
 * A icon showing either the no-gig mode or the gig-open mode.
 * The gig-open mode includes the date of the open gig.
 */
import React from 'react'
import PropTypes from 'prop-types'
import {Query} from 'react-apollo'

import Badge from '@material-ui/core/Badge'
import IconButton from '@material-ui/core/IconButton'
import MenuItem from '@material-ui/core/MenuItem'
import Menu from '@material-ui/core/Menu'

import LoadingIcon from '@material-ui/icons/HourglassEmpty'
import ErrorIcon from '@material-ui/icons/ThumbDown'
import NoGigIcon from '@material-ui/icons/QueueMusic'
import GigOpenIcon from '@material-ui/icons/PlaylistAdd'

import {GET_OPENED_GIG_AND_PERFORMANCES_QUERY} from '../db'

class GigIcon extends React.Component {
  constructor(props, context) {
    super(props)

    this.state = {
      menuAnchor: null
    }
  }

  /*
   * Handle closing the menu
   */
  handleMenuClose = () => {
    this.setState({menuAnchor: null});
  }

  /*
   * Open the menu
   */
  handleMenuOpen = event => {
    this.setState({menuAnchor: event.currentTarget})
  }

  /*
   * Return a function to close the menu and call one of the on functions
   */
  handleOn = fname => event => {
    this.handleMenuClose()
    this.props[fname]()
  }

  render() {
    const {onNewGig} = this.props
    const {sessionId} = this.context
    const {menuAnchor} = this.state
    const isMenuOpen = Boolean(menuAnchor)

    const popupMenu = (
      <Menu
        anchorEl={menuAnchor}
        anchorOrigin={{vertical: 'top', horizontal: 'right'}}
        transformOrigin={{vertical: 'top', horizontal: 'right'}}
        open={isMenuOpen}
        onClose={this.handleMenuClose}
      >
        <MenuItem onClick={this.handleOn('onEditGig')}>Edit gig</MenuItem>
        <MenuItem onClick={this.handleOn('onNewGig')}>New gig</MenuItem>
        <MenuItem onClick={this.handleOn('onCloseGig')}>Close gig</MenuItem>
      </Menu>
    )

    return (
      <Query query={GET_OPENED_GIG_AND_PERFORMANCES_QUERY} variables={{session: sessionId}}>
        {({loading, error, data}) => {
          if(loading) return <LoadingIcon />

          if(error) return (
            <IconButton color="inherit">
              <Badge badgeContent="err" color="secondary">
                <ErrorIcon />
              </Badge>
            </IconButton>
          )

          /* no gig open */
          if(!data.session_by_pk.gigBygig) return (
            <IconButton color="inherit" onClick={onNewGig}>
              <NoGigIcon />
            </IconButton>
          )

          const count = data.session_by_pk.gigBygig.performancesBygig_aggregate.aggregate.count

          return (
            <div>
            <IconButton
              aria-owns={isMenuOpen ? 'material-appbar' : null}
              aria-haspopup="true"
              onClick={this.handleMenuOpen}
              color="inherit"
            >
              <Badge  badgeContent={count} color="secondary">
                <GigOpenIcon />
              </Badge>
            </IconButton>
            {popupMenu}
            </div>
          )
        }
      }
      </Query>
    )
  }
}

GigIcon.propTypes = {
  onNewGig: PropTypes.func.isRequired,
  onEditGig: PropTypes.func.isRequired,
  onCloseGig: PropTypes.func.isRequired
}

GigIcon.contextTypes = {
  sessionId: PropTypes.string
}

export default GigIcon
