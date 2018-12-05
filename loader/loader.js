/*
 * Load a CSV file and issue mutations to populate the gig database.
 * It starts by creating the user adminEmail.
 *
 * This is the Hasura/Heroku version. No tags in this version
 * (see ref/loader-tags.js).
 *
 * Once used a pipeline, but that caused multiple invocations of processSong
 * to be run in parallel. We now read the whole file at the start.
 */
require('dotenv').config();
const assert = require('assert');

const adminEmail = 'neon@leadbone.com';
const endPt = {
    endpoint: process.env.REACT_APP_GIGBASE_ENDPOINT,
    headers: {
        'content-type': 'application/json',
        'x-hasura-access-key': process.env.REACT_APP_GIGBASE_KEY
    }
};

const { query } = require('graphqurl');
const fs = require('fs');

const parseOpts = {columns: true, delimiter: ','};

/* Synchronous read */
const parse = require('csv-parse/lib/sync');
const records = parse(fs.readFileSync('songs.csv'), parseOpts);

/* Async pipeline, processes lines in parallel */
/*
const transform = require('stream-transform');
const parse = require('csv-parse');

var input = fs.createReadStream('songs.csv');
var parser = parse(parseOpts);

var transformer = transform(async function(record, callback) {
    callback(null, await processSong(record));
});
*/

// Globals
var neon, leadbone;

/*
 * Convert YYYYMMDD to ISO 8601, assuming 7 pm.
 */
function fixDate(date) {
    let yr = date.slice(0,4);
    let mo = date.slice(4,6);
    let dy = date.slice(6,8);

    return `${yr}-${mo}-${dy}T19:00:00-08:00`;
}

/*
 * Find or create admin
                user(email: "neon@leadbone.com") {
 */
async function findOrCreateAdmin() {
    let response = await query({
        query: `
            query {
                user(where: {email: {_eq: "${adminEmail}" }}){
                    id
                }
            }
        `, ...endPt,
    });

    assert(response);
    if(response.data.user.length)
        return response.data.user[0].id;

    // Create it
    response = await query({
        query: `
            mutation insert_user($email: String!) {
                insert_user(objects: [
                    {
                        email: $email,
                        password: "changeme"
                    }
                ]) {
                    returning {
                        id
                    }
                }
            }
        `, ...endPt,
        variables: {
            email: adminEmail
        }
    });

    assert(response);
    return response.data.insert_user.returning[0].id;
}

/*
 * Find or create the band Leadbone
 */
async function findOrCreateLeadbone() {
    let response = await query({
        query: `
            query {
                band(where: {name: {_eq: "Leadbone"}}) {
                    id
                }
            }
        `, ...endPt,
    });

    assert(response);
    if(response.data.band.length)
        return response.data.band[0].id;

    // Create it
    response = await query({
        query: `
            mutation insert_band {
                insert_band(objects: [
                    {
                        editableByOthers: false,
                        viewableByOthers: true,
                        name: "Leadbone"
                    }
                ]) {
                    returning {
                        id
                    }
                }
            }
        `, ...endPt,
    });

    assert(response);
    return response.data.insert_band.returning[0].id;
}

/*
 * Add the user to the given band, if not already there
 */
async function userInBand(userId, bandId) {
    let response = await query({
        query: `
            query {
                user_band(where: {
                    _and: [
                        {user: {_eq: "${userId}"}},
                        {band: {_eq: "${bandId}"}}
                    ]
                }) {
                    id
                }
            }
        `, ...endPt,
    });

    assert(response);
    if(response.data.user_band.length)
        return response.data.user_band[0].id;

    // Create it
    response = await query({
        query: `
            mutation insert_user_band($userId: uuid!, $bandId: uuid!) {
                insert_user_band(objects: [
                    {
                        user: $userId,
                        band: $bandId
                    }
                ]) {
                    returning {
                        id
                    }
                }
            }
        `, ...endPt,
        variables: {
            userId: userId,
            bandId: bandId
        }
    });

    assert(response);
    return response.data.insert_user_band.returning[0].id;
}


/*
 * Find or create a gig with the given date at 7pm at Leadbone Studios
 * for the band Leadbone.
 */
async function findOrCreateGig(date) {
    let dt = fixDate(date);

    let response = await query({
        query: `
            query gig($date: date!) {
                gig(where: {date: {_eq: $date}}) {
                    id
                }
            }
        `, ...endPt,
        variables: {
            date: dt
        }
    });


    assert(response);
    if(response.data.gig.length)
        return response.data.gig[0].id;

    // Create it
    response = await query({
        query: `
            mutation insert_gig($date: date!, $band: uuid!) {
                insert_gig(objects: [
                    {
                        date: $date,
                        recorded: true,
                        venue: "Leadbone Studios",
                        band: $band
                    }
                ]) {
                    returning {
                        id
                    }
                }
            }
        `, ...endPt,
        variables: {
            date: dt,
            band: leadbone
        }
    });

    assert(response);
    return response.data.insert_gig.returning[0].id;
}

/*
 * Find or create a song with the given title. If creating it, the
 * number of recordings will be provided (that - 1 is the prehistory).
 */
async function findOrCreateSong(title, recordings) {
    let prehistory = recordings ? recordings - 1 : 0;

    let response = await query({
        query: `
            query song($title: String!) {
                song(where: {title: {_eq: $title}}) {
                    id
                }
            }
        `, ...endPt,
        variables: {
            title: title
        }
    });

    assert(response);
    if(response.data.song.length)
        return response.data.song[0].id;

    // Create it
    response = await query({
        query: `
            mutation insert_song($title: String!, $prehistory: Int!) {
                insert_song(objects: [
                    {
                       title: $title,
                       prehistory: $prehistory
                    }
                ]) {
                    returning {
                        id
                    }
                }
            }
        `, ...endPt,
        variables: {
            title: title,
            prehistory: prehistory
        }
    });

    assert(response);
    return response.data.insert_song.returning[0].id;
}

/*
 * Create a performance of a particular song at a particular gig
 */
async function createPerformance(gig, song, drumkit, key) {

    response = await query({
        query: `
            mutation insert_performance($gig: uuid!, $song: uuid!, $drumkit: String!, $key: String!) {
                insert_performance(objects: [
                    {
                        song: $song,
                        gig: $gig,
                        drumkit: $drumkit,
                        key: $key
                    }
                ]) {
                    returning {
                        id
                    }
                }
            }
        `, ...endPt,
        variables: {
            gig: gig,
            song: song,
            drumkit: drumkit,
            key: key
        }
    });

    assert(response);
    return response.data.insert_performance.returning[0].id;
}

/*
 * Initial setup
 */
async function setup() {
    neon = await findOrCreateAdmin();
    leadbone = await findOrCreateLeadbone();
    await userInBand(neon, leadbone);
}

/*
 * Process one song
 */
async function processSong(record) {
    let gig = await findOrCreateGig(record.played);
    let song = await findOrCreateSong(record.title, record.recordings);
    let perf = await createPerformance(gig, song, record.drumkit, record.key);

    return JSON.stringify(record) + '\n';
}

/*
 * Main
 */
async function main() {
    try {
        await setup();

        /* Sync */
        for(i in records)
          console.log(await processSong(records[i]));

        /* Async
        input.pipe(parser).pipe(transformer).pipe(process.stdout);
        */
    } catch(error) { console.log("Caught: "); console.error(error) };
}

// Do it
main();
