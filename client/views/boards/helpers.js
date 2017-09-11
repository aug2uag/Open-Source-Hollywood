Template.board.helpers({
    isStarred: function() {
        var boardId = Boards.findOne()._id,
            user = Meteor.user();
        return boardId && user && user.hasStarred(boardId);
    }
});

Template.boardChangePermissionPopup.helpers({
    check: function(perm) {
        return this.permission === perm;
    }
});
