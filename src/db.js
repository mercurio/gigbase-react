/*
 * Database operations
 *
 * Queries and mutations used throughout the application.
 * This now handles both the GraphQL and REST interfaces.
 */
import gql from 'graphql-tag'

export const useGraphQL = true

/** GraphQL Queries **/

/*
 * See if the username/password is valid
 */
export const VALIDATE_USER_QUERY = gql`
  query validate_user($user: String!, $pass: String!) {
    user(where: {
      _and: [
        {email: {_eq: $user}}, 
        {password: {_eq: $pass}}
      ]
    }) {
      id
    }
  }
`

/*
 * Get the user id given a user email
 */
export const GET_USERID_QUERY = gql`
  query get_userid_for_user($email: String!) {
    user(where: {email: {_eq: $email}}) {
      id
    }
  }
`

/*
 * Get the session given a user email
 */
export const GET_SESSION_QUERY = gql`
  query get_session_for_user($email: String!) {
    user(where: {email: {_eq: $email}}) {
      sessionsByuser {
        id
      }
    }
  }
`

/*
 * Given a session id, get the opened gig and the count of its performances
 */
export const GET_OPENED_GIG_AND_PERFORMANCES_QUERY = gql`
  query get_opened_gig($session: uuid!) {
    session_by_pk(id: $session) {
      gigBygig {
        performancesBygig_aggregate {
          aggregate {
            count
          }
        }
      }
    }
  }
`

/*
 * Get the reference performance and number of tracks in the gig
 */
export const PERFORMANCE_QUERY = gql`
  query get_perf($perf: uuid!) {
    performance_by_pk(id: $perf) {
      id
      drumkit
      songkey
      songBysong {
        id
        title
      }
    }
  }
`

/*
 * Get the number of tracks in the gig
 */
export const GIG_COUNT_QUERY = gql`
  query get_gig_count($gig: uuid!) {
    gig_by_pk(id: $gig) {
      id
      performancesBygig_aggregate {
        aggregate {
          count
        }
      }
    }
  }
`

/*
 * Given a session id, get the opened gig's id
 */
export const GET_OPENED_GIG_QUERY = gql`
  query get_opened_gig_id($session: uuid!) {
    session_by_pk(id: $session) {
      id
      gig
    }
  }
`

/*
 * Get the selected gig plus all the band names
 */
export const GIG_BANDS_AND_PERFORMANCES_QUERY = gql`
  query get_gig($gig: uuid!) {
    gig_by_pk(id: $gig) {
      id
      venue
      date
      recorded
      bandByband {
        id
        name
      }
      performancesBygig(order_by: {serial: asc}) {
        id
        serial
        stars
        drumkit
        songkey
        songBysong {
          id
          title
        }
      }
    }
    band(order_by: {name: asc}) {
      id
      name
    }
  }
`

/*
 * Query to retrieve gig ids in reverse chronological order
 */
export const GET_GIGS_QUERY = gql`
  query get_gigs {
    gig(order_by: {date: desc}) {
      id
    	date
    	venue
    	recorded
    	bandByband {
        id
        name
      }
    	performancesBygig_aggregate {
      	aggregate {
      	  count
      	}
      }
    }
  }
`

/*
 * Get the logged-in user given a session id
 */
export const LOGGED_IN_USER_QUERY = gql`
  query get_user_names($session: uuid!) {
    session_by_pk(id: $session) {
      userByuser {
        id
        email
        fullName
        stageName
      }
    }
  }
`

/*
 * Get a count of the number of songs
 */
export const GET_SONG_COUNT_QUERY = gql`
  query count_songs {
    song_aggregate {
      aggregate {
        count
      }
    }
  }
`

/*
 * Get the data from one song
 */
export const SONG_QUERY = gql`
  query get_song($song: uuid!) {
    song_by_pk(id: $song) {
      id
      title
      artist
      prehistory
    }
  }
`

/*
 * Query to retrieve song titles and associated info
 * along with the session info. We use the song id as
 * the id, since the performance might be null
 */
export const SONGS_QUERY = gql`
  query songs_table($session: uuid!) {
    most_recent_performance(order_by: {title: asc}) {
      id: song_id
      title
      drumkit
      songkey
      date
      recordings
      song_id
      performance_id
    }
    session_by_pk(id: $session) {
      gig
    }
  }
`

/*
 * Get the profile of the currently loggen-in user
 */
export const USER_PROFILE_QUERY = gql`
  query get_user_profile($session: uuid!) {
    session_by_pk(id: $session) {
      userByuser {
        id
        email
        fullName
        stageName
        userBandsByuser {
          bandByband {
            name
          }
        }
      }
    }
  }
`

/** Mutations **/


/*
 * Upsert the user in the session table, returning the
 * existing session for the user if there is one.
 */
export const OPEN_SESSION_UPSERT = gql`
  mutation open_session($user: uuid!) {
    insert_session(
      objects: [
        {user: $user}
      ]
      on_conflict: {
        constraint: session_user_key,
        update_columns: [id]
      }
    ) {
      affected_rows
      returning {
        id
      }
    }
  }
`

/*
 * Update the gig in the given session
 */
export const SET_SESSION_GIG_MUTATION = gql`
  mutation set_session($session: uuid!, $gig: uuid) {
    update_session(
      where: {id: {_eq: $session}},
      _set: {gig: $gig}
    ) {
      affected_rows
    }
  }
`
/*
 * Create a new performance
 */
export const NEW_PERFORMANCE_MUTATION = gql`
  mutation new_perf($gig: uuid!, $song: uuid!, $drumkit: String!, $songkey: String!, $serial: Int!) {
    insert_performance(objects: [
      {
        gig: $gig,
        song: $song,
        drumkit: $drumkit,
        songkey: $songkey,
        serial: $serial
      }
    ]) {
      returning {
        id
      }
    }
  }
`

/*
 * Mutation to update a gig
 */
export const UPDATE_GIG_MUTATION = gql`
  mutation update_gig($gig: uuid!, $date: date, $venue: String!, $recorded: Boolean!, $band: uuid) {
    update_gig(
      where: {id: {_eq: $gig}},
      _set: {
        date: $date,
        venue: $venue,
        recorded: $recorded,
        band: $band
      }
    ) {
      affected_rows
    }
  }
`

/*
 * Mutation to create a new gig at Leadbone Studios with the given date
 */
export const NEW_GIG_MUTATION = gql`
  mutation new_gig($date: date!) {
    insert_gig(objects: [
      {
        date: $date,
        venue: "Leadbone Studios"
      }
    ]) {
      returning {
        id
      }
    }
  }
`

/*
 * Mutation to create a song
 */
export const NEW_SONG_MUTATION = gql`
  mutation new_song($title: String!, $artist: String, $prehistory: Int!) {
    insert_song(objects: [
      {
        title: $title,
        artist: $artist,
        prehistory: $prehistory,
      }
    ]) {
      returning {
        id
      }
    }
  }
`

/*
 * Mutation to update a song
 */
export const UPDATE_SONG_MUTATION = gql`
  mutation update_song($song: uuid!, $title: String!, $artist: String, $prehistory: Int!) {
    update_song(
      where: {id: {_eq: $song}},
      _set: {
        title: $title,
        artist: $artist,
        prehistory: $prehistory
      }
    ) {
      affected_rows
    }
  }
`

/*
 * Update the full and stage names for a user
 */
export const SET_USER_NAMES_MUTATION = gql`
  mutation set_user_fullname($user: uuid!, $fullName: String!, $stageName: String!) {
    update_user(
      where: {id: {_eq: $user}},
      _set: {fullName: $fullName, stageName: $stageName}
    ) {
      affected_rows
    }
  }
`
