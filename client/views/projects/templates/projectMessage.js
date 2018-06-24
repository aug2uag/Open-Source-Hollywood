var was;

function negotiationHelper(key) {
	var negotiatedRoles = was.project.negotiations || [];
	var negotiatedRole;
	for (var i = 0; i < negotiatedRoles.length; i++) {
		if (negotiatedRoles[i].id = was.user._id) {
			negotiatedRole = negotiatedRoles[i];
			break;
		};
	};
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
	var roles = agg.join(', ');
	return roles.substr(0, roles.length-2);
}

Template.projectMessage.helpers({
	foo: function() {
		was = this;
	},
	isProjectOwner: function() {
		return this.project.ownerId === Meteor.user()._id;
	},
	userName: function() {
		return this.user.firstName + ' ' + this.user.lastName;
	},
	title: function() {
		return 'Conversation w ' + this.user.firstName + ' ' + this.user.lastName + ' campaign: ' + this.project.title;
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
		console.log('negotiationRoles')
		var roles = formattedProjectRoles();
		return 'This contract is valid for the following roles: ' + roles + '.';
	},
	negotiationTerms: function() {
		var value = negotiationHelper('negotiationTerms');
		if (value) return value;
		console.log('negotiationTerms')
		var roles = formattedProjectRoles();
		return 'This contract is valid for all expected performance and conditions relating to the roles of ' + roles + '. Campaign author promises to make best efforts to create campaign, and applicant promises to perform the roles outlined in this agreement.';
	},
	negotiationDamages: function() {
		var value = negotiationHelper('negotiationDamages');
		if (value) return value;
		console.log('negotiationDamag')
		return 'Breaching party is responsible for paying any legal fees resulting from breach of non-performance. All disputes will be handled in the State of California, and this contract is bound to California laws and regulations.';
	},
	negotiationFinancial: function() {
		var value = negotiationHelper('negotiationFinancial');
		if (value) return value;
		console.log('negotiationFinan')
		return 'enter value, calculated in US Dollars';
	},
	negotiationEquities: function() {
		var value = negotiationHelper('negotiationEquities');
		if (value) return value;
		console.log('negotiationEquit')
		return 'enter value, calculated in number of shares';
	}
})

Template.projectMessage.events({
	'change #negotiationRoles': function(e) {
		var _negotiationRoles = $('#negotiationRoles').val();
		Meteor.call('updateProjectNegotiations', {
			ctx: was,
			switch: 'negotiationRoles',
			value: _negotiationRoles
		});
	},
	'change #negotiationTerms': function(e) {
		var _negotiationTerms = $('#negotiationTerms').val();
		Meteor.call('updateProjectNegotiations', {
			ctx: was,
			switch: 'negotiationTerms',
			value: _negotiationTerms
		});
	},
	'change #negotiationDamages': function(e) {
		var _negotiationDamages = $('#negotiationDamages').val();
		Meteor.call('updateProjectNegotiations', {
			ctx: was,
			switch: 'negotiationDamages',
			value: _negotiationDamages
		});
	},
	'change #financials': function(e) {
		var _financials = $('#financials').val();
		Meteor.call('updateProjectNegotiations', {
			ctx: was,
			switch: 'financials',
			value: _financials
		});
	},
	'change #equities': function(e) {
		var _equities = $('#equities').val();
		Meteor.call('updateProjectNegotiations', {
			ctx: was,
			switch: 'equities',
			value: _equities
		});
	},
})

Template.projectMessageOffer.helpers({
	considerationType: function() {
		if (this.ctx==='crew') {
			if (this.type==='hired'&&this.pay>0) {
				return 'requesting pay for crew position: ' + this.position||'';
			} else {
				return 'requesting no pay for crew position: ' + this.position||'';
			}
		} else {
			if (this.type==='hired'&&this.pay>0) {
				return 'requesting pay for cast position: ' + this.position||'';
			} else {
				return 'requesting no pay for cast position: ' + this.position||'';
			}
		}
	},
	considerationItself: function() {
		console.log(this)
		var amount = this.amount, pay = this.pay, type = this.type;
		if (amount===0&&pay===0) {
			return 'time donation offer';
		} else {
			if (amount>0&&type==='hired') {
				return 'requesting $' + this.amount;
			} else {
				return 'offering a donation of $' + this.pay;
			}
		}
	}
})

Template.projectMessage.events({
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

Handlebars.registerHelper('ifEveryOther', function(options) {
  var index = options.data.index + 1;
  if (index % 2 === 0) 
    return true;
  else
    return false;
});