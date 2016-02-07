/**
 * Module dependencies.
 */
var util = require('util');
var OAuth2Strategy = require('passport-oauth2');

var InternalOAuthError = OAuth2Strategy.InternalOAuthError;

function Strategy(options, verify) {
	if (typeof options == 'function') {
		verify = options;
		options = {};
	}

  options = options || {};
	options.gitlabURL = options.gitlabURL || 'http://gitlab.com';

	if (!options.gitlabURL) { throw new TypeError('OAuth2Strategy requires a gitlabURL option'); }

	options.authorizationURL = options.gitlabURL + '/oauth/authorize';
	options.tokenURL = options.gitlabURL + '/oauth/token';

	if (!verify) { throw new TypeError('LocalStrategy requires a verify callback'); }
	if (!options.gitlabURL) { throw new TypeError('GitlabStrategy requires a gitlabURL option'); }

	OAuth2Strategy.call(this, options, verify);
	this.name = 'gitlab';
	this.gitlabURL = options.gitlabURL ;
  this._userProfileURL = options.userProfileURL || this.gitlabURL + '/api/v3/user';
}

util.inherits(Strategy, OAuth2Strategy);

Strategy.prototype.userProfile = function(accessToken, done) {
  this._oauth2.get(this.gitlabURL + '/api/v3/user', accessToken, function (err, body, res) {
    if (err) { return done(new InternalOAuthError('failed to fetch user profile', err)); }
    try {
      var json = JSON.parse(body);

      var profile = { provider: 'gitlab' };
      profile.id = json.id;
      profile.displayName = json.name;
      profile.emails = [{ value: json.email }];
      profile.username = json.username ;
      profile.avatar = json.avatar_url;

      profile._raw = body;
      profile._json = json;

      done(null, profile);
    } catch(e) {
      done(e);
    }
  });
};

module.exports = Strategy;
