/*
 * Display a button that opens a menu of band names
 *
 * Reference: https://material-ui.com/demos/menus/
 */
import React from 'react'
import PropTypes from 'prop-types'
import {withStyles} from '@material-ui/core/styles'

import Button from '@material-ui/core/Button'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'

class BandMenu extends React.Component {
  state = {
    anchorEl: null,
    selectedBand: this.props.band || 'Select a band'
  }

  handleClick = event => {
    this.setState({anchorEl: event.currentTarget})
  }

  select = band => event => {
    this.setState({selectedBand: band})
    this.handleClose()

    if(this.props.onSelectBand) this.props.onSelectBand(band)
  }

  handleClose = () => {
    this.setState({anchorEl: null})
  }

  render() {
    const {anchorEl, selectedBand} = this.state;
    const {classes} = this.props;

    return (
      <div>
        <Button
          aria-owns={anchorEl ? 'band-menu' : undefined}
          aria-haspopup="true"
          onClick={this.handleClick}
          className={classes.btn}
        >
          {selectedBand}
        </Button>
        <Menu
          id="band-menu"
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={this.handleClose}
        >
          {this.props.bands.map((b, i) => <MenuItem key={i} onClick={this.select(b)}>{b}</MenuItem>)}
        </Menu>
      </div>
    )
  }
}

BandMenu.propTypes = {
  classes: PropTypes.object.isRequired,
  band: PropTypes.string,
  bands: PropTypes.array.isRequired,
  onSelectBand: PropTypes.func
}

const styles = {
  btn: {
    textTransform: 'none'
  }
};

export default withStyles(styles)(BandMenu)
