function validateUrl(value) {
	return true // how to handle username ?
	return /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(value);
}

function deleteRow(e) {
	e.preventDefault();
	$(this).closest('tr').remove();
}

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
	'click #save_settings': function(e) {
		e.preventDefault();


		/**
			firstname
			lastname
			bio
			category -- primaryRole
			user-role -- checkboxes //array
			needs-val  == table //array
			social-val  == table //array
			reel-val  == table //array

		*/


		var o = {};
		o.firstName = $('#first_name').val();
		o.lastName = $('#last_name').val();
		o.bio = $('#bio').val();
		o.primaryRole = $('#category').find(":selected").text();
		if (o.primaryRole.toLowerCase().indexOf('primary')>-1) delete o['primaryRole'];
		o.iam = [];
		o.assets = [];
		o.social = [];
		o.reels = [];
		o.avatar = osettings.avatar;

		var userRoles = $('.user-role');
		userRoles.each(function(idx, el) {
			if ($(el).prop('checked')) o.iam.push($(el).attr('name'));
		});

		var userAssets = $('.needs-val');
		userAssets.each(function(i, el) {
			var _o = {};
			var arr = $(el).children('td');
			_o.category = $(arr[0]).text();
			_o.description = $(arr[1]).text();
			_o.quantity = $(arr[2]).text();
			o.assets.push(_o);
		});

		var userSocial = $('.social-val');
		userSocial.each(function(i, el) {
			var _o = {};
			var arr = $(el).children('td');
			_o.name = $(arr[0]).text();
			_o.address = $(arr[1]).text();
			o.social.push(_o);
		});

		var userReels = $('.reel-val');
		userReels.each(function(i, el) {
			var _o = {};
			var arr = $(el).children('td');
			_o.name = $(arr[0]).text();
			_o.address = $(arr[1]).text();
			o.reels.push(_o);
		});

		Meteor.call('upgradeProfile', o);

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
	'click #add-needs': function(e) { 
      e.preventDefault();
      var cat = $('#needs-category').val(), description = $('#needs-description').val(), quantity = parseInt($('#needs-quantity').val());
      if (cat.toLowerCase().indexOf('category')>-1) return;
      if (typeof quantity !== 'number' || quantity<1) return;
      if (cat && description && quantity) $('#needs-table').append('<tr class="needs-val"><td>'+cat+'</td><td>'+description+'</td><td>'+quantity+'</td><td><button class="deleteRow button small">X</button></td></tr>');
      $('.deleteRow').on('click', deleteRow);
      $("#needs-category").val($("#needs-category option:first").val()), $('#needs-description').val(''), $('#needs-quantity').val('');
    },
    'click #add-social': function(e) { 
      e.preventDefault();
      var title = $('#social-title').val(), url = $('#social-url').val();
      if (title && url && validateUrl(url)) $('#social-table').append('<tr class="social-val"><td>'+title+'</td><td>'+url+'</td><td><button class="deleteRow button small">X</button></td></tr>');
      $('.deleteRow').on('click', deleteRow);
      $('#social-title').val(''), $('#social-url').val('');
    },
    'click #add-reel': function(e) { 
      e.preventDefault();
      var title = $('#reel-title').val(), url = $('#reel-url').val();
      if (title && url && validateUrl(url)) $('#reel-table').append('<tr class="reel-val"><td>'+title+'</td><td>'+url+'</td><td><button class="deleteRow button small">X</button></td></tr>');
      $('.deleteRow').on('click', deleteRow);
      $('#reel-title').val(''), $('#reel-url').val('');
    }
});

Template.settings.helpers({
	foo: function() {
		var x = Meteor.user();
		return !(x.primaryRole || (x.iam && x.iam.length));
	},
	bio: function() {
		return Meteor.user().bio || 'describe yourself and your experiences'
	},
	first_name: function() {
		return Meteor.user().firstName || 'First name';
	},
	last_name: function() {
		return Meteor.user().lastName || 'Last name';
	},
	avatar: function() {
		return Meteor.user().avatar;
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

  // set primaryRole
  if (Meteor.user().primaryRole) {
  	var val = Meteor.user().primaryRole;
  	$("#category").val(val);
  };

  // set user-role
  Meteor.user().iam.forEach(function(el) {
  	var elId = '#checkbox-' + el;
  	$(elId).prop("checked", true);
  });
  
  // set needs-table
  Meteor.user().assets.forEach(function(el) {
  	$('#needs-table').append('<tr class="needs-val"><td>'+el.category+'</td><td>'+el.description+'</td><td>'+el.quantity+'</td><td><button class="deleteRow button small">X</button></td></tr>');
  	$('.deleteRow').on('click', deleteRow);
  });

  // set social table
  Meteor.user().social.forEach(function(el) {
  	$('#social-table').append('<tr class="social-val"><td>'+el.name+'</td><td>'+el.address+'</td><td><button class="deleteRow button small">X</button></td></tr>');
  	$('.deleteRow').on('click', deleteRow);
  });

  // set reel-table
  Meteor.user().reels.forEach(function(el) {
  	$('#reel-table').append('<tr class="social-val"><td>'+el.name+'</td><td>'+el.address+'</td><td><button class="deleteRow button small">X</button></td></tr>');
  	$('.deleteRow').on('click', deleteRow);
  });

  var wbs = Meteor.user().website && Meteor.user().website.length > 0 ? Meteor.user().website : 'http://yoursite';
  $('#website').attr('placeholder', wbs);

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
