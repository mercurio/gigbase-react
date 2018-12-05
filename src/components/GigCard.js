/*
 * Display the info from a gig on a card.
 * The onOpenGig function, if provided, will be called with the id of the gig when
 * the open button is pressed.
 */
import React from 'react'
import PropTypes from 'prop-types'

import {withStyles} from '@material-ui/core/styles'
import Card from '@material-ui/core/Card'
import CardActions from '@material-ui/core/CardActions'
import CardContent from '@material-ui/core/CardContent'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'

import RecIcon from '@material-ui/icons/Mic'
import NoRecIcon from '@material-ui/icons/MicOff'

const GigCard = ({classes, date, venue, recorded, band, tracks, onOpenGig, id}) => {
  const tLabel = tracks === 1 ? 'track' : 'tracks'
  const icon = recorded ? <RecIcon /> : <NoRecIcon />

  return (
    <Card className={classes.card}>
      <CardContent>
        <div className={classes.header}>
          <Typography className={classes.date}>
            {date}
          </Typography>
          <Typography color="textSecondary">
            {tracks} {tLabel}
          </Typography>
          <div className={classes.icon}>
            {icon}
          </div>
        </div>
        <div className={classes.bottom}>
          <Typography className={classes.band}>
            {band}
          </Typography>
          &nbsp;&nbsp;
          <Typography className={classes.venue} color="textSecondary">
            {venue}
          </Typography>
          <CardActions className={classes.actions}>
            <Button size="small" onClick={() => onOpenGig(id)}>Open</Button>
          </CardActions>
        </div>
      </CardContent>
    </Card>
  )
}

GigCard.propTypes = {
  classes: PropTypes.object.isRequired,
  date: PropTypes.string.isRequired,
  venue: PropTypes.string.isRequired,
  recorded: PropTypes.bool.isRequired,
  band: PropTypes.string.isRequired,
  tracks: PropTypes.number.isRequired,
  onOpenGig: PropTypes.func,
  id: PropTypes.string
}

const styles = {
  card: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 275,
    maxWidth: 275,
    maxHeight: 80
  },
  header: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  bottom: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  date: {
    fontSize: 14,
  },
  icon: {
    transform: 'scale(0.7)',
    alignSelf: 'flex-start'
  },
  venue: {
  },
  actions: {
    verticalAlign: '-3em',
    alignSelf: 'baseline'
  }
};

export default withStyles(styles)(GigCard)
