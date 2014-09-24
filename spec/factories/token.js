function Token(token, expires, scope) {
  var tokenParams = {
    access_token: token || Math.random().toString(36).substr(2),
    expires_in: expires || 3600,
    scope: scope || "user.info",
    token_type: "Bearer"
  };

  return new OAuth2.Token(tokenParams);
}

