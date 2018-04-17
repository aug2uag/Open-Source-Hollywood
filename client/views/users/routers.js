Router.route('/profile/:_id', {
  name: 'Profile',
  template: 'profile',
  layoutTemplate: 'StaticLayout',
  bodyClass: 'page-index chrome chrome-39 mac large-window body-webkit-scrollbars tabbed-page',
  waitOn: function() {
    // if (!Meteor.user()) {
    //   Router.go('Home');
    //   window.location.assign('/');
    //   return
    // }
    return [
      Meteor.subscribe('getUser', this.params._id), 
      Meteor.subscribe('projectsList'), 
      // Meteor.subscribe('connectUser')
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
    this.next();
  }
});

Router.route('/settings', {
    name: 'Settings',
    template: 'settings',
    layoutTemplate: 'StaticLayout',
    bodyClass: 'page-index chrome chrome-39 mac large-window body-webkit-scrollbars tabbed-page',
    waitOn: function() {
      if (!Meteor.user()) {
        Router.go('Home');
        window.location.assign('/');
        return
      }
      return [
        Meteor.subscribe('getMe'), 
        // Meteor.subscribe('connectUser'),
        Meteor.subscribe('getProjectMessages'),
        Meteor.subscribe('userActiveProjects', Meteor.user()._id),
        Meteor.subscribe('activeProjectsApproved', Meteor.user()._id)
      ];
    },
    onBeforeAction: function() {
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
        // Meteor.subscribe('connectUser'),
        Meteor.subscribe('getMe')
      ];
    },
    onBeforeAction: function() {
      if (!Meteor.user()) {
        Router.go('Home');
        window.location.assign('/');
        return
      }
      document.title = "Members Gallery";
      this.next();
    }
});
