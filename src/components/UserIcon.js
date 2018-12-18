/*
 * A user profile icon with associated menu
 */
import React from 'react'
import PropTypes from 'prop-types'

import IconButton from '@material-ui/core/IconButton'
import MenuItem from '@material-ui/core/MenuItem'
import Menu from '@material-ui/core/Menu'

import ProfileIcon from '@material-ui/icons/AccountCircle'

class UserIcon extends React.Component {
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

  render() {
    const {onMyAccount, onLogOut} = this.props
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
        <MenuItem onClick={() => {this.handleMenuClose(); onMyAccount()}}>My account</MenuItem>
        <MenuItem onClick={() => {this.handleMenuClose(); onLogOut()}}>Log out</MenuItem>
      </Menu>
    )

    return (
      <div>
        <IconButton
          aria-owns={isMenuOpen ? 'material-appbar' : null}
          aria-haspopup="true"
          onClick={this.handleMenuOpen}
          color="inherit"
        >
          <ProfileIcon />
        </IconButton>
        {popupMenu}
      </div>
    )
  }
}

UserIcon.propTypes = {
  onMyAccount: PropTypes.func.isRequired,
  onLogOut: PropTypes.func.isRequired
}

export default UserIcon
