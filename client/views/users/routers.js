Router.route('/profile/:_id', {
  name: 'Profile',
  template: 'profile',
  layoutTemplate: 'StaticLayout',
  bodyClass: 'page-index chrome chrome-39 mac large-window body-webkit-scrollbars tabbed-page',
  waitOn: function() {
    return [
      Meteor.subscribe('getUser', this.params._id), 
      Meteor.subscribe('getUser', Meteor.user()._id),
      Meteor.subscribe('projectsList'), 
      Meteor.subscribe('connectUser')
    ];
  },
  action: function() {
    document.title = "Member";
    this.render('profile', {
      data: function(){
        return Meteor.users.findOne({_id: this.params._id});
      }
    });
  },
  onBeforeAction: function() {
    if (!Meteor.user()) {
      Router.go('Home');
      return
    }
    this.next();
  }
});

Router.route('/settings', {
    name: 'Settings',
    template: 'settings',
    layoutTemplate: 'StaticLayout',
    bodyClass: 'page-index chrome chrome-39 mac large-window body-webkit-scrollbars tabbed-page',
    waitOn: function() {
      return [
        Meteor.subscribe('getUser', Meteor.user()._id), 
        Meteor.subscribe('connectUser')
      ];
    },
    onBeforeAction: function() {
      if (!Meteor.user()) {
        Router.go('Home');
        return
      }
      document.title = "Settings";
      this.next();
    }
});


Router.route('/gallery', {
    name: 'Gallery',
    template: 'userTabs',
    layoutTemplate: 'StaticLayout',
    bodyClass: 'page-index chrome chrome-39 mac large-window body-webkit-scrollbars tabbed-page',
    waitOn: function() {
      return [
        Meteor.subscribe('getUsers'), 
        Meteor.subscribe('connectUser'),
        Meteor.subscribe('getUser', Meteor.user()._id)
      ];
    },
    onBeforeAction: function() {
      if (!Meteor.user()) {
        Router.go('Home');
        return
      }
      document.title = "Members Gallery";
      this.next();
    }
});
