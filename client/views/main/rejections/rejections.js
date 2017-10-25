Router.route('/receipts', {
    name: 'Receipts',
    template: 'receipts',
    layoutTemplate: 'StaticLayout',
    bodyClass: '.col-xs-12,.col-sm-12,.col-md-12,.col-lg-12{margin-bottom: 20px;}',
    waitOn: function() {
        if (!Meteor.user()) Router.go('Home');
        return [
            Meteor.subscribe('getReceipts')
        ];
    }
});

Router.route('/comms', {
    name: 'Comms',
    template: 'comms',
    layoutTemplate: 'StaticLayout',
    bodyClass: '.col-xs-12,.col-sm-12,.col-md-12,.col-lg-12{margin-bottom: 20px;}',
    waitOn: function() {
        if (!Meteor.user()) Router.go('Home');
        return [
            Meteor.subscribe('getComms')
        ];
    }
});


Template.receipts.helpers({
    receiptsList: function() {
        return Receipts.find({userId: Meteor.user()._id}).fetch();
    },
    formatDate: function() {
        return moment(this.created).format('MMMM Do YYYY, h:mm:ss a');
    },
    formatTitle: function() {
        return this.projTitle||this.projectTitle||this.title||'undefined';
    },
    formatAmount: function() {
        return '$' + this.amount.toFixed(2);
    },
    formatRefund: function() {
        if (this.refunded) return 'REFUNDED';
        if (this.error) return 'REFUND ERROR, CONTACT US';
        return 'PAID';
    }
});


Template.comms.helpers({
    comms: function() {
        return Notifications.find({
            user: Meteor.user()._id
        });
    }
});
