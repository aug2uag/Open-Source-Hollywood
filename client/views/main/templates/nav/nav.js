document.title = "Open Source Hollywood";

Template.nav.onRendered(function() {
  $('.login').mouseenter();
});

Template.nav.helpers({
  finishedLoading: function() {
    return Session.get('connectReady');
  }
})

Template.nav.events({
  'click .menu-item': function() {
    if ($(window).width()<=692) $('#navbutton').click();
  },
  'click #signout': function() {
    Meteor.logout();
    Meteor.logoutOtherClients();
    Router.go('Home');
  },
  'click #profile': function() {
    document.title = 'Profile View';
  },
  'click #settings': function() {
    document.title = 'Settings Edit';
  },
  'click .login': function() {
    lock.show();
    Router.go('Projects');
  }

});
