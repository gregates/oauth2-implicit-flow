"use strict";

var $ = require('jquery');

function Token(tokenParams) {
  Object.defineProperties(this, {
    token: {
      enumerable: true,
      writable: false,
      configurable: false,
      value: tokenParams.access_token
    },
    scopes: {
      enumerable: true,
      writable: false,
      configurable: false,
      value: (tokenParams.scope || "").split(",")
    },
    expired: {
      enumerable: true,
      configurable: false,
      get: function() { return Date.now() > this.receivedAt + this.expiresIn; }
    },
    expiresIn: {
      enumerable: true,
      writable: false,
      configurable: false,
      value: parseInt(tokenParams.expires_in)
    },
    receivedAt: {
      enumerable: true,
      writable: false,
      configurable: false,
      value: tokenParams.received_at || Date.now()
    }
  });
};

Token.prototype.ajax = function(url, opts) {
  opts = opts || {};
  opts.headers = opts.headers || {};
  opts.headers.Authorization = "Bearer " + this.token;
  return $.ajax(url, opts);
};

["get", "post", "put", "patch", "delete"].forEach(function(verb) {
  Token.prototype[verb] = function(url, data, opts) {
    opts = opts || {};
    data = data || {};
    opts.method = verb.toUpperCase();
    opts.data = data;
    return this.ajax(url, opts);
  };
});

Token.prototype.save = function() {
  if (typeof this.service === "undefined") {
    throw "Cannot save a Token that doesn't belong to a Service";
  }
  localStorage.setItem(this.service.tokenKey, JSON.stringify({
    access_token: this.token,
    expires_in: this.expiresIn,
    received_at: this.receivedAt,
    scope: this.scopes.join(",")
  }));
};

module.exports = Token;
