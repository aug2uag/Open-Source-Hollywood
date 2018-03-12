Template.projectMessage.helpers({
	title: function() {
		return 'Conversation w ' + this.user.firstName + ' ' + this.user.lastName + ' campaign: ' + this.project.title;
	},
	messagesHeader: function() {
		if (!this.offers.length) return 'There have been no offers made by this user for the ' + this.project.title + ' campaign.';
		if (this.offers.length===1) return 'There is one offer from this user for this campaign.';
		return 'There are ' + this.offers.length + ' offers made by this user for the ' + this.project.title + ' campaign.';
	},
	numMessages: function() {
		if (!this.messages.length) return 'There is no history of communication between the two of you regarding the ' + this.project.title + ' campaign.';
		if (this.messages.length===1) return 'There is only one message.';
		return 'There are ' + this.messages.length + ' messages regarding the ' + this.project.title + ' campaign.';
	},
	formattedOfferDate: function() {
		var d = new Date(this.created);
		return d.toLocaleDateString();
	}
})

Template.projectMessage.events({
	'click #submit-message': function() {
		var text = document.getElementById('message-box').value;
		document.getElementById('message-box').value = '';
		// $('#message-box').val('');
		Meteor.call('addProjectMessage', {
			user: this.user._id,
			project: this.project._id,
			text: text
		});
	}
})