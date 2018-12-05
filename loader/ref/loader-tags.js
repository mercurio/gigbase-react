/*
 * Load a CSV file and issue mutations to populate the gig database.
 * It starts by creating the user adminEmail.
 *
 * This is the Hasura/Heroku version.
 * This version includes tags, tagclasses, and tagtypes: support for
 * an over-engineered tagging mechanism. Since adding tags would require
 * modifications to the UI anyway, it was decided that making tags
 * explicit columns of performance made more sense.
 */
require('dotenv').config();
const assert = require('assert');

const adminEmail = 'neon@leadbone.com';
const endPt = {
    endpoint: process.env.GB_ENDPOINT,
    headers: {
        'content-type': 'application/json',
        'x-hasura-access-key': process.env.GB_KEY
    }
};

const { query } = require('graphqurl');
const fs = require('fs');
const parse = require('csv-parse');
const transform = require('stream-transform');

var input = fs.createReadStream('songs.csv');
var parser = parse({delimiter: ',', columns: true});

var transformer = transform(async function(record, callback) {
    callback(null, await processSong(record));
});

// Globals
var neon, leadbone, drumkit, key;

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
                    user_id
                }
            }
        `, ...endPt,
    });

    assert(response);
    if(response.data.user.length)
        return response.data.user[0].user_id;

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
                        user_id
                    }
                }
            }
        `, ...endPt,
        variables: {
            email: adminEmail
        }
    });

    assert(response);
    return response.data.insert_user.returning[0].user_id;
}

/*
 * Find or create the band Leadbone
 */
async function findOrCreateLeadbone() {
    let response = await query({
        query: `
            query {
                band(where: {name: {_eq: "Leadbone"}}) {
                    band_id
                }
            }
        `, ...endPt,
    });

    assert(response);
    if(response.data.band.length)
        return response.data.band[0].band_id;

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
                        band_id
                    }
                }
            }
        `, ...endPt,
    });

    assert(response);
    return response.data.insert_band.returning[0].band_id;
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
 * Find or create a tag class
 */
async function findOrCreateTagClass(name) {
    let response = await query({
        query: `
            query tagclass($name: String!) {
                tagclass(where: {name: {_eq: $name}}) {
                    tagclass_id
                }
            }
        `, ...endPt,
        variables: {
            name: name
        }
    });

    assert(response);
    if(response.data.tagclass.length)
        return response.data.tagclass[0].tagclass_id;

    // Create it
    response = await query({
        query: `
            mutation insert_tagclass($name: String!) {
                insert_tagclass(objects: [
                    {
                        name: $name,
                        valueType: "TEXT"
                    }
                ]) {
                    returning {
                        tagclass_id
                    }
                }
            }
        `, ...endPt,
        variables: {
            name: name
        }
    });

    assert(response);
    return response.data.insert_tagclass.returning[0].tagclass_id;
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
                    gig_id
                }
            }
        `, ...endPt,
        variables: {
            date: dt
        }
    });

    assert(response);
    if(response.data.gig.length)
        return response.data.gig[0].gig_id;

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
                        gig_id
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
    return response.data.insert_gig.returning[0].gig_id;
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
                    song_id
                }
            }
        `, ...endPt,
        variables: {
            title: title
        }
    });

    assert(response);
    if(response.data.song.length)
        return response.data.song[0].song_id;

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
                        song_id
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
    return response.data.insert_song.returning[0].song_id;
}

/*
 * Create a performance of a particular song at a particular gig
 */
async function createPerformance(gig, song) {

    response = await query({
        query: `
            mutation insert_performance($gig: uuid!, $song: uuid!) {
                insert_performance(objects: [
                    {
                        song: $song,
                        gig: $gig
                    }
                ]) {
                    returning {
                        performance_id
                    }
                }
            }
        `, ...endPt,
        variables: {
            gig: gig,
            song: song
        }
    });

    assert(response);
    return response.data.insert_performance.returning[0].performance_id;
}

/*
 * Create a tag on a performance of the given class and value and return its id
 */
async function createTag(perf, tagClass, value) {
    response = await query({
        query: `
            mutation insert_tag($perf: uuid!, $tagClass: uuid!, $value: String!) {
                insert_tag(objects: [
                    {
                        performance: $perf,
                        tagclass: $tagClass,
                        value: $value
                    }
                ]) {
                    returning {
                        tag_id
                    }
                }
            }
        `, ...endPt,
        variables: {
            perf: perf,
            tagClass: tagClass,
            value: value
        }
    });

    assert(response);
    return response.data.insert_tag.returning[0].tag_id;
}

/*
 * Initial setup
 */
async function setup() {
    neon = await findOrCreateAdmin();
    leadbone = await findOrCreateLeadbone();
    await userInBand(neon, leadbone);

    drumkit = await findOrCreateTagClass('DrumKit');
    key = await findOrCreateTagClass('Key');
}

/*
 * Process one song
 */
async function processSong(record) {
    let gig = await findOrCreateGig(record.played);
    let song = await findOrCreateSong(record.title, record.recordings);

    let perf = await createPerformance(gig, song);
    let dtag = await createTag(perf, drumkit, record.drumkit);
    let ktag = await createTag(perf, key, record.key);
    console.log(perf);

    return JSON.stringify(record) + '\n';
}

/*
 * Main
 */
async function main() {
    try {
        await setup();
        input.pipe(parser).pipe(transformer).pipe(process.stdout);
    } catch(error) { console.log("Caught: "); console.error(error) };
}

// Do it
main();
