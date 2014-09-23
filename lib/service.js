"use strict";

var $ = require('jquery'),
    Token = require('./token'),
    authPrompt = require('./dialog');

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
  Object.defineProperty(this, "token", {
    enumerable: true,
    configurable: false,
    get: function() {
      var savedToken = localStorage.getItem(this.tokenKey);
      if (savedToken) {
        this.token = new Token(JSON.parse(savedToken));
        this.token.service = this;
        return this.token;
      } else {
        return null;
      }
    },
    set: function(token) {
      token.service = this;
      token.save();
    },
  });
};

Service.prototype.authorize = function(opts) {
  opts = opts || {};
  var params = this.tokenParams;
  if (opts.scope) { params.scope = opts.scope; }
  params.state = Math.random().toString(36).substr(2);

  var url = this.tokenURI + '?' + $.param(params),
      dialog = authPrompt(url);

  if (dialog) {
    window.triggerOAuth2Callback = callbackHandler(params.state).bind(this);
  }
};

function callbackHandler(state) {
  return function(hash) {
    var oauthParams = parseHash(hash);

    if (oauthParams.state !== state) {
      throw "OAuth2 error: csrf detected - state parameter mismatch";
    }

    this.token = new Token(oauthParams);
  };
}

function parseHash(locationHash) {
  var oauthParams = {},
      queryString = locationHash.substring(1),
      regex = /([^#?&=]+)=([^&]*)/g,
      match;
  while ((match = regex.exec(queryString)) !== null) {
    oauthParams[decodeURIComponent(match[1])] = decodeURIComponent(match[2]);
  }
  return oauthParams;
};

module.exports = Service;
