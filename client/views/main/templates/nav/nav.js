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
  'click #signout': function() {
    $('html').css('visibility', 'hidden');
    setTimeout(function() {
        $('html').css('visibility', 'visible');
    }, 610);
    Meteor.logout();
    Meteor.logoutOtherClients();
    Router.go('Home');
    window.location.assign('/');
    document.title = "Open Source Hollywood";
  },
  'click #profile': function() {
    document.title = 'Profile View';
  },
  'click #settings': function() {
    document.title = 'Settings Edit';
  },
  'click .login': function() {
    lock.show();
  }

});


Template.user_options.helpers({
  producerReady: function() {
    return Meteor.user() && Meteor.user().didSetProfile
  }
})