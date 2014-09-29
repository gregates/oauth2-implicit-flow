"use strict";

describe("Token.save()", function() {
  var token, key;

  beforeEach(function() {
    token = Token();
    token.service = Service();
    key = token.service.tokenKey;
    token.save();
  });

  it("stores itself in localStorage", function() {
    expect(localStorage.getItem(key)).toBeDefined();
    expect(localStorage.getItem(key)).not.toBeNull();
  });

  it("stores itself as JSON", function() {
    expect(function() { JSON.parse(localStorage.getItem(key)); }).not.toThrow();
  });

  it("includes the access_token", function() {
    var parsed = JSON.parse(localStorage.getItem(key));
    expect(parsed.access_token).toEqual(token.token);
  });

  it("includes time received from server", function() {
    var parsed = JSON.parse(localStorage.getItem(key));
    expect(parsed.received_at).toEqual(token.receivedAt);
  });

  it("includes token duration", function() {
    var parsed = JSON.parse(localStorage.getItem(key));
    expect(parsed.expires_in).toEqual(token.expiresIn);
  });

  it("includes token scopes as a String", function() {
    var parsed = JSON.parse(localStorage.getItem(key));
    token.scopes.forEach(function(scope) {
      expect(parsed.scope.indexOf(scope)).toBeGreaterThan(-1);
    });
  });
});

describe("Token.ajax(url, data)", function() {
  var token;

  beforeEach(function() {
    token = Token();
    spyOn($, 'ajax').and.callFake(function(url, opts) {
      return opts;
    });
  });

  it("calls through to jQuery", function() {
    var opts = { contentType: "application/json" };
    token.ajax("http://r.com", opts);
    expect($.ajax).toHaveBeenCalledWith("http://r.com", opts);
  });

  it("sets token header", function() {
    var opts = { contentType: "application/json" },
    opts = token.ajax("http://r.com", opts);
    expect(opts.headers.Authorization).toEqual("Bearer " + token.token);
  });

  describe("Token.get(url, data, success)", function() {
    it("calls through to jQuery with method: 'GET', data, and callback", function() {
      var data = { foo: "bar" }, callback = function() {};
      var opts = token.get("http://r.com", data, callback);
      expect($.ajax).toHaveBeenCalledWith("http://r.com", opts);
      expect(opts.data.foo).toEqual("bar")
      expect(opts.headers.Authorization).toEqual("Bearer " + token.token);
      expect(opts.method).toEqual("GET");
      expect(opts.success).toEqual(callback);
    });
  });

  describe("Token.post(url, data, success)", function() {
    it("calls through to jQuery with method: 'POST', data, and callback", function() {
      var data = { foo: "bar" }, callback = function() {};
      var opts = token.post("http://r.com", data, callback);
      expect($.ajax).toHaveBeenCalledWith("http://r.com", opts);
      expect(opts.data.foo).toEqual("bar")
      expect(opts.headers.Authorization).toEqual("Bearer " + token.token);
      expect(opts.method).toEqual("POST");
      expect(opts.success).toEqual(callback);
    });
  });

  
  describe("Token.put(url, data, opts)", function() {
    it("calls through to jQuery with method: 'POST' and data", function() {
      var data = { foo: "bar" }, callback = function() {};
      var opts = token.put("http://r.com", data, callback);
      expect($.ajax).toHaveBeenCalledWith("http://r.com", opts);
      expect(opts.data.foo).toEqual("bar")
      expect(opts.headers.Authorization).toEqual("Bearer " + token.token);
      expect(opts.method).toEqual("PUT");
      expect(opts.success).toEqual(callback);
    });
  });

  
  describe("Token.patch(url, data, opts)", function() {
    it("calls through to jQuery with method: 'POST' and data", function() {
      var data = { foo: "bar" }, callback = function() {};
      var opts = token.patch("http://r.com", data, callback);
      expect($.ajax).toHaveBeenCalledWith("http://r.com", opts);
      expect(opts.data.foo).toEqual("bar")
      expect(opts.headers.Authorization).toEqual("Bearer " + token.token);
      expect(opts.method).toEqual("PATCH");
      expect(opts.success).toEqual(callback);
    });
  });

  
  describe("Token.delete(url, data, opts)", function() {
    it("calls through to jQuery with method: 'POST' and data", function() {
      var data = { foo: "bar" }, callback = function() {};
      var opts = token.delete("http://r.com", data, callback);
      expect($.ajax).toHaveBeenCalledWith("http://r.com", opts);
      expect(opts.data.foo).toEqual("bar")
      expect(opts.headers.Authorization).toEqual("Bearer " + token.token);
      expect(opts.method).toEqual("DELETE");
      expect(opts.success).toEqual(callback);
    });
  });
});


