/*
 * Edit the profile of the currently logged-in user
 */
import React from 'react'
import {withApollo} from 'react-apollo'

import {withStyles} from '@material-ui/core/styles'
import TextField from '@material-ui/core/TextField'
import Chip from '@material-ui/core/Chip'
import Avatar from '@material-ui/core/Avatar'
import Button from '@material-ui/core/Button'

import {routePop} from '../history';
import {getSessionId} from '../sessionId'

import {
  USER_PROFILE_QUERY,
  LOGGED_IN_USER_QUERY,
  SET_USER_NAMES_MUTATION
} from '../db'

class UserProfileComponent extends React.Component {
  constructor(props, context) {
    super(props)

    this.constants = {
      client: props.client,
    }

    this.state = {
      userId: '',
      email: '',
      fullName: '',
      stageName: '',
      bands: []
    }

    this.props.client.query({
      query: USER_PROFILE_QUERY,
      variables: {session: getSessionId()}
    }).then(result => {
      const u = result.data.session_by_pk.userByuser;
      this.setState({
        userId: u.id,
        email: u.email,
        fullName: u.fullName || '',
        stageName: u.stageName || '',
        bands: u.userBandsByuser.map(x => x.bandByband.name)
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
   * Update the user profile
   */
  submit = async () => {

    await this.props.client.mutate({
      mutation: SET_USER_NAMES_MUTATION,
      variables: {
        user: this.state.userId,
        fullName: this.state.fullName,
        stageName: this.state.stageName
      },
      refetchQueries: [
        {query: LOGGED_IN_USER_QUERY, variables: {session: getSessionId()}},
        {query: USER_PROFILE_QUERY, variables: {session: getSessionId()}}
      ]
    })

    routePop()
  }

  /*
   * Cancel changes
   */
  cancel = () => {
    routePop()
  }

  render() {
    const {classes} = this.props;

    return (
      <div style={{display: 'flex', justifyContent: 'center'}}>
        <form className={classes.container} noValidate autoComplete="off" onSubmit={this.submit}>
          <br />
          <TextField
            id="fullName"
            label="Full Name"
            className={classes.textField}
            value={this.state.fullName}
            onChange={this.handleChange('fullName')}
            margin="normal"
            variant="outlined"
            style={{display: 'flex', justifyContent: 'center'}}
          />
          <br />
          <TextField
            id="stageName"
            label="Stage Name"
            className={classes.textField}
            value={this.state.stageName}
            onChange={this.handleChange('stageName')}
            margin="normal"
            variant="outlined"
            style={{display: 'flex', justifyContent: 'center'}}
          />
          <br />
          <br />
          <div className={classes.bandBox} style={{height:200}}>
            <h1><span>&nbsp;Bands&nbsp;</span></h1>
            {this.state.bands.map((x,i) => (
              <Chip
                label={x}
                key={i}
                className={classes.chip}
                avatar={<Avatar alt={x} src={`/static/images/bands/${x}.png`} />}
              />
            ))}
          </div>
          <br />
          <Button variant="contained" color="primary" className={classes.button} onClick={this.submit}>
            Update {this.state.email}
          </Button>
          <br />
          <Button variant="contained" color="secondary" className={classes.button} onClick={this.cancel} >
            Cancel
          </Button>
        </form>
      </div>
    )
  }
}

const styles = theme => ({
  mainWrapper: { backgroundColor: theme.palette.background.paper },

  email: {
    borderStyle: 'solid',
    borderWidth: '0px',
    borderColor: 'rgba(0,0,0,0.23)',
    borderRadius: '4px',
    padding: '10px',
    color: 'rgba(0,0,0,0.23)',
  },

  bandBox: {
    borderStyle: 'solid',
    borderWidth: '1px',
    borderColor: 'rgba(0,0,0,0.23)',
    borderRadius: '4px',
    padding: '10px',
    '& h1': {
      textAlign: 'left',
      marginTop: '-20px',
      marginLeft: '0px',
      height: '20px',
      lineHeight: '20px',
      fontSize: '12px',
      color: 'rgba(0,0,0,0.43)',
      '& span': {
        backgroundColor: 'white'
      }
    }
  }
})

const UserProfile = withStyles(styles)(UserProfileComponent)

export default withApollo(UserProfile)
