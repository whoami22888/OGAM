
"use strict";

class RnTcpModule {
  constructor() { this.listeners = []; }
  start() { return Promise.resolve(); }
  stop() { return Promise.resolve(); }
  send() { return Promise.resolve(false); }
  onData() { return () => {}; }
  onConnection() { return () => {}; }
}

class RnTcpTransport {
  constructor() { this.module = new RnTcpModule(); }
  start() { return this.module.start(); }
  stop() { return this.module.stop(); }
  send() { return this.module.send(); }
}

module.exports = { RnTcpModule, RnTcpTransport };
