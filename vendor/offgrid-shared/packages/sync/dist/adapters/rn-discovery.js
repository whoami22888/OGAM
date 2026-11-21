
"use strict";

class RnZeroconf {
  constructor() {}
  scan() { return Promise.resolve(); }
  stop() { return Promise.resolve(); }
  publish() { return Promise.resolve(); }
  unpublish() { return Promise.resolve(); }
  on() { return () => {}; }
}

class RnDiscovery {
  constructor() { this.zeroconf = new RnZeroconf(); }
  start() { return this.zeroconf.scan(); }
  stop() { return this.zeroconf.stop(); }
}

module.exports = { RnZeroconf, RnDiscovery };
