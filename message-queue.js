/* eslint-disable no-param-reassign */
const Listener = require('./pm2-listener');
const Sender = require('./sender');

class MessageQueue {
    constructor() {
        this.cache = [];
        this.maxMsgLength = 1900;
    }

    /**
     * Add a message to the queue
     * @param {String} message Message to be added to queue
     */
    addToQueue(message) {
        if (typeof message !== 'string') return;
        if (message.length > this.maxMsgLength) {
            const messages = this.split(message);
            messages.forEach((m) => this.cache.push(m));
        } else this.cache.push(message);
    }

    /**
     * Split a message to maximum 1900 characters, by newline
     * @param {String} output Message to split
     * @returns {Array<String>} Messages split by \n
     */
    split(output) {
        const msgArray = [];
        let str = '';
        let pos;
        while (output.length > 0) {
            pos = output.length > this.maxMsgLength ? output.lastIndexOf('\n', this.maxMsgLength) : output.length;
            if (pos > this.maxMsgLength) {
                pos = this.maxMsgLength;
            }
            str = output.substr(0, pos);
            output = output.substr(pos);
            msgArray.push(str);
        }
        return msgArray;
    }

    run() {
        Sender.run();
        setInterval(() => {
            const joined = this.cache.join('\n');
            this.cache = [];
            const clean = joined.replace(/\n```\n```js\n|\n```\n\n```js\n/g, '\n');
            if (clean.length > 1900) this.split(clean).forEach((m) => Sender.addToQueue(m));
            else Sender.addToQueue(clean);
        }, Listener.rate * 1000);
    }
}

module.exports = new MessageQueue();
