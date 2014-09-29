"use strict";

var $ = require('jquery'),
    Token = require('./token'),
    authPrompt = require('./dialog'),
    redirectHandler = require('./redirect');

function Service(config) {
  config = config || {};
  this.name = config.name;
  this.clientID = config.clientID || config.clientId;
  this.redirectURI = config.redirectURI || config.redirectUri;
  this.tokenURI = config.tokenURI || config.tokenUri;
  ["name", "clientID", "redirectURI", "tokenURI"].forEach(function(key) {
    if (this[key] == null) {
      window.console.error("OAuth2 Configuration error: options for initializing a new Service object must include a " + key);
    }
  }, this);
  Object.defineProperty(this, "tokenParams", {
    __proto__: null,
    get: function() {
      return {
        response_type: "token",
        client_id: this.clientID,
        redirect_uri: this.redirectURI
      };
    }
  });
  Object.defineProperty(this, "tokenKey", {
    __proto__: null,
    value: ["oauth2", "token", this.name, this.clientID].join("-")
  });
  Object.defineProperty(this, "__cachedToken", {
    enumerable: false,
    configurable: false,
    writable: true,
    value: null
  });
  Object.defineProperty(this, "token", {
    enumerable: true,
    configurable: false,
    get: function() {
      if (!this.__cachedToken) {
        var savedToken = localStorage.getItem(this.tokenKey);
        if (savedToken) {
          this.__cachedToken = new Token(JSON.parse(savedToken));
          this.__cachedToken.service = this;
        }
      }
      return this.__cachedToken;
    },
    set: function(token) {
      token.service = this;
      token.save();
      this.__cachedToken = token;
    },
  });
};

Service.prototype.generateStateToken = function() {
  return Math.random().toString(36).substr(2);
};

Service.prototype.authorize = function(opts, success, error) {
  opts = opts || {};
  var params = this.tokenParams;
  if (opts.scope) { params.scope = opts.scope; }
  params.state = this.generateStateToken();

  var url = this.tokenURI + '?' + $.param(params),
      dialog = authPrompt(url);

  if (dialog) {
    var service = this;
    window.triggerOAuth2Callback = function(hash) {
      dialog.close();
      // the redirectHandler function will handle reject/resolve
      redirectHandler(params.state, success, error).call(service, hash);
    };
  } else {
    var msg = "OAuth Error: could not open authorization dialog";
    console.error(msg);
    if (typeof error === "function") { error(msg); }
  }
};

Service.prototype.clearToken = function() {
  this.__cachedToken = null;
  localStorage.removeItem(this.tokenKey);
};

module.exports = Service;
