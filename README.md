# Goats

A CLI tool for managing multi repos in [Rush](http://aka.ms/rush).

The tool assumes that you already have configured your *rush.json* file.

## Installation

`
$ npm install goats -g
`

## Usage

In order to download all your repositories defined in Rush you will need to issue the *init* command and provide a base repository uri. Goat will create all the folders needed and clone the corresponding repositories. If a folder is already present goat will skip it.

`
$ goats init [repository]
`

If you want to `git pull` from all your repositories just issue a pull command in goat, which will scan all  of your repositories and perform a pull.

`
$ goats pull
`

## Roadmap

* Implement add and remove commands
* Create changelogs on demand
* Bump a new version for all the repos
* ...

## License

Copyright 2017 Tierra SpA

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

[http://www.apache.org/licenses/LICENSE-2.0](http://www.apache.org/licenses/LICENSE-2.0)

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.