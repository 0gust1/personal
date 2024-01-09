---
title: 'How to use SQLite (+ Prisma + nodeJS) app on Azure app service'
description: 'Tips and tricks to use SQLite on Azure app service - YMMV'
date: '2022-10-24'
tags: ['Azure', 'cloud', 'infra', 'SQLite', 'nodeJS', 'prisma']
published: true
---

Original post: https://gist.github.com/0gust1/19ff169231f84d70939943eaf781420e

**Context**

- You want to run an app on Azure appService linux (here a nodeJS app) with a simple SQLite database (on which you want to perform reads and writes).
- You have read https://www.sqlite.org/whentouse.html and your app requirements are simple enough (no big concurrency, no horizontal scaling) to consider SQLite, and you don't need/want yet more sophisticated solutions like PostgreSQL.
- You use a NodeJS based app with the [Prisma ORM](https://www.prisma.io).

**disclaimer:**

- The tips explained here can apply also to non-nodeJS apps on azure AppService. Pick and choose the relevant tips.
- There is no guarantees to those tips, use them wisely.

## TLDR;

- use `PRAGMA journal_mode=WAL;` on the SQLite database.
- be sure that only one client (app instance) will use the database
- in some cases, you won't be able to call the prisma CLI directly (e.g. `prisma migrate deploy`), and you will have to do `node node_modules/prisma/build/index.js migrate deploy` instead
- run the database migrations outside of `/home` and copy back the database file **and** the wal file

## Problem 1 – SQLite and Azure AppService

Please note that SQLite use on AppService seems to be offically discouraged by Microsoft Support ([ref1](https://learn.microsoft.com/en-us/answers/questions/346794/how-to-update-or-insert-sqlite-database-in-web-app.html), [ref2](https://learn.microsoft.com/en-us/azure/app-service/configure-connect-to-azure-storage?tabs=portal&pivots=container-linux#best-practices)).

That's because of the architecture of Azure AppService:

- AppService is horizontally scalable
- when scaled out, the different instances of the app share the same app filesystem using SMB/CIFS network share...  
  ...And SQLite doesn't like this (because its db locking mechanisms rely on the filesystem locking mechanism, and those are kind of broken on networked filesystems). See https://www.sqlite.org/whentouse.htm ("Situations Where A Client/Server RDBMS May Work Better" section).

### Solution

:arrow_right: **Activate WAL journal mode on your database**  
put this at the top of your first Prisma-generated migration file (default location: `prisma/migrations`)

```sql
-- set up the DB in WAL journal mode
PRAGMA journal_mode=WAL;
```

You can also do this on a local database by running: `sqlite3 <PATH_TO_SQLITE_DB_FILE> 'PRAGMA journal_mode=wal;'`

### Caveats:

:warning: You must be sure that only one "client" (application) will access the DB at the same time.

## Problem 2 – Prisma and zip-deploy on AzureAppService, running migrations

### Prisma CLI is broken on the AppService

One of the simplest deployment on Azure AppService is "zip deploy" (which itself comes in different flavors):

- you build locally
- you zip everything important in an archive
- you send this archive to Azure, for the target appService instance

**The problem is:** when doing this: the Azure deployment engine (Kudu/Oryx) **breaks the symlinks which reside in `node_modules/.bin`**, rendering the prisma CLI unusable.

You must also take care that the zip artefact you upload has the right prisma binaries for the AppService environment.

### Solution

see the `azure_database_migrate.sh` file below for a contextual example.

:arrow_right: **Use direct paths when calling prisma on Azure**  
i.e., use `node node_modules/prisma/build/index.js migrate deploy` instead of `prisma migrate deploy`

It seems there is also [an (undocumented) ENV var that could help](https://github.com/projectkudu/kudu/issues/2946#issuecomment-1219165432): `WEBSITE_ZIP_PRESERVE_SYMLINKS`. I didn't test it, but could work.

:arrow_right: **Don't forget to configure prisma the right way**  
you should have something like that in your `schema.prisma` file:

```
generator client {
  provider = "prisma-client-js"

  // prisma engines:
  // "native is for local dev
  // "debian-openssl-1.1.x" is for Azure
  binaryTargets = ["native", "debian-openssl-1.1.x"]
}

datasource db {
  provider = "sqlite"
  url      = env("APPLICATION_DATABASE_URL")
}
```

### "Database is locked" message when running migrations

For the same reason as "Problem 1" above, the `/home` directory (where your app lives) is a SMB/CIFS drive, and it seems that the `prisma migrate deploy` command provokes locking on the database file.

### Solution

:arrow_right: Before app start, move the db file outside of `/home`, run the migrations on it, and move it back to its original place.

You can use a simple shell script for this, that you can launch before app start using the `prestart` npm script.

```json
{
	"scripts": {
		"prestart": "sh azure_database_migrate.sh",
		"start": "node node-dist/index.js"
	}
}
```

see the `azure_database_migrate.sh` file example below.

```sh
#!/usr/bin/env bash

printf "######### Migrating application database - start\n"
rm -rf /migration
mkdir -p /migration
# move the sqlite files *if it exists*
[ -f local_data/application.sqlite ] && mv local_data/application.sqlite /migration/temp.sqlite
[ -f local_data/application.sqlite-wal ] && mv local_data/application.sqlite-wal /migration/temp.sqlite-wal

# here, we have to call the prisma command directly (Azure zip deployment destroys the symlinks in node_modules/.bin )
APPLICATION_DATABASE_URL="file:/migration/temp.sqlite" node node_modules/prisma/build/index.js migrate deploy && \

cp /migration/temp.sqlite local_data/application.sqlite && \
cp /migration/temp.sqlite-wal local_data/application.sqlite-wal && \

printf "######### Migrating application database - cleanup\n" && \
rm -rf /migration
```
