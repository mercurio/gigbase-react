-- Additional views pasted into the Hasura console
--

-- Create a function that always returns the first non-NULL item
CREATE OR REPLACE FUNCTION public.first_agg ( anyelement, anyelement )
RETURNS anyelement LANGUAGE SQL IMMUTABLE STRICT AS $$
        SELECT $1;
$$;

-- And then wrap an aggregate around it
CREATE AGGREGATE public.FIRST (
        sfunc    = public.first_agg,
        basetype = anyelement,
        stype    = anyelement
);


-- A list of all songs and their performance counts, including
-- those with 0 performances
--
CREATE OR REPLACE VIEW song_recordings AS
SELECT DISTINCT ON (song.id)
  song.id AS song_id,
  song.title,
  song.artist,
  song.prehistory + COUNT(performance.id) AS recordings
FROM (song LEFT JOIN performance ON performance.song = song.id)
GROUP BY song.id
ORDER BY song.id;

-- All performances for a song
--
CREATE OR REPLACE VIEW song_performances AS
SELECT
    song.id AS song_id,
    song.title,
    song.artist,
    performance.id AS performance_id,
    performance.serial,
    performance.stars,
    performance.songkey,
    performance.drumkit,
    gig.id AS gig_id,
    gig.venue,
    gig.date,
    gig.recorded,
    gig.band
FROM song, performance, gig
WHERE  performance.song = song.id  AND performance.gig = gig.id
ORDER BY song.title, gig.date DESC;

-- The latest performance for each song
--  This works because song_performances is sorted in descending order.
--  latest could be found using first instead of max.
--
CREATE OR REPLACE VIEW "public"."song_latest_performance" AS
 SELECT song_performances.song_id,
    first(song_performances.title) AS title,
    first(song_performances.artist) AS artist,
    first(song_performances.serial) AS serial,
    first(song_performances.songkey) AS songkey,
    first(song_performances.stars) AS stars,
    first(song_performances.drumkit) AS drumkit,
    first(song_performances.venue) AS venue,
    first(song_performances.recorded) AS recorded,
    first(song_performances.performance_id) AS performance_id,
    max(song_performances.date) AS latest
   FROM song_performances
  GROUP BY song_performances.song_id;


-- The view shown in the song list, containing the counts and latest performance info
--
CREATE OR REPLACE VIEW "public"."most_recent_performance" AS
 SELECT
    song_recordings.song_id,
    song_recordings.artist,
    song_recordings.title,
    song_recordings.recordings,
    song_latest_performance.serial,
    song_latest_performance.stars,
    song_latest_performance.drumkit,
    song_latest_performance.songkey,
    song_latest_performance.latest AS date,
    song_latest_performance.performance_id
   FROM (song_recordings
     LEFT JOIN song_latest_performance ON ((song_latest_performance.song_id = song_recordings.song_id)))
  ORDER BY song_recordings.title;
