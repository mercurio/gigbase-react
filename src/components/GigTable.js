/*
 * A table listing the gigs
 */
import React from 'react'
import PropTypes from 'prop-types'
import {Query} from 'react-apollo'

import {withStyles} from '@material-ui/core/styles'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'

import GigCard from './GigCard'
import {today} from '../util'
import {
  GET_GIGS_QUERY,
  NEW_GIG_MUTATION,
  SET_SESSION_GIG_MUTATION,
  GET_OPENED_GIG_AND_PERFORMANCES_QUERY,
  GIG_BANDS_AND_PERFORMANCES_QUERY,
} from '../db'


const GigData = ({onOpenGig}) => (
  <Query query={GET_GIGS_QUERY}>
    {({loading, error, data}) => {
      if(loading) return '... Loading'
      if(error) return `Error: ${error.toString()}`

      return data.gig.map((g, index) => {
        const x = {
          id: g.id,
          date: g.date,
          venue: g.venue,
          recorded: g.recorded,
          band: g.bandByband ? g.bandByband.name : '',
          tracks: g.performancesBygig_aggregate.aggregate.count,
          onOpenGig
        }

        return (
          <ListItem key={index}>
            <GigCard {...x} />
          </ListItem>
        )
      })
    }}
  </Query>
)


class GigTableComponent extends React.Component {
  constructor(props, context) {
    super(props)

    this.constants = {
      sessionId: context.sessionId
    }
  }

  /*
   * Create a new gig with today's date
   */
  newGig = async () => {
    let result = await this.props.client.mutate({
      mutation: NEW_GIG_MUTATION,
      variables: {date: today()},
      refetchQueries: [
        {query: GET_GIGS_QUERY}
      ]
    })

    const id = result.data.insert_gig.returning[0].id

    await this.props.client.mutate({
      mutation: SET_SESSION_GIG_MUTATION,
      variables: {
        session: this.constants.sessionId,
        gig: id
      },
      refetchQueries: [
        {query: GET_OPENED_GIG_AND_PERFORMANCES_QUERY, variables: {session: this.constants.sessionId}},
        {query: GIG_BANDS_AND_PERFORMANCES_QUERY, variables: {gig: id}}
      ]
    })

    this.props.history.push(`/gig/${id}`)
  }

  onOpenGig = (id) => {
    this.props.history.push(`/gig/${id}`)
  }

  render() {
    const {classes} = this.props;

    return (
      <Grid container className={classes.root} justify="space-evenly" alignItems="center">
        <Grid container direction="row" justify="space-evenly" alignItems="center">
          <Grid item>
            <Button variant="contained" color="primary" className={classes.button} onClick={this.newGig} >
              Create new gig
            </Button>
          </Grid>
        </Grid>
        <Grid item>
          <List className={classes.list}>
            <GigData onOpenGig={this.onOpenGig}/>
          </List>
        </Grid>
      </Grid>
    )
  }
}

GigTableComponent.contextTypes = {
  sessionId: PropTypes.string
}

GigTableComponent.propTypes = {
  classes: PropTypes.object.isRequired,
}

const styles = theme => ({
  root: {
    flexGrow: 1,
    maxWidth: 400,
    padding: theme.spacing.unit * 1,
    justifyContent: 'space-between',
  },
  table: {
    minWidth: '100%'
  },
  row: {
    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.background.default,
    },
  },
  button: {
    maxWidth: 300
  }
})

const GigTable = withStyles(styles)(GigTableComponent)

export {GigTable}
