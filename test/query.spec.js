'use strict';

var expect = require('chai').expect;
var utils = require('./utils');
var _ = require('underscore');

var withAdapterAPI = require('juttle/test').utils.withAdapterAPI;

withAdapterAPI(() => {
    var QueryBuilder = require('../lib/query');
    /* global JuttleAdapterAPI */
    var JuttleMoment = JuttleAdapterAPI.types.JuttleMoment;
    var builder = new QueryBuilder();

    describe('splunk query building', () => {
        it('basic query', () => {
            var filter_ast = utils.parseFilter('index = "cpu"');
            expect(builder.build(filter_ast)).to.equal('search index = "cpu" | sort - Time');
        });

        it('implicit AND', () => {
            var filter_ast = utils.parseFilter('name = "cpu1" index="cpu"');
            expect(builder.build(filter_ast)).to.equal('search name = "cpu1" AND index = "cpu" | sort - Time');
        });

        it('OR', () => {
            var filter_ast = utils.parseFilter('name = "cpu1" or index="cpu"');
            expect(builder.build(filter_ast)).to.equal('search name = "cpu1" OR index = "cpu" | sort - Time');
        });

        it('nested binary expressions', () => {
            var filter_ast = utils.parseFilter('(name = "cpu1" or index="cpu") and host = "host1"');
            expect(builder.build(filter_ast)).to.equal('search (name = "cpu1" OR index = "cpu") AND host = "host1" | sort - Time');
        });

        it('missing index throws', () => {
            var filter_ast = utils.parseFilter('name = "cpu"');
            expect(builder.build.bind(builder, filter_ast)).to.throw(/Missing required field "index"/);
        });

        it('=~ throws', () => {
            var filter_ast = utils.parseFilter('name =~ "cpu"');
            expect(builder.build.bind(builder, filter_ast)).to.throw(/Operator =~ not supported/);
        });

        it('!~ throws', () => {
            var filter_ast = utils.parseFilter('name !~ "cpu"');
            expect(builder.build.bind(builder, filter_ast)).to.throw(/Operator !~ not supported/);
        });

        it('in throws', () => {
            var filter_ast = utils.parseFilter('name in ["cpu","memory"]');
            expect(builder.build.bind(builder, filter_ast)).to.throw(/Operator in not supported/);
        });

        describe('optimizations', () => {
            it('head', () => {
                var filter_ast = utils.parseFilter('index = "cpu"');
                var opt_info = { head: { limit: 10 } };
                expect(builder.build(filter_ast, { optimizations: opt_info })).to.equal('search index = "cpu" | sort - Time | head 10');
            });

            it('tail', () => {
                var filter_ast = utils.parseFilter('index = "cpu"');
                var opt_info = { tail: { limit: 10 } };
                expect(builder.build(filter_ast, { optimizations: opt_info })).to.equal('search index = "cpu" | sort - Time | tail 10');
            });
        });
    });
});
