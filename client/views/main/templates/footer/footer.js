Template.footer.helpers({
	year: function() {
		var x = new Date;
		return x.getYear() + 1900;
	}
});

Template.footer.events({
	'click #subscribe': function(e) {
		e.preventDefault();
		var email = $('#email').val();
		if (email) {
		  Session.set('subscriptionEmail', email);
		  Meteor.call("subscribeEmail", email);
		  $('#email').val('');
		  vex.dialog.alert('Thank you for subscribing!');
		}
	}
})