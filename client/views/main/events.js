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
    if (window.location.href.indexOf('/projects')>-1||window.location.href.indexOf('/profile')>-1) {
      localStorage.setItem('doShowLock', true);
      window.location.assign('/');
    } else {
      localStorage.removeItem('redirectURL');
      lock.show();      
    }
  },

  'click #create': function() {
    localStorage.removeItem('redirectURL');
    setTimeout(function() {
      localStorage.setItem('redirectURL', '/create');
      if (window.location.href.indexOf('/projects')>-1||window.location.href.indexOf('/profile')>-1) {
        localStorage.setItem('doShowLock', true);
        window.location.assign('/');
      } else {
        lock.show();
      }
    }, 144);
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
    }, {limit: 16}).fetch().map(function(i) {
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
    return Blogs.find({});
  },
  ifBlogs: function() {
    // blogs count
    return false;
  }
})

Template.newBlog.events({
  'change #banner_file': function(e, template) {
    if (e.currentTarget.files && e.currentTarget.files[0]) {
      var reader = new FileReader();
      var files = e.target.files;
      var file = files[0];
      if (file.type.indexOf("image")==-1) {
        vex.dialog.alert('Invalid File, you can only upload a static image for your banner picture');
        return;
      };
      reader.onload = function(readerEvt) {
          blogSettings.banner = readerEvt.target.result;
          /** set file.name to span of inner el */
          $('#banner_file_name').text(file.name);
          $('#hidden_banner_name').show();
        }; 
      reader.readAsDataURL(file);
    }
  },
  'change #image_file': function(e, template) {
    if (e.currentTarget.files && e.currentTarget.files[0]) {
      var reader = new FileReader();
      var files = e.target.files;
      var file = files[0];
      if (file.type.indexOf("image")==-1) {
        vex.dialog.alert('Invalid File, you can only upload a static image for your main picture');
        return;
      };
      reader.onload = function(readerEvt) {
          blogSettings.image = readerEvt.target.result;
          /** set file.name to span of inner el */
          $('#image_file_name').text(file.name);
          $('#hidden_image_name').show();
        }; 
      reader.readAsDataURL(file);
    }
  },
  'click #create_article': function(e) {
    e.preventDefault();
    /**
        image file
        summernote html & text
        title.trim()
        category:selected
        tags.split(',').trim()
      */
    var options = {};
    options.htmlText = $('#summernote').summernote('code').replace(/(<script.*?<\/script>)/g, '');
    options.plainText = $("#summernote").summernote('code')
        .replace(/<\/p>/gi, " ")
        .replace(/<br\/?>/gi, " ")
        .replace(/<\/?[^>]+(>|$)/g, "")
        .replace(/&nbsp;|<br>/g, " ")
        .trim();

    if (options.plainText&&options.plainText==='Enter or paste writing here. Use the menu above to format text and insert images from a valid URL.') {
      vex.dialog.alert('you did not enter your article\'s writing');
      return;
    }
    options.title = $('#title').val().trim();
    if (!options.title) {
      vex.dialog.alert('please enter a title');
      return;
    };
    options.teaser = $('#excerpt').val();
    if (!options.teaser) {
      vex.dialog.alert('please enter a short teaser');
      return;
    };
    options.summary = $('#summary').val();
    if (!options.summary) {
      vex.dialog.alert('please enter a summary');
      return;
    };
    var ts = $('#tags').val();
    try {
      ts = ts.trim();
    } catch(e) {};
    if (!ts) {
      vex.dialog.alert('please include at least one meaningful tag');
      return;
    };
    options.tags = ts.split(',').map(function(t) { return t.toLowerCase().trim(); });
    options.category = $('#category').find(":selected").text();
    if (options.category.indexOf('Category')>-1) {
      vex.dialog.alert('please select a category');
      return;
    }
    options._image = blogSettings.image;
    options._banner = blogSettings.banner;

    Meteor.call('createBlog', options);

    $('#title').val('');
    $('#excerpt').val('');
    $('#summary').val('');
    $('#tags').val('');
    $('#category').val('Select Category');
    $('.note-editable').html('<p><span class="large">Enter or paste writing here.</span><br>Use the menu above to format text and insert images from a valid URL.</p><p>&nbsp;</p>');
    delete blogSettings['image'];
    delete blogSettings['banner'];
  }
});

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
          $('.note-editable').html('<p><span class="large">Enter or paste writing here.</span><br>Use the menu above to format text and insert images from a valid URL.</p><p>&nbsp;</p>');
        }
      }
    });
  });
});

Template.blog.helpers({
  shareData: function() {
      ShareIt.configure({
          sites: {
              'facebook': {
                  'appId': '1790348544595983'
              }
          }
      });

      var backupURL = 'https://opensourcehollywood.org/blog/'+this._id;
      return {
        title: this.title,
        author: 'Open Source Hollywood',
        excerpt: this.teaser,
        summary: this.summary,
        description: this.plainText,
        thumbnail: this.image,
        image: this.image,
        url: backupURL
      }
  },
  moment: function() {
    var d = this.created || new Date;
    return moment(d).format('MMMM Do, YYYY');
  },
  _tags: function() {
    return this.tags.join(', ');
  },
  _htmlText: function() {
    var was = this;
    setTimeout(function() {
      $('#htmlText').html(was.htmlText);
    }, 1000);
  }
})

Template.blog.onRendered(function() {
   setTimeout(function() {
      $('.fb-share').html('<li class="fa fa-facebook"></li>');
      $('.tw-share').html('<li class="fa fa-twitter"></li>');
      $('.pinterest-share').html('<li class="fa fa-pinterest"></li>');
      $('.googleplus-share').html('<li class="fa fa-google-plus"></li>');
   }, 133);
 });

Template.bloglist.helpers({
    foo: function() {
    console.log(this)

  },
  moment: function() {
    var d = this.created || new Date;
    return moment(d).format('MMMM Do, YYYY');
  }
})