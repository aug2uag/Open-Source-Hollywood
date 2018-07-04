var connectHandler = WebApp.connectHandlers;

Meteor.startup(function () {
  connectHandler.use(function (req, res, next) {
    res.setHeader('access-control-allow-origin', '*');
    return next();
  });

  ServiceConfiguration.configurations.remove({ service: 'auth0' });
	ServiceConfiguration.configurations.insert({
	  service:      'auth0',
	  domain:       'aug2uag.auth0.com',
	  clientId:     'KC97k4Aq9IbWuNuC8YKzC4IxSPaJWtzB',
	  clientSecret: 'ZwboYVYBP49egRZLTBXf6FwBcE4OGnguihGYv3zzmSbdbpnjFXiE8vyWPPJQ7ieb'
	});
})