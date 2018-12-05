/*
 * A icon showing the number of songs, used to add a new song
 */
import React from 'react'
import PropTypes from 'prop-types'
import { Query } from 'react-apollo'

import Badge from '@material-ui/core/Badge'
import IconButton from '@material-ui/core/IconButton'
import LoadingIcon from '@material-ui/icons/HourglassEmpty'
import ErrorIcon from '@material-ui/icons/ThumbDown'
import SongOpenIcon from '@material-ui/icons/MusicVideo'

import {GET_SONG_COUNT_QUERY} from '../db'


class SongIcon extends React.Component {
  render() {
    const {onNewSong} = this.props

    return (
      <Query query={GET_SONG_COUNT_QUERY}>
        {({loading, error, data}) => {
          if(loading) return <LoadingIcon />

          if(error) return (
            <IconButton color="inherit">
              <Badge badgeContent="err" color="secondary">
                <ErrorIcon />
              </Badge>
            </IconButton>
          )

          const count = data.song_aggregate.aggregate.count

          return (
            <IconButton
              onClick={onNewSong}
              color="inherit"
            >
              <Badge  badgeContent={count} color="secondary">
                <SongOpenIcon />
              </Badge>
            </IconButton>
          )
        }
      }
      </Query>
    )
  }
}

SongIcon.propTypes = {
  onNewSong: PropTypes.func.isRequired
}

SongIcon.contextTypes = {
  sessionId: PropTypes.string
}

export default SongIcon
