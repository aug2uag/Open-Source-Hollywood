// buy merch
const StripePublicKey = 'pk_test_imJVPoEtdZBiWYKJCeMZMt5A'//'pk_live_GZZIrMTVcHHwJDUni09o09sq';

function makeStripeCharge(options) {
  StripeCheckout.open({
    key: StripePublicKey,
    amount: Math.abs(Math.floor(options.amount*100))<1?1:Math.abs(Math.floor(options.amount*100)),
    currency: 'usd',
    name: options.message,
    bitcoin: true,
    description: options.description || 'opensourcehollywood.org',
    panelLabel: 'Pay Now',
    token: function(_token) {
      if (_token) {
        options.token = _token;
        if (Meteor.user()) {
          Meteor.call('userMerchSale', options, function(err, result) {
            if (err) return vex.dialog.alert('your payment failed');
            vex.dialog.alert(result)
          });
        } else {
          // confirm dialog
          vex.dialog.alert({
            message: 'Please confirm the following to finalize payment.',
            input: [
              '<ul>',
                '<li class="wcheckbox">',
                    '<label class="with-square-checkbox">',
                        '<input id="ageverify" name="ageverify" type="checkbox">',
                        '<span>I am 18 years of age or older.</span>',
                    '</label>',
                '</li>',
                '<li class="wcheckbox">',
                    '<label class="with-square-checkbox">',
                        '<input id="payverify" name="payverify" type="checkbox">',
                        '<span>I am authorized to make payments with the payment method I selected.</span>',
                    '</label>',
                '</li>',
                '<li class="wcheckbox">',
                    '<label class="with-square-checkbox">',
                        '<input id="refverify" name="refverify" type="checkbox">',
                        '<span>I understand my payment is non-refundable and will be immediately applied to the campaign\'s budget.</span>',
                    '</label>',
                '</li>',
              '</ul>',
              '<div class="form-group">',
                  '<label for="signature">Sign Your Name</label>',
                  '<input type="text" class="form-control" name="signature" id="signature" placeholder="enter your name here">',
              '</div>',
            ].join(''),
            callback: function(data) {
              if (!data.ageverify) {
                vex.dialog.alert('you must be 18 or older to continue, your payment was cancelled');
                return
              } else if (!data.payverify) {
                vex.dialog.alert('you must be authorized for the transaction, your payment was cancelled');
                return
              } else if (!data.refverify) {
                vex.dialog.alert('you must agree to our terms to continue, your payment was cancelled');
                return
              } else if (!data.signature) {
                vex.dialog.alert('you must provide a signature, your payment was cancelled');
                return
              } 
              data.date = new Date();
              options.anonymous_verification = data;
              Meteor.call('userMerchSale', options, function(err, result) {
                if (err) return vex.dialog.alert('your payment failed');
                vex.dialog.alert(result)
              });
            }
          });
        }
        
      } else {
        vex.dialog.alert('your payment did not succeed');
      }
    }
  });
};



function vexFlag(usr) {
  vex.dialog.open({
    message: 'Request to Remove',
    input: [
      '<div> ',
        '<form> ',
          '<div class="checkbox">',
            '<label style="display: grid;">',
              '<input type="checkbox" value="" name="t1" id="t1">',
              'Obscene content, whether images or text',
            '</label>',
          '</div>',
          '<div class="checkbox">',
            '<label style="display: grid;">',
              '<input type="checkbox" value="" name="t2" id="t2">',
              'Malicious content',
            '</label>',
          '</div>',
          '<div class="checkbox">',
            '<label style="display: grid;">',
              '<input type="checkbox" value="" name="t3" id="t3">',
              'Content that is mislabelled, misplaced, or categorized incorrectly',
            '</label>',
          '</div>',
          '<div class="checkbox">',
            '<label style="display: grid;">',
              '<input type="checkbox" value="" name="t4" id="t4">',
              'Spam and solicitations',
            '</label>',
          '</div>',
          '<div class="checkbox">',
            '<label style="display: grid;">',
              '<input type="checkbox" value="" name="t5" id="t5">',
              'Violations of site policy',
            '</label>',
          '</div>',
          '<div class="checkbox">',
            '<label style="display: grid;">',
              '<input type="checkbox" value="" name="t6" id="t6">',
              'Copyrighted work',
            '</label>',
          '</div>',
          '<div class="checkbox">',
            '<label style="display: grid;">',
              '<input type="checkbox" value="" name="t7" id="t7">',
              'Descriptions/solicitation of illegal acts',
            '</label>',
          '</div>',
        '</form>',
      '</div>',
      '<div class="flagdesc"> ',
        '<form> ',
          '<textarea class="form-control" rows="3" placeholder="enter here" name="t8" id="t8"></textarea> ',
        '</form> ',
      '</div>'
    ].join(''),
    callback: function (data) {
      if (
          !$("#t1").is(':checked')&&
          !$("#t2").is(':checked')&&
          !$("#t3").is(':checked')&&
          !$("#t4").is(':checked')&&
          !$("#t5").is(':checked')&&
          !$("#t6").is(':checked')&&
          !$("#t7").is(':checked')&&
          !$("#t8").val()
        ) return;
      Meteor.call('flagComplaint', {
        url: backupURL = 'https://opensourcehollywood.org/profile/'+usr._id,
        complaint: {
          'Obscene content, whether images or text': $("#t1").is(':checked'),
          'Malicious content': $("#t2").is(':checked'),
          'Content that is mislabelled, misplaced, or categorized incorrectly': $("#t3").is(':checked'),
          'Spam and solicitations': $("#t4").is(':checked'),
          'Violations of site policy': $("#t5").is(':checked'),
          'Copyrighted work': $("#t6").is(':checked'),
          'Descriptions/solicitation of illegal acts': $("#t7").is(':checked')
        },
        msg: $("#t8").val()
      });
    }
  })
}

Template.profile.helpers({
	giftIMG: function() {
		return this.url||this.data
	},
	hasGifts: function() {
		return this.gifts&&this.gifts.length
	},
	gifts: function() {
		console.log(this.gifts)
		return this.gifts||[]
	},
	formattedBio: function() {
		var that =  this;
		setTimeout(function() {
		  if (that.bio) $('#formatted_desc').html(that.bio);
		  else $('#formatted_desc').text('apparently this user likes to keep an air of mystery about them');
		}, 800);
	},
	userProjects: function() {
		return Projects.find({ownerId: this._id});
	},
	isVideo: function() {
		var falsy = false;
		if (this.url.indexOf('vimeo')>-1||this.url.indexOf('youtube')>-1) falsy = true;
		return falsy;
	},
	userReels: function() {
		return this.reels.reverse();
	},
	influenceScore: function() {
		return this.influenceScore;
	},
	avatar: function() {
		return this.avatar;
	},
	name: function() {
		return this.firstName + ' ' + this.lastName;
	},
	createdAt: function() {
		return moment(this.createdAt).format('MM-DD-YYYY');
	},
	hasLinks: function() {
		return this.socialLinks && this.socialLinks.length > 0;
	},
	links: function() {
		return this.socialLinks || ['this user has not shared any social media links'];
	},
	hasWorks: function() {
		return this.onlineWorks && this.onlineWorks.length > 0;
	},
	works: function() {
		return this.onlineWorks || ['this user has not shared any social media links'];
	},
	hasIAM: function() {
		return this.iam && this.iam.length > 0;	
	},
	hasInterests: function() {
		return this.interests && this.interests.length > 0;	
	},
	iams: function() {
		if (!this.iam.length) {
			return 'this user has not specified any specialties or interests'
		};
		return this.iam.join(', ');	
	},
	interests: function() {
		return this.interests || [];	
	},
	hasWebsite: function() {
		return this.website && this.website.indexOf('htt') > -1;	
	},
	website: function() {
		return this.website;	
	},
	hasHeadshots: function() {
		return this.headshots && this.headshots.length > 0;		
	},
	headshots: function() {
		return this.headshots.map(function(i) {
			i.url = 'https://s3-us-west-2.amazonaws.com/producehour/headshots/' + i.url;
			return i;
		});	
	},
	shareData: function() {
	    ShareIt.configure({
	        sites: {
	            'facebook': {
	                'appId': '1790348544595983'
	            }
	        }
	    });
	    var roles;
	    if (!this.iam.length) {
			roles = 'Amazing talent available on O . S . H . (https://opensourcehollywood.org).';
		};
		roles = this.iam.join(', ');	

	    var backupURL = 'https://opensourcehollywood.org/profile/'+this._id;
	    return {
	      title: [this.firstName, this.lastName,'on Open Source Hollywood! <opensourcehollywood.org>'].join(' '),
	      author: 'Open Source Hollywood',
	      excerpt: roles,
	      summary: roles,
	      description: roles,
	      thumbnail: this.avatar,
	      image: this.avatar,
	      url: backupURL
	    }
	},
	profileHasMedia: function() {
		return this.reels.length>0;
	}
});

Template.profile.events({
  'click #reportthis': function(e) {
    e.preventDefault();
    /** show vex dialog */
    vexFlag(this);
  },
  'click .purchase_gift': function(e) {
		e.preventDefault();
		var was = this, o={gift:was};

		var dialogInput = [
		  '<figure class="snip1165">',
		    '<img src="',
		    was.url||was.data,
		    '" alt="sample63"/>',
		    '<figcaption>',
		      '<h3>',
		      was.name,
		      '</h3>',
		      '<p>',
		        was.description,
		      '</p>',
		      '<h4>ADDITIONAL INFORMATION:&nbsp;<br><small><strong>',
		        was.secondaryData||'no additional information provided for this item',
		      '</small></strong></h4>',
		      '<h4>REFUND POLICY & DISCLAIMER:&nbsp;<br><small><strong>',
		        was.disclaimer||'no refund policy or disclaimer provided for this item',
		      '</small></strong></h4>',
		      '<hr>',
		      '<h6 style="margin-top:8px;margin-bottom:0px">Available for Purchase $',
		      was.msrp,
		      '</h6>',
		    '</figcaption>',
		  '</figure>'
		]


		var vex1Open = true, vex2Open = true;
		var vex1 = vex.dialog.open({
		    message: ['   Merchandise for sale'].join(''),
		    // message: ['   Details of ',was.name,'. Purchase below.'].join(''),
		    buttons: [
		      $.extend({}, vex.dialog.buttons.YES, { text: 'PURCHASE' }),
		      $.extend({}, vex.dialog.buttons.NO, { text: 'Close' }),
		    ],
		    input: dialogInput.join(''),
		    callback: function (data) {
		        if (!data) {
		            return console.log('Cancelled')
		        }
		        if (vex1Open) {
		          vex1Open = false;
		          vex1.close();

		          var dialogInput = [
		              '<style>',
		                  '.vex-custom-field-wrapper {',
		                      'margin: 1em 0;',
		                  '}',
		                  '.vex-custom-field-wrapper > label {',
		                      'display: inline-block;',
		                      'margin-bottom: .2em;',
		                  '}',
		              '</style>',
		              '<div class="vex-custom-field-wrapper">',
		                  '<label for="address-gift">Shipping Address</label>',
		                  '<div class="vex-custom-input-wrapper">',
		                      '<input type="text" class="form-control contrastback" placeholder="e.g. 6925 Hollywood Blvd" id="address-gift">',
		                  '</div>',
		              '</div>',
		              '<div class="vex-custom-field-wrapper">',
		                  '<label for="city-gift">City</label>',
		                  '<div class="vex-custom-input-wrapper">',
		                      '<input type="text" class="form-control contrastback" placeholder="e.g. Hollywood" id="city-gift">',
		                  '</div>',
		              '</div>',
		              '<div class="vex-custom-field-wrapper">',
		                  '<label for="state-gift">State</label>',
		                  '<div class="vex-custom-input-wrapper">',
		                      '<input type="text" class="form-control contrastback" placeholder="e.g. CA or California" id="state-gift">',
		                  '</div>',
		              '</div>',
		              '<div class="vex-custom-field-wrapper">',
		                  '<label for="zip-gift">Zip Code</label>',
		                  '<div class="vex-custom-input-wrapper">',
		                      '<input type="text" class="form-control contrastback" placeholder="e.g. 90028" id="zip-gift">',
		                  '</div>',
		              '</div>',
		              '<div class="vex-custom-field-wrapper">',
		                  '<label for="email-gift">Contact Email</label>',
		                  '<div class="vex-custom-input-wrapper">',
		                      '<input type="text" class="form-control contrastback" placeholder="e.g. yours@email.com" id="email-gift">',
		                  '</div>',
		              '</div>',
		              '<div class="vex-custom-field-wrapper">',
		                  '<label for="phone-gift">Contact Phone</label>',
		                  '<div class="vex-custom-input-wrapper">',
		                      '<input type="text" class="form-control contrastback" placeholder="e.g. (310) 555-1212" id="phone-gift">',
		                  '</div>',
		              '</div>'

		          ]

		          dialogInput = dialogInput.concat([
		            '<div class="vex-custom-field-wrapper">',
		              '<p>We are currently in test mode. You can make all your transactions with a test credit card number 4000 0000 0000 0077 exp 02/22 cvc 222 for your transactions.</p>',
		            '</div>'
		          ])

		          var vex2 = vex.dialog.open({
		            message: 'Order and Pay Info',
		            buttons: [
		              $.extend({}, vex.dialog.buttons.YES, { text: 'CONTINUE' }),
		              $.extend({}, vex.dialog.buttons.NO, { text: 'Cancel' }),
		            ],
		            input: dialogInput.join(''),
		            callback: function (data) {
		                if (!data) {
		                    return console.log('Cancelled')
		                }
		                if (vex2Open) {
		                  vex2Open = false;
		                  vex2.close();
		                  o.address = $('#address-gift').val(), o.city = $('#city-gift').val(), o.state = $('#state-gift').val(), o.zip = $('#zip-gift').val(), o.email = $('#email-gift').val(), o.phone = $('#phone-gift').val();
		                  if (!o.address||!o.zip||!o.email) return vex.dialog.alert('invalid order information, please include address, email, and zipcode fields and try again');
		                  o.amount = was.msrp;
		                  o.message = was.name + ' purchase';
		                  o.artistName = $('#artistname').text();
		                  o.uid = $('#u_id').attr('val');
		                  makeStripeCharge(o);
		                };
		            }
		          });
		        };
		    },
		    afterOpen: function() {
		      var was = this;
		      setTimeout(function() {
		          // Either of these lines will do the trick, depending on what browsers you need to support.
		          was.rootEl.scrollTop = 0;
		          was.contentEl.scrollIntoView(true);
		          $(was.$vex).scrollTop(0)
		      }, 0)
		    }
		});
  },
})


Template.profile.helpers({
	avatar: function() {
		return Meteor.user().avatar;
	},
	bio: function() {
		return Meteor.user().bio || 'you don\'t have a bio';
	},
	links: function() {
		if (Meteor.user().social.length === 0) {
			return 'you don\'t have social links';
		} else {
			return Meteor.user().social.join('<br>');
		};
	}
});


Template.profile.onRendered(function() {
   setTimeout(function() {
      $('.fb-share').html('<li class="fa fa-facebook"></li>');
      $('.tw-share').html('<li class="fa fa-twitter"></li>');
      $('.pinterest-share').html('<li class="fa fa-pinterest"></li>');
      $('.googleplus-share').html('<li class="fa fa-google-plus"></li>');
      $('#genreclick1').click();
   }, 133);
 });


Template.dashboard.helpers({
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
	foo: function() {
		var x = Meteor.user();
		return !(x.primaryRole || (x.iam && x.iam.length));
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
