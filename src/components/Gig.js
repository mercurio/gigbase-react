/*
 * Edit a gig
 */
import React from 'react'
import {withRouter} from 'react-router'
import {withApollo} from 'react-apollo'

import {withStyles} from '@material-ui/core/styles'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import Grid from '@material-ui/core/Grid'

import RecChip from './RecChip'
import BandMenu from './BandMenu'
import PerformanceCard from './PerformanceCard'

import history from '../history';
import {today} from '../util'
import {getSessionId} from '../sessionId'

import {
  GIG_BANDS_AND_PERFORMANCES_QUERY,
  UPDATE_GIG_MUTATION,
  GET_OPENED_GIG_AND_PERFORMANCES_QUERY,
  GET_GIGS_QUERY
} from '../db'


class GigComponent extends React.Component {
  constructor(props, context) {
    super(props)

    this.constants = {
      client: props.client,
      gig: props.match.params.id
    }

    this.state = {
      date: today(),
      venue: 'Leadbone Studios',
      recorded: false,
      band: 'Leadbone',
      bands: [],
      bandList: [],
      performances: []
    }

    this.props.client.query({
      query: GIG_BANDS_AND_PERFORMANCES_QUERY,
      variables: {gig: this.constants.gig}
    }).then(result => {
      const g = result.data.gig_by_pk;
      this.setState({
        date: g.date,
        venue: g.venue,
        recorded: g.recorded,
        band: g.bandByband ? g.bandByband.name : 'Leadbone',
        bands: result.data.band.map(b => b.name),
        bandList: result.data.band,
        performances: g.performancesBygig.map(p => ({
          serial: p.serial,
          stars: p.stars || 0,
          song: p.songBysong.title,
          drumkit: p.drumkit,
          songkey: p.songkey
        }))
      })
    })
  }

  /*
   * Return a function that is called when a field is edited,
   * given the name of the state property.
   */
  handleChange = name => event => {
    this.setState({
      [name]: event.target.value
    })
  }

  /*
   * Update the gig
   */
  submit = async () => {
    let band = this.state.bandList.find(b => b.name === this.state.band)
    band = band ? band.id : null

    await this.props.client.mutate({
      mutation: UPDATE_GIG_MUTATION,
      variables: {
        gig: this.constants.gig,
        date: this.state.date,
        venue: this.state.venue,
        recorded: this.state.recorded,
        band: band
      },
      refetchQueries: [
        {query: GET_OPENED_GIG_AND_PERFORMANCES_QUERY, variables: {session: getSessionId()}},
        {query: GIG_BANDS_AND_PERFORMANCES_QUERY, variables: {gig: this.constants.gig}},
        {query: GET_GIGS_QUERY}
      ]
    })

    history.goBack()
  }

  /*
   * Cancel changes
   */
  cancel = () => {
    history.goBack()
  }

  /*
   * Toggle the recorded boolean
   */
  toggleRecorded = () => {
    this.setState({recorded: !this.state.recorded})
  }

  /*
   * A band has been selected
   */
  selectBand = (name) => {
    this.setState({band: name})
  }

  /*
   * Render the component
   */
  render() {
    const {classes} = this.props;

    return (
      <Grid container className={classes.root}>
        <Grid container direction="row" justify="space-evenly" alignItems="center">
          <Grid item>
            <Button variant="contained" color="primary" className={classes.button} onClick={this.submit}>
              Update
            </Button>
          </Grid>
          <Grid item>
            <Button variant="contained" color="secondary" className={classes.button} onClick={this.cancel} >
              Cancel
            </Button>
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <TextField
            id="date"
            label="Date"
            type="date"
            className={classes.textField}
            value={this.state.date}
            onChange={this.handleChange('date')}
            margin="normal"
            variant="outlined"
            style={{display: 'flex', justifyContent: 'center'}}
            InputLabelProps = {{shrink: true}}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            id="venue"
            label="Venue"
            className={classes.textField}
            value={this.state.venue}
            onChange={this.handleChange('venue')}
            margin="normal"
            variant="outlined"
            style={{display: 'flex', justifyContent: 'center'}}
          />
        </Grid>
        <Grid container direction="row" justify="space-evenly" alignItems="center">
          <Grid item>
            <BandMenu band={this.state.band} bands={this.state.bands} onSelectBand={this.selectBand} />
          </Grid>
          <Grid item>
          <RecChip recorded={this.state.recorded} onToggle={this.toggleRecorded} />
          </Grid>
        </Grid>
        <Grid item>
          <List className={classes.list} dense disablePadding>
            {this.state.performances.map((p, i) => (
              <ListItem key={i}>
                <PerformanceCard {...p} />
              </ListItem>
            ))}
          </List>
        </Grid>
      </Grid>
    )
  }
}

const styles = theme => ({
  root: {
    flexGrow: 1,
    maxWidth: 400,
    padding: theme.spacing.unit * 1,
    justifyContent: 'space-between',
  },
})

const Gig = withStyles(styles)(withRouter(GigComponent))

export default withApollo(Gig)
