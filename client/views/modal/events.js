Template.modal.events({
    'click .window-overlay': function(event, t) {
        // We only want to catch the event if the user click on the .window-overlay
        // div itself, not a child (ie, not the overlay window)
        if (event.target !== event.currentTarget)
            return;
        Utils.goBoardId(this.card.board()._id);
        event.preventDefault();
    },
    'click .js-close-window': function(event) {
        Utils.goBoardId(this.card.board()._id);
        $('html').css('visibility', 'hidden');
        setTimeout(function() {
            $('html').css('visibility', 'visible');
        }, 300);
        event.preventDefault();
    }
});
