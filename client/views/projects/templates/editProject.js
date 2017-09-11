Template.editProject.events({
  'click .update':function(event){
    var obj = {
      title:document.getElementById('title').innerHTML,
      logline:document.getElementById('logline').innerHTML,
      videoURL: document.getElementById('videoURL').innerHTML,
      details:document.getElementById('details').innerHTML,
      genres:document.getElementById('genres').innerHTML.split(', '),
      slug: this.slug
    };
    Meteor.call('editProject', obj);
  }, 
  'click .cancel':function(){
    window.location.assign('/projects');
  }
});

Template.editProject.helpers({
  fundingGoal: function() {
    if (this.budget) {
      return '$ ' + this.budget
    }
    return 'none specified';
  },
  genresFormatted: function() {
    if (this.genres.length > 0) {
      var _genres = this.genres.join(', ');
      return _genres.substr(0, _genres.length - 2);
    } else {
      return 'no genres specified';
    }
  }
})