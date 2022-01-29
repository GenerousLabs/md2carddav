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
