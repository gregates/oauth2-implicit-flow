var Token = require('./token');

// returns a function that, when called with a Service object as this, will
// extract the token from the url hash fragment and then run any callbacks
function redirectHandler(state, success, error) {
  return function(hash) {
    var oauthParams = parseHash(hash);

    if (oauthParams.state !== state) {
      console.error("OAuth2 error: csrf detected - state parameter mismatch");
      if (typeof error === "function") { error(); }
      return;
    }

    this.token = new Token(oauthParams);
    if (typeof success === "function") { success(); }
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

module.exports = redirectHandler;
