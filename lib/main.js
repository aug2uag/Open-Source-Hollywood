var StripePublicKey = 'pk_test_Dgvlv9PBf6RuZJMPkqCp00wg';
var StripeServerKey = 'sk_test_ZINoK7ZfA5Axdr06AewQzZuh';
var AWS = require('aws-sdk');
var s3 = new AWS.S3({accessKeyId: 'AKIAJPOLFUWAXQYOBVQQ', secretAccessKey: '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', region: 'us-east-1', params: {Bucket: 'producehour/headshots', Key: 'bdPxm5qOGkODp73bIx7RJbHlHDfX3UDbA7DEcl6i'}});
var uuid = require('uuid');
var fs = require('fs');
var base64Img = require('base64-img');

function myName() {
  return Meteor.user().firstName + ' ' + Meteor.user().lastName;
}

function uploadToS3(options) {
  console.log('to base64Img upload')
  base64Img.img(options.data, '', options.name, Meteor.bindEnvironment(function(err, filepath) {
    s3.upload({
      Body: fs.createReadStream(filepath),
      ACL: 'public-read',
      Key: options.name,
    }, Meteor.bindEnvironment(function(err) {
      if (err) console.log(err);
      // set modified object to user
      fs.unlink(filepath);
    }, function() {
      console.log('failed to bind environment')
    }));
  }, function() {
    console.log('failed to bind environment')
  }));
}

function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}

// var Receipts = new Mongo.Collection('receipts');
Date.prototype.getUnixTime = function() { return this.getTime()/1000|0 };
if (Meteor.isClient) {
  Meteor.startup(function () {
    //search
    Session.set('query', '');
    //pagination
    Session.set('iSkip', 0);
    Session.set('iLimit', 30);
    Session.set('pSkip', 0);
    Session.set('pLimit', 30);
    // portal tabs
    Session.set('register', false);
    Session.set('signin', true);
    Session.set('forgot', false);
  });
} /* isClient */

/* Meteor methods */
Meteor.methods({
  uploadSettingFiles: function(key, options) {
    check(options, Object);
    check(key, String);
    if (Meteor.isServer) {
      if (key === 'headshots') {
        var d = new Date().getTime();
        var _d = uuid();
        var __d = d.toString().substr(0,8) + _d.substr(0,4);
        base64Img.img(options.data, '', __d, Meteor.bindEnvironment(function(err, filepath) {
          s3.upload({
            Body: fs.createReadStream(filepath),
            ACL: 'public-read',
            Key: __d,
          }, Meteor.bindEnvironment(function(err) {
            if (err) console.log(err);
            // set modified object to user
            var o = {};
            o[key] = {};
            o[key].name = options.name;
            o[key].date = options.date;
            o[key].url = __d;
            o[key].size = options.size;
            o[key].type = options.type;
            o[key].tags = options.tags;
            o[key].description = options.description;
            Meteor.users.update({_id: Meteor.user()._id}, {$push: o});
            fs.unlink(filepath);
          }, function() {
            console.log('failed to bind environment')
          }));
        }, function() {
          console.log('failed to bind environment')
        }));
        return;
      };

      var k = {};
      k[key] = options;
      Meteor.users.update({_id: Meteor.user()._id}, {$push: k});
    };
  },
  upgradeProfile: function(options) {
    check(options, Object);
    console.log(options)
    for (var key in options) {
      if (key === 'avatar' && options[key].data) {
        var datum = options[key].data;
        delete options[key];
        var d = new Date().getTime();
        var _d = uuid();
        var __d = d.toString().substr(0,8) + _d.substr(0,4);
        console.log(1)
        base64Img.img(datum, '', __d, Meteor.bindEnvironment(function(err, filepath) {
          s3.upload({
            Body: fs.createReadStream(filepath),
            ACL: 'public-read',
            Key: __d,
          }, Meteor.bindEnvironment(function(err) {
            console.log(2)
            if (err) console.log(err);
            var __x = 'https://s3-us-west-2.amazonaws.com/producehour/headshots/' + __d;
            Meteor.users.update({_id: Meteor.user()._id}, {$set: {'avatar': __x}});
            fs.unlink(filepath);
          }, function() {
            console.log(2)
            console.log('failed to bind environment')
          }));
        }, function() {
          console.log(4)
          console.log('failed to bind environment')
        }));
      };
      if (typeof options[key] === 'object') {
        if (Object.keys(options[key]).length === 0) {
          delete options[key];
        };
      } else if (typeof options[key] === 'array') {
        if (options[key].length === 0) {
          delete options[key];
        };
      } else if (!options[key]) {
        delete options[key];
      }
    };

    if (Meteor.user().didSetProfile === true && Meteor.user().degenerateIAM === true) {
      if (options.iam && options.iam.length > 0) {
        options.degenerateIAM = false;
      } 
    };

    if (Meteor.user().didSetProfile === false) {
      if (options.primaryRole && options.iam && options.iam.length > 0) {
        options.didSetProfile = true;
        options.degenerateIAM = false;
      } else {
        options.didSetProfile = true;
        options.degenerateIAM = true;
      }
    };

    if (Object.keys(options).length > 0) {
      Meteor.users.update({_id: Meteor.user()._id}, {$set: options});
    };
    
    if (Meteor.isClient) {
      bootbox.alert('Your profile was updated', function() {
        Router.go('Home');
      });
    };
  },
  updateList: function(listName, humanReadable, object) {
    check(listName, String);
    check(humanReadable, String);
    check(object, Object);

    var q = {};
    q[listName] = object;
    Meteor.users.update({_id: Meteor.user()._id}, {$push: q});
    if (Meteor.isClient) bootbox.alert(humanReadable + ' has been changed.');
  },
  removeFromList: function(listName, humanReadable, key, val) {
    check(listName, String);
    check(humanReadable, String);
    check(key, String);
    check(val, String);
    var q = {};
    q[listName] = {};
    q[listName][key] = val;
    console.log(q);
    Meteor.users.update({_id: Meteor.user()._id}, {$pull: q});
    if (Meteor.isClient) bootbox.alert(humanReadable + ' has been changed.');
  },
  // should add project receipt to be paid when project goes live
  addProject: function (options) {
    check(options, Object);
    if (Meteor.isServer) {
      var ownerId = Meteor.user()._id,
        slug = ownerId.substr(ownerId.length - 4) + new Date().getTime(),
        _user = {
          userId: ownerId,
          isAdmin: true
        },
        permission = 'public',
        members = [_user];

      options.ownerId = ownerId;
      options.ownerName = Meteor.user().firstName + ' ' + Meteor.user().lastName;
      options.ownerAvatar = Meteor.user().avatar;
      options.createdAt = moment().format('MMMM D, YYYY');
      options.createTimeActual = new Date();
      options.isApproved = true;
      options.archived = false;
      options.count = 0;
      options.funded = 0;
      options.applied = 0;
      options.approved = 0;
      options.upvotedUsers = [];
      options.downvotedUsers = [];
      options.usersApplied = [];
      options.usersApproved = [];
      options.slug = slug;

      // upload avatar and gift files
      if (options._banner) {
        var fn = guid() + new Date().getTime();
        uploadToS3({
          name: fn,
          data: options._banner
        });
        options.banner = 'https://s3-us-west-2.amazonaws.com/producehour/headshots/' + fn;
        delete options['_banner'];
      };
      options.gifts = [];
      options._gifts.forEach(function(obj) {
        if (obj.data) {
          var fn = guid() + new Date().getTime();
          uploadToS3({
            name: fn,
            data: obj.data
          });
          obj.url = 'https://s3-us-west-2.amazonaws.com/producehour/headshots/' + fn;
          delete obj['data'];
          options.gifts.push(obj);
        } else if (obj.url) {
          options.gifts.push(obj);
        }
      })

      var project = Projects.insert(options);
      Receipts.insert({
        projectId: project,
        userId: ownerId,
        title: options.title,
        projAccepted: true,
        amount: 0,
        purpose: 'create',
        forProjectCreate: true,
        forProjectApply: false,
        created: new Date()
      });
      
      Boards.insert({
          title: options.title,
          slug: slug,
          permission : permission,
          members: members,
          archived: false,
          createdAt: new Date(),
          createdBy: ownerId,
          purpose: options.purpose,
          needs: options.needs
      });

      var stripe = require("stripe")(
        'sk_test_ZINoK7ZfA5Axdr06AewQzZuh'
      );
      stripe.accounts.create({
        country: 'US',
        managed: true
      }, Meteor.bindEnvironment(function(err, account) {
        if (err) console.log(err);
        Projects.update({_id: project}, {$set: { account: account } });
      }));
    };

    if (Meteor.isClient) {
      bootbox.alert("Project created! Check your Dashboard for information about applicants, and to share your project with the world.");
      Router.go('Projects');
    } 
  },
  editProject: function (options) {
    check(options, Object);
    if (Meteor.isServer) {
      if (options._banner) {
        var fn = guid() + new Date().getTime();
        uploadToS3({
          name: fn,
          data: options._banner
        });
        options.banner = 'https://s3-us-west-2.amazonaws.com/producehour/headshots/' + fn;
        delete options['_banner'];
      };
      var gifts = [];
      options.gifts = options.gifts || [];
      options.gifts.forEach(function(obj) {
        if (obj.data) {
          var fn = guid() + new Date().getTime();
          uploadToS3({
            name: fn,
            data: obj.data
          });
          obj.url = 'https://s3-us-west-2.amazonaws.com/producehour/headshots/' + fn;
          delete obj['data'];
          gifts.push(obj);
        } else if (obj.url) {
          gifts.push(obj);
        }
      });
      options.gifts = gifts;
      Projects.update({slug: options.slug}, {$set: options});
    };
  },
  // should refund all users applied
  deleteProject: function (slug) {
    check(slug, String);
    var project = Projects.findOne({slug: slug});
    if (project.ownerId !== Meteor.user()._id) {
      // Make sure only the owner can delete it
      throw new Meteor.Error("not-authorized");
    }
    else {
      // Async task (same in all examples in this chapter)
      function async(userApplied, callback) {

        // refund userApplied
        var _receipt = Receipts.findOne({
          userId: userApplied.id,
          projectId: project._id
        });
        if (!_receipt || !_receipt.receipt) {
          if (Meteor.isServer) {
            // create refund Receipt object, add to user
            Receipts.update({
              userId: userApplied.id,
              projectId: project._id
            }, {$set: {
              error: true
            }});
          };
          return callback();
        };
        var cardId = _receipt.receipt.id;
        var returnAmount = userApplied.contribution;
        var reasonRefund = 'Refund of $' + parseInt(returnAmount).toFixed(2) + ' because project "' + project.title + '" did cancel.';
        var returnObj = {
          charge: cardId,
          amount: returnAmount * 95,
          currency: 'usd',
          reason: reasonRefund,
          metadata: {
            projectId: project._id,
            projectOwner: project.ownerId,
            userId: userApplied.id
          }
        }

        if (Meteor.isServer) {
          var stripe = require("stripe")(
            StripeServerKey
          );

          stripe.refunds.create(returnObj, Meteor.bindEnvironment(function(err, refundObj) {
            if (Meteor.isServer) {
              // create refund Receipt object, add to user
              Receipts.update({
                userId: userApplied.id,
                projectId: project._id
              }, {$set: {
                refundAmount: returnAmount,
                refunded: true,
                receipt: refundObj
              }});
            };
            callback();
          }));
        };
      }
      
      function final() { 
        if (Meteor.isServer) {
          Projects.update({slug: slug}, {$set:{archived:true}});
          Boards.update({slug: slug}, {$set:{archived:true}});
          Receipts.update({
            projectId: project._id
          }, {$set: {
            projStarted: false,
            projFinished: false
          }})
        };
        if (Meteor.isClient){
          Router.go('Projects');
          bootbox.alert("Project deleted!");
        }
      }

      // A simple async series:
      var items = project.usersApplied;
      items = items.concat(project.usersApproved);
      function series(item) {
        if(item) {
          async( item, function() {
            return series(items.shift());
          });
        } else {
          return final();
        }
      }
      if (!items || items.length === 0) {
        final();
      } else {
        series(items.shift());
      }
    }
  }, 
  startProject: function (slug) {
    check(slug, String);
    var project = Projects.findOne({slug: slug});
    if (project.ownerId !== Meteor.user()._id) {
      // Make sure only the owner can delete it
      throw new Meteor.Error("not-authorized");
    } else {
      // refund each userApplied
      function async(userApplied, callback) {
        var cardId = userApplied.receipt.id;
        var returnAmount = userApplied.contribution;
        var reasonRefund = 'Refund of $' + parseInt(userApplied.contribution).toFixed(2) + ' because project "' + project.title + '" did start, and you were not selected.';
        var returnObj = {
          charge: cardId,
          amount: returnAmount * 100,
          currency: 'usd',
          reason: reasonRefund,
          metadata: {
            projectId: project._id,
            projectOwner: project.ownerId,
            userId: userApplied.id
          }
        }
        if (Meteor.isServer) {
          var stripe = require("stripe")(
            StripeServerKey
          );

          stripe.refunds.create(returnObj, Meteor.bindEnvironment(function(err, refundObj) {
            if (Meteor.isServer) {
              // create refund Receipt object, add to user
              Receipts.update({
                userId: userApplied.id,
                projectId: project._id
              }, {$set: {
                refundAmount: returnAmount,
                refunded: true,
                receipt: refundObj
              }})
            };
            callback();
          }));
        };
      }
      
      function final() { 
        // transfer sum contributions of usersApproved to project receipt card
        var usersApproved = project.usersApproved;
        var sumContributions = 0;
        usersApproved.forEach(function(u) {
          sumContributions += parseInt(u.contribution);

          // update Receipt object to project_accepted = true

        });
        // sum to cardId
        var cardId = project.receipt.card.id;
        var recipientId = project.receipt.id;
        var descriptor = 'The project "' + project.title + '" is now live, and you have been awarded the total amount of contributions promised to you by your approved project members that total to $' + parseInt(sumContributions).toFixed(2);

        if (Meteor.isServer) {
          var stripe = require("stripe")(
            StripeServerKey
          );

          var transferObject = {
            amount: sumContributions * 95,
            currency: "usd",
            recipient: recipientId,
            card: cardId,
            statement_descriptor: descriptor
          }

          Receipts.update({
            userId: project.ownerId,
            projectId: project._id
          }, {$set: {
            projStarted: true,
            outstandingBalance: 0
          }})

          Receipts.update({
            projectId: project._id
          }, {$set: {
            projStarted: true
          }})

          stripe.transfers.create(transferObject, Meteor.bindEnvironment(function(err, transfer) {
            // remove all users applied from the project, and transfer receipt
            Projects.update({_id: project._id}, {$set: {usersApplied: [], isLive: true, transferReceipt: transfer}});
          }));
        };

        if (Meteor.isClient) bootbox.alert('Project "' + project.title + '" is now in PRODUCTION phase!');
      };

      // A simple async series:
      var items = project.usersApplied;
      function series(item) {
        if(item) {
          async( item, function() {
            return series(items.shift());
          });
        } else {
          return final();
        }
      }
      if (!items || items.length === 0) {
        final();
      } else {
        series(items.shift());
      }

    }
  }, 
  addProjectComment: function(slug, parent, text) {
    var user = Meteor.user();
    if (user) {
      if (Meteor.isServer) {
        check(slug, String);
        check(parent, Number);
        check(text, String);
        Comments.insert({
          projectId: slug,
          parent: parent,
          text: text,
          ownerId: user._id,
          ownerName: user.services.auth0.name,
          ownerAvatar:user.services.auth0.picture,
          createdAt: moment().format("MMMM D, YYYY"),
          createTimeActual: moment().format()
        });
      } else {
        $('#comment-box').val('');
      }
    } else {
      bootbox.alert('You must be signed in to do that.');
    } 
  },
  addCommunicationsMessage: function(slug, _type, text, targetUser) {
    var user = Meteor.user();
    var project = Projects.findOne({slug: slug});
    check(slug, String);
    check(_type, String);
    check(text, String);
    check(targetUser, String);

    var obj = {
      text: text,
      createdAt: moment().format("MMMM D, YYYY"),
      ownerId: user._id,
      ownerName: user.services.auth0.name,
      ownerAvatar:user.services.auth0.picture,
      unread: true
    }
    var idMatch = project.ownerId === user._id ? targetUser : user._id;
    var _q, _p;
    if (_type === 'applied') {
      _q = 'usersApplied.id';
      _p = 'usersApplied.$.communications'
    } else {
      _q = 'usersApproved.id';
      _p = 'usersApproved.$.communications'
    };
    var query = {};
    query['slug'] = slug;
    query[_q] = idMatch;
    var update = {};
    update[_p] = obj;
    Projects.update(query, {$push: update})
  },
  upvoteProject: function (slug) {
    check(slug, String);
    var query = {slug: slug};
    var thisUser = Meteor.user()._id;
    if (!thisUser) {
      // Make sure logged out public can't upvote it
      throw new Meteor.Error("not-authorized");
    }
    else {
      if (!(Projects.findOne({slug: slug, upvotedUsers: thisUser}))) {
        Projects.update(query, { $inc: { count: 1 }});
        Projects.update(query, { $push: { upvotedUsers: thisUser }});

        if (Projects.findOne({slug: slug, downvotedUsers: thisUser})) {
          Projects.update(query, { $pull: { downvotedUsers: thisUser }});
        };
      }
    }
  },
  downvoteProject: function (slug) {
    check(slug, String);
    var query = {slug: slug};
    var thisUser = Meteor.user()._id;
    if (!thisUser) {
      // Make sure logged out public can't downvote it
      throw new Meteor.Error("not-authorized");
    }
    else {
      if (!(Projects.findOne({slug: slug, downvotedUsers: thisUser}))) {
        Projects.update(query, { $inc: { count: -1 }});
        Projects.update(query, { $push: { downvotedUsers: thisUser }});

        if (Projects.findOne({slug: slug, upvotedUsers: thisUser})) {
          Projects.update(query, { $pull: { upvotedUsers: thisUser }});
        };
      }
    }
  },
  subscribeEmail: function(email) {
    check(email, String);
    console.log(new Array(100).join('i '))
    console.log('subscribe email')
    console.log(email, '= email')
    if (Meteor.isServer) {
      Subscribers.insert({
        email: email,
        date: new Date()
      });
    };
  },
  /** DONATION */
  donateToProject: function(options, cb) {
    check(options, Object);
    if (options.amount<1) return 'donations need to be at least one dollar';
    if (Meteor.isServer) {
      options.user = {
        id: Meteor.user()._id,
        name: myName(),
        avatar: Meteor.user().avatar
      }
      var project = Projects.findOne({slug: options.slug});
      var stripe = require("stripe")(
        StripeServerKey
      );
      var future = new (Npm.require('fibers/future'))();
      stripe.charges.create({
        amount: Math.floor(options.amount * 100),
        currency: "usd",
        source: options.token.id,
        destination: {
          account: options.destination,
        },
      }, Meteor.bindEnvironment(function(err, charge) {
        if (charge) {
          delete options['token'];
          options.receipt = charge;
          options.created = new Date();
          var donations = project.donations || [];
          donations.push(options);
          var newTotal = project.funded + options.amount;
          // update project
          Projects.update({_id: project._id}, { $set: { donations: donations, funded: newTotal }});
          // create receipt
          Receipts.insert({
            projectId: project._id,
            userId: Meteor.user()._id,
            avatar: Meteor.user().avatar,
            title: project.title,
            amount: options.amount,
            purpose: 'donation',
            created: new Date(),
            receipt: charge
          });
          // create notification
          Notifications.insert({
            user: project.ownerId,
            from: Meteor.user()._id,
            name: myName(),
            avatar: Meteor.user().avatar,
            title: project.title,
            amount: parseFloat((options.amount*.95).toFixed(2)),
            message: myName() + ' donated $' + (options.amount*.95).toFixed(2),
            purpose: 'donation',
            created: new Date()
          });
          future.return('payment was processed, thank you for your donation !');
        } else {
          future.throw(new Meteor.Error("donation", "payment failed"));
        }
      }));
      return future.wait();
    };  
  },
  /** LEND OFFER ASSET */
  lendResource: function(options) {
    check(options, Object);
    if (Meteor.isServer) {
      var project = Projects.findOne({slug: options.slug});
      delete options['slug'];
      options.user = {
        id: Meteor.user()._id,
        name: myName(),
        avatar: Meteor.user().avatar
      }
      options.project = project._id;
      options.slug = project.slug;
      options.title = project.title;
      options.created = new Date();
      options.message = myName()+' offered to lend '+options.asset+' for project '+project.title;
      var offeredResources = project.offeredResources || [];
      var mappedStings = offeredResources.map(function(o){return o.user.id});
      // prevent duplicates
      /*if (mappedStings.indexOf(Meteor.user()._id)===-1)*/ offeredResources.push(options);
      // else return 'you have already offered one resource for this campaign, please remain patient and negotiate after you receive a response';
      // if (project.ownerId===Meteor.user()._id) return 'not allowed, this is your own campaign';
      Projects.update({_id: project._id}, { $set: { offeredResources: offeredResources }});
      Notifications.insert({
        user: project.ownerId,
        name: myName(),
        message: options.message,
        from: Meteor.user()._id,
        avatar: Meteor.user().avatar,
        title: project.title,
        projectSlug: project.slug,
        project: project.id,
        amount: options.amount*.95||'?',
        purpose: 'lend',
        created: new Date()
      });
    }
  },
  /** APPLY CREW & CAST */
  applyToProject: function(options, cb) {
    check(options, Object);
    console.log(options)
    if (options.type==='sourced') {
      // set date to object and sanitize
      var d = new Date();
      var defaultDate = d.setHours(d.getHours()+(24*45));
      if (!options.expires) {
        options.expires=defaultDate;
      } else {
        options.expires = new Date(options.expires);
        var _d = new Date();
        if (options.expires<_d) return cb('you selected an invalid expiration');
      }
    };
    var message;
    if (options.type==='sourced') {
      var expiresOn = new Date(options.expires).toLocaleDateString();
      message = 'this applicant is offering $'+options.pay+' that expires on '+expiresOn;
    } else {
      var message = 'this applicant is requesting ';
      if (options.pay) message+='$'+options.pay;
      if (options.pay&&options.equity) message+=' and ';
      if (options.equity) message+=options.equity+'%';
      message+=' to join your campaign'
    }
    options.message = message;
    var key=options.ctx==='crew'?'crewApplicants':'roleApplicants';
    if (Meteor.isServer) {
      var project = Projects.findOne({slug: options.slug});
      delete options['slug'];
      options.user = {
        id: Meteor.user()._id,
        name: myName(),
        avatar: Meteor.user().avatar
      }
      options.created = new Date();
      var mappedValues = project[key] || [];
      var mappedStings = mappedValues.map(function(o){return o.user.id});
      // prevent duplicates
      var updateObj = {$set:{}};
      // if (mappedStings.indexOf(Meteor.user()._id)===-1) mappedValues.push(options);
      mappedValues.push(options);
      updateObj['$set'][key] = mappedValues;
      // else return 'you have already applied for '+options.ctx+' to this campaign, please remain patient and offer after you receive a response';
      // project owner cannot act
      // if (project.ownerId===Meteor.user()._id) return 'not allowed, this is your own campaign';
      function saveToProject() {
        Projects.update({_id: project._id}, updateObj);
        Notifications.insert({
          user: project.ownerId,
          from: Meteor.user()._id,
          name: myName(),
          message: message,
          avatar: Meteor.user().avatar,
          title: project.title,
          pay: options.pay,
          equity: options.equity,
          type: options.type,
          purpose: 'apply',
          appliedFor: options.appliedFor,
          created: new Date()
        });
      }
      console.log(options)
      console.log('\n-- -- --\n')
      var successMessage = 'you have successfully applied for ' + options.appliedFor;
      if (options.type==='hired'||!options.pay) {
        saveToProject();
        Offers.insert(options);
        console.log('applied for hire')
        return successMessage;
      } else {
        console.log('apply for donation')
        var stripe = require("stripe")(
          StripeServerKey
        );
        var future = new (Npm.require('fibers/future'))();
        console.log(new Array(100).join('&'))
        stripe.charges.create({
          amount: Math.floor(options.pay * 100),
          currency: "usd",
          source: options.token.id,
          destination: {
            account: options.destination,
          },
        }, Meteor.bindEnvironment(function(err, charge) {
          if (charge) {
            delete options['token'];
            options.receipt = charge;
            var newTotal = project.funded + options.amount;
            // update project
            saveToProject();
            // create offer
            Offers.insert(options);
            // create receipt
            Receipts.insert({
              projectId: project._id,
              userId: Meteor.user()._id,
              avatar: Meteor.user().avatar,
              title: project.title,
              amount: options.amount,
              purpose: 'apply',
              created: new Date(),
              receipt: charge
            });
            future.return(successMessage);
          } else {
            future.throw(new Meteor.Error("apply", "payment failed"));
          }
        }));
        return future.wait();
      }
    }
  },
  /** BUY GIFT */
  purchaseGift: function(options, cb) {
    check(options, Object);
    if (Meteor.isServer) {
      var project = Projects.findOne({slug: options.slug});
      var stripe = require("stripe")(
        StripeServerKey
      );
      var future = new (Npm.require('fibers/future'))();
      stripe.charges.create({
        amount: Math.floor(options.amount * 100),
        currency: "usd",
        source: options.token.id,
        destination: {
          account: options.destination,
        },
      }, Meteor.bindEnvironment(function(err, charge) {
        if (charge) {
          options.user = {
            id: Meteor.user()._id,
            name: Meteor.user().firstName + ' ' + Meteor.user().lastName,
            avatar: Meteor.user().avatar
          }
          options.created = new Date();
          delete options['token'];
          options.receipt = charge;
          var giftPurchases = project.giftPurchases || [];
          giftPurchases.push(options);
          var newTotal = project.funded + options.amount;
          var gifts = project.gifts || [];
          var _gifts = [];
          for (var i = gifts.length - 1; i >= 0; i--) {
            var g = gifts[i];
            if (g.name===options.gift.name&&g.description===options.gift.description&&g.msrp===options.gift.msrp&&g.url===options.gift.url) {
              g.quantity-=1;
            };
            _gifts.push(g);
          };

          var soldGifts = project.soldGifts || [];
          soldGifts.push({
            user: {
              name: Meteor.user().firstName + ' ' + Meteor.user().lastName,
              id: Meteor.user()._id,
              avatar: Meteor.user().avatar
            }
          });
          // update project
          Projects.update({_id: project._id}, { $set: { soldGifts: soldGifts, giftPurchases: giftPurchases, gifts: _gifts, funded: newTotal }});
          // create receipt
          Receipts.insert({
            projectId: project._id,
            userId: Meteor.user()._id,
            avatar: Meteor.user().avatar,
            title: project.title,
            amount: options.amount,
            purpose: 'gift',
            created: new Date(),
            receipt: charge
          });
          // create notification
          Notifications.insert({
            user: project.ownerId,
            from: Meteor.user()._id,
            fromAvatar: Meteor.user().avatar,
            title: project.title,
            amount: options.amount*.95,
            purpose: 'gift',
            gift: {
              name: options.gift.name,
              description: options.gift.description,
              msrp: options.gift.msrp,
              reminingAtPurchase: options.gift.quantity
            },
            correspondence: {
              phone: options.phone,
              email: options.email
            },
            shipping: {
              address: options.address,
              city: options.city,
              state: options.state,
              zip: options.zip
            },
            created: new Date()
          });
          future.return('payment was processed, thank you for your purchase !');
        } else {
          future.throw(new Meteor.Error("donation", "payment failed"));
        }
      }));
      return future.wait();
    };  
  },

















  /** ACCEPT USER TO PROJECT */
  acceptUserToProject: function(userId, contribution, slug) {
    contribution = parseInt(contribution);
    check(contribution, Number);
    check(userId, String);
    check(slug, String);
    var project = Projects.findOne({slug: slug});
    var truthy = true;
    project.usersApproved = project.usersApproved || [];
    project.usersApproved.forEach(function(user) {
      if (user.id === thisUser) {
        truthy = false;
        return;
      };
    });
    if (truthy) {
      var thisUser = {id: userId, contribution: contribution, communications: []};
      var query = {slug: slug};
      Projects.update(query, { $push: { usersApproved: thisUser, contribution: contribution }, $pull: { 'usersApplied': {id: thisUser.id}}, $inc: {approved: 1} });
      Boards.update(query, { $push: { members: {
        "userId" : thisUser.id,
        "isAdmin" : false
      }}});
      Receipts.update({
        projectId: project._id,
        userId: userId}, {$set:{
          projAccepted: true
      }});
    }
  },
  /** REJECT USER FROM PROJECT */
  rejectUserFromProject: function(userId, slug) {
    check(userId, String);
    check(slug, String);
    var project = Projects.findOne({slug: slug});
    var truthy = true;
    project.usersRejected = project.usersRejected || [];
    project.usersApplied.forEach(function(u) {
      if (u.id === userId) {
        // refund account
        var cardId = u.receipt.id;
        var returnAmount = u.contribution;
        var reasonRefund = 'Refund of $' + parseInt(u.contribution).toFixed(2) + ' because project "' + project.title + '" did not select you.';
        var returnObj = {
          charge: cardId,
          amount: returnAmount * 100,
          currency: 'usd',
          reason: reasonRefund,
          metadata: {
            projectId: project._id,
            projectOwner: project.ownerId,
            userId: u.id
          }
        }

        if (Meteor.isServer) {

          var stripe = require("stripe")(
            testPublishableKey
          );
          stripe.refunds.create(returnObj, Meteor.bindEnvironment(function(err, refundObj) {
            Users.update({_id: userId}, {$push: {contributionRefunds: refundObj}, $push: {receiptsHistory: {
              project: {
                name: project.title,
                slug: project.slug,
                date: project.createdAt
              },
              offer: u.contribution,
              receipt1: u.receipt,
              receipt2: refundObj,
              type: 'refund'
            }}});
            Receipts.update({
              projectId: project._id,
              userId: userId
            }, {$set:{
                refunded: true,
                receipt: refundObj
            }});
            Projects.update({slug: slug}, { $push: { usersRejected: {
                id: u.id,
                receipt: u.receipt
                  } }, 
                $pull: { usersApplied: { id: u.id }} 
            });
          }));
        };
      };
    });
  },
  /** FINISH PROJECT */
  closeProject: function(slug) {
    check(slug, String);
    if (Meteor.isServer) {
      var project = Projects.findOne({slug: slug});
      // TODO, update influence scores
      var board = Boards.findOne({slug: slug});
      Projects.update({slug: slug}, { archived: true });
      Boards.update({slug: slug}, {archived: true});
      Cards.update({boardId: board._id}, {archived: true});
      Receipts.update({
        projectId: project._id
      }, {$set: {
        projFinished: true
      }})
    };
    if (Meteor.isClient) {
      bootbox.confirm('The project is history.', function() {
        Router.go('Home');
      });
    };
  }
}); 

