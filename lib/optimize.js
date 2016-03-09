'use strict';

var optimizer = {
    optimize_head: function(read, head, graph, optimization_info) {
        var limit = graph.node_get_option(head, 'arg');

        optimization_info.head = { limit };

        return true;
    },
    optimize_tail: function(read, tail, graph, optimization_info) {
        var limit = graph.node_get_option(tail, 'arg');

        optimization_info.tail = { limit };

        return true;
    },
    optimize_reduce: function(read, reduce, graph, optimization_info) {
        return false;
    }
};

module.exports = optimizer;
