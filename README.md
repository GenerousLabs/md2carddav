# md2carddav

Syncing between markdown + yaml frontmatter and CardDAV

## Intro

This is a console application (cli) written with [oclif](oclif.io/). The code is
an early release, is written for personal use by the author(s) and comes with no
warranty. It may or may not be useful to you.

The general idea is to manage contacts in markdown with yaml frontmatter, and to
synchronise from this markdown data into a CardDAV server.

Currently (v0.1.0) the code can fetch all contacts from the CardDAV server,
convert those VCF contacts into markdown, and can do a one-way push from
markdown to a CardDAV server. It's recommended to delete all contacts from the
CardDAV server periodically and then sync again. The code does not push any
deletions to the CardDAV server except during a wipe operation.

See the `cli/` directory for instructions on usage. Currently (v0.1.0) the
package is not published anywhere (npm, etc), and binaries are not available on
GitHub. If anybody actually ever uses the code, such things may happen.

If you want to self host, [xandikos](https://xandikos.org) is a CardDAV server
which uses a git repo for its data store.

## Why

- My data, my rules, under my control.
- Everything in plain text files (optionally tracked in git).
- Longevity
  - You will almost certainly be able to read markdown / yaml files in 50 years.
- Accessibility / auditability
  - You can use any tools you want (git is a great one) to track changes to
  plain text files over time.
- Including contacts inside a digital garden allows for:
  - Notes related to people
  - Tasks in relation to contacts

## Features

- Fetch all VCards from a CardDAV server and save to disk locally
  - Versioning that folder with git is a great idea!
- Delete all VCards from a given address book on a CardDAV server
  - Currently (v0.1.0) there is no sync functionality, it's only 1 way, the
  vision is that the markdown files are the "master copy" or "source of truth",
  deleting from the CardDAV server may be required periodically to clean up data
  removed from markdown as there is currently (v0.1.0) no deleting of missing
  data.
- Import a folder of VCards into correctly formatted markdown files
  - Primary target is dendron compatibility, but these are just plain markdown
  files so any markdown editor / digital garden / second brain system should
  hopefully be compatible
- Given a folder of markdown contact files, push each one to a CardDAV server
  - Currently (v.0.1.0) the deduplication checking is extremely basic
  - All records are matched by the `uid` field only

## Getting started

### Contacts

You'll need some contacts in markdown + frontmatter. See the schema at
`cli/src/shared.schemas.ts`.

A limited example is:

```markdown
---
id: randomString
uid: randomString
title: Full Name
name:
  first: Full
  last: Name
nickname: Nicki
photo: relative/path/to/photo.jpg
phones:
  - type: cell
    phone: +1 234 567 8901
emails:
  - fullname@domain.tld
urls:
  - type: home
    url: https://domain.tld
addresses:
  - type: home
    line1: 1 Street Name
    line2: c/o Another Name
    city: Somewhere
    postcode: 12345
    country: A Country
desc: A note about the contact
```

It should be pretty self explanatory except for the `title` and `desc` fields
which map to the "Full name" and "Notes" fields respectively on the CardDAV
side. This is for [dendron](https://dendron.so) et al compatibility. The
`phones`, `emails`, and `urls` all support either a `type` and field map
(object) or a single string.

### Code

Currently (v0.1.0) there's no releases (yet). To use this, you'll need to clone
this repo, install dependencies, and then build the cli.

Requirements

- node (v16)
- yarn

Instructions

- Clone this repo
- Run `yarn` in the `cli/` directory
- Run `yarn build` to build
- Run `yarn link` to make the `md2carddav` command available in your path

You'll need to create a config file called `.md2carddavrc.json` in the current
working directory where ou run the program.

### Config

Here's an example config file (as of v0.1.0). But for the most up to date config
spec, see the `cli/src/shared.config.ts` file for the config schema.

```json
{
  "carddav": {
    "url": "https://domain.tld/",
    "credentials": {
      "username": "",
      "password": ""
    },
    "syncAddressBookDisplayName": ""
  },
  "md": {
    "directory": "/absolute/path/to/md/",
    "fileFilter": ["*.contact.md"],
    "photosDirectory": "assets"
  }
}
```

Here's an example config for a Google server (untested).

```json
{
  "carddav": {
    "url": "https://apidata.googleusercontent.com/carddav/v2/",
    "credentials": {
      "tokenUrl": "https://accounts.google.com/o/oauth2/token",
      "username": "user@gmail.com",
      "refreshToken": "YOUR_REFRESH_TOKEN_WITH_CALDAV_PERMISSION",
      "clientId": "YOUR_CLIENT_ID",
      "clientSecret": "YOUR_CLIENT_SECRET"
    },
    "syncAddressBookDisplayName": "addressbook"
  },
  "md": {
    "directory": "/Users/chm/tmp/md2carddav/md/",
    "fileFilter": ["*.contact.md"],
    "photosDirectory": "assets"
  }
}
```

For details on how to figure out what all those tokens are and where to get
them, try the [tsdav GitHub](https://github.com/natelindev/tsdav) and docs. This
program uses tsdav internally, and those options in the config file are passed
directly to the `DAVClient`.

## Limitations

- Currently (v.0.1.0) the code only supports username & password authentication
for CardDAV servers. It uses [tsdav](https://github.com/natelindev/tsdav) which
supports other methods, but they have not (yet) been implemented.
