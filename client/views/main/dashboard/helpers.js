Template.dashboard.helpers({
	foo: function() {
		var _id = Meteor.user()._id;
		return Projects.find({
	        archived: false,
			$or: [
				{crewApplicants: {$elemMatch: {'user.id': _id}}},
				{roleApplicants: {$elemMatch: {'user.id': _id}}}
			]
	    }).fetch();
	},
	bar: function() {
		var _id = Meteor.user()._id;
		return Projects.find({
	        $and: [
	          {archived: false},
	          {usersApproved: {$elemMatch: {id: _id}}}
	        ]
	    }).fetch();
	},
	baz: function() {
		var _id = Meteor.user()._id;
		return Projects.find({
	        $and: [
	          {archived: false},
	          {ownerId: _id}
	        ]
	    }).fetch();
	},
	uid: function() {
		return Meteor.user()._id;
	},
	messagesLink: function() {
		return '/message/project/'+this.slug+'/'+Meteor.user()._id;
	}
});

Template.dashboard.events({
	'click .transfer_funds': function() {
		/**
			
			SHOW POPUP
				how much funded
				funds transferred
				funds available for transfer
				transfer status
					level C
						bank account
						routing
					level B
						name
						address
					level A
						account type
						ssn

		  */
		// console.log(new Array(100).join('^$'))
		// console.log(this)
		// console.log(was)
		if (this.funded<1) return bootbox.alert('there are no funds to transfer');
		// else show popup
		// list bank accounts to choose
		// + button to add bank account
		// bank account type, ssn, FTIN as editable to add
		// show err, and direct user to add details to account
		function configurePersonalAccount() {
			var intmodal = bootbox.dialog({
	            title: 'BIND BANK ACCOUNT',
	            message: '<div class="container" style="width:100%"> <div class="row"> <div style="width:100%"> <div class="panel panel-default"> <div class="panel-body"> <form action="" method="POST" id="payment-form"> <div class="errors"></div><div class="row"> <div class="col-md-8"> <div class="form-group"> <label>Country</label> <select class="form-control input-lg" id="country" data-stripe="country" style="line-height: normal;"> <option value="US">United States</option> <option value="AU">Australia</option> <option value="AT">Austria</option> <option value="BE">Belgium</option> <option value="BR">Brazil</option> <option value="CA">Canada</option> <option value="DK">Denmark</option> <option value="FI">Finland</option> <option value="FR">France</option> <option value="DE">Germany</option> <option value="HK">Hong Kong</option> <option value="IE">Ireland</option> <option value="IT">Italy</option> <option value="JP">Japan</option> <option value="LU">Luxembourg</option> <option value="MX">Mexico</option> <option value="NZ">New Zealand</option> <option value="NL">Netherlands</option> <option value="NO">Norway</option> <option value="PT">Portugal</option> <option value="SG">Singapore</option> <option value="ES">Spain</option> <option value="SE">Sweden</option> <option value="CH">Switzerland</option> </select> </div></div><div class="col-md-4"> <div class="form-group"> <label>Currency</label> <select class="form-control input-lg" id="currency" data-stripe="currency" style="line-height: normal;"> <option value="usd">USD</option> <option value="aud">AUD</option> <option value="brl">BRL</option> <option value="cad">CAD</option> <option value="eur">EUR</option> <option value="gbp">GBP</option> <option value="hkd">HKD</option> <option value="jpy">JPY</option> <option value="mxn">MXN</option> <option value="nzd">NZD</option> <option value="sgd">SGD</option> </select> </div></div></div><div class="row"> <div class="col-md-6"> <div class="form-group"> <label>Full Legal Name</label> <input class="form-control input-lg account_holder_name" id="account_holder_name" type="text" data-stripe="account_holder_name" placeholder="Jane Doe" autocomplete="off"> </div></div><div class="col-md-6"> <div class="form-group"> <label>Account Type</label> <select class="form-control input-lg account_holder_type" id="account_holder_type" data-stripe="account_holder_type" style="line-height: normal;"> <option value="individual">Individual</option> <option value="company">Company</option> </select> </div></div></div><div class="row"> <div class="col-md-6" id="routing_number_div"> <div class="form-group"> <label id="routing_number_label">Routing Number</label> <input class="form-control input-lg bank_account" id="routing_number" type="tel" size="12" data-stripe="routing_number" placeholder="111000025" autocomplete="off"> </div></div><div class="col-md-6"> <div class="form-group"> <label id="account_number_label">Account Number</label> <input class="form-control input-lg bank_account" id="account_number" type="tel" size="20" data-stripe="account_number" placeholder="000123456789" autocomplete="off"> </div></div></div></form> </div></div></div></div></div>',
	            buttons: {
					danger:  {
						label: 'Cancel',
						className: "btn-danger",
						callback: function() { intmodal.modal('hide') }
					},
					success: {
						label: 'ADD TO ACCOUNT',
						className: 'btn-success',
						callback: function() {
						    var opts = {};
							opts.country = $('#country').val();
							opts.currency = $('#currency').val();
							opts.account_holder_name = $('#account_holder_name').val();
							opts.account_holder_type = $('#account_holder_type').val();
							opts.routing_number = $('#routing_number').val();
							opts.account_number = $('#account_number').val();
							return false;	
		                }
		            }
	            }
			}).on('shown.bs.modal', function (e) {
	            // Switch or hide 'routing number' depending on currency
				$('#currency').change(function(){
					$('#routing_number_div').show();
					$('#account_number_label').text('Account Number').next('input').attr('placeholder', '');
					$('#routing_number').attr('data-stripe', 'routing_number');
					switch (this.value) {
					  case "usd":
					    $('#routing_number_label').text('Routing Number').next('input').attr('placeholder', '111000000');
					    break;
					  case "eur":
					    // No routing number needed
					    $('#routing_number_div').hide();
					    $('#routing_number').removeAttr('data-stripe');
					    $('#account_number_label').text('IBAN').next('input').attr('placeholder','XX9828737432389');
					    break;
					  case "cad":
					    $('#routing_number_label').text('Transit & Institution Number');
					    break;
					  case "gbp":
					    $('#routing_number_label').text('Sort Code').next('input').attr('placeholder', '12-34-56');
					    break;
					  case "mxn":
					    $('#routing_number_label').text('CLABE');
					    break;
					  case 'aud': case "nzd":
					    $('#routing_number_label').text('BSB').next('input').attr('placeholder', '123456');
					    break;
					  case 'sgd': case "jpy": case "brl": case "hkd":
					    $('#routing_number_label').text('Bank / Branch Code');
					    break;
					}
				});
	        });
		}
		// if no personal account
		if (true) {};

		// else confirm transfer to account, else configurePersonalAccount
		if (true) {};
	}
})

Template.collapses.helpers({
	emptySetApplied: function() {
		return this.usersApplied.length === 0;
	},
	emptySetApproved: function() {
		return this.usersApproved.length === 0;
	},
	projectApplicants: function() {
        var self = this;
        return _.map(self.usersApplied,function(p) {
            p.slug = self.slug;
            p.title = self.title;
            p.projId = self._id;
            p.ownId = self.ownerId;
            return p;
        });
	},
	projectApprovals: function() {
        var self = this;
        return _.map(self.usersApproved,function(p) {
            p.slug = self.slug;
            p.title = self.title;
            p.projId = self._id;
            p.ownId = self.ownerId;
            return p;
        });
	},
	uuid_accordion: function() {
		return 'accordion' + this._id
	}
});

Template.applied_to_project.helpers({
	bid: function() {
		var _id = Meteor.user()._id;
		var _c;
		this.usersApplied.forEach(function(i) {
			if (i.id === _id) {
				_c = i.contribution.toFixed(2);
				return;
			};
		});
		return _c;
	},
	comm: function() {
		var _id = Meteor.user()._id;
		var _c;
		this.usersApplied.forEach(function(i) {
			if (i.id === _id) {
				_c = i.communications;
				return;
			};
		});
		return _c;
	},
	upTitle: function() {
		return this.title.toUpperCase();
	},
	unreadComm: function() {
		var _id = Meteor.user()._id;
		var falsy = false;
		this.usersApplied.forEach(function(i) {
			if (i.id === _id) {
				i.communications.forEach(function(r) {
					if (r.unread === true && r.ownerId !== _id) {
						falsy = true;
						return;
					};
				})
			};
		});
		return falsy;
	},
	uuid: function() {
		return this.projId + '_' + this.id;
	},
	uuid2: function() {
		return this.slug + '_' + this.id;
	},
	uuid_accordion: function() {
		return 'accordion' + this.projId
	}
});

Template.approved_for_project.helpers({
	bid: function() {
		var _id = Meteor.user()._id;
		var _c;
		this.usersApproved.forEach(function(i) {
			if (i.id === _id) {
				_c = i.contribution.toFixed(2);
				return;
			};
		});
		return _c;
	},
	comm: function() {
		var _id = Meteor.user()._id;
		var _c;
		this.usersApproved.forEach(function(i) {
			if (i.id === _id) {
				_c = i.communications;
				return;
			};
		});
		return _c;
	},
	upTitle: function() {
		return this.title.toUpperCase();
	},
	unreadComm: function() {
		var _id = Meteor.user()._id;
		var falsy = false;
		this.usersApproved.forEach(function(i) {
			if (i.id === _id) {
				i.communications.forEach(function(r) {
					if (r.unread === true && r.ownerId !== _id) {
						falsy = true;
						return;
					};
				});
			};
		});
		return falsy;
	},
	uuid: function() {
		return this.projId + '_' + this.id;
	},
	uuid2: function() {
		return this.slug + '_' + this.id;
	},
	uuid_accordion: function() {
		return 'accordion' + this.projId
	}
});

Template.production_applicant.helpers({
	user: function() {
		return Users.find({_id:this.id}).fetch()[0];
	},
	bid: function() {
		return this.contribution.toFixed(2);
	},
	comm: function() {
		return this.communications;
	},
	upTitle: function() {
		return this.title.toUpperCase();
	},
	unreadComm: function() {
		var _id = Meteor.user()._id;
		var falsy = false;
		this.communications.forEach(function(r) {
			if (r.unread === true && r.ownerId !== _id) {
				falsy = true;
				return;
			};
		});
		return falsy;
	},
	uuid: function() {
		return this.projId + '_' + this.id;
	},
	uuid2: function() {
		return this.slug + '_' + this.id;
	},
	uuid_accordion: function() {
		return 'accordion' + this.id
	}
})

Template.production_member.helpers({
	user: function() {
		return Users.find({_id:this.id}).fetch()[0];
	},
	bid: function() {
		return this.contribution.toFixed(2);
	},
	comm: function() {
		return this.communications;
	},
	upTitle: function() {
		return this.title.toUpperCase();
	},
	unreadComm: function() {
		var _id = Meteor.user()._id;
		var falsy = false;
		this.communications.forEach(function(r) {
			if (r.unread === true && r.ownerId !== _id) {
				falsy = true;
				return;
			};
		});
		return falsy;
	},
	uuid: function() {
		return this.projId + '_' + this.id;
	},
	uuid2: function() {
		return this.slug + '_' + this.id;
	},
	uuid_accordion: function() {
		return 'accordion' + this.id
	}
})