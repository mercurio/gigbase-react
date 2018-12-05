/*
 * Display the info from a performance
 */
import React from 'react'
import PropTypes from 'prop-types'
import {withStyles} from '@material-ui/core/styles'

import Typography from '@material-ui/core/Typography'
import Paper from '@material-ui/core/Paper'
import Grid from '@material-ui/core/Grid'

const PerformanceCard = ({classes, serial, stars, song, drumkit, songkey}) => (
  <Paper className={classes.root}>
    <Grid container spacing={16}>
      <Grid item>
        <Typography>
          {serial}
        </Typography>
      </Grid>
      <Grid item xs={11} container >
        <Grid item xs={10} container direction="column" spacing={8}>
          <Grid item md>
            <Typography variant="headline">
              {song}
            </Typography>
            <Typography color="textSecondary">
              {drumkit}
            </Typography>
          </Grid>
        </Grid>
        <Grid item xs container direction="column" spacing={16}>
          <Grid item>
            <Typography align="right">
              {stars} stars
            </Typography>
            <Typography align="right">
              {songkey}
            </Typography>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  </Paper>
)

PerformanceCard.propTypes = {
  classes: PropTypes.object.isRequired,
  serial: PropTypes.number.isRequired,
  stars: PropTypes.number.isRequired,
  song: PropTypes.string.isRequired,
  drumkit: PropTypes.string.isRequired,
  songkey: PropTypes.string.isRequired
}

PerformanceCard.defaultProps = {
}


const styles = theme => ({
  root: {
    flexGrow: 1,
    maxWidth: 400,
    padding: theme.spacing.unit * 1
  }
})

export default withStyles(styles)(PerformanceCard)

  /*
  <Card className = {classes.root}>
    <CardContent>
      <Grid container spacing={16}>

      <Typography className={classes.serial}>
        {serial}
      </Typography>
      <Typography className={classes.stars}>
        {stars} stars
      </Typography>
      <Typography className={classes.song}>
        {song}
      </Typography>
      <Typography className={classes.drumkit}>
        {drumkit}
      </Typography>
      <Typography className={classes.songkey}>
        {songkey}
      </Typography>
    </CardContent>
  </Card>
  */
