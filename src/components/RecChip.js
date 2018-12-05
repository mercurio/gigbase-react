/*
 * Display a chip indicating whether or not something has been recorded.
 * When clicked, it triggers onToggle
 */
import React from 'react'
import PropTypes from 'prop-types'
import {withStyles} from '@material-ui/core/styles'

import Chip from '@material-ui/core/Chip'

import RecIcon from '@material-ui/icons/Mic'
import NoRecIcon from '@material-ui/icons/MicOff'

const RecChip = ({classes, recorded, onToggle}) => (
  <Chip
    label={recorded ? 'recorded' : 'not recorded'}
    className={classes.chip}
    icon={recorded ? <RecIcon /> : <NoRecIcon />}
    onClick={onToggle}
  />
)

RecChip.defaultProps = {
  recorded: false,
  onToggle: () => {}
}

RecChip.propTypes = {
  classes: PropTypes.object.isRequired,
  recorded: PropTypes.bool.isRequired,
  onToggle: PropTypes.func
}

const styles = {
};

export default withStyles(styles)(RecChip)
