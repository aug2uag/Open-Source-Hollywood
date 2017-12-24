document.title = "Open Source Hollywood";

Template.nav.onRendered(function() {
  $('.login').mouseenter();
});

Template.nav.helpers({
  finishedLoading: function() {
    return Session.get('connectReady');
  },
  producerReady: function() {
    return Meteor.user() && Meteor.user().didSetProfile
  }
})

Template.nav.events({
  'click #signout': function() {
    $('html').css('visibility', 'hidden');
    Router.go('Home');
    setTimeout(function() {
        $('html').css('visibility', 'visible');
    }, 610);
    Meteor.logout();
    Meteor.logoutOtherClients();
    document.title = "Open Source Hollywood";
  },
  'click #profile': function() {
    document.title = 'Profile View';
  },
  'click #settings': function() {
    document.title = 'Settings Edit';
  },
  'click .login': function() {
    var text = $('.login').text().toLowerCase();
    if (text.indexOf('sign')>-1) lock.show();
    else Router.go('Projects');
  }

});


Template.user_options.helpers({
  producerReady: function() {
    return Meteor.user() && Meteor.user().didSetProfile
  }
})