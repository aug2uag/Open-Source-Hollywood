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
    localStorage.setItem('redirectURL', '');
    lock.show();
  },

  'click #create': function() {
    localStorage.setItem('redirectURL', '/create');
    lock.show();
  },
  'click #sendMsg': function() {
    /** get message and subject / email, and send email */
    var o = {
      name: $('#msg_name').val(),
      email: $('#msg_email').val(),
      subject: $('#msg_subject').val(),
      message: $('#message').val()
    };
    if (!o.name||!o.email||!o.subject||!o.message) return vex.dialog.alert('please fill out all fields of the contact form to proceed');
    Meteor.call('splashMessage', o);
    $('#sendmessage').show();
  }
});

Template.splashPage.helpers({
  projects: function() {
    return Projects.find({
        archived: false
    }).fetch().map(function(i) {
      return {
        slug: i.slug,
        title: i.title,
        ownerId: i.ownerId,
        banner: i.banner,
        purpose: i.purpose,
        genre: i.genre, 
        funded: i.funded||0,
        category: i.category,
        logline: i.logline,
        ownerName: i.ownerName,
        cast: i.cast,
        crew: i.crew
      }
    });
  },
  ifProjs: function() {
    return Projects.find({
        archived: false
    }).count();
  },
  hotLN: function() {
    return Projects.find({
        archived: false
    }).count() > 20;
  },
  blogs: function() {
    // get blogs
  },
  ifBlogs: function() {
    // blogs count
    return false;
  }
})