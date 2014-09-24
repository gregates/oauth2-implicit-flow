"use strict";

describe("Service.authorize()", function() {
  var service, token, tokenHash, redirectURI;

  beforeEach(function() {
    redirectURI = "http://localhost:9876/base/spec/fixtures/callback.html";
    token = Math.random().toString(36).substr(2);
    tokenHash = [
      "#state=state",
      "access_token=" + token,
      "&token_type=Bearer",
      "expires_in=3600"
    ].join("&");
    // Note: faking out redirectURI so that we can immediately trigger redirect
    // callback
    service = Service(null, null, redirectURI, redirectURI + tokenHash);
    // stub out state token generation so we can "return" the right token at the
    // callback endpoint
    service.generateStateToken = function() { return "state"; };
  });

  it("defines callback function on the window", function() {
    service.authorize();
    expect(typeof window.triggerOAuth2Callback).toBe("function");
  });

  it("calls the callback function when the service redirects", function(done) {
    service.authorize();
    spyOn(window, "triggerOAuth2Callback");
    setTimeout(function() {
      expect(window.triggerOAuth2Callback).toHaveBeenCalledWith(tokenHash);
      done();
    }, 200);
  });

  xit(" creates a token for the service with hash data", function(done) {
    service.authorize();
    setTimeout(function() {
      expect(service.token).not.toBeNull();
      done();
    }, 200);
  });
});

describe("Service.token", function() {
  var service, token;

  beforeEach(function() {
    service = Service(), token = Token();
  });

  afterEach(function() {
    localStorage.clear();
  });

  it("returns cached token if non-null", function() {
    service.__cachedToken = token;
    expect(service.token).toEqual(token);
  });

  it("reads from localStorage if no cached token", function() {
    token.service = service; token.save();
    expect(service.__cachedToken).toBeNull();
    expect(service.token).toEqual(token);
  });

  it("returns null if no cached token and no localStorage", function() {
    expect(service.token).toBeNull();
  });
});

describe("Service.token=", function() {
  var service, token;

  beforeEach(function() {
    service = Service(), token = Token();
    service.token = token;
  });

  afterEach(function() {
    localStorage.clear();
  });

  it("sets the 'service' property on the token", function() {
    expect(token.service).toEqual(service);
  });

  it("sets the localStorage for the service", function() {
    var parsed = JSON.parse(localStorage.getItem(service.tokenKey));
    expect(parsed.access_token).toEqual(token.token);
  });

  it("updates the cached token on the service", function() {
    expect(service.token).toEqual(token);
  });
});

describe("Service.clearToken()", function() {
  var service, token;

  beforeEach(function() {
    service = Service(), token = Token();
    service.token = token;
  });

  it("sets service.token to null", function() {
    service.clearToken();
    expect(service.token).toBeNull();
  });

  it("cleans up localStorage", function() {
    service.clearToken();
    expect(localStorage.getItem(service.tokenKey)).toBeNull();
  });
});

describe("Service.tokenKey", function() {
  it("is unique for services with different names", function() {
    var s1 = Service("foo"), s2 = Service("bar");
    expect(s1.tokenKey).not.toEqual(s2.tokenKey);
  });

  it("is unique for services with differnet clientID", function() {
    var s1 = Service("foo", 42), s2 = Service("foo", 17);
    expect(s1.tokenKey).not.toEqual(s2.tokenKey);
  });
});

describe("Service.tokenParams", function() {
  it("includes response_type=token", function() {
    expect(Service().tokenParams.response_type).toEqual("token");
  });

  it("includes client_id", function() {
    var s = Service();
    expect(s.tokenParams.client_id).toEqual(s.clientID);
  });

  it("includes redirect_uri", function() {
    var s = Service();
    expect(s.tokenParams.redirect_uri).toEqual(s.redirectURI);
  });
});
