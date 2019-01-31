var was;
var offereeDecision;

const StripePublicKey = 'pk_test_imJVPoEtdZBiWYKJCeMZMt5A'//'pk_live_GZZIrMTVcHHwJDUni09o09sq';

function makeStripeCharge(options) {
  StripeCheckout.open({
    key: StripePublicKey,
    amount: Math.abs(Math.floor(options.stripePaid*100))<1?1:Math.abs(Math.floor(options.stripePaid*100)),
    currency: 'usd',
    name: options.message,
    bitcoin: true,
    description: options.description || 'opensourcehollywood.org',
    panelLabel: 'Pay Now',
    token: function(_token) {
      if (_token) {
        options.token = _token;
		Meteor.call(options.route, options, function(err, result) {
			if (err) return vex.dialog.alert('your payment failed');
			vex.dialog.alert(result)
		});
      } else {
        vex.dialog.alert('your payment did not succeed');
      }
    }
  });
};

function getCurrentNegotiation() {
	var negotiatedRoles = was.project.negotiations || [];
	var negotiatedRole;
	for (var i = 0; i < negotiatedRoles.length; i++) {
		if (negotiatedRoles[i].id = was.user._id) {
			negotiatedRole = negotiatedRoles[i];
			break;
		};
	};
	return negotiatedRole || {};
}

function negotiationHelper(key) {
	var negotiatedRole = getCurrentNegotiation();
	if (negotiatedRole&&negotiatedRole[key]) {
		return negotiatedRole[key];
	};
	return false;
}

function formattedProjectRoles() {
	var agg = [];
	was.offers.forEach(function(o) {
		if (agg.indexOf(o.position)===-1) agg.push(o.position);
	});
	var roles = !agg.length?agg[0]:agg.length==2?agg.join(' & '):agg.join(', ');
	return roles;
}

Template.assetsOfferDialogHeader.helpers({
	cat: function() {
		try {
			this.offer = this.offer || this.offers[0]
			return this.offer.assets[0].category
		} catch(e) {
			Router.go('Home')
		}
	},
})

Template.offerAssetsActive.helpers({
	offerAssets: function() {
		console.log(this)
		this.offer = this.offer||this.offers[0]

		return this.offer.assets
	},
	foo: function() {
		console.log(this)
	}
})

Template.offerAssetsArchived.helpers({
	offerAssets: function() {		
		this.offer = this.offer||this.offers[0]
		this.consideration = this.offer.consideration
		Session.set('consideration', this.consideration)

		return this.offer.assets
	},
	consideration: function() {
		return Session.get('consideration')
	},
	considerationTotalHours: function() {
		return this.consideration.hours + this.consideration.remHours
	},
	considerationTotalDays: function() {
		return this.consideration.days + this.consideration.remDays
	},
	considerationTotalWeeks: function() {
		return this.consideration.weeks
	},
	considerationDateStart: function() {
		return this.consideration.startDate&&moment(this.consideration.startDate).format('MMMM Do, YYYY')||'N / A'
	},
	considerationDateEnd: function() {
		return this.consideration.endDate&&moment(this.consideration.endDate).format('MMMM Do, YYYY')||'N / A'
	},
	considerationContact: function() {
		this.consideration.offereeContact = this.consideration.offereeContact || {}
		this.consideration.offereeContact.email = this.consideration.offereeContact.email || 'N / A'
		this.consideration.offereeContact.phone = this.consideration.offereeContact.phone || 'N / A'
		return this.consideration.offereeContact
	},
	considerationSummary: function() {
		if (this.consideration.receipt) {
			return ['$', (this.consideration.receipt.amount/100), ' paid towards this request.'].join('')
		} 
		return 'There was no money paid towards this offer.'
	}
})

Template.projectMessage.helpers({
	isAssets: function() {

		if (this.isAssets) return true
		if (this.offers&&this.offers[0]&&this.offers[0].type==='assets') return true
		if (this.offer&&this.offer.type==='assets') return true

		return false
	},
	rejected: function() {
		// Router.go('Dashboard')
	},
	init: function() {
		was = this
	},
	archivedOffer: function() {
		console.log(this)
		// case active asset negotiate
		try {	
			if (this.offers[0].accepted||this.offers[0].rejected) return true;
			if (this.isAssets&&this.offer&&this.offer.pending) return false
			if (this.offers[0]&&this.offers[0].pending) return false
			// case active role negotiate
			if (this.offer&&this.offer.pending) return false
		} catch(e) {}

		return true
	},
	formattedOffers: function() {
		return this.offers.map(function(o) {
			if (!o.ctx||o.ctx!=='offer') return o;
		}).filter(function(o) { if (o) return o })
	},
	url: function() {
		if (this.audition==='N/A') {
			return ' this role does not have an audition ';
		} else if (this.url) {
			return this.url;
		} else {
			return ' applicant enter URL of audition material ';
		}
	},
	isDisabled: function() {
		if (this.audition==='N/A'||was.project.ownerId===Meteor.user()._id||this.url) {
			return 'pointer-events:none;'
		};
	},
	hasOffer: function() {
		return this.offers.length > 0
	},
	needsApplicantAction: function() {
		try {
			var o = this.offers[0]
			if (o.needsApplicantAction&&Meteor.user()._id!==was.project.ownerId) return true;
			else return false
		} catch(e) {
			return false
		}
	},
	ownerInitAgreement: function() {
		for (var i = this.offers.length - 1; i >= 0; i--) {
			var o = this.offers[i]
			if (o.needsApplicantAction) return false
		}
		if (Meteor.user()._id===was.project.ownerId) return true
	},
	ownerInitAgreementAplicantNote: function() {
		for (var i = this.offers.length - 1; i >= 0; i--) {
			var o = this.offers[i]
			if (o.needsApplicantAction) return false
		}
		if (Meteor.user()._id!==was.project.ownerId) return true
	},
	applicantRequestCounter: function() {
		var currentNegotiation = getCurrentNegotiation();
		return currentNegotiation.authorVerified&&!currentNegotiation.applicantVerified&&Meteor.user()._id!==was.project.ownerId;
	},
	applicantInCounter: function() {
		if (Meteor.user()._id!==was.project.ownerId) return false
		for (var i = this.offers.length - 1; i >= 0; i--) {
			var o = this.offers[i]
			if (o.needsApplicantAction) return true
		}
		return false
	},
	sharesAvailable: function() {
		var percent = (this.project.totalShares || 0) / 100;
    	return (100 - percent) * 100;
	},
	auditions: function() {
		var agg = [];
		var positions = was.project.cast.concat(was.project.crew);
		for (var i = 0; i < was.offers.length; i++) {
			var offer = was.offers[i]
			var _position = offer.offer.position
			// console.log(offer)
			// console.log('^^^ OFFER  VVV POSIITON')
			for (var j = 0; j < positions.length; j++) {
				var position = positions[j];
				var _role = position.title||position.role
				// console.log(position)
				if (_position===_role) {
					if (position.audition&&position.audition!=='N/A') agg.push({
						title: _role,
						audition: position.audition,
						url: offer.url,
						offer: offer.offer
					});
				};
			};
		};
		return agg;
	},
	isProjectOwner: function() {
		return this.project.ownerId === Meteor.user()._id;
	},
	userName: function() {
		return this.user.firstName + ' ' + this.user.lastName;
	},
	title: function() {
		return this.title;
	},
	messages: function() {
		var messages = ProjectMessages.find({user: this.user._id, project: this.project._id}, {sort: {createTimeActual: -1}});
		return messages;
	},
	messagesHeader: function() {
		if (!this.offers.length) return 'There have been no actions made by this user for the ' + this.project.title + ' campaign.';
		if (this.offers.length===1) return 'There is one action this user has taken.';
		return 'There are ' + this.offers.length + ' offers regarding the ' + this.project.title + ' campaign.';
	},
	numMessages: function() {
		if (!this.messages.length) return 'There is no history of communication between the two of you regarding the ' + this.project.title + ' campaign.';
		if (this.messages.length===1) return 'There is only one message.';
		return 'There are ' + this.messages.length + ' messages regarding the ' + this.project.title + ' campaign.';
	},
	negotiationRoles: function() {
		var value = negotiationHelper('negotiationRoles');
		if (value) return value;
		var roles = formattedProjectRoles();
		return 'This contract is valid for the following roles: ' + roles + '.';
	},
	negotiationTerms: function() {
		var value = negotiationHelper('negotiationTerms');
		if (value) return value;
		var roles = formattedProjectRoles();
		return 'This contract is valid for all expected performance and conditions relating to the roles: ' + roles + '.\n\nCampaign author promises to make best efforts to create campaign, and applicant promises to perform the roles outlined in this agreement.';
	},
	negotiationDamages: function() {
		var value = negotiationHelper('negotiationDamages');
		if (value) return value;
		return 'Breaching party is responsible for paying any legal fees resulting from breach of non-performance. All disputes will be handled in the State of California, and this contract is bound to California laws and regulations.';
	},
	negotiationFinancial: function() {
		var value = negotiationHelper('financials');
		if (value) return value;
		return '0';
	},
	negotiationEquities: function() {
		var value = negotiationHelper('equities');
		if (value) return value;
		return '0';
	},
	roleConsideration: function() {
		try {
			if (this.offers[0].receipts.length) {
				if (this.offers[0].purpose === 'apply') {
					return true
				};
			};
			
		} catch(e){}
		return false
	},
	isHired: function() {
		try {
			if (this.offers[0].offer.type==='hired') return true;
		} catch(e) {} finally { 
			return false
		}
	}
})

Template.projectMessage.events({
	'click #rejectUser': function(e) {
		vex.dialog.confirm({
	      message: "Please confirm: you are rejecting " + was.offers[0].offer.user.name,
	      buttons: [
	        $.extend({}, vex.dialog.buttons.YES, { text: 'Yes' }),
	        $.extend({}, vex.dialog.buttons.NO, { text: 'No' })
	      ],
	      callback: function (result) {
	        if (result) {
	          Meteor.call('rejectUserFromProject', was.offers);
	          vex.dialog.alert('applicant rejected');
	          setTimeout(function() { history.back() }, 1597);
	        };
	      }
	  	});
	},
	'click #revokeOffer': function(e) {
		vex.dialog.confirm({
	      message: "Please confirm: you are revoking " + was.project.title,
	      buttons: [
	        $.extend({}, vex.dialog.buttons.YES, { text: 'Yes' }),
	        $.extend({}, vex.dialog.buttons.NO, { text: 'No' })
	      ],
	      callback: function (result) {
	        if (result) {
	          Meteor.call('revokeOffer', was.offers);
	          vex.dialog.alert('your offer was revoked');
	          setTimeout(function() { history.back() }, 1597);
	        };
	      }
	  	});
	},
	'click #counterk': function(e) {
		e.preventDefault();
		// console.log('clicked counterk')
		var counteroffer = {
			negotiationTerms: $('#negotiationTerms').val(),
			negotiationDamages: $('#negotiationDamages').val(),
			financials: $('#financials').val(),
			equities: $('#equities').val()
		}
		Meteor.call('counterRoleOffer', {
			counteroffer: counteroffer,
			context: was
		});

		vex.dialog.alert('your counter offer was sent')
		setTimeout(function() { history.back() }, 1597);
	},
	'click #authorfinalizek': function(e) {
		e.preventDefault();

		var agg = []
		$('.offer_role_decision:checked').each(function() {
			var o = {}
			o[$(this).val()] = JSON.parse($(this).attr('val'))
			agg.push(o)
		})

		Meteor.call('authorFinalizeAgreement', {
			offers: agg,
			user: was.user,
			project: was.project
		}, function(err, result) {
			if (result===true) {
				vex.dialog.alert({
				    message: 'Applicant approved, this negotiations is complete',
				    callback: function () {
				        history.back()
				    }
				});
			};	
		});
	},
	'click #counterofferbtn': function(e) {
		$('#counteroffer').show();
		$('#equity_negotiations_block')[0].reset();
		window.scrollTo({
			'behavior': 'smooth',
			'left': 0,
			'top': document.getElementById('counteroffer').offsetTop
		});
	},
	'click #applicantfinalizek': function(e) {
		e.preventDefault();
		Meteor.call('applicantFinalizeAgreement', was, function(err, result) {
			if (result===true) {
				vex.dialog.alert({
				    message: 'Offer accepted, this negotiations is complete',
				    callback: function () {
				        history.back()
				    }
				});
			};	
		});
	},
	'click #applicantrejectoffer': function(e) {
		e.preventDefault();
		Meteor.call('applicantRejectOffer', was, function(err, result) {
			if (result===true) {
				vex.dialog.alert({
				    message: 'Offer accepted, this negotiations is complete',
				    callback: function () {
				        history.back()
				    }
				});
			};	
		});
	},
	'change .auditionURL': function(e) {
		this.url = $(e.target).val() || null;
		Meteor.call('addAuditionURL', this);
	},
	'click #assetsmakeoffer': function() {

		var that = this

		/**
			@function 
			calculate costs
			collect pay
			make request
		  */
		function evalThisOffer(_offer) {

			var _o = {
				hourly: [], 
				daily: [], 
				weekly: [],
				payment: []
			}

			var items = []
			var fixed = 0
			var maxDepositPercent = 0
			var maxDepositFixed = 0

			_offer.assets = $('.yes-button:checked').map(function() {
				return JSON.parse($(this).attr('val'))
			}).get()

			if (!_offer.assets||!_offer.assets.length) {
				// handle no offers selected
				return vex.dialog.confirm({
					message: 'None of the assets were marked accepted above.\n\nWould you like to reject this offer?', 
					callback: function(a) {
						if (a) {
							$('#assetsrejectoffer').click()
							return setTimeout(function() {
								Router.go('Dashboard')
							}, 987)
						};
					}
				})
			}


			/*
				assets each =>

					fixed: NaN, 
					hourly: 10, 
					daily: 50, 
					weekly: 100
			*/
			_offer.assets.forEach(function(a) {
				items.push({
					category: a.category,
					item: a.name,
					description: a.description
				})


				if (a.deposit) {
					if (a.deposit.type==='percent') {
						maxDepositPercent = Math.max(a.deposit.amount, maxDepositPercent)
					} else {
						maxDepositFixed = Math.max(a.deposit.amount, maxDepositFixed)
					}
				};


				for (var key in a.pricing) {
					if (a.pricing[key])
						if (_o[key])
							_o[key].push(a.pricing[key])
						else
							fixed += a.pricing[key]
				}
				// get pricing options
				a.paySchedule.forEach(function(_a) {
					if (_o.payment.indexOf(_a)===-1)
						_o.payment.push(_a)
				})
			})

			for (var key in _o) {
				if (key==='payment') continue
				_o[key] = (function() {
					var max = 0
					for (var i = 0; i < _o[key].length; i++) {
						if (!max||_o[key][i] > max) max = _o[key][i];
					};
					return max
				}())
			}

			_offer.order = _o

	        var totalWeeks = _offer.weeks
	        var totalDays = _offer.days + _offer.remDays
	        var totalHours = _offer.hours + _offer.remHours

	        var weeklyPrice = _offer.order.weekly
	        var dailyPrice = _offer.order.daily
	        var hourlyPrice = _offer.order.hourly

	        var weeklyCost = weeklyPrice * totalWeeks
	        var dailyCost = dailyPrice * totalDays
	        var hourlyCost = hourlyPrice * totalHours

	        // show request summary, expected charges, and amount owed now
	        // 1) only one pay mode? do it, else choose payment mode
			var dialogContent = [
	            '<div class="row">',
	              '<div class="col-sm-7">Confirm Request for this Asset</div>',
	              '<p>&nbsp;</p>',
	              '<p class="krown-column-container small">Items</p>',
	              '<div class="panel-body">',
	                '<table class="table"><tbody>'
	        ]

	        items.forEach(function(i) {
	        	dialogContent = dialogContent.concat([
	        		'<tr>',
	        			'<td>', i.category, '</td>',
	        			'<td>', i.item, '</td>',
	        			'<td>', i.description, '</td>',
	        		'</tr>',
	        	])
	        })

	        dialogContent = dialogContent.concat([
	            '</tbody></table>',
	              '</div>'
	        ])

	        if (weeklyCost||dailyCost||hourlyCost||fixed) {
		        // show pricing
		        dialogContent = dialogContent.concat([
		        	'<p class="krown-column-container small">Estimated Cost</p>',
		            '<div class="panel-body">',
		                '<table class="table"><tbody>'
		        ])

		        if (weeklyCost) {

		        	dialogContent = dialogContent.concat([
		        		'<tr>',
		        			'<td>Weekly Pricing</td>',
		        			'<td>', weeklyCost, '</td>',
		        		'</tr>',
		        	])

		        } else if (dailyCost) {

		        	dialogContent = dialogContent.concat([
		        		'<tr>',
		        			'<td>Daily Pricing</td>',
		        			'<td>', dailyCost, '</td>',
		        		'</tr>',
		        	])

		        } else if (hourlyCost) {

		        	dialogContent = dialogContent.concat([
		        		'<tr>',
		        			'<td>Hourly Pricing</td>',
		        			'<td>', hourlyCost, '</td>',
		        		'</tr>',
		        	])

		        } else if (fixed) {

		        	dialogContent = dialogContent.concat([
		        		'<tr>',
		        			'<td>Fixed Pricing</td>',
		        			'<td>', fixed, '</td>',
		        		'</tr>',
		        	])

		        }

		        dialogContent = dialogContent.concat([
		            '</tbody></table>',
		              '</div>'
		        ])
	        }

	        dialogContent = dialogContent.concat([
	        	'</div>'
	        ])

	        // payment options
		    var buttons = []
		    var payMaps = { none: 0 }
		    var fullAmount = weeklyCost||dailyCost||hourlyCost||fixed||0

		    if (_offer.order.payment.indexOf('full')>-1) {
		    	
		    	payMaps.full = fullAmount
				buttons.push($.extend({}, vex.dialog.buttons.NO, { 
					text: ['Pay Escrow in Full ($', fullAmount,')'].join(''), 
					className: 'aquamarineB krown-alert', 
					click: function($vexContent, event) {
						this.value = 'full'
						this.price = fullAmount
						this.close()
				}}))
		    }

		    if (_offer.order.payment.indexOf('deposit')>-1) {

		    	// define max per-cent
		    	var depositAmount = maxDepositFixed ? maxDepositFixed : (maxDepositPercent/100) * fullAmount
		    	payMaps.deposit = depositAmount
		    	console.log(maxDepositFixed, maxDepositPercent)
		    	if (depositAmount>0) {
		    		buttons.push($.extend({}, vex.dialog.buttons.NO, { 
			    		text: ['Pay Partial Deposit ($', depositAmount,')'].join(''),
			    		className: 'lemonB krown-alert', 
			    		click: function($vexContent, event) {
					        this.value = 'deposit'
					        this.close()
				    }}))
		    	};
		    }

		    if (!buttons.length||_offer.order.payment.indexOf('none')>-1) {
		    	buttons.push($.extend({}, vex.dialog.buttons.NO, { 
		    		text: 'Arrange without Payment', 
		    		className: 'thistle krown-alert', 
		    		click: function($vexContent, event) {
				        this.value = 'none'
				        this.close()
			    }}))
		    }

		    buttons.push($.extend({}, vex.dialog.buttons.NO, { text: 'Cancel' }))

			vex.dialog.open({
				input: dialogContent.join(''),
				buttons: buttons,
				callback: function(data) {
					if (payMaps[data]) {

						Object.assign(_offer, {
							stripePaid: payMaps[data],
							message: 'Asset Escrow Payment',
							description: ['$', payMaps[data], ' offer (', _offer.assets.length,' assets)'].join(''),
							route: 'leaseRequest',
						})
						console.log(_offer)
						// console.log(JSON.stringify(_offer, null, 4))
						makeStripeCharge(_offer)
					} else {
						_offer.free = true
						Meteor.call('leaseRequest', _offer, function(err, res) {
							console.log(err, res)
						})
					}
				}
			})
		}

        var h = parseInt($('#hours_ass').val())
        var sd = $('#start_date_ass').val()
        var st = $('#start_time_ass').val()
        var ed = $('#end_date_ass').val()
        var et = $('#end_time_ass').val()
        var offereeContact = {
        	phone: $('#phone_contact').val(),
        	email: $('#email_contact').val()
        }
        var escrow = 0

        var assets = this.offer.assets
        var payOptions, hours, days, weeks, remHours, remDays, startDate, endDate

        if (!h) {

        	if (!sd||!ed) {
        		return vex.dialog.alert('Please include start and end dates.')
        	};

        	// is end date after start date ?
        	startDate = new Date(sd)
        	endDate = new Date(ed)
        	var d = new Date()

        	if (startDate>endDate) {
        		return vex.dialog.alert('End date must be later than start date')
        	};

        	if (d>startDate) {
        		return vex.dialog.alert('Start date must be 1 day in the future')
        	};

        	var delta = endDate - startDate
        	var seconds = delta/1000
        	hours = parseFloat((seconds * 0.000277778).toFixed(2))
        	weeks = 0, remDays = 0, days = 0, remHours = 0

        	if (delta === 0) {
        		days = 1
        	} else {
	        	if (hours > 24) {
	        		days = hours/24
			    	remHours = hours%24
	        	};

	        	if (days > 7) {
	        		weeks = days / 7
	        		remDays = days%7
	        	};
        	}
        }

        evalThisOffer({
        	offer: that.offer,
        	assets: assets||[],
        	payOptions: payOptions||{},
        	weeks: parseInt(weeks||0),
        	days: parseInt(days||0),
        	remDays: parseInt(remDays||0),
        	hours: parseInt(hours||h||0),
        	remHours: parseInt(remHours||0),
        	startDate: startDate,
        	endDate: endDate,
        	offereeContact: offereeContact
        })
    },
	'click #submit-message': function(e) {
		e.preventDefault();
		var text = $('#message-box').val();
		$('#message-box').val('');
		Meteor.call('addProjectMessage', {
			user: this.user._id,
			project: this.project._id,
			slug: this.project.slug,
			title: this.project.title,
			text: text
		});
	}
})

Template.projectMessageOffer.helpers({
	optradio: function() {
		return this.uid + this.position;
	},
	myProject: function() {
		if (this.authorCounterOffer) return false
		return was.project.ownerId===Meteor.user()._id
	},
	stringyThis: function() {
		return JSON.stringify(this)
	},
	approveOrDenyButton: function() {
		if (!this.declined) return 'red';
		return 'green';
	},
	approveOrDenyButtonApplicant: function() {
		if (this.declined) return 'red';
		return 'green';
	},
	approveOrDenyButtonText: function() {
		if (!this.declined) return 'remove';
		return 'ok';
	},
	approveOrDenyButtonTextApplicant: function() {
		if (this.declined) return 'remove';
		return 'ok';
	},
	approveOrDenyTextDecoration: function() {
		if (!this.declined) return 'none';
		return 'line-through';
	},
	approveOrDenyButtonTextReadable: function() {
		if (!this.declined) return 'decline';
		return 'approve';
	},
	approveOrDenyButtonTextReadableApplicant: function() {
		if (this.declined) return 'declined';
		return 'not declined';
	},
	isEditable: function() {
		var currentNegotiation = getCurrentNegotiation();
		return !currentNegotiation.authorVerified&&!currentNegotiation.applicantVerified&&Meteor.user()._id===was.project.ownerId;
	},
	considerationType: function() {
		var position = this.offer.appliedFor
		if (this.authorCounterOffer) {
			return 'agreement is for the following positions: ' + position
		} else if (this.ctx==='crew') {
			if (this.type==='hired'&&this.pay>0) {
				return 'requesting pay for crew position: ' + position;
			} else {
				return 'requesting no pay for crew position: ' + position;
			}
		} else {
			if (this.type==='hired'&&this.pay>0) {
				return 'requesting pay for cast position: ' + position;
			} else {
				return 'requesting no pay for cast position: ' + position;
			}
		}
	},
	considerationItself: function() {
		var amount = this.offer.amount, pay = this.offer.pay, type = this.offer.type;

		if (this.offer.authorCounterOffer) {
			var returnMsg = 'pay of $' + this.offer.pay;
			if (this.offer.equity > 0) {
				returnMsg += ' and equity of ' + this.offer.equity + ' shares'
			};
			if (this.offer.customTerms) {
				returnMsg += '; additional terms: ' + this.offer.customTerms
			};
			if (this.offer.customLimits) {
				returnMsg += '; further limitations: ' + this.offer.customLimits
			};
			return returnMsg
		};

		if (amount===0&&pay===0) {
			return 'time donation offer';
		} else {
			var amount = this.offer.amount===undefined ? 0 : this.offer.amount ? this.offer.amount: 0
			var pay = this.offer.pay===undefined ? 0 : this.offer.pay ? this.offer.pay: 0
			if (amount>0&&type==='hired') {
				return 'requesting $' + amount;
			} else {
				return 'offering a donation of $' + pay;
			}
		}
	}
})

Template.assetsOfferDialog.onRendered(function() {
	setTimeout(function() {
		$('.calendar').flatpickr();
	
		$('.clock').flatpickr(
		{
			enableTime: true,
			noCalendar: true,

			enableSeconds: false, // disabled by default

			time_24hr: false, // AM/PM time picker is used by default

			// default format
			dateFormat: "H:i", 

			// initial values for time. don't use these to preload a date
			defaultHour: 12,
			defaultMinute: 0

			// Preload time with defaultDate instead:
			// defaultDate: "3:30"
		});
	}, 987)
})

Template.assetsOfferDialog.events({
	'click #offerorrejectoffer': function(e) {
		Meteor.call('rejectLeaseRequest', this.offer, function(err, res) {
			vex.dialog.alert(err||res)
		})
	},
	'click #offeroracceptoffer': function(e) {
		Meteor.call('approveLeaseRequest', this.offer, function(err, res) {
			vex.dialog.alert(err||res)
		})
	},
	'click #edit_eo': function(e) {
		var _was = this
	    vex.dialog.open({
	      message: 'Edit your express offer.',
	      input: [
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
	              '<div class="vex-custom-input-wrapper t40">',
	              	'<label for="offer">enter new amount here</label>',
	              	'<input type="number" min="0" max="9999" placeholder="', this.offer.expressOffer.offer||'','" name="offer">',
	              '</div>',
	              '<div class="vex-custom-input-wrapper t20">',
	              '<label for="offer">enter new details here</label>',
	              	'<input type="text" placeholder="', this.offer.expressOffer.message||'','" name="message">',
	              '</div>',
	          '</div>'
	      ].join(''),
	      callback: function (data) { 
	      	console.log(data)
	      	if (data&&(data.offer||data.message)) {
	      		Meteor.call('editExpressOffer', _was.offer._id, data)
	      	};
	      }
	    });
	},
	'click #assetsexpressoffer': function(e) {
		console.log('express offer accept')
	},
	'click #assetsrevokeoffer': function(e) {
		var _was = this
		vex.dialog.confirm({
			input: 'Please verify you want to revoke this offer.',
			callback: function(d) {
				console.log(d)
				if (d) {
					Meteor.call('revokeLeaseRequest', _was.offer, function(err, res) {
						vex.dialog.alert(err||res)
					})
				};
			}
		})
	},
	'click #submit-message': function(e) {
		e.preventDefault();
		var text = $('#message-box').val();
		$('#message-box').val('');
		// console.log(this)
		Meteor.call('addOfferMessage', {
			user: this.user._id,
			offer: this.offer._id,
			text: text
		});
	},
	'click #assetsagreeoffer': function(e) {
		Meteor.call('acceptAssetsOffer', this, function(e, r) {
			vex.dialog.alert(e||r)
		})
	},
	'click #assetsrejectoffer': function(e) {
		Meteor.call('rejectAssetsOffer', this)
	}
})

Template.assetsOfferDialog.helpers({
	notPendingNotOffereeDecision: function() {
		try {
			var isOffereeDeciding = this.offer.offereeDecision||false
			return !isOffereeDeciding
		} catch(e) {
			return true
		}
	},
	firstAction: function() {
		this.offer = this.offer||this.offers[0]
		return !(this.offer.offereeDecision||false)
	},
	formattedOfferorAssetNames: function() {
		return this.offer.assets.map(function(a){ return a.name}).join(', ')
	},
	totalOfferorHours: function() {
		return this.offer.consideration.hours + this.offer.consideration.remHours
	},
	totalOfferorDays: function() {
		return this.offer.consideration.days + this.offer.consideration.remDays
	},
	totalOfferorWeeks: function() {
		return this.offer.consideration.weeks
	},
	offerorOfferAmount: function() {
		if (this.offer.receipt) {
			return '$' + (this.offer.receipt.amount/100)
		};
		return '$0'
	},
	offerorPanel: function() {
		console.log('offerorPanel')
		console.log(this)
	},
	eoEditable: function() {
		return this.offer.pending||false
	},
	init: function() {
		// Session.set('offereeDecision', this.offereeDecision||false)
	},
	expressOffer: function() {
		var expressOffer = this.expressOffer || this.offer.expressOffer || {}
		console.log(expressOffer)
		if (expressOffer.offer) {
			var expiration = this.expirationDate || this.offer.expirationDate || null
			if (expiration) {
				if (expiration < new Date()) return null
			}

			return expressOffer
		}

		return false
	},
	offereeOption: function() {
		console.log(this)
	},
	pendingDetails: function() {
		var msg = ''
		if (this.offer.receipt) {
			msg = ['You have $', (this.offer.receipt.amount/100), ' in escrow.'].join('')
		} else {
			'The other party is contemplating your offer.'
		}

		return msg
	},
	stringify: function() {
		return JSON.stringify(this)
	},
	timeDefined: function() {
		var timeDefined = this.schedule ? true:false
		return timeDefined
	},
	isOfferee: function() {
		console.log(this)
		if (this.offer.pending===false) return false;
		if (Meteor.user()._id===this.offer.offeree) return true;
		return false
	},
	formattedPricing: function() {
		var p = this.pricing
		var a = []
		for (var k in p) {
			if (p[k]) {
				a.push(['$', p[k], ' ', k].join(''))
			}
		}
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
	messages: function() {
		return this.offer.messages||[]
	}
})

Handlebars.registerHelper('ifEveryOther', function(options) {
  var index = options.data.index + 1;
  if (index % 2 === 0) 
    return true;
  else
    return false;
});