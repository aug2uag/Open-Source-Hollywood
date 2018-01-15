Router.route('/projects', {
    name: 'Projects',
    template: 'projectTabs',
    layoutTemplate: 'StaticLayout',
    waitOn: function() {
      return [
        Meteor.subscribe('projectsList'), 
        Meteor.subscribe('connectUser'),
        Meteor.subscribe('getMe')
      ];
    },
    onBeforeAction: function() {
      document.title = "Campaigns";
      this.next();
    }
});

Router.route('/newproject', {
    name: 'Create Project',
    template: 'newProject',
    layoutTemplate: 'StaticLayout',
    waitOn: function() {
      if (!Meteor.user()) {
        Router.go('Projects');
        return
      }
        return [
          Meteor.subscribe('getMe'), 
          Meteor.subscribe('connectUser')
        ];
    },
    onBeforeAction: function() {
      var u = Users.findOne({_id: Meteor.user()._id});
      document.title = "New Campaign";
      this.next();
    }
});

Router.route('/activeprojects', {
    name: 'Actives',
    template: 'projectTabs',
    layoutTemplate: 'StaticLayout',
    waitOn: function() {
      if (!Meteor.user()) {
        Router.go('Home');
        window.location.assign('/');
        return
      }
        return [
          Meteor.subscribe('getMe'),
          Meteor.subscribe('activeProjects'), 
          Meteor.subscribe('connectUser')
        ];
    },
    onBeforeAction: function() {
      document.title = "Active Campaigns";
      this.next();
    }
});

Router.route('/projects/:slug/:uid', {
  name: 'projectView',
  template: 'projectView',
  layoutTemplate: 'StaticLayout',
  onBeforeAction: function() {
    document.title = "Campaign";
    this.next();
  },
  waitOn: function() {
    return [
      Meteor.subscribe('getProject', this.params.slug), 
      Meteor.subscribe('gotoBoard', this.params.slug),
      Meteor.subscribe('commentsList', this.params.slug),
      Meteor.subscribe('stringId', this.params.uid),
      Meteor.subscribe('getMe')
    ];
  },
  data: function() {
    var slug = this.params.slug;
    var project = Projects.findOne({slug: slug});
    var board = Boards.findOne({slug: slug});
    if (!board || !project) return;
    var user = Users.findOne({_id: project.ownerId});
    var myId = Meteor.user()&&Meteor.user()._id||'';
    var me = Users.findOne({_id: myId});
    var role = user&&user.primaryRole ? user.primaryRole : user&&user.iam&&user.iam&&user.iam.length&&user.iam.join ? user.iam.join(' / ') : 'view profile for more info';
    return {
        me: me,
        uid: project._id,
        isOwner: function () {
          if (!Meteor.user()) return false;
          return project.ownerId === Meteor.user()._id;
        },
        isMember: function() {
          if (!Meteor.user()) return false;
          if (project.ownerId === Meteor.user()._id) return true;
          var falsy = false;
          project.usersApproved.forEach(function(u) {
            if (u.id === Meteor.user()._id) return falsy = true;
          });
          return falsy;
        },
        projectComments: function () {
          return Comments.find({projectId: slug});
        },
        submittedAgo: moment(project.createTimeActual, moment.ISO_8601).fromNow(),
        numComments: function() {
          var numComments = Comments.find({projectId: slug}).count();
          if (numComments === 0) {
            return 'Be the first to comment!';
          };
          if (numComments === 1) {
            return '1 comment';
          };
          return numComments + ' comments';
        },
        _ownerStats: {
          score: user&&user.influenceScore||0,
          rating: user&&user.rating||0
        },
        count: project.count,
        _bid: board._id,
        _slug: board.slug,
        isLive: project.isLive,
        project: project,
        title: project.title,
        role: role
      }
    },
    onAfterAction: function() {
      var post;
      // The SEO object is only available on the client.
      // Return if you define your routes on the server, too.
      if (!Meteor.isClient) {
        return;
      }
      post = this.data();
      SEO.set({
        title: post.title,
        meta: {
          'description': post.project.description||post.project.logline||'Campaign by '+post.project.ownerName
        },
        og: {
          'title': post.title,
          'description': post.project.description||post.project.logline||'Campaign by '+post.project.ownerName,
          'image': [post.project.banner, post.project.ownerAvatar]

        }
      });
    }
});
Router.route('/campaign/:slug', {
  name: 'campaignView',
  template: 'projectView',
  layoutTemplate: 'StaticLayout',
  onBeforeAction: function() {
    document.title = "Campaign";
    this.next();
  },
  waitOn: function() {
    return [
      Meteor.subscribe('getProject', this.params.slug), 
      Meteor.subscribe('gotoBoard', this.params.slug),
      Meteor.subscribe('commentsList', this.params.slug),
      Meteor.subscribe('stringId', this.params.uid),
      Meteor.subscribe('getMe')
    ];
  },
  data: function() {
    var slug = this.params.slug;
    var project = Projects.findOne({slug: slug});
    var board = Boards.findOne({slug: slug});
    if (!board || !project) return;
    var user = Users.findOne({_id: project.ownerId});
    var myId = Meteor.user()&&Meteor.user()._id||'';
    var me = Users.findOne({_id: myId});
    var role = user&&user.primaryRole ? user.primaryRole : user&&user.iam&&user.iam&&user.iam.length&&user.iam.join ? user.iam.join(' / ') : 'view profile for more info';
    return {
        me: me,
        uid: project._id,
        isOwner: function () {
          if (!Meteor.user()) return false;
          return project.ownerId === Meteor.user()._id;
        },
        isMember: function() {
          if (!Meteor.user()) return false;
          if (project.ownerId === Meteor.user()._id) return true;
          var falsy = false;
          project.usersApproved.forEach(function(u) {
            if (u.id === Meteor.user()._id) return falsy = true;
          });
          return falsy;
        },
        projectComments: function () {
          return Comments.find({projectId: slug});
        },
        submittedAgo: moment(project.createTimeActual, moment.ISO_8601).fromNow(),
        numComments: function() {
          var numComments = Comments.find({projectId: slug}).count();
          if (numComments === 0) {
            return 'Be the first to comment!';
          };
          if (numComments === 1) {
            return '1 comment';
          };
          return numComments + ' comments';
        },
        _ownerStats: {
          score: user&&user.influenceScore||0,
          rating: user&&user.rating||0
        },
        count: project.count,
        _bid: board._id,
        _slug: board.slug,
        isLive: project.isLive,
        project: project,
        title: project.title,
        role: role
      }
    }
});

Router.route('/edit/projects/:slug/edit', {
  name: 'EditProject',
  template: 'editProject',
  layoutTemplate: 'StaticLayout',
  onBeforeAction: function() {
    this.next();
  },
  waitOn: function() {
    if (!Meteor.user()) {
      Router.go('Home');
      window.location.assign('/');
      return
    }
    return [
      Meteor.subscribe('getProject', this.params.slug), 
      Meteor.subscribe('connectUser'),
      Meteor.subscribe('getMe')
    ];
  },
  action: function() {
    document.title = "Edit Campaign"
    this.render('editProject', {
      data: function(){
        return Projects.findOne({slug: this.params.slug});
      }
    });
  }
});

Router.route('/message/project/:slug/:uid', {
  name: 'ProjectMessage',
  template: 'projectMessage',
  layoutTemplate: 'StaticLayout',
  onBeforeAction: function() {
    this.next();
  },
  waitOn: function() {
    if (!Meteor.user()) {
      Router.go('Home');
      window.location.assign('/');
      return
    }
    return [
      Meteor.subscribe('getProject', this.params.slug), 
      Meteor.subscribe('getUsers'),
      Meteor.subscribe('getMe'),
      Meteor.subscribe('offers'),
      Meteor.subscribe('getReceipts'),
      Meteor.subscribe('getProjectMessages')
    ];
  },
  data: function() {
    var slug = this.params.slug;
    var project = Projects.findOne({slug: this.params.slug});
    var user = Users.findOne({_id: this.params.uid});
    var offers = Offers.find({uid: user._id, slug: project.slug}).fetch();
    var receipts = Receipts.find({user: user._id, slug: project.slug});
    var messages = ProjectMessages.find({user: user._id, project: project._id}).fetch();
    return {
      project: project,
      user: user,
      offers: offers,
      receipts: receipts,
      messages: messages
    }
  }
});