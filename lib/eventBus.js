const { EventEmitter } = require('events');

/**
 * 事件总线
 */
const eventBus = {
    ee: new EventEmitter(),
    event_list: [],
    on(event, fn) {
        this.ee.addListener(event, fn);
        this.event_list.push(event);
    },
    emit(event, msg) {
        this.ee.emit(event, msg);
    },
    flush() {
        this.event_list.forEach(event => {
            this.ee.removeAllListeners(event)
        });
        this.event_list = [];
    }
}


module.exports = eventBus;
