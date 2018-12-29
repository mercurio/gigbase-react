/*
 * A table listing the songs along with the drumkit and other info
 * from the most recent performance.
 *
 * Reference: https://material-ui.com/demos/tables/
 */
import React from 'react';
import PropTypes from 'prop-types';
import { Query } from 'react-apollo';

import { withStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button'

import {routePush} from '../history';
import {getSessionId} from '../sessionId'
import {SONGS_QUERY} from '../db'


const SongData = ({onAddGenFunc}) => (
  <Query query={SONGS_QUERY} variables={{session:getSessionId()}}>
  {({loading, error, data}) => {
    if(loading) return <TableRow key="1"><CustomTableCell>Loading</CustomTableCell></TableRow>;
    if(error) return <TableRow key="1"><CustomTableCell>Error: ${error.toString()}</CustomTableCell></TableRow>;

    return data.most_recent_performance.map((p, index) => (
      <TableRow key={index} hover={true}>
        <CustomTableCell>{p.drumkit || ''}</CustomTableCell>
        <CustomTableCell component="th" scope="row">{p.title}</CustomTableCell>
        <CustomTableCell>{p.date || ''}</CustomTableCell>
        <CustomTableCell numeric>{p.recordings || 0}</CustomTableCell>
        {data.session_by_pk.gig ?
          <CustomTableCell>
            <Button variant="contained" color="primary" onClick={onAddGenFunc(p.performance_id, data.session_by_pk.gig, p.song_id)}>Add</Button>
          </CustomTableCell>
          :
          null
        }
      </TableRow>
    ));
  }}
  </Query>
);

const CustomTableCell = withStyles(theme => ({
  head: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  body: {
    fontSize: 14,
  },
}))(TableCell);


class SongTableComponent extends React.Component {

  /*
   * Given a performance and a gig, return a function that routes to
   * AddPerformance. We also take a song id, in case we have no performances yet.
   */
  addPerfOrSong = (perf,gig,song) => () => {
    perf = perf || 'new'
    routePush(`/addPerf/${perf}/${gig}/${song}`)
  }

  render() {
    const {classes} = this.props;

    return (
      <Paper className={classes.root}>
        <Table className={classes.table} padding="dense">
          <TableHead>
            <TableRow>
              <CustomTableCell>Drum Kit</CustomTableCell>
              <CustomTableCell>Song</CustomTableCell>
              <CustomTableCell>Last Played</CustomTableCell>
              <CustomTableCell numeric>Recordings</CustomTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <SongData className={classes.row} onAddGenFunc={this.addPerfOrSong}/>
          </TableBody>
        </Table>
      </Paper>
    )
  }
}

SongTableComponent.propTypes = {
  classes: PropTypes.object.isRequired,
};

const styles = theme => ({
  root: {
    width: '100%',
    marginTop: 0,
    overflowX: 'auto',
  },
  table: {
    minWidth: '100%'
  },
  row: {
    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.background.default,
    },
  },
});

export default withStyles(styles)(SongTableComponent);
