function goDiscovery() {
  try{
    var cb = document.getElementById('discoverybtn'); 
      cb.dispatchEvent(new MouseEvent('click', {
        view: window
      }));
  } catch(e){ window.location.assign('/discover');}
};

Template.memberHeader.events({
    'click .js-open-header-member-menu': Popup.open('memberMenu'),
    'click #stats': Popup.open('stats'),
    'click #cal': Popup.open('cal'),
    'click #tasks': Popup.open('tasks'),
    'click #asss': Popup.open('asss'),
    'click #mine': Popup.open('mine'),
    'click #exit': function() {
        goDiscovery()
    }
});

Template.memberMenuPopup.events({
    'click .js-language': Popup.open('setLanguage'),
    'click .js-logout': function(event, t) {
        event.preventDefault();

        Meteor.logout(function() {
            Router.go('Home');
        });
    }
});

Template.setLanguagePopup.events({
    'click .js-set-language': function(event) {
        Users.update(Meteor.userId(), {
            $set: {
                'profile.language': this.tag
            }
        });
        event.preventDefault();
    }
});

// Template.memberName.events({
//     'click .js-show-mem-menu': Popup.open('user')
// });


Template.applicantAvatar.events({
    'click .accept': function(event) {
        $('.accept').attr("disabled", true);
        $('.reject').attr("disabled", true);
        Meteor.call('acceptUserToProject', this.user.id, this.user.contribution, Router.current().params.slug);
    },
    'click .reject': function(event) {
        $('.accept').attr("disabled", true);
        $('.reject').attr("disabled", true);
        Meteor.call('rejectUserFromProject', this.user.id, Router.current().params.slug);
    }
})