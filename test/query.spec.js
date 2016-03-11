'use strict';

var expect = require('chai').expect;
var utils = require('./utils');

var withAdapterAPI = require('juttle/test').utils.withAdapterAPI;

withAdapterAPI(() => {
    var QueryBuilder = require('../lib/query');
    var builder = new QueryBuilder();

    describe('splunk query building', () => {
        it('basic query', () => {
            var filter_ast = utils.parseFilter('index = "cpu"');
            expect(builder.compile(filter_ast)).to.equal('search index = "cpu" | sort + _time');
        });

        it('implicit AND', () => {
            var filter_ast = utils.parseFilter('name = "cpu1" index="cpu"');
            expect(builder.compile(filter_ast)).to.equal('search name = "cpu1" AND index = "cpu" | sort + _time');
        });

        it('OR', () => {
            var filter_ast = utils.parseFilter('name = "cpu1" or index="cpu"');
            expect(builder.compile(filter_ast)).to.equal('search name = "cpu1" OR index = "cpu" | sort + _time');
        });

        it('nested binary expressions', () => {
            var filter_ast = utils.parseFilter('(name = "cpu1" or index="cpu") and host = "host1"');
            expect(builder.compile(filter_ast)).to.equal('search (name = "cpu1" OR index = "cpu") AND host = "host1" | sort + _time');
        });

        it('missing index throws', () => {
            var filter_ast = utils.parseFilter('name = "cpu"');
            expect(builder.compile.bind(builder, filter_ast)).to.throw(/Missing required field "index"/);
        });

        it('=~ throws', () => {
            var filter_ast = utils.parseFilter('name =~ "cpu"');
            expect(builder.compile.bind(builder, filter_ast)).to.throw(/Operator =~ not supported/);
        });

        it('!~ throws', () => {
            var filter_ast = utils.parseFilter('name !~ "cpu"');
            expect(builder.compile.bind(builder, filter_ast)).to.throw(/Operator !~ not supported/);
        });

        it('in throws', () => {
            var filter_ast = utils.parseFilter('name in ["cpu","memory"]');
            expect(builder.compile.bind(builder, filter_ast)).to.throw(/Operator in not supported/);
        });

        describe('full text search', () => {
            it('unquoted fts - implicit and', () => {
                var filter_ast = utils.parseFilter('index = "cpu" "one two three"');
                expect(builder.compile(filter_ast)).to.equal('search index = "cpu" AND one two three | sort + _time');
            });

            it('quoted fts - exact match', () => {
                var filter_ast = utils.parseFilter('index = "cpu" "\\"cpu1\\""');
                expect(builder.compile(filter_ast)).to.equal('search index = "cpu" AND "cpu1" | sort + _time');
            });
        });

        describe('optimizations', () => {
            it('head', () => {
                var filter_ast = utils.parseFilter('index = "cpu"');
                var opt_info = { head: { limit: 10 } };
                expect(builder.compile(filter_ast, { optimizations: opt_info })).to.equal('search index = "cpu" | sort + _time | head 10');
            });

            it('tail', () => {
                var filter_ast = utils.parseFilter('index = "cpu"');
                var opt_info = { tail: { limit: 10 } };
                expect(builder.compile(filter_ast, { optimizations: opt_info })).to.equal('search index = "cpu" | sort + _time | tail 10');
            });
        });
    });
});
