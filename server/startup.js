var connectHandler = WebApp.connectHandlers;

Meteor.startup(function () {
  connectHandler.use(function (req, res, next) {
    res.setHeader('access-control-allow-origin', 'http://localhost:3000');
    console.log(new Array(100).join('@!'))
    return next();
  })
})