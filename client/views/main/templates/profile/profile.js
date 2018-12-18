Handlebars.registerHelper('eachProperty', function(context, options) {
    var ret = "";
    for(var prop in context)
    {
        ret = ret + options.fn({property:prop,value:context[prop]});
    }
    return ret;
});

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
	formattedName: function() {
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
	},
	hasAssets: function() {
		return (this.assets||[]).length
	},
	assets: function() {
		return (this.assets||[])
	},
	innerPricing: function() {
		var pricing = this.pricing
		var pricingKeys = Object.keys(pricing)
		var a = []
		pricingKeys.forEach(function(key) {
			if (pricing[key]) a.push({key: key, value: pricing[key]})
		})
		return a
	},
	formattedAvailability: function() {
		var normalized = {
			any: 'anytime',
			'any-weekdays': 'anytime weekdays',
			am: 'mornings weekdays',
			pm: 'evening weekdays',
			'any-weekends': 'anytime weekends',
			'am-wk': 'mornings weekends',
			'pm-wk': 'evenings weekends'
		}
		return this.availability.map(function(a) {
			return normalized[a]
		})
	},
	hasSocialMedia: function() {
		return (this.social||[]).length
	},
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
  'click .request_asset': function(e) {
  	console.log(this)
  }
})


Template.profile.onRendered(function() {
   setTimeout(function() {
      $('.fb-share').html('<li class="fa fa-facebook"></li>');
      $('.tw-share').html('<li class="fa fa-twitter"></li>');
      $('.pinterest-share').html('<li class="fa fa-pinterest"></li>');
      $('.googleplus-share').html('<li class="fa fa-google-plus"></li>');
      $('#genreclick1').click();
   }, 133);
 });

