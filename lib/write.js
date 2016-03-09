'use strict';

/* global JuttleAdapterAPI */
var AdapterWrite = JuttleAdapterAPI.AdapterWrite;

class WriteSplunk extends AdapterWrite {
    constructor(options, params) {
        super(options, params);
        throw Error('implement me');
    }

    write(points) {
        throw Error('implement me');
    }

    eof() {
        throw Error('implement me');
    }
}

module.exports = WriteSplunk;
