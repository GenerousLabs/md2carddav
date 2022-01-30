md2carddav
=================

Syncing between markdown + yaml frontmatter and CardDAV

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/oclif-hello-world.svg)](https://npmjs.org/package/oclif-hello-world)
[![Downloads/week](https://img.shields.io/npm/dw/oclif-hello-world.svg)](https://npmjs.org/package/md2carddav/)
[![License](https://img.shields.io/npm/l/oclif-hello-world.svg)](https://github.com/GenerousLabs/md2carddav/blob/main/cli/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g md2carddav
$ md2carddav COMMAND
running command...
$ md2carddav (--version)
md2carddav/0.1.0 darwin-x64 node-v17.3.1
$ md2carddav --help [COMMAND]
USAGE
  $ md2carddav COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`md2carddav carddav fetch`](#md2carddav-carddav-fetch)
* [`md2carddav carddav list`](#md2carddav-carddav-list)
* [`md2carddav carddav wipe`](#md2carddav-carddav-wipe)
* [`md2carddav help [COMMAND]`](#md2carddav-help-command)
* [`md2carddav md import`](#md2carddav-md-import)
* [`md2carddav md push`](#md2carddav-md-push)
* [`md2carddav plugins`](#md2carddav-plugins)
* [`md2carddav plugins:inspect PLUGIN...`](#md2carddav-pluginsinspect-plugin)
* [`md2carddav plugins:install PLUGIN...`](#md2carddav-pluginsinstall-plugin)
* [`md2carddav plugins:link PLUGIN`](#md2carddav-pluginslink-plugin)
* [`md2carddav plugins:uninstall PLUGIN...`](#md2carddav-pluginsuninstall-plugin)
* [`md2carddav plugins update`](#md2carddav-plugins-update)
* [`md2carddav sync`](#md2carddav-sync)

## `md2carddav carddav fetch`

fetch vcf files from carddav server into a local directory

```
USAGE
  $ md2carddav carddav fetch -d <value>

FLAGS
  -d, --directory=<value>  (required) path to save VCF files

DESCRIPTION
  fetch vcf files from carddav server into a local directory

  fetch does the following:

  1 - Connects to your configured CardDAV server

  2 - Retrieves a list of address books on that server

  3 - Fetches every VCard in every address book

  4 - Saves them all into your target directory

  - In a folder with the address book display name (slugified)

  - In a file named UID.vcf where UID is the UID of the VCard

  For example addressbook/5182b11b-7ff4-511d-8d92-d45369ec1fac.vcf

  NOTE: This command does not remove any existing files, it is recommended to start with an empty directory.

EXAMPLES
  $ md2carddav carddav fetch

  fetch -d /path/to/put/vcf/files/
```

## `md2carddav carddav list`

List all address books on the configured CardDAV server

```
USAGE
  $ md2carddav carddav list

DESCRIPTION
  List all address books on the configured CardDAV server

EXAMPLES
  $ md2carddav carddav list
```

## `md2carddav carddav wipe`

delete every contact in an address book

```
USAGE
  $ md2carddav carddav wipe -a <value> [-f] [-v]

FLAGS
  -a, --address-book=<value>  (required) address book to wipe
  -f, --force
  -v, --verbose

DESCRIPTION
  delete every contact in an address book

  This command is extremely destructive, it will delete every contact in a given address book. It is highly recommended
  to run fetch first and take a backup.

  Why? This command can be useful if you want to delete all contacts and then push again from markdown. Otherwise
  contacts will never be deleted.

  Use the list command to list address books, each one must be wiped separately.

EXAMPLES
  $ md2carddav carddav wipe
```

## `md2carddav help [COMMAND]`

Display help for md2carddav.

```
USAGE
  $ md2carddav help [COMMAND] [-n]

ARGUMENTS
  COMMAND  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for md2carddav.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v5.1.10/src/commands/help.ts)_

## `md2carddav md import`

Import a directory of .vcf files into markdown

```
USAGE
  $ md2carddav md import -d <value> [-m] [-v]

FLAGS
  -d, --directory=<value>  (required) directory of .vcf files
  -m, --add-meta           Add id, created, updated metadata fields to all contacts.
  -v, --verbose            Output more detail as the program runs.

DESCRIPTION
  Import a directory of .vcf files into markdown

EXAMPLES
  $ md2carddav md import
```

## `md2carddav md push`

Push contacts from markdown to CardDAV

```
USAGE
  $ md2carddav md push [-v]

FLAGS
  -v, --verbose

DESCRIPTION
  Push contacts from markdown to CardDAV

  Load all contacts from markdown, load all contacts from CardDAV, find any which need created or update, and then
  create or update them on configured the CardDAV server

EXAMPLES
  $ md2carddav md push
```

## `md2carddav plugins`

List installed plugins.

```
USAGE
  $ md2carddav plugins [--core]

FLAGS
  --core  Show core plugins.

DESCRIPTION
  List installed plugins.

EXAMPLES
  $ md2carddav plugins
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v2.0.11/src/commands/plugins/index.ts)_

## `md2carddav plugins:inspect PLUGIN...`

Displays installation properties of a plugin.

```
USAGE
  $ md2carddav plugins:inspect PLUGIN...

ARGUMENTS
  PLUGIN  [default: .] Plugin to inspect.

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Displays installation properties of a plugin.

EXAMPLES
  $ md2carddav plugins:inspect myplugin
```

## `md2carddav plugins:install PLUGIN...`

Installs a plugin into the CLI.

```
USAGE
  $ md2carddav plugins:install PLUGIN...

ARGUMENTS
  PLUGIN  Plugin to install.

FLAGS
  -f, --force    Run yarn install with force flag.
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Installs a plugin into the CLI.

  Can be installed from npm or a git url.

  Installation of a user-installed plugin will override a core plugin.

  e.g. If you have a core plugin that has a 'hello' command, installing a user-installed plugin with a 'hello' command
  will override the core plugin implementation. This is useful if a user needs to update core plugin functionality in
  the CLI without the need to patch and update the whole CLI.

ALIASES
  $ md2carddav plugins add

EXAMPLES
  $ md2carddav plugins:install myplugin 

  $ md2carddav plugins:install https://github.com/someuser/someplugin

  $ md2carddav plugins:install someuser/someplugin
```

## `md2carddav plugins:link PLUGIN`

Links a plugin into the CLI for development.

```
USAGE
  $ md2carddav plugins:link PLUGIN

ARGUMENTS
  PATH  [default: .] path to plugin

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Links a plugin into the CLI for development.

  Installation of a linked plugin will override a user-installed or core plugin.

  e.g. If you have a user-installed or core plugin that has a 'hello' command, installing a linked plugin with a 'hello'
  command will override the user-installed or core plugin implementation. This is useful for development work.

EXAMPLES
  $ md2carddav plugins:link myplugin
```

## `md2carddav plugins:uninstall PLUGIN...`

Removes a plugin from the CLI.

```
USAGE
  $ md2carddav plugins:uninstall PLUGIN...

ARGUMENTS
  PLUGIN  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ md2carddav plugins unlink
  $ md2carddav plugins remove
```

## `md2carddav plugins update`

Update installed plugins.

```
USAGE
  $ md2carddav plugins update [-h] [-v]

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Update installed plugins.
```

## `md2carddav sync`

Sync from markdown to CardDAV

```
USAGE
  $ md2carddav sync -d <value> [-f]

FLAGS
  -d, --directory=<value>  (required) path to markdown files
  -f, --force

DESCRIPTION
  Sync from markdown to CardDAV

EXAMPLES
  $ md2carddav sync
```

_See code: [dist/commands/sync.ts](https://github.com/GenerousLabs/md2carddav/blob/v0.1.0/dist/commands/sync.ts)_
<!-- commandsstop -->
