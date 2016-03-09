'use strict';

/* global JuttleAdapterAPI */
var JuttleMoment = JuttleAdapterAPI.types.JuttleMoment;
var AdapterRead = JuttleAdapterAPI.AdapterRead;
var Config = require('./config');
var QueryBuilder = require('./query');

var splunkjs = require('splunk-sdk');
var url = require('url');
var _ = require('underscore');

class ReadSplunk extends AdapterRead {
   constructor(options, params) {
        super(options, params);

        var config = Config.get();

        this.filter = params.filter_ast;
        this.queryBuilder = new QueryBuilder();

        // FIXME: get & parse an url from the config
        this.splunk = new splunkjs.Service({
            scheme: config.scheme,
            host: config.host,
            port: config.port,
            username: config.username,
            password: config.password
        });

        if (!this.options.from && !this.options.to) {
            throw this.compileError('MISSING-TIME-RANGE');
        }

        this.from = this.options.from || params.now;
        this.to = this.options.to || params.now;

        this.fields = this.options.fields || null;
        this.optimizations = params.optimization_info;
    }

    static allowedOptions() {
        return AdapterRead.commonOptions().concat(['fields']);
    }

    defaultTimeOptions() {
        return {
            from: this.from,
            to: this.to
        };
    }

    periodicLiveRead() {
        return true;
    }

    read(from, to, limit, state) {
        var self = this;

        var query = this.queryBuilder.build(this.filter, { fields: this.fields, optimizations: this.optimizations });
        var options = { earliest_time: from.unix(), latest_time: to.unix(), count: limit };

        // FIXME: KISS, use oneshot searches
        return this.login()
        .then(function() {
            return self.search(query, options);
        }).catch(function(e) {
            throw new Error(e);
        }).then(function(results) {
            return {
                points: self.toNative(results),
                readEnd: to || new JuttleMoment(Infinity)
            };
        });
    }

    toNative(results) {
        var fields = results.fields;
        return _.map(results.rows, function(row) {
            var obj = _.object(fields, row);
            if (obj._time) {
                obj.time = JuttleMoment.parse(obj._time);
            }
            return obj;
        });
    }

    search(query, options) {
        var self = this;
        return new Promise(function(resolve, reject) {
            return self.splunk.oneshotSearch(query, options, function(error, results) {
                if (error) {
                    reject(error);
                } else {
                    resolve(results);
                }
            });
        });
    }

    // XXX/bkutil: do not run login on each request?
    login() {
        var self = this;
        return new Promise(function(resolve, reject) {
            return self.splunk.login(function(error, success) {
                if (error || !success) {
                    reject(error);
                } else {
                    resolve(success);
                }
            });
        });
    }
}

module.exports = ReadSplunk;
