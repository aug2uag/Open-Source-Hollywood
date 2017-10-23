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
		console.log(new Array(100).join('^$'))
		console.log(this)
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