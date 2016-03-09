'use strict';

var Read = require('./lib/read');
var Write = require('./lib/write');
var Optimizer = require('./lib/optimize');
var config = require('./lib/config');

function SplunkAdapter(cfg) {
    config.set(cfg);

    return {
        name: 'splunk',
        read: Read,
        write: Write,
        optimizer: Optimizer
    };
}

module.exports = SplunkAdapter;
