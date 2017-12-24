Template.editor.events({
  // Pressing Ctrl+Enter should submit the form.
  'keydown textarea': function(event, t) {
      if (event.keyCode == 13 && (event.metaKey || event.ctrlKey)) {
          $(event.currentTarget).parents('form:first').submit();
      }
  },
});

Template.signin.events({
  // Pressing Ctrl+Enter should submit the form.
  'click .login': function() {
		lock.show();
	}
});

Template.about.events({
  // Pressing Ctrl+Enter should submit the form.
  'click .login': function() {
    lock.show();
  },
  'click #subscribe': function(e) {
    e.preventDefault();
    var email = $('#email').val();
    if (email) {
      Session.set('subscriptionEmail', email);
      Meteor.call("subscribeEmail", email);
      $('#email').val('');
      swal('Thank you for subscribing!');
    }
  }
});
