var connectHandler = WebApp.connectHandlers;

Meteor.startup(function () {
  connectHandler.use(function (req, res, next) {
    res.setHeader('access-control-allow-origin', '*');
    return next();
  })
})