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

		var that = this;
		// console.log(was)
		if (this.funded<1) return bootbox.alert('there are no funds to transfer');
		// else show popup
		// list bank accounts to choose
		// + button to add bank account
		// bank account type, ssn, FTIN as editable to add
		// show err, and direct user to add details to account
		function configurePersonalAccount() {
			var opts = {slug:that.slug};
			Meteor.call('transferFunds', opts, function(err, result) {
				if (err) return bootbox.alert('there was an error, please contact us');
				bootbox.alert(result);
			});
			return false;
		}

		// if no personal account
		if (!Meteor.user().account) {
			return bootbox.alert('your account status is invalid, please update your profile to correct this deficiency');
		};

		// no bank
		if (!Meteor.user().bank) {
			return bootbox.alert('there is no transfer destination, please add one in the EDIT PROFILE section');
		};

		// else confirm transfer to account, else configurePersonalAccount
		// how much available for transfer amt - .05x
		// how much transfer fees 0.05x (x=amt_transfer)
		configurePersonalAccount();

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