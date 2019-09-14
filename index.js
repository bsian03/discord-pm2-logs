// eslint-disable-next-line no-unused-expressions
const Listener = require('./pm2-listener');

const listener = new Listener();

listener.start();
console.log('Starting up');
