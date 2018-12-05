/*
 * Load a CSV file and issue mutations to populate the gig database.
 * Assumes the user 'neon@leadbone.com' has been created already via:
 *  mutation {
 *     signupUser(email: "neon@leadbone.com", password: "PASSWORD") {
 *      id
 *      token
 *   }
}
 */
const adminEmail = 'neon@leadbone.com';
const endpoint = 'http://localhost:60000/simple/v1/cjlo2cc8w005x0143751f0k8q';

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
 * Return id of neon
 */
async function findNeon() {
    let response = await query({
        query: `
            query {
                User(email: "neon@leadbone.com") {
                    id
                }
            }
        `,
        endpoint: endpoint,
    });

    return response.data.User.id;
}

/*
 * Find or create the band Leadbone
 */
async function findOrCreateLeadbone(admin) {
    let response = await query({
        query: `
            query {
                Band(name: "Leadbone") {
                    id
                }
            }
        `,
        endpoint: endpoint
    });

    if(response.data.Band)
        return response.data.Band.id;

    // Create it
    response = await query({
        query: `
            mutation CreateBand($adminId: ID!) {
                createBand(
                    editableByOthers: false,
                    viewableByOthers: true,
                    name: "Leadbone",
                    adminId: $adminId
                ) {
                    id
                }
            }
        `,
        endpoint: endpoint,
        variables: {
            adminId: admin
        }
    });

    return response.data.createBand.id;
}

/*
 * Find or create the a tag class
 */
async function findOrCreateTagClass(name) {
    let response = await query({
        query: `
            query FindTagClass($name: String!) {
                TagClass(name: $name) {
                    id
                }
            }
        `,
        endpoint: endpoint,
        variables: {
            name: name
        }
    });

    if(response.data.TagClass)
        return response.data.TagClass.id;

    // Create it
    response = await query({
        query: `
            mutation CreateTagClass($name: String!) {
                createTagClass(
                    name: $name
                    valueType: TEXT
                ) {
                    id
                }
            }
        `,
        endpoint: endpoint,
        variables: {
            name: name
        }
    });

    return response.data.createTagClass.id;
}

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
 * Find or create a gig with the given date at 7pm at Leadbone Studios
 */
async function findOrCreateGig(date) {
    let dt = fixDate(date);

    let response = await query({
        query: `
            query FindGig($date: DateTime!) {
                allGigs(filter: {
                    date: $date
                }) {
                    id
                }
            }
        `,
        endpoint: endpoint,
        variables: {
            date: dt
        }
    });

    if(response.data.allGigs.length > 0)
        return response.data.allGigs[0].id;

    // Create it
    response = await query({
        query: `
            mutation CreateGig($date: DateTime!, $band: ID!) {
                createGig(
                    date: $date
                    recorded: true
                    venue: "Leadbone Studios",
                    bandId: $band
                ) {
                    id
                }
            }
        `,
        endpoint: endpoint,
        variables: {
            date: dt,
            band: leadbone
        }
    });

    return response.data.createGig.id;
}

/*
 * Find or create a song with the given title. If creating it, the
 * number of recordings will be provided (that - 1 is the prehistory).
 */
async function findOrCreateSong(title, recordings) {
    let prehistory = recordings ? recordings - 1 : 0;

    let response = await query({
        query: `
            query FindSong($title: String!) {
                allSongs(filter: {
                    name: $title
                }) {
                    id
                }
            }
        `,
        endpoint: endpoint,
        variables: {
            title: title
        }
    });

    if(response.data.allSongs.length > 0)
        return response.data.allSongs[0].id;

    // Create it
    response = await query({
        query: `
            mutation CreateSong($title: String!, $prehistory: Int!) {
                createSong(
                    name: $title
                    prehistory: $prehistory
                ) {
                    id
                }
            }
        `,
        endpoint: endpoint,
        variables: {
            title: title,
            prehistory: prehistory
        }
    });

    return response.data.createSong.id;
}

/*
 * Create a tag of the given class and value and return its id
 */
async function createTag(tagClass, value) {
    response = await query({
        query: `
            mutation CreateTag($tagClass: ID!, $value: String!) {
                createTag(
                    tagClassId: $tagClass
                    value: $value
                ) {
                    id
                }
            }
        `,
        endpoint: endpoint,
        variables: {
            tagClass: tagClass,
            value: value
        }
    });

    return response.data.createTag.id;
}

/*
 * Create a performance
 */
async function createPerformance(gig, song, dtag, ktag) {
    response = await query({
        query: `
            mutation CreatePerformance($gig: ID!, $song: ID!) {
                createPerformance(
                    songId: $song
                    gigId: $gig
                ) {
                    id
                }
            }
        `,
        endpoint: endpoint,
        variables: {
            gig: gig,
            song: song
        }
    });

    let perf = response.data.createPerformance.id;

    let addTagQ = {
        query: `
            mutation AddTag($perf: ID!, $tag: ID!) {
                addToPerformanceTags(
                    performancesPerformanceId: $perf
                    tagsTagId: $tag
                ) {
                    tagsTag {
                        id
                    }
                }
            }
        `,
        endpoint: endpoint,
        variables: {
            perf: perf,
            tag: dtag
        }
    };

    response = await query(addTagQ);

    addTagQ.variables.tag = ktag;
    response = await query(addTagQ);

    return perf;
}

/*
 * Initial setup
 */
async function setup() {
    neon = await findNeon();
    leadbone = await findOrCreateLeadbone(neon);
    drumkit = await findOrCreateTagClass('DrumKit');
    console.log(drumkit);
    key = await findOrCreateTagClass('Key');
    console.log(key);
}

/*
 * Process one song
 */
async function processSong(record) {
    let gig = await findOrCreateGig(record.played);
    let song = await findOrCreateSong(record.title, record.recordings);

    let dtag = await createTag(drumkit, record.drumkit);
    let ktag = await createTag(key, record.key);
    let perf = await createPerformance(gig, song, dtag, ktag);
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
    } catch(error) { console.error(error) };
}

// Do it
main();
