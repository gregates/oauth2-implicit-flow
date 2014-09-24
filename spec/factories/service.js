function Service(name, id, redirectURI, tokenURI) {
  var opts = {
    name: name || "testApp",
    clientID: id || Math.random().toString(36).substr(2),
    redirectURI: redirectURI || "http://localhost:9876/base/spec/fixtures/callback.html",
    // same as redirectURI so that we can immediately trigger callback script
    tokenURI: tokenURI || "http://auth.example.com/oauth/authorize"
  };

  return new OAuth2.Service(opts);
}

