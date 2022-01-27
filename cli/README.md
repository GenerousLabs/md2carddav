oclif-hello-world
=================

oclif example Hello World CLI

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/oclif-hello-world.svg)](https://npmjs.org/package/oclif-hello-world)
[![CircleCI](https://circleci.com/gh/oclif/hello-world/tree/main.svg?style=shield)](https://circleci.com/gh/oclif/hello-world/tree/main)
[![Downloads/week](https://img.shields.io/npm/dw/oclif-hello-world.svg)](https://npmjs.org/package/oclif-hello-world)
[![License](https://img.shields.io/npm/l/oclif-hello-world.svg)](https://github.com/oclif/hello-world/blob/main/package.json)

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
md2carddav/0.0.0 darwin-x64 node-v17.3.1
$ md2carddav --help [COMMAND]
USAGE
  $ md2carddav COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`md2carddav hello PERSON`](#md2carddav-hello-person)
* [`md2carddav hello world`](#md2carddav-hello-world)
* [`md2carddav help [COMMAND]`](#md2carddav-help-command)
* [`md2carddav plugins`](#md2carddav-plugins)
* [`md2carddav plugins:inspect PLUGIN...`](#md2carddav-pluginsinspect-plugin)
* [`md2carddav plugins:install PLUGIN...`](#md2carddav-pluginsinstall-plugin)
* [`md2carddav plugins:link PLUGIN`](#md2carddav-pluginslink-plugin)
* [`md2carddav plugins:uninstall PLUGIN...`](#md2carddav-pluginsuninstall-plugin)
* [`md2carddav plugins update`](#md2carddav-plugins-update)

## `md2carddav hello PERSON`

Say hello

```
USAGE
  $ md2carddav hello [PERSON] -f <value>

ARGUMENTS
  PERSON  Person to say hello to

FLAGS
  -f, --from=<value>  (required) Whom is saying hello

DESCRIPTION
  Say hello

EXAMPLES
  $ oex hello friend --from oclif
  hello friend from oclif! (./src/commands/hello/index.ts)
```

_See code: [dist/commands/hello/index.ts](https://github.com/GenerousLabs/md2carddav/blob/v0.0.0/dist/commands/hello/index.ts)_

## `md2carddav hello world`

Say hello world

```
USAGE
  $ md2carddav hello world

DESCRIPTION
  Say hello world

EXAMPLES
  $ oex hello world
  hello world! (./src/commands/hello/world.ts)
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
<!-- commandsstop -->
