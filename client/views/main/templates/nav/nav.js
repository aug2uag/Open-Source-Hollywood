document.title = "Open Source Hollywood";

function goDiscovery() {
  try{
    var cb = document.getElementById('discoverybtn'); 
      cb.dispatchEvent(new MouseEvent('click', {
        view: window
      }));
  } catch(e){ window.location.assign('/discover');}
};

Template.nav.onRendered(function() {
  $('.login').mouseenter();
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
    if ($(window).width()<=767) $('#navbutton').click();
  },
  'click #logo': function() {
    window.location.assign('/');
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
    goDiscovery();
  },
  'click #profile': function() {
    document.title = 'Profile View';
  },
  'click #settings': function() {
    document.title = 'Settings Edit';
  },
  'click .login': function() {
    var url = window.location.href;
    if (url.indexOf('/projects')>-1||url.indexOf('/profile')>-1) {
      localStorage.setItem('doShowLock', true);
      goDiscovery();
    } else {
      if (!url||url.match(/\//g).length===3) return lock.show();
      if ((url.indexOf('/terms')===-1&&url.indexOf('/privacy')===-1&&url.indexOf('/contact')===-1)) {
        localStorage.setItem('doShowLock', true);
        setTimeout(function() {
          goDiscovery();
        }, 144);
        return;
      };
      if (url.match(/\//g).length<=4) lock.show();
    }
  },
  'click .ls0': function() {
    localStorage.removeItem('redirectURL');
  }

});
