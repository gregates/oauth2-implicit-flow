"use strict";

Object.seal(Object.defineProperty(exports, "default", {
  get: function() {
    var OAuth2 = { services: {} };

    Object.seal(Object.defineProperties(OAuth2, {
      Token: { __proto__: null, value: require("./token") },
      Service: { __proto__: null, value: require("./service") }
    }));

    return OAuth2;
  },

  enumerable: true
}));
