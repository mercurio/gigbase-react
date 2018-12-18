/*
 * Create and edit a preformance and add it to the open gig,
 * given an existing performance as the starting point.
 */
import React from 'react'
import {withRouter} from 'react-router'
import {withApollo} from 'react-apollo'

import {withStyles} from '@material-ui/core/styles'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'

import history from '../history';
import {getSessionId} from '../sessionId'

import {
  PERFORMANCE_QUERY,
  SONG_QUERY,
  GIG_COUNT_QUERY,
  NEW_PERFORMANCE_MUTATION,
  GET_OPENED_GIG_AND_PERFORMANCES_QUERY,
  GIG_BANDS_AND_PERFORMANCES_QUERY,
  SONGS_QUERY
} from '../db'


class AddPerformanceComponent extends React.Component {
  constructor(props, context) {
    super(props)

    this.constants = {
      client: props.client,
      gig: props.match.params.gig,
      perf: props.match.params.perf,
      song: props.match.params.song
    }

    this.state = {
      song: '',
      drumkit: '',
      songkey: '',
      songId: '',
      serial: 0
    }

    this._setState()
  }

  /*
   * Do some queries and set the state
   */
  _setState = async () => {
    let result = await this.props.client.query({
      query: GIG_COUNT_QUERY,
      variables: {gig: this.constants.gig}
    })

    const serial = result.data.gig_by_pk.performancesBygig_aggregate.aggregate.count+1

    if(this.constants.perf === 'new') {
      result = await this.props.client.query({
        query: SONG_QUERY,
        variables: {song: this.constants.song}
      })

      const s = result.data.song_by_pk;
      this.setState({
        drumkit: '',
        songkey: '',
        songId: s.id,
        song: s.title,
        serial: serial
      })
    } else {
      result = await this.props.client.query({
        query: PERFORMANCE_QUERY,
        variables: {perf: this.constants.perf}
      })

      const p = result.data.performance_by_pk;
      this.setState({
        drumkit: p.drumkit,
        songkey: p.songkey,
        songId: p.songBysong.id,
        song: p.songBysong.title,
        serial: serial
      })
    }
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
   * Create the new performance
   */
  submit = async () => {
    await this.props.client.mutate({
      mutation: NEW_PERFORMANCE_MUTATION,
      variables: {
        gig: this.constants.gig,
        song: this.state.songId,
        drumkit: this.state.drumkit,
        songkey: this.state.songkey,
        serial: this.state.serial
      },
      refetchQueries: [
        {query: GET_OPENED_GIG_AND_PERFORMANCES_QUERY, variables: {session: getSessionId()}},
        {query: GIG_BANDS_AND_PERFORMANCES_QUERY, variables: {gig: this.constants.gig}},
        {query: SONGS_QUERY,  variables: {session: getSessionId()}},
        {query: GIG_COUNT_QUERY,  variables: {gig: this.constants.gig}}
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
   * Render the component
   */
  render() {
    const {classes} = this.props;

    return (
      <Grid container className={classes.root}>
        <Grid container direction="row" justify="space-evenly" alignItems="center">
          <Grid item>
            <Button variant="contained" color="primary" className={classes.button} onClick={this.submit}>
              Add to gig
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
            disabled
            id="song"
            label="Song"
            className={classes.textField}
            value={this.state.song}
            margin="normal"
            variant="filled"
            style={{display: 'flex', justifyContent: 'center'}}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            id="drumkit"
            label="Drum Kit"
            className={classes.textField}
            value={this.state.drumkit}
            onChange={this.handleChange('drumkit')}
            margin="normal"
            variant="outlined"
            style={{display: 'flex', justifyContent: 'center'}}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            id="songkey"
            label="Key"
            className={classes.textField}
            value={this.state.songkey}
            onChange={this.handleChange('songkey')}
            margin="normal"
            variant="outlined"
            style={{display: 'flex', justifyContent: 'center'}}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            disabled
            id="serial"
            label="Serial"
            className={classes.textField}
            value={this.state.serial}
            margin="normal"
            variant="filled"
            style={{display: 'flex', justifyContent: 'center'}}
          />
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

const AddPerformance = withStyles(styles)(withRouter(AddPerformanceComponent))

export default withApollo(AddPerformance)
