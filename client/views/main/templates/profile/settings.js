var osettings = {};
osettings.avatar = {};

function isURL(str) {
  var pattern = new RegExp('^(https?):\\/\\/[^ "]+$','i');
  return pattern.test(str);
}

function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}

Template.settings.events({
	'click #update': function(e) {
		e.preventDefault();
		var o = {};
		o.firstName = $('#first_name').val();
		o.lastName = $('#last_name').val();
		o.iam = [];
		$('.iam:checked').each(function() {
		    o.iam.push($(this).attr('value'));
		});
		o.interests = [];
		$('.interests:checked').each(function() {
		    o.interests.push($(this).attr('value'));
		});
		var url = $('#website').val();
		if (url && !isURL(url)) {
			bootbox.alert('Invalid URL, please include your website in "http://" or "https://" format for the URL.');
			return;
		};
		o.website = url;
		o.avatar = osettings.avatar;
		o.bio = $('#bio').val();
		Meteor.call('upgradeProfile', o);

	},
	'click #works_url_submit': function(e) {
		e.preventDefault();
		// collect URL/text, description
		// validate format of URL
		// add to global object
		// get #works_url and add to list

		// show dialog for uploading text/URL
		// uploading description of work
		// uploading date of work

		bootbox.dialog({
			message: '<label>Include the URL, description, and date of your work<br></label><input type="text" id="works_url" name="works_url" placeholder="Enter URL"><input type="text" id="works_description" name="works_description" placeholder="Description of your work"><input type="date" id="works_date" name="works_date" placeholder="Date of your work">',
			buttons: {
		        confirm: {
		            label: 'Add',
		            className: 'btn-success',
		            callback: function(e) {
		            	e.preventDefault();
		            	// scrape the URL, description, and date
		            	// add to data source
		            	// add to table
		            	var o = {
		            		url: $('#works_url').val(),
		            		description: $('#works_description').val() || 'no description provided',
		            		date: $('#works_date').val() || new Date(),
		            		id: guid() + new Date().getTime()
		            	}

		            	if (!o.url) return bootbox.alert('you must specify a URL for this to work');

		            	Meteor.call('updateList', 'onlineWorks', 'Your online works list', o);
		            }
		        },
		        cancel: {
		            label: 'Cancel',
		            className: 'btn-danger'
		        }
		    }
		})
	},
	'click .deleteWorksRow': function(e) {
		Meteor.call('removeFromList', 'onlineWorks', 'Your online works list', 'id', $(this)[0].id);
	},
	'click .deleteResourceRow': function(e) {
		Meteor.call('removeFromList', 'resources', 'Your resource list', 'id', $(this)[0].id);
	},
	'click .deleteSocialRow': function(e) {
		Meteor.call('removeFromList', 'socialLinks', 'Your social media links list', 'id', $(this)[0].id);
	},
	'click .deleteHeadshotsRow': function(e) {
		Meteor.call('removeFromList', 'headshots', 'Your personal files list', 'id', $(this)[0].url);
	},
	'click #social_media_submit': function(e) {
		e.preventDefault();
		var url = $('#social_media').val();
		if (!isURL(url)) {
			bootbox.alert('Invalid URL, please copy & paste the link that includes "http://" or "https://" for the URL.');
			return;
		};
		$('#social_media').val('');
		Meteor.call('updateList', 'socialLinks', 'Your social media links list', {
			url: url,
			id: guid()
		});

	},
	'click #headshots_submit': function(e) {
		e.preventDefault();
		if (Object.keys(osettings).length === 0) return;
		var reader = new FileReader();
        osettings.date = $('#headshots_date').val() && new Date($('#headshots_date').val()) || new Date(file.lastModifiedDate);
	    osettings.name = $('#headshots_name').val() || file.name;
	    osettings.description = $('#headshots_description').val() || 'no description was provided for this item';
	    osettings.tags = [];
	    $('.select_tag.active').each(function(idx,el) {
	    	osettings.tags.push($(el).html());
	    });
		reader.onload = function(readerEvt) {
            osettings.data = readerEvt.target.result;
	        delete osettings['file'];
	        var o = new Object(osettings);
	        delete o['avatar'];
			Meteor.call('uploadSettingFiles', 'headshots', osettings);
			$('#headshots_date').val('');
		    $('#headshots_name').val('');
		    $('#headshots_description').val('');
		    $('#fileInput').val('');
		    $('.select_tag.active').each(function(idx, el) {
		    	$(el).toggleClass("active");
		    });
        }; 
    	
        reader.readAsDataURL(osettings.file);
	},
	'click .select_tag': function(e) {
		e.preventDefault();
		$(e.target).toggleClass("active");
	},
	'click #resource_submit': function(e) {
		e.preventDefault();
		Meteor.call('updateList', 'resources', 'Your resources list', {
			resource: $( "#object_category option:selected" ).text(),
			details: $("#resource_details").val(),
			id: guid()
		});
	},
	'change #avatar_file': function (e, template) {
	    if (e.currentTarget.files && e.currentTarget.files[0]) {
	    	osettings.avatar = {};
	    	var reader = new FileReader();
	    	var files = e.target.files;
		    var file = files[0];
		    if (file.type.indexOf("image")==-1) {
		    	bootbox.alert('Invalid File, you can only upload a static image for your profile picture');
		    	return;
		    };
		    reader.onload = function(readerEvt) {
	            osettings.avatar.data = readerEvt.target.result;
		        var _url = "url(" + readerEvt.target.result + ")";
		        $('.logo').css("background-image", _url);
	        }; 
    		reader.readAsDataURL(file);
	  	}
	},
	'click .remove_headshot': function(e) {
		Meteor.call('removeFromList', 'headshots', 'Your personal files list', 'url', this.url.split('https://s3-us-west-2.amazonaws.com/producehour/headshots/')[1]);
	}
});

Template.settings.helpers({
	first_name: function() {
		return Meteor.user().firstName || 'enter first name';
	},
	last_name: function() {
		return Meteor.user().lastName || 'enter last name';
	},
	avatar: function() {
		return Meteor.user().avatar;
	},
	worksExamples: function() {
		return Meteor.user().onlineWorks && Meteor.user().onlineWorks.length > 0;
	},
	worksList: function() {
		return Meteor.user().onlineWorks;
	},
	headfiles: function() {
		return Meteor.user().headshots && Meteor.user().headshots.length > 0;	
	},
	headshots: function() {
		return Meteor.user().headshots.map(function(i) {
			i.url = 'https://s3-us-west-2.amazonaws.com/producehour/headshots/' + i.url;
			return i;
		});
	},
	resources: function() {
		return Meteor.user().resources && Meteor.user().resources.length > 0;
	},
	resourceList: function() {
		return Meteor.user().resources;
	},
	socialLinks: function() {
		return Meteor.user().socialLinks && Meteor.user().socialLinks.length > 0;
	},
	socialLinksList: function() {
		return Meteor.user().socialLinks;
	},
	isViewer: function() {
		return Meteor.user().iam.indexOf('viewer') > -1;
	},
	isWriter: function() {
		return Meteor.user().iam.indexOf('writer') > -1;
	},
	isDirector: function() {
		return Meteor.user().iam.indexOf('director') > -1;
	},
	isProducer: function() {
		return Meteor.user().iam.indexOf('producer') > -1;
	},
	isActor: function() {
		return Meteor.user().iam.indexOf('actor') > -1;
	},
	isCinematographer: function() {
		return Meteor.user().iam.indexOf('cinematographer') > -1;
	}
});

Template.settings.rendered = function () {
  $(".iam").each(function(){
    var val = $(this).attr('value');
    if (Meteor.user().iam.indexOf(val) > -1) {
      $(this).prop("checked", true);
    }
   });

  $(".interests").each(function(){
    var val = $(this).attr('value');
    if (Meteor.user().interests.indexOf(val) > -1) {
      $(this).prop("checked", true);
    }
   });

  var wbs = Meteor.user().website && Meteor.user().website.length > 0 ? Meteor.user().website : 'http://yoursite';
  $('#website').attr('placeholder', wbs);

  var _bio = Meteor.user().bio && Meteor.user().bio.length > 0 ? Meteor.user().bio : 'describe yourself and experiences';
  $('#bio').attr('placeholder', _bio);
};


Template.uploadForm.onCreated(function () {
  this.currentUpload = new ReactiveVar(false);
});

Template.uploadForm.helpers({
  currentUpload: function () {
    return Template.instance().currentUpload.get();
  }
});

Template.uploadForm.events({
  'change #fileInput': function (e, template) {
	    if (e.currentTarget.files && e.currentTarget.files[0]) {
	    	osettings = {};
	    	var files = e.target.files;
		    var file = files[0];
		    osettings.file = file;
		    osettings.size = file.size;
		    osettings.type = file.type;
	  	}
	}
});
