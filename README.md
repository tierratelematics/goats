# Goats

A CLI tool for managing multi repos in [Rush](http://aka.ms/rush).
Monorepos seems to be quite a convenient way of managing complex projects. Having everything on a single repository, however, might end up being as cumbersome as 
handling just one single repository. In addition to that many projects start with a modular approach therefore migrating to a single repository might be problematic,
especially with respect to repo merging and having to deal with external libraries which might need to be kept in sync regardless of the main repository.

Goats tries to solve these issues by bringing the best of the two worlds: a single code container split into multiple repositories. Most specifically Rush is used
as the main system for keeping all the elements up to date, and reducing the cross-dependency hell. Goats aims at reducing the stress from all those repetitive tasks
that multi repositories seems to suffer from, such as keeping in sync all the repositories, tracking dependencies and so on.

Bear in mind that this is obviously an experimental tool, therefore many things may change in the future.

## Prerequisites

The tool assumes that you already have configured your *rush.json* file, and that you already have installed both rush and git on your system.

## Installation

`
$ npm i -g goats
`

## Usage

In order to download all your repositories defined in Rush you will need to issue the *init* command and provide a base repository uri. Goat will create all the folders needed and clone the corresponding repositories. If a folder is already present goat will skip it.

`
$ goats init [repository]
`

If you want to `git pull` from all your repositories just issue a pull command in goat, which will scan all  of your repositories and perform a pull.

`
$ goats refresh
`

If you want to perform a checkout on a specific branch in all repositories you should issue

`
$ goats checkout [branch]
`

Last but not least, if you want to execute any command on any of your repositories (e.g. a gitflow start feature), you can use the conveniente run command

`
$ goat run [command] [arguments...]
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