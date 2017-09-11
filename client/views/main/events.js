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

Template.splashPage.events({
  // Pressing Ctrl+Enter should submit the form.
  'click .login': function() {
    console.log('foo lala')
    lock.show();
  }
});
