# Installation

This package is currently published only in a private repository. If you have access to that repository, you may `npm install oauth2-implicit-flow`

# Usage

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
  service.authorize();
}
```

Once you have a token for a service, you can make authorized requests with it using a simple wrapper for `jQuery.ajax()`.

```
// takes same options as jQuery.ajax() but automatically sets the Authorization
// header
var opts = { method: "GET" };
service.token.ajax('http://resource-server.com/resources/', opts); 

// convenient helper methods for different HTTP verbs. requires a second data
// parameter before (optional) opts hash for consistency with `jQuery.get()`
//function signature

opts = {};

service.token.get('http://resource-server.com/resources/', {}, opts);
service.token.post('http://resource-server.com/resources/', {}, opts);
service.token.patch('http://resource-server.com/resources/17', {}, opts);
service.token.delete('http://resource-server.com/resources/17', {}, opts);
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

