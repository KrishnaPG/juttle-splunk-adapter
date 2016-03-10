'use strict';

/* global JuttleAdapterAPI */
var ASTVisitor = JuttleAdapterAPI.compiler.StaticFilterCompiler;

class Query extends ASTVisitor {
    constructor() {
        super();

        this.ops = {
            '==': '=',
            'AND': 'AND',
            'OR': 'OR',
            '!=': '!=',
            '<' : '<',
            '>' : '>',
            '>=' : '>=',
            '<=' : '<=',
            'NOT': 'NOT'
            //'=~' : '=~',
            //'!~' : '!~',
            //'IN': undefined,
        };
    }

    // XXX/bkutil: ensure index field is there
    compile(ast, opts) {
        var op, where;

        var options = opts || {};
        var fields = options.fields;
        var optimizations = options.optimizations || {};

        var params = { hasIndex: false};

        where = this.visit(ast, op, options, params);

        if (!params.hasIndex) {
            throw new Error('Missing required field "index"');
        }

        if (where === undefined) {
            return '';
        }

        where = `search ${String(where)}`;

        if (fields) {
            where = `${where} | fields ${fields}`;
        }

        where = `${where} | sort + _time`;

        if (optimizations.head) {
            where = `${where} | head ${optimizations.head.limit}`;
        }

        if (optimizations.tail) {
            where = `${where} | tail ${optimizations.tail.limit}`;
        }

        return where;
    }

    visitNumberLiteral(node, op, options, params) {
        return node.value;
    }

    visitNullLiteral(node, op, options, params) {
        return 'null';
    }

    visitVariable(node, op, options, params) {
        return `"${node.name}"`;
    }

    visitField(node, op, options, params) {
        if (node.name === 'index') { params.hasIndex = true; }

        return `${node.name}`;
    }

    visitBooleanLiteral(node, op, options, params) {
        return node.value;
    }

    visitFilterLiteral(node, op, options, params) {
        return this.visit(node.ast, op, options, params);
    }

    visitStringLiteral(node, op, options, params) {
        return `"${node.value}"`;
    }

    visitFulltextFilterTerm(node, op, options, params) {
        return `"${node.value}"`;
    }

    visitBinaryExpression(node, op, options, params) {
        var operator = this.ops[node.operator];

        if (!operator) { throw new Error(`Operator ${node.operator} not supported by Splunk SPL`); }

        var str = '';

        var left = this.visit(node.left, operator, options, params);
        var right = this.visit(node.right, operator, options, params);

        if (typeof left !== 'undefined') {
            str += this._addParens(node.left) ? `(${left})` : left;
        }
        if (typeof left !== 'undefined' && typeof right !== 'undefined') {
            str += ` ${operator} `;
        }
        if (typeof right !== 'undefined') {
            str += this._addParens(node.right) ? `(${right})` : right;
        }

        return str;
    }

    _addParens(node) {
        return node.type === 'BinaryExpression'
            && (node.operator === 'AND' || node.operator === 'OR');
    }

    visit(node, op, options, params) {
        return this[`visit${node.type}`].apply(this, arguments);
    }
}

module.exports = Query;
