⚠️ This is a work in progress

### GigBase

PWA for editing a database of songs and when they were performed. Currently supports
the specific use case of selecting songs and adding them to a gig. There are lots
of other things it should do that haven't been implemented yet.

Built with React, Apollo GraphQL, Hasura, and PostgreSQL.

## Table of Contents

- [Backend Setup](#backend-setup)
- [Use](#use)
- [Loader](#loader)

## Backend Setup

The backend was created with [Hasura](https://hasura.io) using the free tier on Heroku. A dump of the schema is in
`./backend/pg_schema-<timestamp>`. The database was constructed interactively using Hasura, so I don't
know if all or just a portion of this schema should be loaded into an empty database. The tables I
created are: band, gig, performance, session, song, user, and user_band. The views song_recordings, song_performances,
song_latest_performance, and most_recent_performance are created by `./views.sql`, along with
a definition of a FIRST aggregate used in some of the views. All of the tables and views should be
tracked by Hasura.

Logins haven't been implemented yet, so create a row in each of the band, user, and session tables manually.

Create a `./.env` file based on `./backend/sample.env` containing your Heroku URL, Hasura access key, and the
hard-coded session ID. `npm start` should now work, with the web app running at [http://localhost:3000](http://localhost:3000).

## Use

Just click on the Login button to log into the hard-coded session. Use buttons in the toolbar to create songs and then a gig.
Once a gig is open, `Add` buttons will appear next to each song in the list. Adding a song creates a new performance of the
song and appends it to the gig, with the opportunity to change the drumkit and key settings for that performance. The song
list will show the most recent performance for each song.

## Loader

The code in `./loader` was used to load data from a prior, single-table database. If you have data you need to import this
would be a good starting point, otherwise this directory can be ignored.
