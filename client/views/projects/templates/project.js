Template.project.events({
  "click .edit": function () {
    var path = '/projects/' + this.slug + '/edit';
    Router.go(path);
  },
  "click .delete": function () {
    if (bootbox.confirm("Are you sure you want to delete this?", function(r) {
      if (!r || r === false) return;
      Meteor.call("deleteProject", this._id);
    }));
  },
  "click .fa-chevron-up": function () {
    Meteor.call("upvoteProject", this._id);
  },
  "click .fa-chevron-down": function () {
    Meteor.call("downvoteProject", this._id);
  }
});

Template.project.helpers({
  isOwner: function () {
    return this.ownerId === Meteor.user()._id;
  },
  submittedAgo: function() {
    return moment(this.createTimeActual, moment.ISO_8601).fromNow();
  },
  perCent: function() {
    return this.duration/30 * 100;
  },
  foo: function() {
    console.log(this)
  }
});
