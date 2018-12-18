/*
 * Edit a song, usually used to create a new song
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
  SONG_QUERY,
  SONGS_QUERY,
  GET_SONG_COUNT_QUERY,
  NEW_SONG_MUTATION,
  UPDATE_SONG_MUTATION
} from '../db'


class SongComponent extends React.Component {
  constructor(props, context) {
    super(props)

    this.constants = {
      client: props.client,
      song: props.match.params.id,
      newSong: props.match.params.id === 'new'  // indicates we're creating a new song
    }

    this.state = {
      title: '',
      artist: '',
      prehistory: 0,
    }

    if(this.constants.newSong) return

    this.props.client.query({
      query: SONG_QUERY,
      variables: {song: this.constants.song}
    }).then(result => {
      const s = result.data.song_by_pk;
      this.setState({
        title: s.title,
        artist: s.artist,
        prehistory: s.prehistory
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
   * Create the new song or update the old one
   */
  submit = async () => {
    if(this.constants.newSong) {
      await this.props.client.mutate({
        mutation: NEW_SONG_MUTATION,
        variables: {
          title: this.state.title,
          artist: this.state.artist,
          prehistory: this.state.prehistory
        },
        refetchQueries: [
          {query: GET_SONG_COUNT_QUERY},
          {query: SONGS_QUERY, variables: {session: getSessionId()}},
        ]
      })
    } else {
      await this.props.client.mutate({
        mutation: UPDATE_SONG_MUTATION,
        variables: {
          song: this.constants.song,
          title: this.state.title,
          artist: this.state.artist,
          prehistory: this.state.prehistory
        },
        refetchQueries: [
          {query: SONG_QUERY, variables: {song: this.constants.song}},
          {query: SONGS_QUERY, variables: {session: getSessionId()}},
        ]
      })
    }

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
              {this.constants.newSong ? "Add song" : "Update song"}
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
            id="title"
            label="Title"
            className={classes.textField}
            value={this.state.title}
            onChange={this.handleChange('title')}
            margin="normal"
            variant="outlined"
            style={{display: 'flex', justifyContent: 'center'}}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            id="artist"
            label="Artist"
            className={classes.textField}
            value={this.state.artist}
            onChange={this.handleChange('artist')}
            margin="normal"
            variant="outlined"
            style={{display: 'flex', justifyContent: 'center'}}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            id="prehistory"
            label="Prehistory"
            type="number"
            className={classes.textField}
            value={this.state.prehistory}
            onChange={this.handleChange('prehistory')}
            margin="normal"
            variant="outlined"
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

const Song = withStyles(styles)(withRouter(SongComponent))

export default withApollo(Song)
