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
  }
})

Template.nav.events({
  'click .menu-item': function() {
    if ($(window).width()<=692) $('#navbutton').click();
  },
  'click #signout': function() {
    localStorage.clear();
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
