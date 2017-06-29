Salt-n-Peppa
========

> A Node.js push notifications server for the open web

this is a express.js based project that currently uses MongoDb for the datastore. Currently this project only supports Firebase Cloud Service (previously Google Cloud Service). 

## Installation

after cloning this repository run install the dependencies 

```shell
 $ npm install
```

## Prerequisites
- MongoDb Installation
- SSL Certificate
- FireBase Cloud Messaging API Key

## Configuration

Create a javascript file named `development.js` and save it to `config/env/`

```js
module.exports = {
    appPort: 8443,
    db: 'mongodb://username:password@localhost/database',
    sslKey: '/path/to/server.key',
    sslCert: '/path/to/server.crt',
    sslCA: '/path/to/server.csr',
    sessionSecret: '<SecretSessionPath>',
    gcmAPI: '<ChangeMe>'
};
```

## Start Server
  
```shell
$ node server.js
```

## Getting Started
Once the service is up and running the administration can be reached at `https://localhost:8443/dashboard` and the subscription demo can be reached at `https://localhost:8443`.
