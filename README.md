# modit
[![NPM version](https://img.shields.io/npm/v/modit.svg?style=flat)](https://www.npmjs.org/package/modit)

a tool for init a new node module

## Feature

* generate basic files for a node module.
    * `.editorconfig`
    * `.gitignore`
    * `.jshintrc`
    * `.npmignore`
    * `.travis.yml`
    * `Makefile`
    * `package.json`
    * `README.md`
    * `LICENSE`(if you selected one) 
* insert some basic value into `package.json`, `README.md`
* generate a LICENSE file as the type you choose
 

## Installation

```bash
$ npm install -g modit
```

## Usage

```sh
$ modit path/to/new_module
```
this command will create a new node module called `new_module` in `path/to`.

## License

MIT © [Leigh Zhu](http://zhu.li)
