/*
*
* To make this available on the client, use a reactive cursor,
* such as by creating a publication on the server:
*/
Meteor.publish('profile', function(_id) {
    check(_id, Object);
    return Users.find({ '_id': _id });
});

Meteor.publish('stringId', function(_id) {
    check(_id, String);
    return Users.find({ '_id': _id });
});

Meteor.publish('getUsers', function() {
    return Users.find({ });
});

Meteor.publish('projBackers', function(arr) {
    check(arr, Array)
    return Users.find({ _id: { $in: arr } });
});

Meteor.publish('getMe', function() {
    if (this.userId) {
        return Users.find({ _id: this.userId });
    } else {
        this.ready();
    }
});

Meteor.publish('usersList', function() {
  return Users.find({});
});

Meteor.publish('getUser', function(_id) {
  check(_id, String);
  return Users.find({'_id': _id});
});
