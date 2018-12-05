Loader used to initialize the database from prehistoric data.

Not perfect, check the song titles using
```
select name from Song order by name;
```
in the database. If they're not all there, remove lines from
songs.csv and start where it left off. At the end it was still
necessary to diff the list of songs in the DB to those in 
songs.csv.sav, a few didn't make it. Might be a Graphcool problem.

This is v1 of the loader, corresponding to the types.graphql in this
directory. It turns out that graphcool/Prisma don't support orderBy
on related fields, and it's not clear that GraphQL in general does this.
So in v2 we'll add a date field to the Performance model.
