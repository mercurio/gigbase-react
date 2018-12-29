/*
 * The top app bar.
 *
 * Reference: https://material-ui.com/demos/app-bar/
 */
import React from 'react'
import PropTypes from 'prop-types'
import {withApollo} from 'react-apollo'

import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import IconButton from '@material-ui/core/IconButton'
import Typography from '@material-ui/core/Typography'
import {fade} from '@material-ui/core/styles/colorManipulator'
import {withStyles} from '@material-ui/core/styles'
import MenuIcon from '@material-ui/icons/Menu'

import {routePush} from '../history';
import {LoggedInUser} from './LoggedInUser'
import SongIcon from './SongIcon'
import GigIcon from './GigIcon'
import UserIcon from './UserIcon'

import {getSessionId, setSessionId} from '../sessionId'

import {
  GET_OPENED_GIG_QUERY,
  SET_SESSION_GIG_MUTATION,
  GET_OPENED_GIG_AND_PERFORMANCES_QUERY,
  GET_GIGS_QUERY
} from '../db'


class TopBar extends React.Component {
  /*
   * Go to gig list to select or create a gig
   */
  handleNewGig = event => {
    routePush('/gigs')
  }

  /*
   * Go to the user profile form
   */
  handleMyAccount = () => {
    routePush('/user')
  }

  /*
   * Log out, deleting the session
   */
  handleLogOut = () => {
    this.props.onLogOut()

    setSessionId('')
    window.location.reload()
  }

  /*
   * Go to the edit page for the current gig
   */
  handleEditGig = async () => {
    const result = await this.props.client.query({
      query: GET_OPENED_GIG_QUERY,
      variables: {
        session: getSessionId()
      }
    })

    const id = result.data.session_by_pk.gig;
    if(id)
      routePush(`/gig/${id}`)
    else
      routePush('/gigs')
  }

  /*
   * Close the currently open gig
   */
  handleCloseGig = async () => {
    await this.props.client.mutate({
      mutation: SET_SESSION_GIG_MUTATION,
      variables: {
        session: getSessionId(),
        gig: null
      },
      refetchQueries: [
        {query: GET_OPENED_GIG_AND_PERFORMANCES_QUERY, variables: {session: getSessionId()}},
        {query: GET_OPENED_GIG_QUERY, variables: {session: getSessionId()}},
        {query: GET_GIGS_QUERY}
      ]
    })
  }

  /*
   * Go to the song edit page to add a new song
   */
  handleNewSong = () => {
    routePush('/song/new')
  }

  /*
   * Handle the open drawer button, which, for now,
   * goes to the song list.
   */
  handleOpenDrawer = () => {
    routePush('/songs')
  }

  /*
   * Render the TopBar
   */
  render() {
    const {classes} = this.props;

    return (
      <div className={classes.root}>
        <AppBar position="static">
          <Toolbar>
            <IconButton className={classes.menuButton} color="inherit" aria-label="Open drawer" onClick={this.handleOpenDrawer}>
              <MenuIcon />
            </IconButton>
            <Typography className={classes.title} variant="title" color="inherit" noWrap>
              <LoggedInUser />
            </Typography>
            <div className={classes.grow} />
            <GigIcon onNewGig={this.handleNewGig} onCloseGig={this.handleCloseGig} onEditGig={this.handleEditGig} />
            <SongIcon onNewSong={this.handleNewSong} />
            <UserIcon onMyAccount={this.handleMyAccount} onLogOut={this.handleLogOut} />
          </Toolbar>
        </AppBar>
      </div>
    );
  }
}

TopBar.propTypes = {
  classes: PropTypes.object.isRequired,
  onLogOut: PropTypes.func.isRequired
}

/* Search input
              <div className={classes.search}>
                <div className={classes.searchIcon}>
                  <SearchIcon />
                </div>
                <Input
                  placeholder="Search…"
                  disableUnderline
                  classes={{
                    root: classes.inputRoot,
                    input: classes.inputInput,
                  }}
                />
              </div>
*/

/* Different toolbars for desktop and mobile
              <div className={classes.grow} />
              <div className={classes.sectionDesktop}>
                <GigIcon onNewGig={this.handleNewGig} onOpenGig={this.handleOpenGig}/>
                <IconButton
                  aria-owns={isMenuOpen ? 'material-appbar' : null}
                  aria-haspopup="true"
                  onClick={this.handleProfileMenuOpen}
                  color="inherit"
                >
                  <AccountCircle />
                </IconButton>
              </div>
              <div className={classes.sectionMobile}>
                <IconButton aria-haspopup="true" onClick={this.handleMobileMenuOpen} color="inherit">
                  <MoreIcon />
                </IconButton>
              </div>
*/

const styles = theme => ({
  root: {
    width: '100%',
  },
  grow: {
    flexGrow: 1,
  },
  menuButton: {
    marginLeft: -12,
    marginRight: 20,
  },
  title: {
    display: 'none',
    [theme.breakpoints.up('sm')]: {
      display: 'block',
    },
  },
  search: {
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: fade(theme.palette.common.white, 0.15),
    '&:hover': {
      backgroundColor: fade(theme.palette.common.white, 0.25),
    },
    marginRight: theme.spacing.unit * 2,
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      marginLeft: theme.spacing.unit * 3,
      width: 'auto',
    },
  },
  searchIcon: {
    width: theme.spacing.unit * 9,
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputRoot: {
    color: 'inherit',
    width: '100%',
  },
  inputInput: {
    paddingTop: theme.spacing.unit,
    paddingRight: theme.spacing.unit,
    paddingBottom: theme.spacing.unit,
    paddingLeft: theme.spacing.unit * 10,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: 200,
    },
  },
  sectionDesktop: {
    display: 'none',
    [theme.breakpoints.up('md')]: {
      display: 'flex',
    },
  },
  sectionMobile: {
    display: 'flex',
    [theme.breakpoints.up('md')]: {
      display: 'none',
    },
  },
});

export default withApollo(withStyles(styles)(TopBar))
