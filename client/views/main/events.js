var blogSettings = {};
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

Template.newBlog.events({
  'change #banner_file': function (e, template) {
    if (e.currentTarget.files && e.currentTarget.files[0]) {
      blogSettings.banner = {};
      var reader = new FileReader();
      var files = e.target.files;
      var file = files[0];
      if (file.type.indexOf("image")==-1) {
        vex.dialog.alert('Invalid File, you can only upload a static image for your profile picture');
        return;
      };
      reader.onload = function(readerEvt) {
          blogSettings.banner.data = readerEvt.target.result;
          /** set file.name to span of inner el */
          $('#banner_file_name').text(file.name);
          $('#hidden_banner_name').show();
        }; 
      reader.readAsDataURL(file);
    }
  },

})

Template.newBlog.onRendered(function() {
  blogSettings = {};
  blogSettings.banner = {};
  $(document).ready(function() {
    $('#summernote').summernote({
      toolbar: [
        // [groupName, [list of button]]
        ['style', ['bold', 'underline', 'clear', 'fontname', 'strikethrough', 'superscript', 'subscript', 'fontsize', 'color']],
        ['para', ['ul', 'ol', 'paragraph', 'style']],
        ['height', ['height']],
        ['misc', ['undo', 'redo']],
        ['insert', ['picture', 'video', 'table', 'hr']]
      ],
      height: 300,
      minHeight: null,
      maxHeight: null,
      focus: false,
      tooltip: false,
      callbacks: {
        onInit: function() {
          $('.note-editable').html('<p><span class="large">Enter your campaign description here.</span><br>You can copy / paste text from another source here or use the menu above to format text and insert images from a valid URL.</p><p>&nbsp;</p>');
        }
      }
    });
  });
});