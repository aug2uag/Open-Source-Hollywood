var wasUser = false;

Router.route('/discover', {
    name: 'Projects',
    template: 'projectTabs',
    layoutTemplate: 'StaticLayout',
    waitOn: function() {
      return [
        Meteor.subscribe('projectsList'), 
        // Meteor.subscribe('connectUser'),
        Meteor.subscribe('getMe')
      ];
    },
    onBeforeAction: function() {
      var x = localStorage.getItem('redirectURL');
      if (x&&x!=='null'&&x.indexOf('/')>-1) {
        Router.go(x);
        localStorage.removeItem('redirectURL');
        return;
      };
      $('meta[name=description]').remove();
      $('head').append( '<meta name="description" content="Campaigns on O . S . H . (https://opensourcehollywood.org)">' );
      document.title = 'Active Campaigns';
      this.next();
    }
});

Router.route('/create', {
    name: 'Create Project',
    template: 'newProject',
    layoutTemplate: 'StaticLayout',
    waitOn: function() {
      if (!Meteor.user()) {
        window.location.assign('/');
        return
      }
      return [
        Meteor.subscribe('getMe'), 
        // Meteor.subscribe('connectUser')
      ];
    },
    onBeforeAction: function() {
      $('meta[name=description]').remove();
      $('head').append( '<meta name="description" content="Free crowdsourcing campaign creation on Open Source Hollywood.' );
      document.title = 'Create Campaign';
      this.next();
    }
});

Router.route('/projects/:slug/:uid', {
  name: 'projectView',
  template: 'projectView',
  layoutTemplate: 'StaticLayout',
  waitOn: function() {
    return [
      Meteor.subscribe('getProject', this.params.slug), 
      Meteor.subscribe('gotoBoard', this.params.slug),
      Meteor.subscribe('commentsList', this.params.slug),
      Meteor.subscribe('stringId', this.params.uid)
    ];
  },
  data: function() {
    var slug = this.params.slug;
    var project = Projects.findOne({slug: slug});
    var board = Boards.findOne({slug: slug});
    if (!board || !project) return;
    var user = Users.findOne({_id: project.ownerId});
    $('meta[name=description]').remove();
    $('head').append( '<meta name="description" content="'+(project.descriptionText||project.logline||'Amazing campaign on O . S . H . (https://opensourcehollywood.org)')+'">' );
    document.title = project.title ? [project.title, 'on O . S . H . (opensourcehollywood.org).'].join(' ') : 'Campaign Details';
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
        numComments: function() {
          return Comments.find({projectId: slug}).count();
        },
        projectComments: function () {
          return Comments.find({projectId: slug});
        },
        submittedAgo: moment(project.createTimeActual, moment.ISO_8601).fromNow(),
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
        count: project.count,
        createdAt: project.createdAt,
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

Router.route('/edit/projects/:slug/edit', {
  name: 'EditProject',
  template: 'editProject',
  layoutTemplate: 'StaticLayout',
  onBeforeAction: function() {
    $('meta[name=description]').remove();
    $('head').append( '<meta name="description" content="Open Source Hollywood edit campaign mode.">' );
    document.title = 'Edit Campaign';
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
      // Meteor.subscribe('connectUser'),
      Meteor.subscribe('getMe')
    ];
  },
  action: function() {
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
    $('meta[name=description]').remove();
    $('head').append( '<meta name="description" content="Open Source Hollywood member correspondence channel.">' );
    document.title = 'Member Correspondence';
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
    if (user&&project) {
      var offers = Offers.find({uid: user._id, slug: project.slug});
      var receipts = Receipts.find({user: user._id, slug: project.slug});
      var messages = ProjectMessages.find({user: this.params.uid, project: project._id}).fetch();
      return {
        project: project,
        user: user,
        offers: offers,
        receipts: receipts,
        messages: messages
      }
    };
  }
})