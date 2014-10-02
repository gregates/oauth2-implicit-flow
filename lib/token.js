"use strict";

var $ = window.jQuery || require('jquery');

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
    },
    resourceOwner: {
      enumerable: true,
      configurable: false,
      get: function() {
        if (!this.__cachedResourceOwner) {
          var data = JSON.parse(localStorage.getItem(this.service.userKey));
          this.__cachedResourceOwner = data;
        }
        return this.__cachedResourceOwner;
      }
    },
    __cachedResourceOwner: {
      enumerable: false,
      configurable: false,
      writable: true,
      value: null
    }
  });
};

Token.prototype.ajax = function(url, opts) {
  if (typeof url === "string") {
    opts = opts || {};
    opts.url = url;
  } else {
    opts = url || {};
  }
  opts.headers = opts.headers || {};
  opts.headers.Authorization = "Bearer " + this.token;
  return $.ajax(opts);
};

["get", "post", "put", "patch", "delete"].forEach(function(verb) {
  Token.prototype[verb] = function(url, data, callback, type) {
    var opts = {};
    if (typeof data === "function") {
      // data argument was ommitted
      type = type || callback;
      callback = data;
      data = undefined;
    }
    opts.method = verb.toUpperCase();
    opts.dataType = type;
    opts.data = data;
    opts.success = callback;
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

Token.prototype.fetchResourceOwner = function() {
  var token = this;
  if (token.service.resourceOwnerURI) {
    return token.get(token.service.resourceOwnerURI, function(data) {
      token.__cachedResourceOwner = data;
      localStorage.setItem(token.service.userKey, JSON.stringify(data));
      return data;
    });
  } else {
    var msg = "OAuth Error: attempted to fetch token resource owner, but no resourceOwnerURI was specified for " + token.service.name;
    console.error(msg);
    return $.Deferred().reject(msg);
  }
};

module.exports = Token;
