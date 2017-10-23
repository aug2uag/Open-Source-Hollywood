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

function createNotification(options) {
  /**
    NEEDS:
  user, message, title, slug, purpose
    */
  Notifications.insert({
    user: options.user,
    name: myName(),
    message: options.message,
    from: Meteor.user()._id,
    avatar: Meteor.user().avatar,
    title: options.title,
    slug: options.slug,
    purpose: options.purpose,
    created: new Date()
  });
}

function createReceipt(options) {
  /**
    NEEDS:
  title, slug, amount, purpose, receipt
    */
  Receipts.insert({
    user: Meteor.user()._id,
    avatar: Meteor.user().avatar,
    name: myName(),
    title: options.title,
    slug: options.slug,
    amount: options.amount,
    purpose: options.purpose,
    created: new Date(),
    receipt: options.receipt
  });
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
            console.log('in upgradeProfile 1')
            console.log('failed to bind environment')
          }));
        }, function() {
          console.log('in upgradeProfile 2')
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
      options.created = new Date();
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

      createNotification({
        user:project.ownerId,
        message: 'You created a new campaign.',
        title: project.title,
        slug: project.slug,
        purpose: 'new campaign'
      });

      var stripe = require("stripe")(
        StripeServerKey
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
  /** SPLASH PAGE SUBSCRIBE EMAIL */
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
          // title, slug, amount, purpose, receipt
          createReceipt({
            title: project.title,
            slug: project.slug,
            amount: options.amount,
            purpose: 'donation',
            receipt: charge
          });

          // create notification
          createNotification({
            user:project.ownerId,
            message:myName() + ' donated $' + (options.amount*.95).toFixed(2),
            title: project.title,
            slug: project.slug,
            purpose: 'donation'
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
      options.message = myName()+' offered to lend '+options.asset+' for '+project.title.toUpperCase();
      var offeredResources = project.offeredResources || [];
      var mappedStings = offeredResources.map(function(o){return o.user.id});
      // prevent duplicates
      /*if (mappedStings.indexOf(Meteor.user()._id)===-1)*/ offeredResources.push(options);
      // else return 'you have already offered one resource for this campaign, please remain patient and negotiate after you receive a response';
      // if (project.ownerId===Meteor.user()._id) return 'not allowed, this is your own campaign';
      Projects.update({_id: project._id}, { $set: { offeredResources: offeredResources }});
      // user, message, title, slug, purpose
      createNotification({
        user:project.ownerId,
        message:options.message,
        title: project.title,
        slug: project.slug,
        purpose: 'lend'
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
        // user, message, title, slug, purpose
        createNotification({
          user:project.ownerId,
          message:message,
          title: project.title,
          slug: project.slug,
          purpose: 'apply'
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
            createReceipt({
              title: project.title,
              slug: project.slug,
              amount: options.amount,
              purpose: 'apply',
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
          createReceipt({
            title: project.title,
            slug: project.slug,
            amount: options.amount,
            purpose: 'gift purchase',
            receipt: charge
          });
          // create notification
          createNotification({
            user:project.ownerId,
            message: myName()+' purchased '+options.gift.name+' for $'+options.amount.toFixed(2),
            title: project.title,
            slug: project.slug,
            purpose: 'gift purchase'
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
  acceptUserToProject: function(options) {
    check(options, Object);
    if (Meteor.isServer) {
      console.log('aaaaaaargh')
      var key=options.ctx==='crew'?'crewApplicants':'roleApplicants';
      var project = Projects.findOne({slug: options.slug});
      delete options['slug'];
      var acceptedUsers = project.acceptedUsers || [];
      var equityAllocated = project.equityAllocated || 0;
      var funded = project.funded || 0;
      var applicants = project[key];
      var message = options.user.name + ' was approved for ';
      if (options.type==='hired') {
        if (options.pay) {
          message+='$'+options.pay+' ';
        };
        if (options.pay&&options.equity) message+='and ';
        if (options.equity) {
          message+=options.equity+'% equity';
          equityAllocated+=options.equity;
        }
      } else {
        message+='$'+options.pay+' that will be applied to ' + project.title;
        funded+=options.pay;
      }

      function finalUpdateHandler(idx) {
        /** TODO: automatically reject other users applying for the same role?? */
        // add user to project
        applicants.splice(i,1);
        var uid = options.user.id;
        if (acceptedUsers.indexOf(uid)===-1) acceptedUsers.push(uid);
        var updateObj = { acceptedUsers: acceptedUsers, equityAllocated: equityAllocated, funded: funded };
        updateObj[key] = applicants;
        Projects.update({_id: project._id}, { $set: updateObj });

        // create notification
        createNotification({
          user:options.user.id,
          message: message,
          title: project.title,
          slug: project.slug,
          purpose: 'approved'
        });
      }

      for (var i = 0; i < applicants.length; i++) {
        var el = applicants[i];
        if (Object.keys(options).length===Object.keys(el).length) {
          if (options.receipt&&el.receipt) {
            if (options.receipt.id===el.receipt.id) {
              console.log('222222222222222222222222222')
              return finalUpdateHandler(i);
            };
          } else {
            if (options.ctx===el.ctx&&options.type===el.type&&options.pay===el.pay&&options.equity===el.equity&&options.appliedFor===el.appliedFor&&options.created.toString()===el.created.toString()) {
              console.log('11111111111111111111111111111111')
              return finalUpdateHandler(i);
            };
          };
        };
      };
    };
  },
  /** REJECT USER FROM PROJECT */
  rejectUserFromProject: function(options) {
    check(options, Object);
    console.log(options)
    var message;
    if (Meteor.isServer) {
      var key=options.ctx==='crew'?'crewApplicants':'roleApplicants';
      var project = Projects.findOne({slug: options.slug});
      delete options['slug'];
      var applicants = project[key];
      function finalUpdateHandler(idx) {
        /** TODO: automatically reject other users applying for the same role?? */
        // add user to project
        applicants.splice(i,1);
        var updateObj = { };
        updateObj[key] = applicants;
        Projects.update({_id: project._id}, { $set: updateObj });

        // create notification
        // user, message, title, slug, purpose
        createNotification({
          user:options.user.id,
          message:message,
          title: project.title,
          slug: project.slug,
          purpose: 'declined'
        });
      }
      for (var i = 0; i < applicants.length; i++) {
        var el = applicants[i];
        if (Object.keys(options).length===Object.keys(el).length) {
          if (options.receipt&&el.receipt) {
            if (options.receipt.id===el.receipt.id) {
              console.log('222222222222222222222222222')
              message = 'Your application for '+project.title.toUpperCase()+' '+options.appliedFor+' was declined and you were refunded $'+options.pay+'.';
              var stripe = require("stripe")(
                StripeServerKey
              );
              stripe.refunds.create({
                charge: options.receipt.id,
              }, Meteor.bindEnvironment(function(err, receipt) {
                if (err) console.log(err);
                createReceipt({
                  title: project.title,
                  slug: project.slug,
                  amount: options.pay,
                  purpose: 'declined refund',
                  receipt: receipt
                });
              }));
              return finalUpdateHandler(i);
            };
          } else {
            if (options.ctx===el.ctx&&options.type===el.type&&options.pay===el.pay&&options.equity===el.equity&&options.appliedFor===el.appliedFor&&options.created.toString()===el.created.toString()) {
              console.log('11111111111111111111111111111111')
              message='Your application for '+project.title+' was declined.'
              return finalUpdateHandler(i);
            };
          };
        };
      };
    };
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
      bootbox.confirm('This campaign is history.', function() {
        Router.go('Home');
      });
    };
  }
}); 

