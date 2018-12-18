⚠️ This is a work in progress

### GigBase

PWA for editing a database of songs and when they were performed. Currently supports
the specific use case of selecting songs and adding them to a gig. There are lots
of other things it should do that haven't been implemented yet.

Built with React, Apollo GraphQL, Hasura, PostgreSQL, and Auth0.

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

New account creation isn't implemented yet, so use the Hasura app to create at least one entry in the *band*
table and then a new user and password entry in the *user* table. 

Logins are managed using Auth0, the email used in Auth0 should match one of the entries 
in the *user* table.

For production, create a `./.env` file based on `./backend/sample.env` containing your 
Heroku URL and the Auth0 configuration parameters. 
and the Hasura access key. The callback URL should be the URL to where
you're installing the app with `/callback` appended. The URL to the
app should also be set as the `homepage` property in `./package.json`.

For development, you can bypass the login by setting the Hasura key
and session id in your `.env` file. The session ID is the id from an
entry in the *session* table that you've created manually. Do not include these options in production.

`npm start` should now work, with the web app running at [http://localhost:3000](http://localhost:3000) or wherever you've 
installed it.

## Use

The only part of the login page that's implemented is the *Login* button: enter a valid user email and password and
click on the *Login* button. A new session will be created and its ID stored in your browser's local storage, so you
won't need to login afterwards. Use the *Log out* menu item to remove the session ID from local storage.

Use buttons in the toolbar to create songs and then a gig.
Once a gig is open, `Add` buttons will appear next to each song in the list. Adding a song creates a new performance of the
song and appends it to the gig, with the opportunity to change the drumkit and key settings for that performance. The song
list will show the most recent performance for each song.

## Loader

The code in `./loader` was used to load data from a prior, single-table database. If you have data you need to import this
would be a good starting point, otherwise this directory can be ignored.


*Released under the MIT License*
