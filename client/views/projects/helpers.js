// Template.newProject.helpers({
//   basicsTab: function() {
//     return Session.get('basicsTab');
//   },
//   rewardsTab: function() {
//     return Session.get('rewardsTab');
//   },
//   storyTab: function() {
//     return Session.get('storyTab');
//   },
//   aboutTab: function() {
//     return Session.get('aboutTab');
//   },
//   accountTab: function() {
//     return Session.get('accountTab');
//   },
//   previewTab: function() {
//     return Session.get('previewTab');
//   }
// });

// Template.project.helpers({
//   isOwner: function () {
//     return this.ownerId === Meteor.userId();
//   },
//   submittedAgo: function() {
//     return moment(this.createTimeActual, moment.ISO_8601).fromNow();
//   },
//   perCent: function() {
//     return this.duration/30 * 100;
//   }
// });

// Template.projectTabs.helpers({
//   projects: function () {
//     if (Session.equals('order', 'hot')) {
//       return Projects.find({}, {sort: {count: -1, createTimeActual: -1, title: 1}, skip: Session.get('pSkip'), limit: Session.get('pLimit')});
//     }
//     else if (Session.equals('order', 'top')){
//       return Projects.find({}, {sort: {count: -1}, skip: Session.get('pSkip'), limit: Session.get('pLimit')});
//     }
//     else if (Session.equals('order', 'newest')) {
//       return Projects.find({}, {sort: {createTimeActual: -1}, skip: Session.get('pSkip'), limit: Session.get('pLimit')});
//     }
//     else if (Session.equals('order', 'alphabetical')) {
//       return Projects.find({}, {sort: {title: 1}, skip: Session.get('pSkip'), limit: Session.get('pLimit')});
//     }
//     else { /*by default the tab is on hot, in hot order */
//       return Projects.find({}, {sort: {count: -1, createTimeActual: -1, title: 1}, skip: Session.get('pSkip'), limit: Session.get('pLimit')});
//     }
//   }
// });

// Template.projectView.helpers({
//   uid: function() {
//     return this._id;
//   },
//   perCent: function() {
//     return this.funded/this.budget * 100 > 100 ? 100 : this.funded/this.budget * 100;
//   },
//   isOwner: function () {
//     return this.ownerId === Meteor.user().profile.meetupId;
//   },
//   projectComments: function () {
//     return Comments.find({projectId:this._id});
//   },
//   submittedAgo: function() {
//     return moment(this.createTimeActual, moment.ISO_8601).fromNow();
//   },
//   numComments: function() {
//     var numComments = Comments.find({projectId: this._id}).count();
//     if (numComments === 1) {
//       return '1 comment';
//     }
//     else
//       return numComments + ' comments';
//   },
//   processedGenres: function() {
//     if (this.genres.length > 0) {
//       return this.genres.join(', ');
//     } else {
//       return 'none specified';
//     }
//   },
//   needs: function() {
//     return this.needs || 'watch video for details';
//   }
// });