Template.membersThumbnail.helpers({
    user: function() {
        if (!this.user && !this.userId) return;
        return Users.findOne({_id: this.userId});
    }
});

Template.cardMembersPopup.helpers({
    isCardMember: function() {
        if (!this.user && !this.userId) return;
        var cardId = Template.parentData().card._id;
        var cardMembers = Cards.findOne(cardId).members || [];
        return _.contains(cardMembers, this.userId);
    },
    user: function() {
        if (!this.user && !this.userId) return;
        return Users.findOne({'_id': this.userId});
    }
});

Template.cardMemberPopup.helpers({
    user: function() {
        if (!this.user && !this.userId) return;
        if (this.userId) return Users.findOne({'_id': this.userId});
        return this.user;
    }
});

Template.cardLabelsPopup.helpers({
    isLabelSelected: function(cardId) {
        return _.contains(Cards.findOne(cardId).labelIds, this._id);
    }
});

var labelColors = ['green', 'yellow', 'orange', 'red', 'purple', 'blue', 'sky',
'lime', 'pink', 'black'];

Template.createLabelPopup.helpers({
    // This is the default color for a new label. We search the first color that
    // is not already used in the board (although it's not a problem if two
    // labels have the same color)
    defaultColor: function() {
        var usedColors = _.pluck(this.card.board().labels, 'color');
        var availableColors = _.difference(labelColors, usedColors);
        return availableColors.length > 1 ? availableColors[0] : 'green';
    }
});

Template.formLabel.helpers({
    labels: function() {
        return _.map(labelColors, function(color) {
            return { color: color, name: '' };
        });
    }
});

Template.cardDetailWindow.helpers({
    foo: function() {
        return this.card && this.board;
    }
});

Template.dueDatePopup.helpers({
    datecal: function() {
        setTimeout(function() {
            $('#glwiz').trigger('click');
        }, 110);
    }
})

Template.dueDatePopup.onRendered(function() {
    this.$('.datetimepicker').datetimepicker();
});