document.title = "Open Source Hollywood";

Template.nav.onRendered(function() {
  $('.login').mouseenter();
  if (localStorage.getItem('doShowLock')==='true'||localStorage.getItem('doShowLock')===true) {
      setTimeout(function() {
        localStorage.setItem('doShowLock', false);
        lock.show();
      }, 2100);
    };
});

Template.nav.helpers({
  finishedLoading: function() {
    return Session.get('connectReady');
  },
  superAdmin: function() {
    return (Meteor.user()._id==='NtwHRpqPZCRiMkbsK' || Meteor.user()._id==='RKgbrBSd9gEfm4cJP' || Meteor.user()._id==='h6hMjCTqgvju6S6ES' || Meteor.user()._id==='Kf4kzSmLze9jYPYh3' || Meteor.user()._id==='k69vzFMz9MhwxqQv2');
  }
})

Template.nav.events({
  'click .menu-item': function() {
    if ($(window).width()<=692) $('#navbutton').click();
  },
  'click #signout': function() {
    localStorage.clear();
    Session.set('order', 'hot');
    Session.set('needsResetOption', false);
    Session.set('locationFilter', null);
    Session.set('selectedCategory', null);
    Session.set('selectedGenre', null);
    Meteor.logout();
    Meteor.logoutOtherClients();
  },
  'click #profile': function() {
    document.title = 'Profile View';
  },
  'click #settings': function() {
    document.title = 'Settings Edit';
  },
  'click .login': function() {
    var url = window.location.href;
    if (!url||url.match(/\//g).length===3) return lock.show();
    if ((url.indexOf('/terms')===-1&&url.indexOf('/privacy')===-1&&url.indexOf('/contact')===-1)) {
      localStorage.setItem('doShowLock', true);
      setTimeout(function() {
        window.location.assign('/');
      }, 800);
      return;
    };
    if (url.match(/\//g).length<=4) lock.show();
  },
  'click .ls0': function() {
    localStorage.removeItem('redirectURL');
  }

});
