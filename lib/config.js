'use strict';

var _ = require('underscore');

var config = {};

module.exports = {
    set(cfg) {
        _.extend(config, cfg);
    },
    get() {
        return config;
    }
};
