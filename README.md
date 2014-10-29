[![Build Status](https://travis-ci.org/gregates/oauth2-implicit-flow.svg?branch=master)](https://travis-ci.org/gregates/oauth2-implicit-flow)

# Installation

`npm install oauth2-implicit-flow --save`

# Usage

This package is intended to be used in the browser, with [browserify](http://browserify.org/).

```
var OAuth2 = require('oauth2-implicit-flow').default;

var service = new OAuth2.Service({
  name: "myService",
  redirectURI: "http://localhost/~myusername/callback",
  tokenURI: "http://localhost:9000/oauth/authorize",
  clientID: 123456789
});
```

The `redirectURI` configuration parameter should point to an html document that hosts the following script:

```
<script>
if (window.opener && typeof window.opener.triggerOAuth2Callback === "function") {
  window.opener.triggerOAuth2Callback(window.location.hash);
}
</script>
```

Once that's set up, you can call

```
service.authorize()
```

to prompt the user to authorize your app. (To request a specific scope, pass `{ scope: "requested scope" }` to this function.) A pop-up window will open with the configured `tokenURI`. On a successful authorization, the token will be stored in localStorage with a key unique to the service `name` & `clientId`. Thus, you'll be able to read it from `localStorage` on a page refresh without prompting the user for authorization again.

```
var OAuth2 = require('oauth2-implicit-flow').default;

var service = new OAuth2.Service({
  name: "myService",
  redirectURI: "http://localhost/~myusername/callback",
  tokenURI: "http://localhost:9000/oauth/authorize",
  clientID: 123456789
});

if (service.token && !service.token.expired) {
  // make some authorized requests
} else {
  service.authorize({ scope: "user.info" });
}
```

The `service.authorize()` function optionally takes success and error callbacks after the options argument, which will be called with the service's `token` object (in the case of success) or an error message (in the case of failure). You can use this to easily convert this function into a promise (using a promise library such as [RSVP](https://github.com/tildeio/rsvp.js/)

```
var RSVP = require('rsvp');

function login() {
  return new RSVP.Promise(function(resolve, reject) {
    service.authorize({ scope: "user.login" }, resolve, reject);
  });
}

login().then(function(token) {
  // do some stuff tha trequires authorization
});
```

Once you have a token for a service, you can make authorized requests with it using a wrapper for `jQuery.ajax()`.

```
// takes same options as jQuery.ajax() but automatically sets the Authorization
// header
var opts = { method: "GET" };
service.token.ajax('http://resource-server.com/resources/', opts); 

// convenient helper methods for different HTTP verbs. 
// function signature is the same as for jQuery.get(), i.e.,
// service.token.<verb>(url [, data] [, success] [, dataType ])
service.token.get('http://resource-server.com/resources/');
service.token.post('http://resource-server.com/resources/', { name: 'foo' });
service.token.patch('http://resource-server.com/resources/17', { name: 'foo'});
service.token.delete('http://resource-server.com/resources/17');
```

These methods will all return a `jQuery.Deferred` object, just like `jQuery.ajax()`.

You have to check for token expiration yourself, and/or be prepared to handle 401 Unauthorized errors from the resource server.

```
if (service.token.expired) {
  alert('sorry, your access token has expired');
} else {
  service.token.get('http://resource-server.com/resources')
  .then(function(data) { alert('success!') })
  .fail(function(jqXHR) { alert('error!') });
}
```

