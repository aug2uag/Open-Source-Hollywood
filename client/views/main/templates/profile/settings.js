function videoURLValidation(url) {
	var vimeo = /^https:\/\/vimeo.com\/[\d]{8,}$/;
	var youtube = /^https:\/\/youtu.be\/[A-z0-9]{9,}$/;
	if (!vimeo.test(url)&&!youtube.test(url)) return url;
	if (url.indexOf('vimeo')>-1) {
		var patternMatch = /^https:\/\/vimeo.com\/([\d]{8,}$)/;
		var videoID = url.match(patternMatch)[1];
		return 'https://player.vimeo.com/video/' + videoID + '?autoplay=0&loop=1&autopause=0';
	} else {
		var patternMatch = /^https:\/\/youtu.be\/([A-z0-9]{9,}$)/;
		var videoID = url.match(patternMatch)[1];
		return 'https://www.youtube.com/embed/' + videoID;
	}
}

function validateUrl(url) {
	return /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(url);
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

function phoneVerifyVexCB(data, _vex) {
	// vex.closeAll();
    if (data) {
    	$('osh_loader').show();
        Meteor.call('verifyPhonePIN', data.pin, function(err, msg) {
        	$('osh_loader').hide();
        	vex.dialog.alert(msg);
        });
    }
}

function phoneVerifyVex() {
	var _vex = vex.dialog.open({
	    message: 'VERIFY PHONE NUMBER',
	    input: [
	        '<input type="text" value="Enter 4 digit PIN to verify:" readonly/>',
	        '<input name="pin" type="number" placeholder="XXXX" required />'
	    ].join(''),
	    buttons: [
	        $.extend({}, vex.dialog.buttons.YES, { text: 'PROCEED' }),
	        $.extend({}, vex.dialog.buttons.NO, { text: 'Cancel' })
	    ],
	    callback: function (data) {
	    	return phoneVerifyVexCB(data, _vex);
	    }
	});
}

Template.settings.events({
	'click #remove_phone_notify': function(e) {
		Meteor.call('removeNotificationRT', 'phone', function(err, msg) {
			vex.dialog.alert(msg);
		});
	},
	'click #remove_email_notify': function(e) {
		Meteor.call('removeNotificationRT', 'email', function(err, msg) {
			vex.dialog.alert(msg);
		});
	},
	'click #set-notifications': function(e) {
		e.preventDefault();
		/**
			read & send email val, phone val
			read & send checked preferences
		  */

		var o = {
			email: $('#email_notify').val(),
			phone: $('#phone_notify').val(),
			donations: $('#checkbox-Donations').prop('checked') ? true : false,
			applications: $('#checkbox-Applications').prop('checked') ? true : false,
			summaries: $('#checkbox-Donations').prop('checked') ? true : false
		}

		Meteor.call('setNotificationPreferences', o, function(err, result) {
			if (result) {
				if (result.indexOf('verification code')>-1) {
					/** show modal with verification code input */
					vex.dialog.open({
					    message: result,
					    input: [
					        '<input type="text" value="Enter 4 digit PIN to verify:" readonly/>',
					        '<input name="pin" type="number" placeholder="XXXX" required />'
					    ].join(''),
					    buttons: [
					        $.extend({}, vex.dialog.buttons.YES, { text: 'PROCEED' }),
					        $.extend({}, vex.dialog.buttons.NO, { text: 'Cancel' })
					    ],
					    callback: function (data) {
					        if (!data) {
					            console.log('Cancelled')
					        } else {
					        	vex.closeAll();
					        	$('osh_loader').show();
				                Meteor.call('verifyPhonePIN', data.pin, function(err, msg) {
				                	$('osh_loader').hide();
				                	vex.dialog.alert(msg);
				                });
					        }
					    }
					});
				} else {
					vex.dialog.alert(result);
				}
			};
		});

	},
	'click #resend_email_notify': function(e) {
		/** resend email verification */
		Meteor.call('resendVerification', 'email', function(err, msg) {
			vex.dialog.alert(msg);
		});
	},
	'click #resend_phone_notify': function(e) {
		/** resend phone verification */
		Meteor.call('resendVerification', 'phone', phoneVerifyVex);
	},
	'click #avatar_init': function(e) {
		e.preventDefault();
		$('#avatar_file').click();
	},
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
		var descriptionText = $('#summernote').summernote('code').replace(/(<script.*?<\/script>)/g, '');
      	var plainText = $("#summernote").summernote('code')
            .replace(/<\/p>/gi, " ")
            .replace(/<br\/?>/gi, " ")
            .replace(/<\/?[^>]+(>|$)/g, "")
            .replace(/&nbsp;|<br>/g, " ")
            .trim();
		if (plainText&&plainText!=='Enter your biography and self-description here. You can copy / paste text from another source here or use the menu above to format text and insert images from a valid URL.') {
			o.bio = descriptionText;
			o.bio_plaintext = plainText;
		} else {
			o.bio = '';
		};
		o.primaryRole = $('#category').find(":selected").text();
		if (o.primaryRole.toLowerCase().indexOf('primary')>-1) delete o['primaryRole'];
		o.iam = [];
		o.assets = [];
		o.social = [];
		o.reels = [];
		o.avatar = osettings.avatar;
		if ($('#website').val().trim()&&$('#website').val()!=='enter http://www.your.site') o.website = $('#website').val();

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
			_o.url = $(arr[0]).text();
			o.reels.push(_o);
		});

		Meteor.call('upgradeProfile', o);

	},
	'click #add_account': function(e) {
		e.preventDefault();
		var opts = {};
		opts.country = $('#country').val();
		opts.currency = $('#currency').val();
		opts.account_holder_name = $('#account_holder_name').val();
		opts.account_holder_type = $('#account_holder_type').val();
		opts.routing_number = $('#routing_number').val();
		opts.account_number = $('#account_number').val();
		opts.default_for_currency = true;
		opts.object = 'bank_account';
		Meteor.call('updateBanking', opts, function(err, result) {
			if (err) return vex.dialog.alert('there was an error updating your account information, please try again later or contact us if you need assistance');
			return vex.dialog.alert(result||'account updated');
		});
	},
	'click .reset_transfer': function(e) {
		Meteor.call('deleteBanking');
	},
	'change #avatar_file': function (e, template) {
	    if (e.currentTarget.files && e.currentTarget.files[0]) {
	    	osettings.avatar = {};
	    	var reader = new FileReader();
	    	var files = e.target.files;
		    var file = files[0];
		    if (file.type.indexOf("image")==-1) {
		    	vex.dialog.alert('Invalid File, you can only upload a static image for your profile picture');
		    	return;
		    };
		    reader.onload = function(readerEvt) {
	            osettings.avatar.data = readerEvt.target.result;
	            $('#image_avatar').attr('src', readerEvt.target.result);
		        var _url = "url(" + readerEvt.target.result + ")";
		        $('.logo').css("background-image", _url);
	        }; 
    		reader.readAsDataURL(file);
	  	}
	},
	'click #add-needs': function(e) { 
      e.preventDefault();
      var cat = $('#needs-category').val(), description = $('#needs-description').val();
      if (cat.toLowerCase().indexOf('category')>-1) return;
      if (cat && description) $('#needs-table').append('<tr class="needs-val"><td>'+cat+'</td><td>'+description+'</td><td><button class="deleteRow button small">X</button></td></tr>');
      $('.deleteRow').on('click', deleteRow);
      $("#needs-category").val($("#needs-category option:first").val()), $('#needs-description').val('');
    },
    'click #add-social': function(e) { 
      e.preventDefault();
      var title = $('#social-title').val(), url = $('#social-url').val();
      if (title && url) $('#social-table').append('<tr class="social-val"><td>'+title+'</td><td>'+url+'</td><td><button class="deleteRow button small">X</button></td></tr>');
      $('.deleteRow').on('click', deleteRow);
      $('#social-title').val(''), $('#social-url').val('');
    },
    'click #add-reel': function(e) { 
      e.preventDefault();
      var url = videoURLValidation($('#reel-url').val().trim());
      if (url) {
      	  $('#reel-table').append('<tr class="reel-val"><td>'+url+'</td><td><button class="deleteRow button small">X</button></td></tr>');
	      $('.deleteRow').on('click', deleteRow);
	      $('#reel-url').val('');
	  }
    },
    'click #vidurl': function(e) {
    	e.preventDefault();
    	vex.dialog.open({
		    message: 'How to link YouTube and Vimeo URLs',
		    input: [
				'<div class="embed-responsive embed-responsive-4by3">',
				'<iframe class="embed-responsive-item" src="/img/vidurls.mp4"></iframe>',
				'</div>',
		    ].join(''),
		    buttons: [
		        $.extend({}, vex.dialog.buttons.NO, { text: 'Close' })
		    ]
		});
    }
});

Template.settings.helpers({
	createAccount: function() {
		Meteor.call('createBankingAccount');
	},
	foo: function() {
		var x = Meteor.user();
		return !(x.primaryRole || (x.iam && x.iam.length));
	},
	approvedCamps: function() {
		var _id = Meteor.user()._id;
		return Projects.find({
	        $and: [
	          { archived: false },
	          { usersApproved: _id }
	        ]
	    });
	},
	equityCamps: function() {
		/** 
			if my id is in list of equity holders:
				id:
				details: {
					value: percent equity
					date assigned:
					considerationType: author | patron | cast | crew | resource
					considerationValue: amount | role | resource -- details
				}
		*/
		var _id = Meteor.user()._id;
		return Projects.find({
			$or: [
				{
					$and: [
			          { archived: true },
			          { ownerId: _id }
			        ]
				},
				{
					"equity.id": _id
				}
			]
	    });
	},
	createdCamps: function() {
		var _id = Meteor.user()._id;
		return Projects.find({
	        $and: [
	          { archived: false },
	          { ownerId: _id }
	        ]
	    });
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
	website: function() {
		return Meteor.user().website || 'enter http://www.your.site'
	},
	avatar: function() {
		return Meteor.user().avatar;
	},
	account: function() {
		if (Meteor.user().account) return true;
		return false;
	},
	bank: function() {
		return Meteor.user()&&Meteor.user().bank||false;
	},
	bank_name: function() {
		return Meteor.user().bank.bank_name;
	},
	account_no: function() {
		return '********'+Meteor.user().bank.last4;
	},
	routing_no: function() {
		return Meteor.user().bank.routing_number;
	},
	emailConfig: function() {
		var configs = Meteor.user().notification_preferences  || {};
		var _email = configs.email || {};
		return _email.verification || false;
	},
	emailReverify: function() {
		var configs = Meteor.user().notification_preferences  || {};
		var _email = configs.email || {};
		if (_email.email&&_email.verification===false) {
			return true;
		};
		return false;
	},
	emailValue: function() {
		var configs = Meteor.user().notification_preferences  || {};
		var _email = configs.email || {};
		return _email.email || '';
	},
	emailConfigStatus: function() {
		var configs = Meteor.user().notification_preferences  || {};
		if (!configs.email) return 'N / A';
		var _email = configs.email || {};
		if (_email.verification) return 'verified';
		return 'not verified';
	},
	phoneConfig: function() {
		var configs = Meteor.user().notification_preferences  || {};
		var _phone = configs.phone || {};
		return _phone.verification || false
	},
	phoneReverify: function() {
		var configs = Meteor.user().notification_preferences  || {};
		var _phone = configs.phone || {};
		if (_phone.phone&&_phone.verification===false) {
			return true;
		};
		return false;
	},
	phoneValue: function() {
		var configs = Meteor.user().notification_preferences  || {};
		var _phone = configs.phone || {};
		return _phone.phone || '';
	},
	phoneConfigStatus: function() {
		var configs = Meteor.user().notification_preferences  || {};
		if (!configs.phone) return 'N / A';
		var _phone = configs.phone || {};
		if (_phone.verification) return 'verified';
		return 'not verified';
	},
	messages: function() {
		var projects = Projects.find({
	        $and: [
	          {archived: false},
	          {ownerId: Meteor.user()._id}
	        ]
	    }).fetch().map(function(p) {
	    	return p._id;
	    });
		var messages = ProjectMessages.find({ 
			$or: [
				{ user: Meteor.user()._id } , 
				{ project: { $in: projects } }
			] 
		}, { 
				sort: { createTimeActual: -1 } 
		}).fetch();

		return messages.filter(function(m) {
			if (Meteor.user()._id!==m.ownerId) return m;
		});
	}
});

Template.settings.rendered = function () {
  if ($(window).width()<580) {
  	setTimeout(function() {
  		$($( ".tabs-select" )[1]).prepend('<i id="crazed_foo" class="fa fa-chevron-down fa-2x" style="position:absolute;pointer-events:none;"></i>');
  	}, 610);
  }
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
  	$('#needs-table').append('<tr class="needs-val"><td>'+el.category+'</td><td>'+el.description+'</td><td><button class="deleteRow button small">X</button></td></tr>');
  	$('.deleteRow').on('click', deleteRow);
  });

  // set social table
  Meteor.user().social.forEach(function(el) {
  	$('#social-table').append('<tr class="social-val"><td>'+el.name+'</td><td>'+el.address+'</td><td><button class="deleteRow button small">X</button></td></tr>');
  	$('.deleteRow').on('click', deleteRow);
  });

  // set reel-table
  Meteor.user().reels.forEach(function(el) {
  	$('#reel-table').append('<tr class="reel-val"><td>'+el.url+'</td><td><button class="deleteRow button small">X</button></td></tr>');
  	$('.deleteRow').on('click', deleteRow);
  });

  var wbs = Meteor.user().website && Meteor.user().website.length > 0 ? Meteor.user().website : 'enter http://www.your.site';
  $('#website').attr('placeholder', wbs);

  $(document).ready(function() {
      $('#summernote').summernote({
      	toolbar: [
		    // [groupName, [list of button]]
		    ['style', ['clear', 'fontname', 'strikethrough', 'superscript', 'subscript', 'fontsize', 'color']],
		    ['para', ['paragraph', 'style']],
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
            $('.note-editable').html(Meteor.user&&Meteor.user().bio||'<p><span class="large">Enter your biography and self-description here.</span><br>You can copy / paste text from another source here or use the menu above to format text and insert images from a valid URL.</p><p>&nbsp;</p>');
          }
        }
      });
  });

};
