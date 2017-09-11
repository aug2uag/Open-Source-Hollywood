// Template.editProject.events({
//   'click .update':function(event){
//     var title = document.getElementById('title').innerHTML;
//     var logline = document.getElementById('logline').innerHTML;
//     var details = document.getElementById('details').innerHTML;
//     var genres = document.getElementById('genres').innerHTML.split(', ');

//     Meteor.call('editProject', this._id, title, logline, details, genres);
//   }, 
//   'click .cancel':function(){
//     window.history.back();
//   }
// });

//  Template.newProject.events({
//   'submit .addProjectForm':function(e){
//     var title = e.target.title.value;
//     var logline = e.target.logline.value;
//     var videoURL = e.target.video.value;
//     var details = e.target.details.value;
//     var genres = e.target.genres.value.split(',').map(function(e) { return e.trim().substr(0, 8); }) || [];
//     var needs = e.target.needs.value;
//     var budget = e.target.budget.value;

//     if (!title || !logline|| !details || !videoURL || !needs) {
//       bootbox.alert('enter values for all fields');
//       return false;
//     };
//     Meteor.call('addProject', title, logline, videoURL, details, genres, needs, budget);
//     return false;
//   }
// });

// Template.project.events({
//   "click .edit": function () {
//     var path = '/projects/' + this.slug + '/edit';
//     Router.go(path);
//   },
//   "click .delete": function () {
//     if (confirm("Are you sure you want to delete this?")){
//       Meteor.call("deleteProject", this._id);
//     }
//   },
//   "click .fa-chevron-up": function () {
//     Meteor.call("upvoteProject", this._id);
//   },
//   "click .fa-chevron-down": function () {
//     Meteor.call("downvoteProject", this._id);
//   }
// });

//   Template.projectTabs.events({
//     "click #hot": function(){
//       Session.set('order', 'hot');
//     },
//     "click #top": function(){
//       Session.set('order', 'top');
//     },
//     "click #newest": function(){
//       Session.set('order', 'newest');
//     },
//     "click #alphabetical": function(){
//       Session.set('order', 'alphabetical');
//     },
//     "click .next": function() {
//       var s = Session.get('pSkip');
//       s = s + 5;
//       Session.set('pSkip', s);
//     },
//     "click .prev": function() {
//       var s = Session.get('pSkip');
//       if (s !== 0 && s > 0){
//         s = s - 5;
//         Session.set('pSkip', s);
//       }
//     }
//   });

// Template.projectView.events({
//   "click .edit": function () {
//     var path = '/projects/' + this.slug + '/edit';
//     Router.go(path);
//   },
//   "click .delete": function () {
//     if (confirm("Are you sure you want to delete this?")){
//       Meteor.call("deleteProject", this._id);
//     }
//   },
//   'click #submit-comment': function() {
//     var text = document.getElementById('comment-box').value;
//     Meteor.call('addProjectComment', this._id, 0, text);
//   },
//   'click #fund': function() {
//     var was = this;
//     bootbox.dialog({
//       title: this.title,
//       message: '<div class="row">  ' +
//       '<div class="col-md-12"> ' +
//       '<h3>You\'re interested!</h3>' +
//       '<h5>What\'s your contribution:</h5>' + 
//       '<input id="contribution" type="number" placeholder="enter value">' +
//       '</div> </div>',
//       buttons: {
//         danger: {
//           label: "Cancel",
//           className: "btn-danger",
//           callback: function() {
            
//           }
//         },
//         success: {
//           label: "Continue",
//           className: "btn-success",
//           callback: function () {
//             // check if user previously applied
//             var contribution = $('#contribution').val();
//             // if number and less than 2/3 of budget update funded
//             contribution = contribution < 1 ? 0 : contribution;
//             Meteor.call('addUserToProject', contribution, was._id);
//           }
//         }
//       }
//     }
//     );
//   }
// });