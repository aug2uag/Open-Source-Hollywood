/*
* If you want to use a default layout template for all routes you can
* configure a global Router option.
*/
Router.configure({
    loadingTemplate: 'loading',
    notFoundTemplate: 'notfound',

    yieldRegions: {
        '': {
            to: 'modal'
        }
    },

    /*
    * onBeforeAction hooks now require you to call this.next(),
    * and no longer take a pause() argument. So the default behaviour is reversed.
    * ClassMapper body add, remove class.
    */
    onBeforeAction: function(pause) {
        window.scrollTo(0,0);
        var body = $('body'),
            options = this.route.options,
            bodyClass = options["bodyClass"],
            authenticate = options['authenticated'],
            redirectLoggedInUsers = options['redirectLoggedInUsers'];

        // authenticated
        if (!Meteor.user() && authenticate) {

            // redirect
            Router.go('/');
            // options authenticate not next().
            return;
        }

        if (Meteor.user() && redirectLoggedInUsers) {
            // redirect
            Router.go('Projects');
            return;
        }

        // Remove class attribute body
        body.removeAttr('class');

        // if klass iron router name currentRouter then add Class
        if (bodyClass) body.addClass(bodyClass);

        // reset default sessions
        Session.set('error', false);
        Session.set('warning', false);

        Popup.close();

        // Next
        this.next();
    }
});

Router.route('/dashboard', {
    name: 'Dashboard',
    template: 'dashboard',
    layoutTemplate: 'StaticLayout',
    bodyClass: '.col-xs-12,.col-sm-12,.col-md-12,.col-lg-12{margin-bottom: 20px;}',
    waitOn: function() {
        if (!Meteor.user()) Router.go('Home');
        var _id = Meteor.user()._id;
        return [
            Meteor.subscribe('usersList'),
            Meteor.subscribe('userActiveProjects', _id),
            Meteor.subscribe('activeProjectsApplied', _id),
            Meteor.subscribe('activeProjectsApproved', _id)
        ];
    },
    onBeforeAction: function() {
        if (!Meteor.user()) {
            Router.go('Home');
            window.location.assign('/');
            return;
        }
        document.title = "Dashboard";
        this.next();
    }
});