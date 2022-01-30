# md2carddav

Syncing between markdown + yaml frontmatter and CardDAV

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

## Features

- Fetch all VCards from a CardDAV server and save to disk locally
  - Versioning that folder with git is a great idea!
- Delete all VCards from a given address book on a CardDAV server
  - Currently (v0.1.0) there is no sync functionality, it's only 1 way, the vision is that the markdown files are the "master copy" or "source of truth", deleting from the CardDAV server may be required periodically to clean up data removed from markdown as there is currently (v0.1.0) no deleting of missing data.
- Import a folder of VCards into correctly formatted markdown files
  - Primary target is dendron compatibility, but these are just plain markdown files so any markdown editor / digital garden / second brain system should hopefully be compatible
- Given a folder of markdown contact files, push each one to a CardDAV server
  - Currently (v.0.1.0) the deduplication checking is extremely basic
  - All records are matched by the `uid` field only