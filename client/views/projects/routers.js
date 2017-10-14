Router.route('/projects', {
    name: 'Projects',
    template: 'projectTabs',
    layoutTemplate: 'StaticLayout',
    waitOn: function() {
      if (Meteor.user() === null) {
        Router.go('Home');
        window.location.assign('/');
        return
      }
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
        Router.go('Home');
        window.location.assign('/');
        return
      }
        return [
          Meteor.subscribe('getMe'), 
          Meteor.subscribe('connectUser')
        ];
    },
    onBeforeAction: function() {
      var u = Users.findOne({_id: Meteor.user()._id});
      if ((!u.firstName || !u.lastName) || !u.iam || u.iam.length === 0) {
        bootbox.alert('you must update your profile before creating a campaign');
        Router.go('Settings');
        window.location.assign('/settings');
        return;
      };
      
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

Router.route('/projects/:slug', {
  name: 'projectView',
  template: 'projectView',
  layoutTemplate: 'StaticLayout',
  onBeforeAction: function() {
    document.title = "Campaign";
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
      Meteor.subscribe('gotoBoard', this.params.slug),
      Meteor.subscribe('commentsList', this.params.slug),
      Meteor.subscribe('getMe')
    ];
  },
  data: function() {
    var slug = this.params.slug;
    var project = Projects.findOne({slug: slug});
    var board = Boards.findOne({slug: slug});
    if (!board || !project) return;
    return {
        uid: project._id,
        perCent: function() {
          if (project.funded && project.budget) {
            var v = (project.funded/project.budget * 100 > 100 ? 100 : project.funded/project.budget * 100).toFixed(2);
            return v + ' %';
          };

          return 'not available';
        },
        isOwner: function () {
          return project.ownerId === Meteor.user()._id;
        },
        isMember: function() {
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
        processedGenres: function() {
          if (project.genres.length > 0) {
            return project.genres.join(', ');
          } else {
            return 'no genres specified';
          }
        },
        needs: project.needs || 'watch video for details',
        videoURL: project.videoURL,
        _bid: board._id,
        _slug: board.slug,
        isLive: project.isLive,
        project: project,
        ownerName: project.ownerName,
        logline: project.logline,
        ownerAvatar: project.ownerAvatar,
        ownerId: project.ownerId,
        details: project.details,
        funded: project.funded,
        createdAt: project.createdAt,
        count: project.count,
        title: project.title,
        gifts: project.gifts,
        budget: function() {
          if (project.budget) {
            return '$ ' + project.budget
          }
          return 'none specified';
        },
        duration: project.duration,
        applied: project.applied
      }
    }
});

Router.route('/projects/:slug/edit', {
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