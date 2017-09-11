var currentBoard = function() {
    return Boards.findOne(Router.current().params.boardId);
}

var widgetTitles = {
    filter: 'filter-cards',
    background: 'change-background'
};

Template.applicantsPopup.helpers({
    applicants: function() {
        var usersApplied = Projects.findOne({slug: this.board.slug}).usersApplied;
        usersApplied = usersApplied || [];
        var appliedIds = usersApplied.map(function(i){return i.id;});
        var appliedContribution = usersApplied.map(function(i){return i.contribution;});
        var usersArray = Projects.findOne({slug: this.board.slug}).usersApplied;
        var o = [];
        var ids = [];
        usersArray.forEach(function(i) {
            var _o = {};
            _o.id = i.id;
            ids.push(i.id);
            _o.contribution = i.contribution;
            o.push(_o);
        });
        var users = Users.find({'_id': {$in:appliedIds}}).fetch();
        users.forEach(function(i) {
            for (var j = 0; j < usersArray.length; j++) {
                var currUser = usersArray[j];
                if (currUser.id === i._id) {
                    currUser.name = i.firstName + ' ' + i.lastName;
                    currUser.thumbnailUrl = i.services.auth0.picture;
                };
            };
        });
        return usersArray;
    },
    areApplicants: function() {
        return Projects.findOne({slug: this.board.slug}).usersApplied.length > 0;
    } 
})

Template.boardWidgets.helpers({
    currentWidget: function() {
        return Session.get('currentWidget') + 'Widget';
    },
    currentWidgetTitle: function() {
        return TAPi18n.__(widgetTitles[Session.get('currentWidget')]);
    }
});

Template.addMemberPopup.helpers({
    isBoardMember: function() {
        var user = Users.findOne({'_id': this._id});
        return user && user.isBoardMember();
    }
});

Template.backgroundWidget.helpers({
    backgroundColors: function() {
        return DefaultBoardBackgroundColors;
    }
});

Template.memberPopup.helpers({
    user: function() {
        return Users.findOne({'_id': this.user});
    },
    memberType: function() {
        var type = Users.findOne({'_id': this.user}).isBoardAdmin() ? 'admin' : 'normal';
        return TAPi18n.__(type).toLowerCase();
    }
});

Template.menuWidget.helpers({
    backgroundColor: function() {
        return this.board.background && this.board.background.color || "#16A085";
    }
})

Template.removeMemberPopup.helpers({
    user: function() {
        return Users.findOne({'_id': this.userId})
    },
    board: function() {
        return currentBoard();
    }
});

Template.changePermissionsPopup.helpers({
    isAdmin: function() {
        return Users.findOne({'_id': this.user}).isBoardAdmin();
    },
    isLastAdmin: function() {
        if (! Users.findOne({'_id': this.user}).isBoardAdmin())
            return false;
        var nbAdmins = _.where(currentBoard().members, { isAdmin: true }).length;
        return nbAdmins === 1;
    }
});

Template.filterWidget.helpers({
    foo: function() {
        var cards = Cards.find({boardId: this.board._id}).fetch();
        var _cards = cards.map(function(i) {
            if (i.dueDate !== undefined) {
                var _dStr = '';
                var _i = new Date(i.dueDate);
                var m = _i.getMonth() + 1;
                var d = _i.getDate();
                var y = _i.getYear() + 1900;
                _dStr = m + '/' + d + '/' + y;
                return {
                    _id: i._id,
                    title: i.title,
                    listId: i.listId,
                    dueDate: i.dueDate,
                    formattedDate: _dStr
                };
            };
        });
        return _cards;
    }
})

Template.calendarViewPopup.helpers({
    calendarOptions: function() {
        setTimeout(function() {
            var date = new Date();
            var d = date.getDate();
            var m = date.getMonth();
            var y = date.getFullYear();

            var board = currentBoard();
            var cards = Cards.find({boardId: board._id}).fetch();
            var events_array = [];
            cards.forEach(function(e) {
                if (e.dueDate) {
                    var url = '/boards/' + board._id + '/' + board.slug + '/' + e._id;
                    // http://fullcalendar.io/docs/event_data/Event_Object/
                    events_array.push({
                        start: e.dueDate,
                        title: e.title,
                        allDay: true,
                        url: url
                    });
                };
            });

            $('#calendar').fullCalendar({
                header: {
                    left: 'prev,next',
                    title: 'title',
                    right: ''
                },
                selectable: true,
                events: events_array,
                eventRender: function(event, element) {
                    element.attr('title', event.tip);
                }
            });
        }, 100);
    }
});
