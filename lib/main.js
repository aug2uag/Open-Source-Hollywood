var StripePublicKey = 'pk_test_Dgvlv9PBf6RuZJMPkqCp00wg';
var StripeServerKey = 'sk_test_ZINoK7ZfA5Axdr06AewQzZuh';
var AWS = require('aws-sdk');
var s3 = new AWS.S3({accessKeyId: 'AKIAJPOLFUWAXQYOBVQQ', secretAccessKey: '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', region: 'us-east-1', params: {Bucket: 'producehour/headshots', Key: 'bdPxm5qOGkODp73bIx7RJbHlHDfX3UDbA7DEcl6i'}});
var uuid = require('uuid');
var fs = require('fs');
var base64Img = require('base64-img');
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
    for (var key in options) {
      if (key === 'avatar' && options[key].data) {
        var datum = options[key].data;
        delete options[key];
        var d = new Date().getTime();
        var _d = uuid();
        var __d = d.toString().substr(0,8) + _d.substr(0,4);
        base64Img.img(datum, '', __d, Meteor.bindEnvironment(function(err, filepath) {
          s3.upload({
            Body: fs.createReadStream(filepath),
            ACL: 'public-read',
            Key: __d,
          }, Meteor.bindEnvironment(function(err) {
            if (err) console.log(err);
            var __x = 'https://s3-us-west-2.amazonaws.com/producehour/headshots/' + __d;
            Meteor.users.update({_id: Meteor.user()._id}, {$set: {'avatar': __x}});
            fs.unlink(filepath);
          }, function() {
            console.log('failed to bind environment')
          }));
        }, function() {
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
      if (options.iam && options.iam.length > 0) {
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
    var ownerId = Meteor.user()._id,
        _true = true,
        slug = ownerId.substr(ownerId.length - 4) + new Date().getTime(),
        _user = {
          userId: ownerId,
          isAdmin: _true
        },
        ownerName = Meteor.user().firstName + ' ' + Meteor.user().lastName,
        ownerAvatar = Meteor.user().avatar,
        createTimeActual = new Date(),
        createdAt = moment().format('MMMM D, YYYY'),
        emptyArr = [],
        zero = 0,
        duration = 27,
        _false = false,
        permission = 'public',
        members = [_user];

    if (Meteor.isServer) {
      if (Meteor.user().iam.length === 0) {
        if (Meteor.isClient) {
          bootbox.alert('you must update your profile before creating a project.');
        };
        return;
      };

      var filesAgg = [];
      var d = new Date().getTime();
      for (var i = 0; i < options.files.length; i++) {
        var _d = uuid();
        var __d = d.toString().substr(0,8) + _d.substr(0,4);
        filesAgg.push(__d);
      };

      options.files.forEach(function(f, idx) {
        var named = filesAgg[idx];
        base64Img.img(f.data, '', named, Meteor.bindEnvironment(function(err, filepath) {
          s3.upload({
            Body: fs.createReadStream(filepath),
            ACL: 'public-read',
            Key: named,
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
      });



      var project = Projects.insert({
        slug: slug,
        title: options.title,
        logline: options.logline,
        videoURL: options.videoURL,
        details: options.details,
        city: options.city,
        state: options.state,
        genres: options.genres,
        gifts: options.gifts,
        needs: options.needs,
        budget: options.budget,
        duration: duration,
        purpose: options.purpose,
        // locally set vars
        ownerId: ownerId,
        ownerName: ownerName,
        ownerAvatar: ownerAvatar,
        createdAt: createdAt,
        createTimeActual: createTimeActual,
        isApproved: _true,
        archived: _false,
        count: zero, 
        funded: zero,
        applied: zero,
        approved: zero,
        upvotedUsers: emptyArr,
        downvotedUsers: emptyArr,
        usersApplied: emptyArr,
        usersApproved: emptyArr,
        receipt: options.receipt,
        selectedSegment: options.selectedSegment,
        files: filesAgg,
        creators: options.creators,
        story: options.story,
        history: options.history,
        plans: options.plans,
        needsExplained: options.needsExplained,
        significance: options.significance
      });

      Receipts.insert({
        projectId: project,
        userId: ownerId,
        projTitle: options.title,
        projAccepted: true,
        amount: 10,
        forProjectCreate: true,
        forProjectApply: false,
        outstandingBalance: options.processingFee,
        receipt: options.receipt,
        created: new Date()
      });
      
      Boards.insert({
          title: options.title,
          slug: slug,
          permission : permission,
          members: members,
          archived: _false,
          createdAt: createdAt,
          createdBy: ownerId,
          purpose: options.purpose,
          needs: options.needs
      });
    }  

    if (Meteor.isClient) {
      bootbox.alert("Project created! Check your Dashboard for information about applicants, and to share your project with the world.");
      Router.go('Projects');
    }
  },
  editProject: function (options) {
    check(options, Object);
    var project = Projects.findOne({slug: options.slug});
    if (project.ownerId !== Meteor.user()._id) {
      // Make sure only the owner can edit it
      throw new Meteor.Error("not-authorized");
    }
    else {

      Projects.update({slug: options.slug}, {$set: options});
      if (Meteor.isClient) {
        Router.go('Projects');
        bootbox.alert("Project updated!");
      }
    }
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
  // charge user
  addUserToProject: function(contribution, processedFee, slug, description, title, professionalOffer, angel) {
    check(contribution, Number);
    check(processedFee, Number);
    check(slug, String);
    check(description, String);
    check(title, String);
    check(professionalOffer, Boolean);
    check(angel, Boolean);

    var thisUser = Meteor.user()._id;
    var project = Projects.findOne({slug: slug});
    if (project.ownerId === thisUser) {
      if (Meteor.isClient) bootbox.alert("You're the owner of the project!");
      return;
    };

    var falsy = false;
    project.usersApplied.forEach(function(u) {
      if (u.id === thisUser) {
        falsy = true;
        return;
      };
    });
    if (falsy && !angel) {
      if (Meteor.isClient) bootbox.alert("You've already applied!");
      return;
    };

    // check if user in rejected list
    falsy = false;
    project.usersRejected = project.usersRejected || [];
    project.usersRejected.forEach(function(u) {
      if (u === thisUser) {
        falsy = true;
        return;
      };
    });
    if (falsy && !angel) {
      if (Meteor.isClient) bootbox.alert("Haven't you already applied to this project??");
      return;
    };
    var _receipt;
    // charge card and apply
    if (Meteor.isClient) {
      StripeCheckout.open({
        key: StripePublicKey,
        amount: processedFee * 100,
        currency: 'usd',
        name: 'Apply to ' + title,
        description: description,
        panelLabel: 'Pay Now',
        token: function(receipt) {
          // Do something with res.id
          // Store it in Mongo and/or create a charge on the server-side
          thisUser = {id: thisUser, contribution: contribution, receipt: receipt, communications: [], professional: professionalOffer, angel: angel};
          Projects.update({_id: project._id}, { $push: { usersApplied: thisUser }, $inc: {applied: 1, funded: contribution}});              
          // create Receipt and add to user
          Receipts.insert({
            projectId: project._id,
            userId: Meteor.user()._id,
            projTitle: project.title,
            amount: processedFee,
            forProjectCreate: false,
            forProjectApply: true,
            created: new Date(),
            receipt: receipt,
            professional: professionalOffer,
            angel: angel
          });
          var msg = '';
          if (angel) {
            msg += 'Your support was added to the project.';
            msg += 'Check back in for updates of this campaign.';
          } else {
            if (professionalOffer) {
              msg += 'Your offer was sent for approval. ';
            } else {
              msg += 'Project applied! ';
            }
            msg += 'Check back in for updates to your status.';
          }
          bootbox.alert(msg);
        }
      });
    };
  },
  supportProjectForGift: function(contribution, processedFee, slug, description, title, gift) {
    check(contribution, Number);
    check(processedFee, Number);
    check(slug, String);
    check(description, String);
    check(title, String);
    check(professionalOffer, Boolean);
    check(angel, Boolean);

    var thisUser = Meteor.user()._id;
    var project = Projects.findOne({slug: slug});
    if (project.ownerId === thisUser) {
      if (Meteor.isClient) bootbox.alert("You're the owner of the project!");
      return;
    };


    var _receipt;
    // charge card and apply
    if (Meteor.isClient) {
      StripeCheckout.open({
        key: StripePublicKey,
        amount: processedFee * 100,
        currency: 'usd',
        name: 'Apply to ' + title,
        description: description,
        panelLabel: 'Pay Now',
        token: function(receipt) {
          // Do something with res.id
          // Store it in Mongo and/or create a charge on the server-side
          thisUser = {id: thisUser, contribution: contribution, receipt: receipt, communications: [], gift: gift};
          Projects.update({_id: project._id}, { $push: { usersApplied: thisUser }, $inc: {applied: 1, funded: contribution}, $pull: { gifts: gift }});              
          // create Receipt and add to user
          Receipts.insert({
            projectId: project._id,
            userId: Meteor.user()._id,
            projTitle: project.title,
            amount: processedFee,
            forProjectCreate: false,
            forProjectApply: true,
            created: new Date(),
            receipt: receipt,
            professional: professionalOffer,
            angel: angel
          });
          var msg = 'Your support has been sent, and your gift will be processed.';
          bootbox.alert(msg);
        }
      });
    };
  },
  // update accept count of project
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
  // send refund to single project applicant
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
            StripeServerKey
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
  // close project
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
  },
  // refund users on expired projects
  projectsHousekeeping: function() {
    var projects = Projects.find({archived: false});
    projects.forEach(function(proj) {
      if (--proj.duration < 1) {
        Projects.update(proj._id, {$set: {archived: true}})
      } else {
        Projects.update(proj._id, {$set: {duration: proj.duration - 1}});
      };
    });
  }
}); 

