Template.projectMessage.helpers({
	foo: function() {
		console.log(this)
	},
	title: function() {
		return 'Conversation w ' + this.user.firstName + ' ' + this.user.lastName + ' campaign: ' + this.project.title;
	},
	messagesHeader: function() {
		if (!this.notifications.length) return 'There have been no actions made by this user for the ' + this.project.title + ' campaign.';
		if (this.notifications.length===1) return 'There is one action this user has taken.';
		return 'There are ' + this.notifications.length + ' notifications regarding the ' + this.project.title + ' campaign.';
	},
	numMessages: function() {
		if (!this.messages.length) return 'There is no history of communication between the two of you regarding the ' + this.project.title + ' campaign.';
		if (this.messages.length===1) return 'There is only one message.';
		return 'There are ' + this.messages.length + ' messages regarding the ' + this.project.title + ' campaign.';
	}
})

Template.projectMessage.events({
	'click #submit-message': function() {
		var text = document.getElementById('message-box').value;
		document.getElementById('message-box').innerHTML = '';
		Meteor.call('addProjectMessage', {
			user: this.user._id,
			project: this.project._id,
			text: text
		});
	}
})