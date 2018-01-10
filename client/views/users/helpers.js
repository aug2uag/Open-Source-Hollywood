var currentBoard = function() {
    return Boards.findOne(Router.current().params.boardId);
};


Template.setLanguagePopup.helpers({
    languages: function() {
        return _.map(TAPi18n.getLanguages(), function(lang, tag) {
            return {
                tag: tag,
                name: lang.name
            };
        });
    },
    isCurrentLanguage: function() {
        return this.tag === TAPi18n.getLanguage();
    }
});

Template.userAvatar.helpers({
    username: function() {
        if (!this.user || !this.user._id) return;
        var user = Users.findOne({_id: this.user._id});
        if (user && user.services && user instanceof Object) {return user.services.auth0.name;}
    },
    name: function() {
        if (!this.user || !this.user._id) return;
        var user = Users.findOne({_id: this.user._id})
        if (user && user.services && user instanceof Object) {return user.services.auth0.nickname;}
    },
    thumbnailUrl: function() {
        if (!this.user || !this.user._id) return;
        var user = Users.findOne({_id: this.user._id})
        if (user && user.services && user instanceof Object) {return user.services.auth0.picture;}
    }
});

Template.memberAvatar.helpers({
    username: function() {
        var user = Users.findOne({'_id': this.user})
        if (user && user.services && user.services.auth0) return user.services.auth0.name;
    },
    name: function() {
        var user = Users.findOne({'_id': this.user})
        if (user && user.services && user.services.auth0) return user.services.auth0.name;
    },
    thumbnailUrl: function() {
        var user = Users.findOne({'_id': this.user})
        if (user && user.services && user.services.auth0) return user.services.auth0.picture;
    },
    status: function() {
        var user = Users.findOne({'_id': this.user})
        if (user && user.services && user.services.auth0) return user.status === 'online';
    },
    memberType: function() {
        var user = Users.findOne({'_id': this.user})
        if (user && user.services && user.services.auth0) return user.isBoardAdmin() ? 'admin' : 'member';
    }
});

Template.applicantAvatar.helpers({
    uid: function() {
        return this.user.uid;
    },
    otype: function() {
        return this.user.type;
    },
    message: function() {
        return this.user.message;
    },
    name: function() {
        return this.user.name.trim() || 'this user\'s name is not available';
    },
    avatar: function() {
        return this.user.avatar;
    }
});

Template.statsPopup.onRendered(function() {
    // get tasks total v tasks completed
    var board = currentBoard();
    var tasksTotal = Cards.find({boardId: board._id}).fetch();
    var tasksTotalLength = tasksTotal.length;
    var tasksFinished = 0;
    var personalTasksTotal = 0, personalTasksFinished = 0, personalTasksRemaining = 0;
    var myId = Meteor.user()._id;
    tasksTotal.forEach(function(t) {
        if (t.archived) tasksFinished += 1;
        t.members = t.members || [];
        var truthy = true;
        for (var i = 0; i < t.members.length; i++) {
            if (myId === t.members[i]) {
                personalTasksTotal += 1;
                if (t.archived) {
                    personalTasksFinished += 1;
                };
                truthy = false;
                break;
            };
        };
        if (truthy && myId === t.userId) {
            personalTasksTotal += 1;
            if (t.archived) {
                personalTasksFinished += 1;
            };
        };
    });
    personalTasksRemaining = personalTasksTotal - personalTasksFinished;
    var tasksRemaining = tasksTotal.length - tasksFinished;

    // get personal total v personal completed
    var polarData = [
        {
            value: tasksTotal.length,
            color:"#F7464A",
            highlight: "#FF5A5E",
            label: "total tasks"
        },
        {
            value: tasksFinished,
            color: "#46BFBD",
            highlight: "#5AD3D1",
            label: "total finished"
        },
        {
            value: tasksRemaining,
            color: "#FDB45C",
            highlight: "#FFC870",
            label: "total remaining"
        },
        {
            value: personalTasksTotal,
            color: "#949FB1",
            highlight: "#A8B3C5",
            label: "yours total"
        },
        {
            value: personalTasksFinished,
            color: "#4D5360",
            highlight: "#616774",
            label: "yours finished"
        },
        {
            value: personalTasksRemaining,
            color: "#FFCE56",
            highlight: "#FF9063",
            label: "yours remaining"
        }
    ];


    var ctx = document.getElementById("canvas").getContext("2d");
    return new Chart(ctx).PolarArea(polarData, {
        responsive:true
    });
});

Template.calPopup.helpers({
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
                    console.log(e);
                    events_array.push({
                        start: e.dueDate,
                        title: e.title,
                        url: url
                    });
                };
            });

            $('#cali').fullCalendar({
                defaultView: 'basicWeek',
                events: events_array
            });
            setTimeout(function() {
                $('.fc-prev-button').empty().append('<i class="fa fa-caret-left"></i>');
                $('.fc-next-button').empty().append('<i class="fa fa-caret-right"></i>');
                $('.fc-day-header').css('color', '#333');
                if($('fc-left').child)$($('fc-left').child()).css('color', '#333');
                $('.fc-day-header').css('color', '#333');
                $('.fc-today-button').css('display', 'none');
                $('.fc-button').on('click', function() {
                    $('.fc-day-header').css('color', '#333');
                });
            }, 10);
        }, 100);
    }
});

Template.tasksPopup.helpers({
    tasks: function() {
        var x = Cards.find({boardId: this._id}).fetch();
        var o = {};
        o.tasksTotal = x.length;
        o.tasksCompleted = 0;
        x.forEach(function(t) {
            if (t.archived) o.tasksCompleted += 1;
        });
        o.tasksRemaining = o.tasksTotal - o.tasksCompleted;
        return o;
    }
});

Template.asssPopup.helpers({
    noAsss: function() {
        var x = Attachments.find({
            boardId: this._id
        }).count();
        return x === 0;
    },
    asss: function() {
        var was = this;
        var x = Attachments.find({
            boardId: this._id
        }).fetch();
        return _
            .chain(x)
            .groupBy('cardId')
            .map(function(value, key) {
                return {
                    // /boards/yYT2eu2wRLxAq7v5r/PsL61462418864/n24J3PZWQ8E2eM69o
                    card: '/boards/' + was._id + '/' + was.slug + '/' + key,
                    val: _.pluck(value, 'original')
                }
            })
            .value();
    }
});

Template.minePopup.helpers({
    mine: function() {
        var was = this;
        var x = Cards.find({
            boardId: this._id,
            userId: Meteor.user()._id
        }).fetch(); 
        return x.map(function(c) {
            return {
                href: '/boards/' + was._id + '/' + was.slug + '/' + c._id,
                title: c.title,
            }
        });
    }
});