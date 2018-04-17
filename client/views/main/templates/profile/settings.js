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
	console.log('baz')
    if (data) {
    	console.log(data)
    	$('osh_loader').show();
        Meteor.call('verifyPhonePIN', data.pin, function(err, msg) {
        	console.log('fosososjoj')
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
	    	console.log('bar');
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
		console.log('foo')
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
		var bioText = $('#textBox').text().trim();
		if (bioText&&bioText!=='Enter your biography and self-description here.You can copy / paste text from another source here or use the menu above to format text and insert images from a valid URL.') {
			o.bio = $('#textBox').html();
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

		console.log(o)

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
	          {archived: false},
	          {usersApproved: {$elemMatch: {id: _id}}}
	        ]
	    }).fetch();
	},
	createdCamps: function() {
		var _id = Meteor.user()._id;
		return Projects.find({
	        $and: [
	          {archived: false},
	          {ownerId: _id}
	        ]
	    }).fetch();
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
		var messages = ProjectMessages.find({user: Meteor.user()._id}, {sort: {createTimeActual: -1}});
		return messages;
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

  var wbs = Meteor.user().website && Meteor.user().website.length > 0 ? Meteor.user().website : 'http://yoursite';
  $('#website').attr('placeholder', wbs);

  /**
     *  Plugin name:SWEDitor
     *  Author: Moncho Varela / nakome
     *  Date: 20/10/2013 ten day for my birthday LOL
     *  @nakome on twitter
     */
    (function(window) {
      
      'use strict';
      
      
      function getTemplate(el) {
        // Template html
        var html = '<div class="box-editor">' +
            '<div id="thisForm">' +
            '<input type="hidden" name="myDoc">' +
            '<div id="toolBar2">' +
            '<label class="custom-select fontSi">' +
            '<select class="selectThis" data-chg="fontsize">' +
            '<option class="heading" selected>:: Size</option>' +
            '<option value="1">Very small</option>' +
            '<option value="2">A bit small</option>' +
            '<option value="3">Normal</option>' +
            '<option value="4">Medium-large</option>' +
            '<option value="5">Big</option>' +
            '<option value="6">Very big</option>' +
            '<option value="7">Maximum</option>' +
            '</select></label>' +
            '<a href="javascript:void(0);" class="intLink formatBlock" title="Left align"  data-fn="justifyleft">' +
            '<i class="fa fa-align-left"></i></a>' +
            '<a href="javascript:void(0);" class="intLink formatBlock" title="Center align"  data-fn="justifycenter">' +
            '<i class="fa fa-align-center"></i>' + '</a>' +
            '<a href="javascript:void(0);" class="intLink formatBlock" title="Right align"  data-fn="justifyright">' +
            '<i class="fa fa-align-right">' + '</i></a>' +
            '<a href="javascript:void(0);" class="intLink" title="Quote"  id="quote" data-fn="blockquote">' +
            '<i class="fa fa-quote-left"></i></a>' +
            '<a href="javascript:void(0);" class="intLink formatBlock" title="Add indentation"  data-fn="indent">' +
            '<i class="fa fa-indent"></i></a>' +
            '<a href="javascript:void(0);" class="intLink formatBlock" title="Get hr"  data-fn="inserthorizontalrule">' +
            'HR </a>' +
            ' <a href="javascript:void(0);" class="intLink" title="Get img" id="getImg" data-fn="insertImage">' +
            '<i class="fa fa-image">' + '</i></a>' +
            ' </div>' +
            '<div id="textBox" contenteditable="true">' +
            '</div></div></div>';
        // render html
        el.innerHTML = html;
      }
      
      function initDoc(fm, bx) {
        var elem = bx,
            sDefTxt;
        sDefTxt = bx.innerHTML;
        if (fm.checked) {
          setDocMode(true);
        }
      }
      
      function formatDoc(obj, val) {
        if (validateMode()) {
          document.execCommand(obj, false, val);
        }
      }
      
      
      function validateMode() {
        var thisForm = document.querySelector('#thisForm');
        if (!thisForm.checked) {
          return true;
        }
        alert("Uncheck \"Show HTML\".");
        return false;
      }
      
      function setDocMode(source, oDoc) {
        var sDefTxt = oDoc.innerHTML;
        var oContent;
        if (source) {
          oContent = document.createTextNode(sDefTxt);
          oDoc.innerHTML = "";
          var oPre = document.createElement("pre");
          oDoc.contentEditable = false;
          oPre.id = "sourceText";
          oPre.contentEditable = true;
          oPre.appendChild(oContent);
          oDoc.appendChild(oPre);
        } else {
          if (document.all) {
            sDefTxt = oDoc.innerText;
          } else {
            oContent = document.createRange();
            oContent.selectNodeContents(oDoc.firstChild);
            oDoc.innerHTML = oContent.toString();
          }
          oDoc.contentEditable = true;
        }
      }
      
      // extend options
      
      function extend(a, b) {
        for (var key in b) {
          if (b.hasOwnProperty(key)) {
            a[key] = b[key];
          }
        }
        return a;
      }
      
      function sweDitor(elem, options) {
        // The div of editor
        this.elem = elem;
        // The options  ex. this.options.type = hello
        this.options = extend(this.defaults, options);
        // Get Template
        getTemplate(elem);
        // Start init
        this._init();
      }
      
      sweDitor.prototype = {
        // this.options.type
        defaults: {
          textArea: 'editor_area',
          showTextarea: true
        },
        
        // this._init();
        _init: function() {
          var self = this;
          // Div of content
          this.box = document.querySelector('#textBox');
          // array for change event
          this.selects = Array.prototype.slice.call(this.elem.querySelectorAll('.selectThis'));
          // array for click event
          this.formats = Array.prototype.slice.call(this.elem.querySelectorAll('.formatBlock'));
          // get print id
          this.getPrint = document.getElementById('getPrint');
          // The textarea
          this.textArea = document.getElementById(this.options.textArea);
          // get clean id
          this.getClean = document.getElementById('getClean');
          // get img id 
          this.getImg = document.getElementById('getImg');
          // get switchbox
          this.quote = document.getElementById('quote');
          // get switchbox
          this.switchBox = document.getElementById('switchBox');
          // Init Doc function
          initDoc(this, this.textArea);
          this._initEvents();
        },
        
        // this._initEvents();
        _initEvents: function() {
          
          var self = this;
          
          //Show or hide textarea
          if (this.options.showTextarea === true) {
            self.textArea.style.display = 'block';
          } else {
            self.textArea.style.display = 'none';
          }
          
          // On ready copy text of text area
          this.box.innerHTML = this.textArea.textContent;
          // On keyup copy text on textarea
          this.box.addEventListener('keyup', function() {
            self.textArea.textContent = self.box.innerHTML;
          }, false);
          // On keydown copy text on textarea
          this.box.addEventListener('keydown', function() {
            self.textArea.textContent = self.box.innerHTML;
          }, false);
          // add event on change for  all selects 
          this.selects.forEach(function(el, i) {
            el.addEventListener('change', function() {
              formatDoc(this.getAttribute('data-chg'), this.value);
              self.textArea.textContent = self.box.innerHTML;
            }, false);
          });
          // img listener
          this.getImg.addEventListener('click', function() {
            var simg = prompt('Write the URL of image here', 'http:\/\/');
            if (simg && simg !== '') {
              formatDoc(this.getAttribute('data-fn'), simg);
              self.textArea.textContent = self.box.innerHTML;
            }
          }, false);
          
          // all other formats  
          this.formats.forEach(function(el, i) {
            el.addEventListener('click', function() {
              formatDoc(this.getAttribute('data-fn'));
              self.textArea.textContent = self.box.innerHTML;
            }, false);
          });
          // blockquote
          this.quote.addEventListener('click', function() {
            formatDoc('formatblock', this.getAttribute('data-fn'));
            self.textArea.textContent = self.box.innerHTML;
          }, false);
        }
        
      };
      
      // add to global namespace
      window.sweDitor = sweDitor;
      
    })(window);

    // Init editor
    new sweDitor(document.getElementById('editor_panel'),{
      textArea: 'editor_area', //id of textarea
      showTextarea: false // if true show hidden text area
    });

    setTimeout(function() {
    	if (Meteor.user().bio) {
    		$('#textBox').html(Meteor.user().bio)
    	} else {
      		$('#textBox').html('<p><span class="large">Enter your biography and self-description here.</span><br>You can copy / paste text from another source here or use the menu above to format text and insert images from a valid URL.</p><p>&nbsp;</p>');    		
    	}
    }, 800);

};
