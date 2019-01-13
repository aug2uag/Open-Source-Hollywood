Template.board.helpers({
    isStarred: function() {
        var boardId = Boards.findOne()._id,
            user = Meteor.user();
        return boardId && user && user.hasStarred(boardId);
    },
    onboarded: function() {
    	var user = Meteor.user()
    	if (!user.onboardBoarding) {
    		vex.dialog.alert({
    			input: [
    				'<p>This is your project board.</p>',
    				'<p>You can assign or be assigned tasks.</p>',
    				'<p>Tasks are accessed in the cards that contain information when you click into them.</p>'
    			].join(''),
    			callback: function() {
    				Meteor.call('userBoardDidOnboard')
    			}
    		})
    	};
    }
});

Template.boardChangePermissionPopup.helpers({
    check: function(perm) {
        return this.permission === perm;
    }
});
