0.0.3
=====

+ Change token.ajax argument signature to accept either a url and an opts hash or just an opts hash (which we expect to have a `url` key).

0.0.2
=====

+ Pick up window.jQuery instead of requiring node module if available. Allows building with browserify options to ignore jquery and instead include via CDN or other global method, reducing overall built file size.
+ Include `resourceOwner` property on the `Token` class. Will return a cached/stored user after `Token.fetchResourceOwner()` has been called. Assumes that the service has been configured with a `resourceOwnerURI` for fetching details about the authorizing user for the token.


0.0.1
=====

+ Initial release
