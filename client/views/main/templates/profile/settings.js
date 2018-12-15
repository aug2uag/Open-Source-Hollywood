var gifts = [], resources = [], reels = [], social = [];
var osettings = {giftImage: {}, avatar: {}};
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

function appendResourceToTable(o, set) {
	if (set===true) {
		resources.push(o)
		Session.set('resources', resources);
	}
	$('#assets-table-toggle').show()
	$('#needs-table').append('<tr class="needs-val"><td>'+o.category||'N/A'+'</td><td>'+o.name||'N/A'+'</td><td>'+o.description||'N/A'+'</td><td><button val="resource" class="deleteRow button small">X</button></td></tr>');
	$('.deleteRow').off()
	$('.deleteRow').on('click', deleteRow);
	$("#needs-category").val($("#needs-category option:first").val()), $('#needs-description').val('');
}

function appendSocialToTable(o, set) {
	if (set===true) {
		social.push(o)
		Session.set('social', social);
	}
	$('#social-table-toggle').show()
	$('#social-table').append('<tr class="social-val"><td>'+o.name+'</td><td>'+o.address+'</td><td><button val="social" class="deleteRow button small special">X</button></td></tr>');
	$('.deleteRow').off()
	$('.deleteRow').on('click', deleteRow);
	$('#social-title').val(''), $('#social-url').val('');
}

function appendMediaURLtoTable(o, set) {
	if (!o.url) return;
	if (set===true) {
		reels.push(o)
		Session.set('reels', reels);
	}
	console.log(o)
	$('#reel-table-toggle').show()
	$('#reel-table').append([
	  	'<tr class="krown-pricing-title reel-val">',
	  		'<td><div class="krown-column-container">',
	  			o.name?'<small>'+o.name+'</small><br>':'',
	  			o.url,
	  			'</div><div class="krown-pie">',
	  			'<button val="reel" class="right deleteRow button special small">X</button>',
	  		'</div></td>',
	  	'</tr>'
	  ].join(''));
	$('.deleteRow').off()
	$('.deleteRow').on('click', deleteRow);
	$('#reel-name').val('');
	$('#reel-url').val('');
}

function validateUrl(url) {
	return /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(url);
}

function deleteRow(e) {
	e.preventDefault();

	var ctx = $(e.target).attr('val')
	console.log('in deleteRow', ctx)
	if (ctx) {
	  try {
	    var idx = $($(e.target).closest('tr')).index();

	    if (ctx==='gift') {
	    	
	      gifts.splice(idx, 1);
	    };

	    if (ctx==='resource') {
	      resources.splice(idx, 1);
	    };

	    if (ctx==='reel') {
	      reels.splice(idx, 1);
	    };

	    if (ctx==='social') {
	    	console.log('remove social at index', idx)
	      social.splice(idx, 1);
	      console.log(social)
	    };
	  } catch(e) {}
	};

	$(e.target).closest('tr').remove();
}

function removeGift(e) {
  e.preventDefault();
  var idx = $($(this).closest('tr')).index();
  gifts.splice(idx, 1);
  $(this).closest('tr').remove();
}

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

function phoneVerifyVexCB(data) {
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
	vex.dialog.open({
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
	    	console.log(data)
	    	return phoneVerifyVexCB(data);
	    }
	});
}

function saveSettings(o) {
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

	o = o || {};
	o.firstName = $('#first_name').val();
	o.lastName = $('#last_name').val();
	var descriptionText = $('#summernote').summernote('code').replace(/(<script.*?<\/script>)/g, '');
  	var plainText = $("#summernote").summernote('code')
        .replace(/<\/p>/gi, " ")
        .replace(/<br\/?>/gi, " ")
        .replace(/<\/?[^>]+(>|$)/g, "")
        .replace(/&nbsp;|<br>/g, " ")
        .trim();
	if (plainText&&plainText.indexOf('https://en.wikipedia.org/wiki/Template:Biography')===-1) {
		o.bio = descriptionText;
		o.bio_plaintext = plainText;
	} else {
		o.bio = '';
	};
	o.primaryRole = $('#category').find(":selected").text();
	if (o.primaryRole.toLowerCase().indexOf('primary')>-1) delete o['primaryRole'];
	o.iam = [];
	o.assets = resources||[];
	o.social = social||[];
	o.reels = reels||[];
	o.gifts = gifts||[];

	o.avatar = osettings.avatar;
	if ($('#website').val().trim()&&$('#website').val()!=='enter http://www.your.site') o.website = $('#website').val();

	var userRoles = $('.user-role');
	userRoles.each(function(idx, el) {
		if ($(el).prop('checked')) o.iam.push($(el).attr('name'));
	});

	Meteor.call('upgradeProfile', o);
}

Template.settings.onRendered(function() {
    setTimeout(function() {
      var script = document.createElement('script');
      script.src = "/js/scripts.min.js";
      document.head.appendChild(script);
    }, 987);
    setTimeout(function() { 
    	$('#gotoemailpref').removeClass('animated'); 
    }, 2499);
})

Template.settings.events({
	'click .res_show_setting': function(e) {
	    $('.settings_view_toggle').hide()
	    $('.res_show_setting').removeClass('bold')
	    $(e.target).addClass('bold')
	    var v= $(e.target).attr('val')
	    var id = '#' + v
	    $(id).show()
	},
	'click .res_show_opt': function(e) {
	    $('.res_opt_set').hide()
	    $('.res_show_opt').removeClass('bold')
	    $(e.target).addClass('bold')
	    var v= $(e.target).attr('val')
	    var id = '#' + v
	    $(id).show()
	},
	'click #gotoemailpref': function(e) {
		e.preventDefault();
		$('#not1').click();
		$('#not2').click();
	},
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
	'click #file_gift': function(e) {
	    $('#gift_file').click();
	},
	'change #gift_file': function (e, template) {
		if (e.currentTarget.files && e.currentTarget.files[0]) {
			osettings.giftImage = {};
			var reader = new FileReader();
			var files = e.target.files;
			var file = files[0];
			if (file.type.indexOf("image")==-1) {
			  vex.dialog.alert('Invalid File, you can only upload a static image for your profile picture');
			  return;
			};
			reader.onload = function(readerEvt) {
			    osettings.giftImage.data = readerEvt.target.result;
			    $('#merch_thumbnail').attr('src', osettings.giftImage.data);
			    $('#merch_thumbnail').show();
			}; 
			reader.readAsDataURL(file);
		}
	},
	'click .save_settings': function(e) {
		e.preventDefault();
		saveSettings({showDialog:true});
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
	      
	      var o = {
	      	category: $('#needs-category').val(),
	      	name: $('#needs-title').val(),
	      	description: $('#needs-description').val(),
	      	location: $('#needs-location').val(),
	      	pricing: {
	      		fixed: parseFloat($('#needs-offer-fixed').val()),
	      		hourly: parseFloat($('#needs-offer-hour').val()),
	      		daily: parseFloat($('#needs-offer-day').val()),
	      		weekly: parseFloat($('#needs-offer-week').val())
	      	},
	      	availability: $('.need-sched:checkbox:checked').map(function(el){ return $(this).val();}).get(),
	      	paySchedule: $('.need-payopt:checkbox:checked').map(function(el){ return $(this).val();}).get(),
	      }

	      if (o.paySchedule.indexOf('deposit')>-1) {
	      	o.deposit = {
	      		type: $('#input-fixed-need').val() ? 'usd' : 'percent',
	      		amount: $('#input-fixed-need').val() || $('#input-percent-need').val()
	      	}
	      };

	      if (!o.category||!o.name) return vex.dialog.alert('please select a valid category for your resource');

	      try {
	      	var x = /^\d{5}$/.exec(o.location.trim())
	      	if (!x) throw new Error()
	      } catch(e) {
	      	return vex.dialog.alert('invalid postal code detected, please enter valid zipcode or postal code')
	      }

	      appendResourceToTable(o, true)
    },
    'click #add-social': function(e) { 
      e.preventDefault();
      appendSocialToTable({
      	name: $('#social-title').val(),
      	address: $('#social-url').val()
      }, true)
    },
    'click #add-reel': function(e) { 
      e.preventDefault();
      appendMediaURLtoTable({
      	name: $('#reel-name').val().trim(),
      	url: videoURLValidation($('#reel-url').val().trim())
      }, true)
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
    },
	'change #merchtype': function(e) {
		e.preventDefault();
		var giftType = $('#merchtype option:selected').val();
		if (giftType.indexOf('Select')>-1) return alert('please select merchandise type');
		$('#merchtypehidden').show();
		if (giftType==='Apparel') {
		  $('#apparelsizes').show();
		  $('#perishabledetails').hide();
		} else if (giftType==='Perishable') {
		  $('#apparelsizes').hide();
		  $('#merch_handling').prop("placeholder", "Shelf Life and Handling Instructions");
		  $('#perishabledetails').show();
		} else {
		  $('#apparelsizes').hide();
		  $('#merch_handling').prop("placeholder", "Details and Handling Instructions");
		  $('#perishabledetails').show();
		};
	},
	'click #add-gift': function(e) {
		e.preventDefault();
		var o = {};
		o.name = $('#gift-title').val(), o.description = $('#gift-description').val(), o.msrp = parseFloat($('#gift-msrp').val());
		if (!o.name || Number.isFinite(o.msrp) === false || o.msrp < 1) return alert('please correct the name or price information to continue');
		if (!osettings.giftImage.data) o.url = 'https://s3-us-west-2.amazonaws.com/producehour/placeholder_gift.jpg';
		else o.data = osettings.giftImage.data;
		// get type
		o.type = $('#merchtype option:selected').val();
		if (o.type.indexOf('Select')>-1) return alert('please select merchandise type');
		if (o.type==='Apparel') {
		  o.secondaryData = $('.apparelsize:checkbox:checked').map(function(el){ return $(this).val();}).get();
		} else {
		  o.secondaryData = $('#merch_handling').val();
		};
		o.disclaimer = $('#merch_disclaimer').val();
		osettings.giftImage = {};
		gifts.push(o);
		var tblRow = [
		  	'<tr class="gift-val after-the-fact">',
		    '<td>'+o.name+'</td>',
		    '<td>'+o.type+'</td>',
		    '<td>'+o.description+'</td>',
		    '<td>'
		];

		if (o.secondaryData) tblRow.push('<strong><small>DATA:</small></strong>&nbsp;'+o.secondaryData);
		if (o.disclaimer) tblRow.push('<br><strong><small>DISCLAIMER:</small></strong>&nbsp;'+o.disclaimer);
		tblRow = tblRow.concat([
		  	'</td>',
		    '<td>'+o.msrp+'</td>',
		    '<td><button class="removeGift button special">X</button></td></tr>'
		]);
		$('#gift-table').append(tblRow.join(''));
		$('.removeGift').on('click', removeGift);
		$('#gift-title').val(''), $('#gift-description').val(''), $('#gift-quantity').val(''), $('#gift-msrp').val('');
		/** set file.name to span of inner el */
		$('#settings_add_merch_form')[0].reset();
		$('#merch_thumbnail').hide();
		saveSettings();
	},
	'input #social-title': function() { 
		if (true) {};
		$('#add-social').removeClass('btn'), $('#add-social').removeClass('disabled')
	},
	'input #reel-url': function() { 
		if (true) {};
		$('#add-reel').removeClass('btn'), $('#add-reel').removeClass('disabled')
	},
	'input #needs-title': function() { 
		if (true) {};
		$('#add-needs').removeClass('btn'), $('#add-needs').removeClass('disabled')
	},
	'input #input-percent-need': function() { 
		$('#percent_deposit_val').text($('#input-percent-need').val()) 
	},
	'click #checkbox-need-deposit': function() { 
		if ($('input#checkbox-need-deposit').is(':checked')) { $('.percent_deposit').show() } else { $('.percent_deposit').hide() }
	},
	'input #input-fixed-need': function() { 
		if ($('#input-fixed-need').val()) {
			$('#input-percent-need').prop('disabled', true)
			$('#percent_deposit_sign').text(' USD')
			$('#percent_deposit_val').text($('#input-fixed-need').val())
		} else {
			$('#input-percent-need').prop('disabled', false)
			$('#percent_deposit_sign').text('%')
			$('#percent_deposit_val').text($('#input-percent-need').val()||10)
		}
	}
});

Template.settings.helpers({
	resources: function() {
		return Session.get('resources');
	},
	init: function() {
		Session.set('resources', resources)
		Session.set('gifts', gifts)
	},
	giftPurchases: function() {
		return Meteor.user().giftPurchases||[]
	},
	purchaseAMT: function() {
		return this.token.receipt.amount/100
	},
	purchaseStatus: function() {
		return this.status||'unfulfilled'
	},
	hasEmail: function() {
		return Meteor.user().email!==null
	},
	hasGifts: function() {
		return Meteor.user().gifts&&Meteor.user().gifts.length
	},
	userGifts: function() {
		return Meteor.user().gifts||[]
	},
	createAccount: function() {
		Meteor.call('createBankingAccount');
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
	activeCamps: function() {
		var _id = Meteor.user()._id;
		var _x = Projects.find({
	        $and: [
	          { archived: false },
	          { usersApproved: _id }
	        ]
	    }).fetch();
	    var x = _x.map(function(p) {
	    	p.scope = 'approved';
	    	return p;
	    });

		var _y = Projects.find({
	        $and: [
	          { archived: false },
	          { ownerId: _id }
	        ]
	    }).fetch();
	    var y = _y.map(function(p) {
	    	p.scope = 'created';
	    	return p;
	    });

	    return x.concat(y);
	},
	isCreated: function() {
		if (this.scope==='created') return true;
		return false;
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
		/** 
			THIS METHOD IS COMPLETELY FUCKED
				- used to show each message
				- now it's one negotiations tab (set)

		  	IT SHOULD SHOW UNIQUE PROJ BY OFFERS, not messages
		  */
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
				{ 
					user: Meteor.user()._id,
					archived: { $ne: true }
				} , 
				{ 
					project: { $in: projects },
					archived: { $ne: true }
				}
			] 
		}, { 
				sort: { createTimeActual: -1 } 
		}).fetch();

		var projs = messages.map(function(p) {
			return p.project;
		});

		var returnArr = [], duplicatesArr = [];

		for (var i = 0; i < messages.length; i++) {
			var m = messages[i];
			if (duplicatesArr.indexOf(m.project)===-1) {
				returnArr.unshift(m);
				duplicatesArr.push(m.project);
			};
		};

		return returnArr;
	},
	textify: function() {
		if (this.ownerName==='Open Source Hollywood'&&this.ownerId===Meteor.user()._id) {
			return '';
		};
		return this.text;
	}
});

Template.settings.rendered = function () {
	gifts = [], resources = [], reels = [], social = [];
	// console.log(new Array(1000).join('# '))
	var u = Meteor.user()
	// console.log(JSON.stringify(u, null, 4))


	resources = u.assets||[]
	resources.forEach(appendResourceToTable)
	
	gifts = u.gifts||[]
	// list gifts

	social = u.social||[]
	social.forEach(appendSocialToTable)

	reels = u.reels||[]
	reels.forEach(appendMediaURLtoTable)

	console.log(social)

	if ($(window).width()<580) {
	  	setTimeout(function() {
	  		$($( ".tabs-select" )[1]).prepend('<i id="crazed_foo" class="fa fa-chevron-down fa-2x" style="position:absolute;pointer-events:none;"></i>');
	  	}, 610);
	}

	$(".iam").each(function(){
		var val = $(this).attr('value');
		if (u.iam.indexOf(val) > -1) {
		  $(this).prop("checked", true);
		}
	});

	$(".interests").each(function(){
		var val = $(this).attr('value');
		if (u.interests.indexOf(val) > -1) {
		  $(this).prop("checked", true);
		}
	});

	// set primaryRole
	if (u.primaryRole) {
		var val = u.primaryRole;
		$("#category").val(val);
	};

	// set user-role
	u.iam.forEach(function(el) {
		var elId = '#checkbox-' + el;
		$(elId).prop("checked", true);
	});
  

	var wbs = u.website && u.website.length > 0 ? u.website : 'enter http://www.your.site';
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
		        $('.note-editable').html(u.bio||'<p><span class="large">Enter your biography here.</span><br>You can copy / paste HTML, for more help visit <a href="https://en.wikipedia.org/wiki/Template:Biography" target="_blank">https://en.wikipedia.org/wiki/Template:Biography</a>.</p><p>&nbsp;</p>');
		        $('.note-toolbar').css('z-index', '0');
		      }
		    }
		});
	});
};
