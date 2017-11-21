# TWELITE SDK for JavaScript

[![Build Status](https://travis-ci.org/TatsuyaYamamoto/twelite-sdk-js.svg?branch=master)](https://travis-ci.org/TatsuyaYamamoto/twelite-sdk-js)

This project is UNOFFICIAL SDK of [TWELITE](https://mono-wireless.com/jp/products/TWE-LITE/index.html).

## What is TWELITE?
[https://mono-wireless.com/jp/index.html](https://mono-wireless.com/jp/index.html)

## Getting Started

### Install
```bash
$ npm install --save twelite-sdk
// or 
$ yarn add twelite-sdk
```

### Build
This SDK depends on [node-serialport](https://github.com/node-serialport/node-serialport). In some cases, the module requires a preparation to work well. See [serialport#installation-special-cases](https://www.npmjs.com/package/serialport#installation-special-cases)


### Usage


```js
import {Twelite, ChangeOutputCommand} from 'twelite-sdk';
// You can import with ES6 module style if you use anu bundler, TypeScript and so on.
// import {Twelite, ChangeOutputCommand} from 'twelite-sdk';

Twelite.list()
    .serialPorts(([port])=>{
        const twelite = new Twelite(port.comName);
        twelite.open()
            .then(()=>{
                const command = new ChangeOutputCommand();
                command.digital = [0, -1, -1, -1];
                twelite.write(command);
            })
    });

```
