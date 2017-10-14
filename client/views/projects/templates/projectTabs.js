Handlebars.registerHelper('each_with_index', function(array, fn) {
  var buffer, i, item, j, len;
  buffer = '';
  for (j = 0, len = array.length; j < len; j++) {
    i = array[j];
    item = i;
    item.index = _i;
    buffer += fn(item);
  }
  return buffer;
});

Template.projectTabs.helpers({
  producerReady: function() {
    return !(Meteor.user() && Meteor.user().didSetProfile);
  },
  counts3: function() {
    var x = Session.get('pCount');
    x = x || 0;
    return x > 3 && Meteor.user();
  },
  counts30: function() {
    var x = Session.get('pCount');
    x = x || 0;
    return x > 30;
  },
  projects: function () {
    var pLimit = Session.get('pLimit') || 30;
    Session.set('pLimit', pLimit);
    if (Session.equals('order', 'hot')) {
      var p = Projects.find({archived: false, isLive: {$ne: true}}, {sort: {count: -1, createTimeActual: -1, title: 1}, skip: Session.get('pSkip'), limit: Session.get('pLimit')});
      Session.set('pCount', p.count());
      return p;
    }
    else if (Session.equals('order', 'top')){
      var p = Projects.find({archived: false, isLive: {$ne: true}}, {sort: {count: -1}, skip: Session.get('pSkip'), limit: Session.get('pLimit')});
      Session.set('pCount', p.count());
      return p;
    }
    else if (Session.equals('order', 'newest')) {
      var p = Projects.find({archived: false, isLive: {$ne: true}}, {sort: {createTimeActual: -1}, skip: Session.get('pSkip'), limit: Session.get('pLimit')});
      Session.set('pCount', p.count());
      return p;
    }
    else if (Session.equals('order', 'alphabetical')) {
      var p = Projects.find({archived: false, isLive: {$ne: true}}, {sort: {title: 1}, skip: Session.get('pSkip'), limit: Session.get('pLimit')});
      Session.set('pCount', p.count());
      return p;
    }
    else if (Session.equals('order', 'film')) {
      var p = Projects.find({archived: false, isLive: {$ne: true}, purpose: "Motion Pictures/Theatrical"}, {sort: {createTimeActual: -1}, skip: Session.get('pSkip'), limit: Session.get('pLimit')});
      Session.set('pCount', p.count());
      return p;
    }
    else if (Session.equals('order', 'music')) {
      var p = Projects.find({archived: false, isLive: {$ne: true}, purpose: "Music/Score"}, {sort: {createTimeActual: -1}, skip: Session.get('pSkip'), limit: Session.get('pLimit')});
      Session.set('pCount', p.count());
      return p;
    }
    else if (Session.equals('order', 'books')) {
      var p = Projects.find({archived: false, isLive: {$ne: true}, purpose: "Writing/Novel"}, {sort: {createTimeActual: -1}, skip: Session.get('pSkip'), limit: Session.get('pLimit')});
      Session.set('pCount', p.count());
      return p;
    }
    else { /*by default the tab is on hot, in hot order */
      var p = Projects.find({archived: false, isLive: {$ne: true}}, {sort: {count: -1, createTimeActual: -1, title: 1}, skip: Session.get('pSkip'), limit: Session.get('pLimit')});
      Session.set('pCount', p.count());
      return p;
    }
  }
});

Template.projectTabs.events({
  "click #hot": function(){
    Session.set('order', 'hot');
  },
  "click #top": function(){
    Session.set('order', 'top');
  },
  "click #newest": function(){
    Session.set('order', 'newest');
  },
  "click #alphabetical": function(){
    Session.set('order', 'alphabetical');
  },
  "click #film": function(){
    Session.set('order', 'film');
  },
  "click #music": function(){
    Session.set('order', 'music');
  },
  "click #books": function(){
    Session.set('order', 'books');
  },
  "click .next": function() {
    var s = Session.get('pSkip');
    s = s + 30;
    Session.set('pSkip', s);
  },
  "click .prev": function() {
    var s = Session.get('pSkip');
    if (s !== 0 && s > 0){
      s = s - 30;
      Session.set('pSkip', s);
    }
  }
});

Template.projectTabs.events({
  'click #createnewproject': function() {
    if (!Meteor.user()) {
      return bootbox.alert('you must sign in to do that')
    };
    Router.go('Create Project');
  }
})

Template.projectTabs.rendered = function () {
   $(document).ready(function(){
      $("#loadVideo").bind("click", function(){
        videoUrl = $(this).attr("data-video-src")
        $("#video").attr("src", videoUrl)
      });
    });
};


Template.userTabs.helpers({
  counts3: function() {
    var x = Session.get('uCount');
    x = x || 0;
    return x > 3 && Meteor.user();
  },
  counts30: function() {
    var x = Session.get('uCount');
    x = x || 0;
    return x > 30;
  },
  users: function () {
    var uLimit = Session.get('uLimit') || 30;
    Session.set('uLimit', uLimit);
    if (Session.equals('uorder', 'all')) {
      var p = Users.find({privacy: false}, {sort: {createdAt: 1}, skip: Session.get('uSkip'), limit: Session.get('uLimit')});
      Session.set('uCount', p.count());
      return p;
    }
    else if (Session.equals('uorder', 'viewer')){
      var p = Users.find({privacy: false, iam: {$in: ['viewer']}}, {sort: {createdAt: 1}, skip: Session.get('uSkip'), limit: Session.get('uLimit')});
      Session.set('uCount', p.count());
      return p;
    }
    else if (Session.equals('uorder', 'writer')) {
      var p = Users.find({privacy: false, iam: {$in: ['writer']}}, {sort: {createdAt: 1}, skip: Session.get('uSkip'), limit: Session.get('uLimit')});
      Session.set('uCount', p.count());
      return p;
    }
    else if (Session.equals('uorder', 'actor')) {
      var p = Users.find({privacy: false, iam: {$in: ['actor']}}, {sort: {createdAt: 1}, skip: Session.get('uSkip'), limit: Session.get('uLimit')});
      Session.set('uCount', p.count());
      return p;
    }
    else if (Session.equals('uorder', 'director')) {
      var p = Users.find({privacy: false, iam: {$in: ['director']}}, {sort: {createdAt: 1}, skip: Session.get('uSkip'), limit: Session.get('uLimit')});
      Session.set('uCount', p.count());
      return p;
    }
    else if (Session.equals('uorder', 'producer')) {
      var p = Users.find({privacy: false, iam: {$in: ['producer']}}, {sort: {createdAt: 1}, skip: Session.get('uSkip'), limit: Session.get('uLimit')});
      Session.set('uCount', p.count());
      return p;
    }
    else if (Session.equals('uorder', 'cinematographer')) {
      var p = Users.find({privacy: false, iam: {$in: ['cinematographer']}}, {sort: {createdAt: 1}, skip: Session.get('uSkip'), limit: Session.get('uLimit')});
      Session.set('uCount', p.count());
      return p;
    }
    else { /*by default the tab is on hot, in hot order */
      var p = Users.find({privacy: false}, {sort: {createdAt: 1}, skip: Session.get('uSkip'), limit: Session.get('uLimit')});
      Session.set('uCount', p.count());
      return p;
    }
  },
  formattedName: function() {
    return this.firstName + ' ' + this.lastName;
  },
  formattedAvatar: function() {
    return this.avatar;
  },
  formattedBio: function() {
    return this.bio || 'this user has not updated their bio';
  }
});

Template.userTabs.events({
  "click #all": function(){
    Session.set('uorder', 'all');
  },
  "click #viewer": function(){
    Session.set('uorder', 'viewer');
  },
  "click #writer": function(){
    Session.set('uorder', 'writer');
  },
  "click #actor": function(){
    Session.set('uorder', 'actor');
  },
  "click #director": function(){
    Session.set('uorder', 'director');
  },
  "click #producer": function(){
    Session.set('uorder', 'producer');
  },
  "click #cinematographer": function(){
    Session.set('uorder', 'cinematographer');
  },
  "click .next": function() {
    var s = Session.get('uSkip');
    s = s + 30;
    Session.set('uSkip', s);
  },
  "click .prev": function() {
    var s = Session.get('uSkip');
    if (s !== 0 && s > 0){
      s = s - 30;
      Session.set('uSkip', s);
    }
  }
});
