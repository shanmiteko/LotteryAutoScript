const { EventEmitter } = require('events');

const eTarget = new EventEmitter();
/**
 * 事件总线
 */
module.exports = {
    on: (type, fn) => {
        eTarget.addListener(type, fn);
    },
    emit: (type) => {
        eTarget.emit(type);
    },
    off: () => {
        eTarget.off();
    }
};
