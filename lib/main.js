/** 
  * STRIPE TEST
  * pk_test_imJVPoEtdZBiWYKJCeMZMt5A
  * sk_test_NV3x8Jk24lPX5ToEccddXGLq
  */
var StripePublicKey = 'pk_test_imJVPoEtdZBiWYKJCeMZMt5A'//'pk_live_GZZIrMTVcHHwJDUni09o09sq';
var StripeServerKey = 'sk_test_NV3x8Jk24lPX5ToEccddXGLq'//'sk_live_Wc9rRa8LbtyVkV6XVm7vAAAu';
var AWS = require('aws-sdk');
var s3 = new AWS.S3({accessKeyId: 'AKIAJPOLFUWAXQYOBVQQ', secretAccessKey: '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', region: 'us-east-1', params: {Bucket: 'producehour/headshots', Key: 'bdPxm5qOGkODp73bIx7RJbHlHDfX3UDbA7DEcl6i'}});
var SES = new AWS.SES({ accessKeyId: "AKIAJPOLFUWAXQYOBVQQ", secretAccessKey: "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", region: "us-east-1" });
var uuid = require('uuid');
var fs = require('fs');
var base64Img = require('base64-img');
var request = require( 'request' );
var prettyHtml = require('json-pretty-html').default;
var BASE_URL = 'https://opensourcehollywood.org/';


function DEBUG(char, num) {
  console.log(new Array(num).join(char))
}

function markOffersPendingOff(offers) {
  var offerids = offers.map(function(o) { 
    if (o._id) {
      return o._id 
    };
    var keys = Object.keys(o)
    return o[keys[0]]._id
  })

  Offers.update({
    _id: {
      $in: offerids
    }
  }, {$set: {pending: false}})
}

function deleteRejectedOffers(offers) {
  console.log('in deleteRejectedOffers')
  var offerids = offers.map(function(o) { 
    if (o._id) {
      return o._id 
    };
    var keys = Object.keys(o)
    return o[keys[0]]._id
  })

  console.log(offerids)

  Offers.remove({
    _id: {
      $in: offerids
    }
  })
}

function projectGiftsToProducts(project) {
    var stripe = require("stripe")(
      StripeServerKey
    );
    var gifts = []

    var project = Projects.findOne({_id:project})

    // console.log(new Array(1000).join('i'))
    // console.log(project)

    function formatAndSaveProjectProduct(o) {
      o.owner = Meteor.user()._id
      o.productType = 'gift'
      o.projectSlug = project.slug

      var product = Products.insert(o)

      return o._id
    }

    function finalProjectGiftHandler() {
      // var _gifts = gifts.map(formatAndSaveProjectProduct)
      // Projects.update({_id: project._id}, {$set:{gifts:_gifts}})
      Projects.update({ _id: project._id }, { $set:{ gifts: gifts }})
    }

    if (!project.gifts.length) return

    project.gifts.forEach(function(obj) {

      if (typeof obj === 'string') return

      if (obj.product) {
        gifts.push(obj)
        if (gifts.length===project.gifts.length) {
          return finalProjectGiftHandler()
        };
      };

      stripe.products.create({
        name: obj.name,
        type: 'service',
        metadata: {
          user: Meteor.user()._id,
          project: project._id
        }
      }, Meteor.bindEnvironment(function(err, product) {
        if (product) {
          obj.product = product
        }

        gifts.push(obj)
        if (gifts.length===project.gifts.length) {
          return finalProjectGiftHandler()
        };
      }));
    });
}

function userGiftsToProducts() {
    var stripe = require("stripe")(
      StripeServerKey
    );

    var user = Meteor.user()
    var gifts = []
    var assets = []

    function formatAndSaveUserProduct(o, isGift) {
      if (isGift) {
        o.productType = 'gift'
      } else {
        o.productType = 'asset'
      }

      o.owner = Meteor.user()._id


      var product = Products.insert(o)

      return o._id
    }

    function finalUserGiftsHandler() {
      // var _gifts = gifts.map(function(g) {
      //   return formatAndSaveUserProduct(g, true)
      // })

      // var _assets = assets.map(formatAndSaveUserProduct)

      // Users.update({_id: user._id}, {$set:{gifts: _gifts, assets: _assets}})

      Users.update({_id: user._id}, {$set:{gifts: gifts, assets: assets}})
    }

    function assetsUsersHandler() {
      if (!user.assets.length) {
        return finalUserGiftsHandler()
      }
      
      user.assets.forEach(function(obj) {

        if (obj.product) {
          assets.push(obj)
          if (assets.length === user.assets.length) {
            return finalUserGiftsHandler()
          };
          return
        };

        stripe.products.create({
          name: obj.name,
          type: 'service',
          metadata: {
            user: user._id,
            type: 'asset'
          }
        }, Meteor.bindEnvironment(function(err, product) {
          if (product) {
            obj.product = product
          }

          assets.push(obj)
          if (assets.length === user.assets.length) {
            return finalUserGiftsHandler()
          };

        }));
      });
    }
 

    if (!user.gifts.length) {
      return assetsUsersHandler()
    } else {
      user.gifts.forEach(function(obj) {

        if (typeof obj === 'string') return

        if (obj.product) {
          gifts.push(obj)
          if (gifts.length === user.gifts.length) {
            return assetsUsersHandler()
          };
          return
        };

        stripe.products.create({
          name: obj.name,
          type: 'service',
          metadata: {
            user: user._id,
            type: 'gift'
          }
        }, Meteor.bindEnvironment(function(err, product) {
          if (product) {
            obj.product = product
          }

          gifts.push(obj)
          if (gifts.length === user.gifts.length) {
            return assetsUsersHandler()
          };

        }));
      })
    }
}

function rejectedOffers(offers) {
  var stripe = require("stripe")(
    StripeServerKey
  );
  console.log('in deleteRejectedOffers')
  var offerids = offers.map(function(o) { 
    if (o._id) {
      return o._id 
    };
    var keys = Object.keys(o)
    return o[keys[0]]._id
  })

  Offers.update({
    _id: {
      $in: offerids
    }
  }, {$set: {pending: false, rejected: true}})
}

function approveUserToProject(options) {

  if (Meteor.isClient) return;

  /**
    @function filterOffers
      - handles offers with object { decision: offer }
    */
  function filterOffers(o, forApprove) {
      // add approved offers to list of approved
      var keys = Object.keys(o)
      var decision = keys[0]
      var offer = o[decision]
      // accept is set in projectMessage.js
      if ((forApprove&&decision==='accept')||(!forApprove&&decision!=='accept')) {
        // if donation offer, add to amountApplied
        return offer
      } 
  }

  var applicantId = options.user._id
  var applicantName = options.user.firstName||'' + ' ' + options.user.lastName||''
  if (!applicantName.trim()) applicantName = 'applicant'

  var project = Projects.findOne({_id: options.project._id});

  // is the user the project author or applicant ???
  var isAuthor = project.ownerId===Meteor.user()._id ? true : false
  var negotiations = project.negotiations || [];
  var agreementsFinal = project.agreementsFinal || [];
  var usersApproved = project.usersApproved || [];
  var usersApplied = project.usersApplied || [];
  var crewApplicants = project.crewApplicants || [];
  var castApplicants = project.roleApplicants || [];
  var equityAllocated = project.equityAllocated || 0;
  var funded = project.funded || 0;
  var message = options.user.firstName + ' ' + options.user.lastName + ' was approved for a role in the campaign named ' + options.project.title + '. ';

  // list of approved roles
  var offers = [], declinedOffers = [], userUID = applicantId, slugID = project.slug;
  var priceToPay = 0
  var amountReceivable = 0
  var equityOut = 0
  var amountFunded = 0


  if (isAuthor) {
    offers = options.offers.filter(function(o) {
        return filterOffers(o, true)
    }).map(function(o) {
        return o.accept
    });

    if (!offers.length) return false;

    // price to pay / equity to distribute
    offers.forEach(function(offer) {
        var offer = offer.offer
        if (offer.type==='sourced'&&offer.pay>0) {
          amountFunded += offer.pay
        } else if (offer.pay>0) {
          priceToPay += offer.pay||0
        }
        equityOut += offer.equity||0
    })

    // refund declined offers if they have receipt
    declinedOffers = options.offers.filter(function(o) {
        return filterOffers(o, false)
    }).map(function(o) {
        return o.decline
    });

    // each declined function remove offer and refund where appropriate
    declinedOffers.forEach(function(o) {
        if (o&&o.receipt) {
            var receipt = o.receipt
            declinedUserRefund(receipt.id, project, o.pay, null, function() {
                rejectedOffers(declinedOffers)
            })
        }
    })
  } else {
    offers = options.offers
  }

  if (priceToPay&&priceToPay>0) {
      message += project.ownerName + ' agrees to pay ' + applicantName + ' ' + priceToPay + ' USD for their role. '
  }

  if (equityOut&&equityOut>0) {
      message += project.ownerName + ' agrees to pay ' + applicantName + ' ' + equityOut + ' shares in the ownership of the campaign. '
  }

  if (amountReceivable>0) {
      message += 'Applicant agrees to pay ' + amountReceivable + ' USD towards costs for their role.'
  }

  if (amountFunded>0) {
    message += applicantName + ' is recognized to have donated $' + amountFunded + ' towards production costs for this agreement. '
  };

  // create notification object
  createNotification({
      user:options.user._id,
      message: message,
      title: options.project.title,
      slug: options.project.slug,
      purpose: 'approved'
  })

  createNotification({
      user:Meteor.user()._id,
      message: message,
      title: options.project.title,
      slug: options.project.slug,
      purpose: 'approved'
  })

  // add to finalAgreements
  agreementsFinal.push({
      uid: options.user._id,
      roles: offers,
      message: message,
      priceToPay: priceToPay,
      amountReceivable: amountReceivable,
      equityOut: equityOut,
      amountFunded: amountFunded
  })

  // remove applicant from list of applicants
  for (var i = castApplicants.length - 1; i >= 0; i--) {
      var r = castApplicants[i]
      if (r.user.id===applicantId) castApplicants.splice(i, 1)
  }

  for (var i = crewApplicants.length - 1; i >= 0; i--) {
      var r = crewApplicants[i]
      if (r.user.id===applicantId) crewApplicants.splice(i, 1)
  }

  // update project
  if (usersApproved.indexOf(userUID)===-1) usersApproved.push(userUID)
  var updateObj = { 
      usersApplied: usersApplied, 
      usersApproved: usersApproved, 
      equityAllocated: equityAllocated + equityOut, 
      funded: funded + amountFunded,
      crewApplicants: crewApplicants,
      roleApplicants: castApplicants,
      agreementsFinal: agreementsFinal
  }

  Projects.update({_id: project._id}, { $set: updateObj })

  // update board
  var board = Boards.findOne({slug: project.slug})
  // if member not in board then add
  var boardMembers = board.members
  var notInBoard = true
  boardMembers.forEach(function(m) {
      if (m.userId===userUID) {
        notInBoard = false
        return
      }
  })

  if (notInBoard) {
      Boards.update({slug: project.slug}, { $push: { members: {
        "userId" : options.user._id,
        "isAdmin" : false
      }}})
  }

  // archive communications
  ProjectMessages.update({user: options.user._id, project: project._id}, {$set: {archived:true}})

  // notify applicant of the decision
  var projectApplicant = Users.findOne({_id: options.user._id})
  var notification_preferences = projectApplicant.notification_preferences || {}
  var email_preferences = notification_preferences.email || {}
  var phone_preferences = notification_preferences.phone || {}
  /**
    sendEmailNotification(email, html, text, subject)
    sendPhoneNotification(phone, body)
  */
  var textMessage = 'Congratulations! You were selected and approved to join the campaign titled: ' + project.title + '. You now have access to the project board where tasks will be assigned to you. To access the board, view the project page from the main screen or from your DASHBOARD.'
  if (email_preferences.email&&email_preferences.verification===true) {
      /** send email notification */
      var html = emailToHTML('YOU ARE ON A NEW CAMPAIGN!', textMessage)
      sendEmailNotification(email_preferences.email, html, textMessage, 'Approval Notice from O . S . H .')
  }

  if (phone_preferences.phone&&phone_preferences.verification===true) {
      /** send phone notification */
      sendPhoneNotification(phone_preferences.phone, textMessage)
  }

  // notify author of the decision
  var projectAuthor = Users.findOne({_id: project.ownerId})
  var notification_preferences = projectAuthor.notification_preferences || {}
  var email_preferences = notification_preferences.email || {}
  var phone_preferences = notification_preferences.phone || {}
  /**
    sendEmailNotification(email, html, text, subject)
    sendPhoneNotification(phone, body)
  */
  var textMessage = 'Congratulations! You have a new team member for the campaign titled: ' + project.title + '. This member has access to the project board where you can assign them tasks. To access the board, view the project page from the main screen or from your DASHBOARD.'
  if (email_preferences.email&&email_preferences.verification===true) {
      /** send email notification */
      var html = emailToHTML('YOUR TEAM IS +1!', textMessage)
      sendEmailNotification(email_preferences.email, html, textMessage, 'New Team Member from O . S . H .')
  }

  if (phone_preferences.phone&&phone_preferences.verification===true) {
      /** send phone notification */
      sendPhoneNotification(phone_preferences.phone, textMessage)
  }

  return true
}

function myName() {
  if (!Meteor.user()) return 'anonymous patron';
  return Meteor.user().firstName + ' ' + Meteor.user().lastName;
}

function myCustomerId() {
  return Meteor.user().customer&&Meteor.user().customer.id||null
}

function myAvatar() {
  return Meteor.user()&&Meteor.user().avatar||'https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Gold_Star.svg/2000px-Gold_Star.svg.png'
}

function myEmail(phoneIfNotEmail) {
  if (Meteor.user().notification_preferences&&Meteor.user().notification_preferences.email&&Meteor.user().notification_preferences.email.verification) {
    return Meteor.user().notification_preferences.email.email
  };

  if (phoneIfNotEmail) {
    if (Meteor.user().notification_preferences&&Meteor.user().notification_preferences.phone&&Meteor.user().notification_preferences.phone.verification) {
      return Meteor.user().notification_preferences.phone.phone
    };
  };

  return null
}

function miniMe() {
  return {
    id: Meteor.user()&&Meteor.user()._id||'anon',
    name: myName(),
    avatar: Meteor.user()&&Meteor.user().avatar||'/img/star.png'
  }
}

function notifyByEmailAndPhone(options) {
  // user, title, message, subject
  var recipient = Users.findOne({_id: options.user});

  // console.log('options notifyByEmailAndPhone:')
  // console.log(options)
  // console.log(new Array(100).join('9 '))
  // console.log(recipient)

  if (!recipient) return;

  var notification_preferences = recipient.notification_preferences || {};
  var email_preferences = notification_preferences.email || {};
  var phone_preferences = notification_preferences.phone || {};
  /**
      sendEmailNotification(email, html, text, subject)
      sendPhoneNotification(phone, body)
    */
  var textMessage = options.message;
  if (email_preferences.email&&email_preferences.verification===true) {
    /** send email notification */
    var html = emailToHTML(options.title, textMessage);
    sendEmailNotification(email_preferences.email, html, textMessage, options.subject);
  }

  if (phone_preferences.phone&&phone_preferences.verification===true) {
    /** send phone notification */
    sendPhoneNotification(phone_preferences.phone, textMessage);
  }
}

function createNotification(options) {
  /**
    NEEDS:
  user, message, title, slug, purpose
    */
  var name = Meteor.user() ? myName() : 'anonymous patron';
  Notifications.insert({
    user: options.user,
    name: name,
    message: options.message,
    from: myName(),
    avatar: myAvatar(),
    title: options.title,
    slug: options.slug,
    offer: options.offer,
    purpose: options.purpose,
    created: new Date(),
    viewed: false
  });

  notifyByEmailAndPhone({
    user: options.user,
    message: options.message,
    title: options.title,
    subject: options.subject||options.title
  });
}

function createReceipt(options) {
  /**
    NEEDS:
  title, slug, amount, purpose, receipt
    */
  if (!Meteor.user()) return;
  var o = {
    user: Meteor.user()._id,
    avatar: Meteor.user().avatar,
    name: myName(),
    owner: options.owner,
    order: options.order,
    title: options.title,
    slug: options.slug,
    amount: options.amount,
    purpose: options.purpose,
    created: new Date(),
    receipt: options.receipt
  }
  if (options.order&&options.order.shares) {
    o.fulfilled = true
  };
  Receipts.insert(o);
}

function uploadToS3(options) {
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

function emailToHTML(title, message, link, linkTitle) {
  var html = '';
  html += '<div style="max-width:550px; min-width:320px;  background-color: white; border: 1px solid #DDDDDD; margin-right: auto; margin-left: auto">';
  html += '<div style="margin-left:30px;margin-right:30px">';
  html += '<p>&nbsp;</p>';
  html += '<p><a href="https://opensourcehollywood.org" style="text-decoration:none;font-family:Verdana, Geneva, sans-serif;font-weight: bold; color: #3D3D3D;font-size: 15px">opensourcehollywood.org</a></p>';
  html += '<hr style="margin-top:10px;margin-bottom:65px;border:none;border-bottom:1px solid red"/>';
  html += '<h1 style="font-family: Tahoma, Geneva, sans-serif; font-weight: normal; color: #2A2A2A; text-align: center; margin-bottom: 65px;font-size: 20px; letter-spacing: 6px;font-weight: normal; border: 2px solid black; padding: 15px">'
  html += title;
  html += '</h1>';
  html += '<h3 style="font-family:Palatino Linotype, Book Antiqua, Palatino, serif;font-style:italic;font-weight:500">Please <span style="border-bottom: 1px solid red">check this out</span>:</h3>';
  html += '<p style="font-family:Palatino Linotype, Book Antiqua, Palatino, serif;font-size: 15px; margin-left: auto; margin-right: auto; text-align: justify;color: #666;line-height:1.5;margin-bottom:75px">';
  html += message;
  html += '</p>';
  if (link) {
    html += '<table style="width:100%">';
    html += '<th>';
    html += '<td style="width:25%"></td>';
    html += '<td style="background-color:black;with:50%;text-align:center;padding:15px"><a href="';
    html += link;
    html += '" style="margin-left: auto; margin-right: auto;text-decoration:none;color: white;text-align:center;font-family:Courier New, Courier, monospace;font-weight:600;letter-spacing:2px;padding:15px">';
    html += linkTitle;
    html += '</a></td>';
    html += '<td style="width:25%"></td>';
    html += '</th>';
    html += '</table>';
  }
  html += '<hr style="margin-top:10px;margin-top:75px"/>';
  html += '<p style="text-align:center;margin-bottom:15px"><small style="text-align:center;font-family:Courier New, Courier, monospace;font-size:10px;color#666">CC BY-OSH 1.0 <a href="https://opensourcehollywood.org/" style="color:#666">O . S . H .</a> | Made with <span style="color:red">&hearts;</span> in Los Angeles</small></p>';
  html += '<p>&nbsp;</p>';
  html += '</div>';
  html += '</div>';
  return html;
}

function getMiniURL(url) {
  var requestParams = {
    uri:    'https://firebasedynamiclinks.googleapis.com/v1/shortLinks?key=AIzaSyDogzrc_KJ_SjEc0PYGkT2BTWEB1_WWPwc',
    method: 'POST',
    json: {
      longDynamicLink: url,
      suffix: {
         option: 'short'
       }
    }
  };
  var future = new (Npm.require('fibers/future'))();
  request( requestParams, Meteor.bindEnvironment(function ( err, response, body ) {
    
    if (err) return future.return(err.message);
    future.return(body);
  }));
  return future.wait();
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

function sendEmailNotification(emails, html, text, subject) {
  if (typeof emails === 'string') emails = [ emails ];
  var params = {
    Destination: {
     ToAddresses: emails
    }, 
    Message: {
     Body: {
      Html: {
       Charset: "UTF-8", 
       Data: html
      }, 
      Text: {
       Charset: "UTF-8", 
       Data: text
      }
     }, 
     Subject: {
      Charset: "UTF-8", 
      Data: subject
     }
    }, 
    ReplyToAddresses: [
      "noreply@opensourcehollywood.org"
    ], 
    ReturnPath: "noreply@opensourcehollywood.org", 
    Source: "noreply@opensourcehollywood.org"
  };
  SES.sendEmail(params, function(err, data) {
   if (err) {
     console.log(err, err.stack); // an error occurred
   } else {
      console.log(data);           // successful response
   };
   /*
   data = {
    MessageId: "EXAMPLE78603177f-7a5433e7-8edb-42ae-af10-f0181f34d6ee-000000"
   }
   */
  });
}

function sendPhoneNotification(phone, body) {
  var __opts = {
    to: phone,
    from: '+14157877947 ',
    body: body,
  }
  var options = {
    method: 'post',
    body: __opts,
    json: true,
    url: 'http://localhost:4112/s'
  }
  request(options, function(err, res, body) {});
}

function removeProjectMessages(user, slug) {
  ProjectMessages.remove({user: user, slug: slug})
}

function declinedUserRefund(tx, project, amount, receipts, cb) {
    var stripe = require("stripe")(
        StripeServerKey
    );
    stripe.refunds.create({
        charge: tx,
    }, Meteor.bindEnvironment(function(err, receipt) {
        if (err) return cb(err);
        createReceipt({
            title: project.title,
            slug: project.slug,
            owner: project.ownerId,
            amount: amount,
            order: null,
            purpose: 'declined refund',
            receipt: receipt
        });
        try {
            receipts.push(receipt)
        } catch(e) {}
        cb(null, receipts)
    }));
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
    delete Session.keys['order'];
    delete Session.keys['locationFilter'];
    delete Session.keys['selectedCategory'];
    delete Session.keys['selectedGenre'];
    delete Session.keys['needsResetOption'];
  });
} /* isClient */

/* Meteor methods */
Meteor.methods({
    /** AUTHOR UPDATES */
    projectUpdateText: function(options) {
        check(options, Object);
        Projects.update({slug: options.slug}, {$addToSet: { updates: options.update }});
    },
    /** FILTER */
    locationFromZip: function(options) {
        check(options, Object);
        if (Meteor.isServer) {
          var requestParams = {
            uri:    ['https://maps.googleapis.com/maps/api/geocode/json?address=',options.zip,',',options.country||'US','&key=AIzaSyDDUJ4ZQNWvF4x2C7AbnPR8-PZEoQGCnLs'].join(''),
            method: 'GET'
          };
          var future = new (Npm.require('fibers/future'))();
          request( requestParams, Meteor.bindEnvironment(function ( err, response, body ) {
            if (err) return future.return(err.message);
            body = JSON.parse(body);
            if (!body.status||body.status!=='OK') {
              if(future)future.throw(new Meteor.Error("location code", "Invalid location, please enter a valid location code."));
            } else {
              var results = body.results[0];
              var loc = results.geometry.location;
              future.return([loc.lng, loc.lat]);
            }
          }));
          return future.wait();
        };
    },
    /** DELETE NOTIFICATION */
    removeNotificationRT: function(notificationType) {
        check(notificationType, String);
        if (Meteor.isClient) return;
        var notification_preferences = Meteor.user().notification_preferences || {};
        if (notificationType==='email') {
          delete notification_preferences['email'];
        } else {
          delete notification_preferences['phone'];
        };
        Meteor.users.update({_id: Meteor.user()._id}, {$set: {notification_preferences: notification_preferences}});
        return('Notification preferences were updated.');
    },
    /** VERIFY PHONE SOURCE */
    verifyPhonePIN: function(pin) {
        check(pin, String);
        if (Meteor.isClient) return;
        var verificationCode = Meteor.user().phone_verification_code;
        pin = parseInt(pin);
        if (pin===verificationCode) {
          var notification_preferences = Meteor.user().notification_preferences || {};
          var email_preferences = notification_preferences.email || {};
          var phone_preferences = notification_preferences.phone;
          if (phone_preferences.phone) {
            phone_preferences.verification = true;
            phone_preferences.verificationDate = new Date();
            notification_preferences.phone = phone_preferences;
            Meteor.users.update({_id: Meteor.user()._id}, {$set: {notification_preferences: notification_preferences}});
            return('This number is now verified.');
          } 
        } else {
          return('The verification code was invalid, please try again.');
        }
    },
    /** RE-VERIFY NOTIFICATION SOURCE */
    resendVerification: function(reverify) {
        check(reverify, String);
        if (Meteor.isClient) return;
        var notification_preferences = Meteor.user().notification_preferences || {};
        var email_preferences = notification_preferences.email || {};
        var phone_preferences = notification_preferences.phone || {};
        if (reverify==='email') {
          /** send email verification */
          var guid1 = Meteor.user().guid1;
          var guid2 = Meteor.user().guid2;
          var email = email_preferences.email;
          var verificationURL = BASE_URL + 'verify/' + guid2 + '/' + guid1;
          var _html = emailToHTML('VERIFY EMAIL', 'Your email was provided as a source for notifications on O . S . H .. To verify, please select the following:', verificationURL, 'SELECT TO VERIFY');
          var _text = "Your email was provided as a source for notifications on O . S . H .. To verify, please visit the following URL: " + verificationURL;
          var _subject = "Verify Email for Notifications from O . S . H .";
          sendEmailNotification(email, _html, _text, _subject);
          return('A verification email was dispatched to ' + email + '.')
        } else {
          var phone = phone_preferences.phone;
          var verificationCode = Meteor.user().phone_verification_code;
          var _body = verificationCode + ' is your verification code for O . S . H ..';
          sendPhoneNotification(phone, _body);
          return('Please enter the verification code to verify your phone:');
        }
    },
    /** REAL-TIME NOTIFICATIONS */
    setNotificationPreferences: function(options) {
        check(options, Object);
        if (Meteor.isClient) return;
        var phone, email, notification_preferences;
        phone = options.phone && options.phone.replace(/ /g, '');
        email = options.email && options.email.replace(/ /g, '');
        notification_preferences = Meteor.user().notification_preferences || {};
        email_preferences = notification_preferences.email || {};
        phone_preferences = notification_preferences.phone || {};
        var responseMsg = '';
        if (email) {
          /* The following example sends a formatted email: */
          var guid1 = guid();
          var guid2 = guid();
          if (email_preferences.email===email) {
            /** do nothing, email already exists */
          } else {
            /** set guids to user */
            email_preferences.email = email;
            email_preferences.verification = false;
            notification_preferences.email = email_preferences;
            Meteor.users.update({_id: Meteor.user()._id}, {$set: {'guid1': guid1, 'guid2': guid2, notification_preferences: notification_preferences}});
            var verificationURL = BASE_URL + 'verify/' + guid2 + '/' + guid1;
            var _html = emailToHTML('VERIFY EMAIL', 'Your email was provided as a source for notifications on O . S . H .. To verify, please select the following:', verificationURL, 'SELECT TO VERIFY');
            var _text = "Your email was provided as a source for notifications on O . S . H .. To verify, please visit the following URL: " + verificationURL;
            var _subject = "Verify Email for Notifications from O . S . H .";
            sendEmailNotification(email, _html, _text, _subject);
            responseMsg += 'A verification email was dispatched to ' + email + '.\n';
          }
        };

        if (phone) {
          /** get 4 digit code, set to user and SMS user */
          // console.log(new Array(100).join('#'))

          phone = phone.replace(/\D/g,'');
          // console.log(phone)
          if (phone.length!==10) {
            responseMsg += 'The phone number you provided did not match the (xxx)xxx-xxxx format, please try again.'
          } else if (phone_preferences.phone===phone) {
            /** do nothing, phone already verified */
          } else {
            phone = '+1' + phone;
            var verificationCode = Math.floor(1000 + Math.random() * 9000);
            phone_preferences.phone = phone;
            phone_preferences.verification = false;
            notification_preferences.phone = phone_preferences;
            Meteor.users.update({_id: Meteor.user()._id}, {$set: {'phone_verification_code': verificationCode, notification_preferences: notification_preferences}});
            var _body = verificationCode + ' is your verification code for O . S . H ..';
            sendPhoneNotification(phone, _body);
            responseMsg += 'Please enter the verification code to verify your phone:';
          }
          return(responseMsg);
        };
    },
    /** EDIT PROFILE */
    upgradeProfile: function(options) {
        check(options, Object);
        // console.log('upgradeProfile')
        if (Meteor.isClient) {
          if (options.showDialog) vex.dialog.alert('Your profile was updated', function() {
          });
          return
        } else {
          var ipAddr = this.connection&&this.connection.clientAddress||'127.0.0.1';
          var userAgent = this.connection&&this.connection.httpHeaders['user-agent']||'user-agent';
          for (var key in options) {
            if (key === 'avatar' && !Object.keys(options[key]).length) {
              delete options[key];
              continue;
            }
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
                  // console.log('in upgradeProfile 1')
                  // console.log('failed to bind environment')
                }));
              }, function() {
                // console.log('in upgradeProfile 2')
                // console.log('failed to bind environment')
              }));
            };
            if (!options[key]) {
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
            userGiftsToProducts()
          };
        }
    },
    /** DEFAULT VIRTUAL ACCOUNT */
    createBankingAccount: function() {
        if (!Meteor.user().account&&Meteor.isServer) {
          var ipAddr = this.connection&&this.connection.clientAddress||'127.0.0.1';
          var userAgent = this.connection&&this.connection.httpHeaders['user-agent']||'user-agent';
          var stripe = require("stripe")(
            StripeServerKey
          );

          stripe.customers.create({
            email: myEmail(),
            metadata: {
              uid: Meteor.user()._id
            }
          }, Meteor.bindEnvironment(function(err, customer) {
            if (err) return;
            /** 
              TODO:
                add support fields and others for CUSTOM type account
                https://stripe.com/docs/api/accounts/create
              */
            stripe.accounts.create({
              country: 'US',
              type: 'custom',
              "tos_acceptance" : {
                "date" : Math.round(new Date().getTime()/1000),
                "ip" : ipAddr,
                "user_agent" : userAgent
              }
            }, Meteor.bindEnvironment(function(err, account) {
              if (err) return
              // asynchronously called
              stripe.products.create({
                name: 'donation id:' + Meteor.user()._id,
                type: 'service',
                metadata: {
                  user: Meteor.user()._id,
                  type: 'donation'
                }
              }, Meteor.bindEnvironment(function(err, product) {
                if (err) return
                Meteor.users.update({_id: Meteor.user()._id}, {$set: { account: account, customer: customer, donate: product }});
              }));
            }));
          }));
        };
    },
    /** ADD BANK INFO */
    updateBanking: function(options, cb) {
        check(options, Object);
        if (Meteor.isServer&&Meteor.user().account&&Meteor.user().account.keys&&Meteor.user().account.keys.secret) {
          try {
            var future = new (Npm.require('fibers/future'))();
            var stripe = require("stripe")(
              Meteor.user().account.keys.secret
            );
            stripe.accounts.createExternalAccount(
              Meteor.user().account.id,
              { external_account: options },
            Meteor.bindEnvironment(function(err, bank) {
              // asynchronously called
              // console.log(new Array(1000).join('!'))
              // console.log(err, bank)
              // console.log(new Array(100).join('~'))
              if (err) return future.return(err.message);
              if (bank) {
                Meteor.users.update({_id: Meteor.user()._id}, {$set: { bank: bank }});
                if (Meteor.user()._bank) {
                  // delete previously deleted account
                  stripe.accounts.deleteExternalAccount(
                    Meteor.user()._bank.account,
                    Meteor.user().id,
                    function(err, confirmation) {
                      // asynchronously called
                      if (confirmation) {
                        Meteor.users.update({_id: Meteor.user()._id}, {$set: { _bank: null }});
                      };
                    }
                  );
                };
                // console.log('did save')
                future.return('you may now use this account for transferring funds from your campaigns');
              } else {
                future.return('an unidentified error occurred, please record the steps you took to arrive here including Wifi signal strength and device used and report it to us');
              }
            }));

            return future.wait();
          } catch(e) {
            console.log(e)
            // console.log(Meteor.user())
            return 'an unidentified error occurred, please record the steps you took to arrive here including Wifi signal strength and device used and report it to us';
          }
        } else {
          // console.log(Meteor.user())
          return 'an account was not identified, if you feel this is a mistake please wait and try again or contact us';
        }
    },
    /** REMOVE BANK INFO */
    deleteBanking: function() {
        var user = Meteor.user();
        var bank = user.bank;
        Meteor.users.update({_id: Meteor.user()._id}, {$set: { bank: null, _bank: bank }});
    },
    /** CREATE PROJECT */
    addProject: function (options, cb) {
        check(options, Object);

        // console.log('in addProject')

        if (Meteor.isClient) return
        var shouldExit = false;
        var ownerId = Meteor.user()._id,
            slug = ownerId.substr(ownerId.length - 2) + new Date().getTime(),
            _user = {
              userId: ownerId,
              isAdmin: true
            },
            permission = 'public',
            members = [_user],
            future;
        var future = new (Npm.require('fibers/future'))();
        // does project with the same name exist for this producer?
        // https://maps.googleapis.com/maps/api/geocode/json?components=postal_code=01210|country:PL&key=AIzaSyDDUJ4ZQNWvF4x2C7AbnPR8-PZEoQGCnLs
        // https://maps.googleapis.com/maps/api/geocode/json?components=postal_code=91316|country:US&key=AIzaSyDDUJ4ZQNWvF4x2C7AbnPR8-PZEoQGCnLs
        var previousProjectExists = Projects.findOne({title: options.title, archived: {$ne: true}})
        // console.log('do duptitle')
        if (previousProjectExists) {
          // console.log('project already exists')
          future.throw(new Meteor.Error("Error: duplicate title", "This campaign contains a title identical to a previous project of yours. Please update the campaign to a new title so it is unique."))
          return
        }
        if (/** country ==US, postal_code is 5 digits */!options.country||options.country==='US') {
          if (!options.zip.match(/\d{5}/)) {
            if(future)future.throw(new Meteor.Error("invalid zip", "Invalid postal code, please enter a valid one."));
            return
          };
        };
        var requestParams = {
          uri:    ['https://maps.googleapis.com/maps/api/geocode/json?address=',options.zip,',',options.country||'US','&key=AIzaSyDDUJ4ZQNWvF4x2C7AbnPR8-PZEoQGCnLs'].join(''),
          method: 'GET'
        };
        // console.log('do geoJSON')
        request( requestParams, Meteor.bindEnvironment(function ( err, response, geoOptions ) {
          if (!geoOptions) {
            if(future)future.throw(new Meteor.Error("campaign create", "Invalid location, please enter a valid location code."));
            return
          };
          // console.log('in geoJSON')
          shouldExit = true;
          geoOptions = JSON.parse(geoOptions);

          if (!geoOptions.status||geoOptions.status!=='OK') {
            if(future)future.throw(new Meteor.Error("campaign create", "Invalid location, please enter a valid location code."));
            return;
          };

          /** are results valid ? */
          var results = geoOptions.results[0];
          var loc = results.geometry.location;
          
          options.formattedAddress = results.formatted_address;
          options.location = {
            type: "Point",
            coordinates: [loc.lng, loc.lat]
          }

          options.ownerId = ownerId;
          options.ownerName = Meteor.user().firstName + ' ' + Meteor.user().lastName;
          options.ownerAvatar = Meteor.user().avatar;
          options.createdAt = moment().format('MMMM D, YYYY');
          options.created = new Date();
          options.isApproved = true;
          options.community = 'general'; // TODO: group projects by community
          options.group = 'general'; // TODO: community subgroup
          options.archived = false;
          options.count = 0;
          options.funded = options.funded || 0;
          options.applied = 0;
          options.approved = 0;
          options.updates = [];
          options.upvotedUsers = [];
          options.downvotedUsers = [];
          options.usersApplied = [];
          options.usersApproved = [];
          options.slug = slug;
          options.purpose = options.category||'new project';

          // console.log('OPTIONS ==')
          // console.log(options)


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
          });

          delete options['_gifts']

          // get minified URL for project
          // getMiniURL
          var url = 'https://csc5w.app.goo.gl?link=https://opensourcehollywood.org/projects/'+options.slug+'/'+options.ownerId;
          var miniURL = getMiniURL(url);
          if (miniURL.shortLink) {
            options.urlLink = miniURL.shortLink;
          } else {
            options.urlLink = url;
          }
          
          var board = Boards.insert({
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

          options.bid = board;
          var project = Projects.insert(options);

          // console.log('do projectGiftsToProducts')
          // console.log('\n - - - - - ')

          projectGiftsToProducts(project)

          var stripe = require("stripe")(
            StripeServerKey
          );

          stripe.products.create({
            name: 'campaign donation id:' + project,
            type: 'service',
            metadata: {
              user: Meteor.user()._id,
              type: 'donation',
              projectSlug: options.slug
            }
          }, Meteor.bindEnvironment(function(err, product) {
            if (err) return
            //   console.log(new Array(100).join('i '))
            // console.log(product)
            Projects.update({slug: options.slug}, {$set: { donate: product }});
          }));

          createNotification({
            user: options.ownerId,
            message: 'Campaign created! You created a new campaign, and it is now displayed live and eligible for viewing and user actions. Be sure to click on the social media links and spread the word to your network of friends and family for contributions and shares. If we can help, reach out to us on social media or by email to "hello@opensourcehollywood.org" and one of our representatives will be in touch with you soon.',
            title: options.title,
            slug: options.slug,
            purpose: 'new campaign'
          });

          if(future)future.return('Project created! Check your Dashboard for information about applicants, and to share your project with the world.');
        }));
        if (future) return future.wait();
    },
    /** EDIT PROJECT */
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
          });
          delete options['_gifts'];
          Projects.update({slug: options.slug}, {$set: options});
          projectGiftsToProducts(project)
        };
    },
    /** VOTE UP */
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
    /** VOTE DOWN */
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
        if (Meteor.isServer) {
          Subscribers.insert({
            email: email,
            date: new Date()
          });
        };
    },
    splashMessage: function(options) {
        check(options, Object);
        var formattedMessage = '';
        // name, email, subject, message
        formattedMessage += 'Message FROM: ' + options.name;
        formattedMessage += ' (email: ' + options.email + ')';
        formattedMessage += '. Message SUBJECT: ' + options.subject + ' ... ... MESSAGE: ' + options.message;
        var _html = emailToHTML('NEW CONTACT US MESSAGE FROM O.S.H.', formattedMessage, null, null);
        var _text = formattedMessage;
        var _subject = "New Contact Us Message from O.S.H.";
        sendEmailNotification(['aug2uag@gmail.com'], _html, _text, _subject);
    },
    /** DONATION */
    donateToProject: function(options, cb) {
        check(options, Object);
        if (options.amount<1) return 'donations need to be at least one dollar';
        if (Meteor.isClient) return;
        options.user = Meteor.user() ? {
          id: Meteor.user()._id,
          name: myName(),
          avatar: Meteor.user().avatar
        } : {
          id: 'anon',
          name: 'patron',
          avatar: '/img/star.png'
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
          transfer_group: project.slug
        }, Meteor.bindEnvironment(function(err, charge) {
          if (err) return future.return(err.message);
          if (charge) {
            delete options['token'];
            options.receipt = charge;
            options.created = new Date();
            var donations = project.donations || [];
            donations.push(options);

            var backers = project.backers || [];
            if (Meteor.user()&&Meteor.user()._id) {
              if (backers.indexOf(Meteor.user()._id)===-1) backers.push(Meteor.user()._id);
            };

            var newTotal = project.funded + options.amount;
            // update project
            Projects.update({_id: project._id}, { $set: { backers: backers, donations: donations, funded: newTotal }});
            // create receipt
            // title, slug, amount, purpose, receipt
            createReceipt({
              order: {
                donation: true,
                subscription: false
              },
              title: project.title,
              slug: project.slug,
              owner: project.ownerId,
              amount: options.amount,
              purpose: 'donation',
              receipt: charge
            });

            var donationMessage = myName() + ' donated $' + (options.amount).toFixed(2);
            // create notification
            createNotification({
              user:project.ownerId,
              message: donationMessage,
              title: project.title,
              slug: project.slug,
              purpose: 'donation'
            });

            var projectOwner = Users.findOne({_id: project.ownerId});
            var notification_preferences = projectOwner.notification_preferences || {};
            var email_preferences = notification_preferences.email || {};
            var phone_preferences = notification_preferences.phone || {};
            /**
                sendEmailNotification(email, html, text, subject)
                sendPhoneNotification(phone, body)
              */
            var textMessage = donationMessage + ' to your project titled: ' + project.title + '.'
            if (email_preferences.email&&email_preferences.verification===true) {
              /** send email notification */
              var html = emailToHTML('NEW DONATION!', textMessage);
              sendEmailNotification(email_preferences.email, html, textMessage, 'New Donation from O . S . H .');
            }

            if (phone_preferences.phone&&phone_preferences.verification===true) {
              /** send phone notification */
              sendPhoneNotification(phone_preferences.phone, textMessage);
            }


            future.return('payment was processed, thank you for your donation !');
          } else {
            future.throw(new Meteor.Error("donation", "payment failed"));
          }
        }));
        return future.wait();
    },
    /** LEND OFFER ASSET */
    lendResource: function(options) {
      check(options, Object);
      if (Meteor.isServer) {
        var project = Projects.findOne({slug: options.slug});
        delete options['slug'];
        options.user = miniMe()


        options.user.email = myEmail()
        options.created = new Date();
        options.message = myName()+' offered to lend '+options.asset+' for $'+ options.offer;
        var offeredResources = project.offeredResources || [];
        var mappedStings = offeredResources.map(function(o){return o.user.id});

        Projects.update({_id: project._id}, { $addToSet: { offeredResources: options }});
        // user, message, title, slug, purpose
        createNotification({
          user:project.ownerId,
          message:options.message,
          title: project.title,
          slug: project.slug,
          purpose: 'lend'
        });
        options.uid = Meteor.user()._id;
        Offers.insert(options);

        var projectOwner = Users.findOne({_id: project.ownerId});
        var notification_preferences = projectOwner.notification_preferences || {};
        var email_preferences = notification_preferences.email || {};
        var phone_preferences = notification_preferences.phone || {};
        /**
            sendEmailNotification(email, html, text, subject)
            sendPhoneNotification(phone, body)
          */
        var textMessage = options.message;
        if (email_preferences.email&&email_preferences.verification===true) {
          /** send email notification */
          var html = emailToHTML('RESOURCE OFFER!', textMessage);
          sendEmailNotification(email_preferences.email, html, textMessage, 'New Resource Offer from O . S . H .');
        }

        if (phone_preferences.phone&&phone_preferences.verification===true) {
          /** send phone notification */
          sendPhoneNotification(phone_preferences.phone, textMessage);
        }
      }
    },
    /** APPLY CREW & CAST */
    applyToProject: function(options, cb) {
        check(options, Object);
        if (Meteor.isClient) return;

        var project = Projects.findOne({slug: options.slug});
        if (project.ownerId===Meteor.user()._id) return 'not allowed, this is your own campaign';

        function notifyProjectOwner(ownerId, message) {
            var projectOwner = Users.findOne({_id: ownerId, message});
            var notification_preferences = projectOwner.notification_preferences || {};
            var email_preferences = notification_preferences.email || {};
            var phone_preferences = notification_preferences.phone || {};
            /**
                sendEmailNotification(email, html, text, subject)
                sendPhoneNotification(phone, body)
              */
            var textMessage = message;
            if (email_preferences.email&&email_preferences.verification===true) {
              /** send email notification */
              var html = emailToHTML('NEW APPLICANT!', textMessage);
              sendEmailNotification(email_preferences.email, html, textMessage, 'New Applicant from O . S . H .');
            }

            if (phone_preferences.phone&&phone_preferences.verification===true) {
              /** send phone notification */
              sendPhoneNotification(phone_preferences.phone, textMessage);
            }
        }

        var key=options.ctx==='crew'?'crewApplicants':'roleApplicants';
        var __key =options.ctx==='crew'?'crew':'cast';

        options.audition = project[__key].audition||'N/A';
        var usersApplied = project.usersApplied;

        options.uid = Meteor.user()._id;
        if (usersApplied.indexOf(options.uid)===-1) usersApplied.push(options.uid);

        options.user = miniMe()

        options.user.email = myEmail()
        options.created = new Date();

        var mappedValues = project[key] || [];
        var mappedStings = mappedValues.map(function(o){return o.user.id});
        // prevent duplicates
        var updateObj = {$set:{usersApplied: usersApplied}};
        // if (mappedStings.indexOf(Meteor.user()._id)===-1) mappedValues.push(options);
        mappedValues.push(options);
        updateObj['$set'][key] = mappedValues;

        var successMessage = 'Your application was successful. You can communicate on your offer by visiting your contracts in dashboard.'
        // create notifications

        function appliedForSuccessHandler() {
          Projects.update({_id: project._id}, updateObj);
          createNotification({
            user: Meteor.user()._id,
            message: ['You successfully applied for' + options.appliedFor, 'on campaign titled', project.title,'and the campaign owner was notified.'].join(' '),
            title: project.title,
            slug: project.slug,
            purpose: 'apply',
            viewed: false
          });

          createNotification({
            user: project.ownerId,
            message: [Meteor.user().firstName||'', Meteor.user().lastName||'', 'applied for', options.appliedFor, 'to your campaign.'].join(' '),
            title: project.title,
            slug: project.slug,
            purpose: 'apply',
            viewed: false
          });
        }

        var offerOptions = {
          type: options.ctx,
          offer: options,
          purpose: 'apply',
          pending: true,
          offeror : Meteor.user()._id,
          offeree : project.ownerId,
          slug : project.slug,
          title: project.title,
          banner: project.banner
        }

        if (options.type==='hired'||!options.pay) {
          Offers.insert(offerOptions);
          appliedForSuccessHandler()
          return successMessage;
        } else {
          // console.log('apply for donation')
          var stripe = require("stripe")(
            StripeServerKey
          );
          var future = new (Npm.require('fibers/future'))();
          // console.log(new Array(100).join('&'))
          stripe.charges.create({
            amount: Math.floor(options.pay * 100),
            currency: "usd",
            source: options.token.id,
            transfer_group: project.slug
          }, Meteor.bindEnvironment(function(err, charge) {
            if (err) return future.return(err.message);
            if (charge) {
              delete options['token'];
              offerOptions.receipts = [charge];

              var d = new Date()
              d.setHours(d.getHours() + (5*24))
              offerOptions.expiration = d

              // create offer
              Offers.insert(offerOptions);

              // create receipt
              createReceipt({
                order: {
                  application: true,
                  refunded: false
                },
                title: project.title,
                slug: project.slug,
                owner: project.ownerId,
                amount: options.amount,
                purpose: 'apply',
                receipt: charge
              });

              appliedForSuccessHandler()

              future.return(successMessage);
            } else {
              future.throw(new Meteor.Error("apply", "payment failed"));
            }
          }));
          return future.wait();
        }
    },
    /** BUY GIFT */
    purchaseGift: function(options, cb) {
        check(options, Object);
        if (Meteor.isServer) {
          var project = Projects.findOne({slug: options.slug});
          options.uid = Meteor.user()&&Meteor.user()._id||'anon';
          var stripe = require("stripe")(
            StripeServerKey
          );
          var future = new (Npm.require('fibers/future'))();
          stripe.charges.create({
            amount: Math.floor(options.amount * 100),
            currency: "usd",
            source: options.token.id,
            transfer_group: project.slug
          }, Meteor.bindEnvironment(function(err, charge) {
            if (err) return future.return(err.message);
            if (charge) {
              options.user = miniMe()

              options.user.email = myEmail()
              options.message = options.user.name+' purchased '+options.gift.name+' for $'+options.amount.toFixed(2);
              options.uid = Meteor.user()&&Meteor.user()._id||'anon';
              options.slug = project.slug;
              options.created = new Date();
              delete options['token'];
              delete options.gift['data'];
              options.type = 'gift'
              options.receipt = charge;

              var backers = project.backers || [];
              if (Meteor.user()&&Meteor.user()._id) {
                if (backers.indexOf(Meteor.user()._id)===-1) backers.push(Meteor.user()._id);
              };

              var newTotal = project.funded + options.amount;
              var gifts = project.gifts || [];
              var _gifts = [];
              for (var i = gifts.length - 1; i >= 0; i--) {
                var g = gifts[i];
                var gift = options.gift
                // console.log(g)
                // console.log('\n')
                // console.log(gift)
                // console.log('-- -- - - - -- -- - - - -- -- - - - -- -- - - - -- -- - - - ')
                if (g.name===gift.name&&g.description===gift.description&&g.msrp===gift.msrp) {
                  // CHANGE QUANTITY OF GOODS HERE
                  // console.log(new Array(100).join('u '))
                  options.order.forEach(function(o) {
                    if (g.quantity.hasOwnProperty(o.key)) {
                      // console.log('hasOwnProperty KEY')
                      g.quantity[o.key] = parseFloat(g.quantity[o.key]) - parseFloat(o.quantity)
                    } else if (g.quantity.hasOwnProperty('all')) {
                      // console.log('hasOwnProperty ALL')
                      g.quantity.all = parseFloat(g.quantity.all) - parseFloat(o.quantity)
                    } else {
                      // console.log('NO MATCH')
                    }
                  })
                };
                _gifts.push(g);
              };

              var soldGifts = project.soldGifts || [];
              soldGifts.push({
                user: options.user
              });

              // console.log('do set new gifts values:')
              // console.log(_gifts)

              // update project
              Projects.update({_id: project._id}, { $set: { backers: backers, soldGifts: soldGifts, gifts: _gifts, funded: newTotal }});


              // create offer notice
              Offers.insert(options);
              // create receipt
              delete options['receipt']
              createReceipt({
                order: options,
                title: project.title,
                slug: project.slug,
                owner: project.ownerId,
                amount: options.amount,
                purpose: 'gift purchase',
                receipt: charge
              });
              // create notification
              createNotification({
                user:project.ownerId,
                message: options.message,
                title: project.title,
                slug: project.slug,
                purpose: 'gift purchase'
              });
              

              var projectOwner = Users.findOne({_id: project.ownerId});
              var notification_preferences = projectOwner.notification_preferences || {};
              var email_preferences = notification_preferences.email || {};
              var phone_preferences = notification_preferences.phone || {};
              /**
                  sendEmailNotification(email, html, text, subject)
                  sendPhoneNotification(phone, body)
                */
              var textMessage = options.message;
              if (email_preferences.email&&email_preferences.verification===true) {
                /** send email notification */
                var html = emailToHTML('GIFT PURCHASE!', textMessage);
                sendEmailNotification(email_preferences.email, html, textMessage, 'New Gift Purchase from O . S . H .');
              }

              if (phone_preferences.phone&&phone_preferences.verification===true) {
                /** send phone notification */
                sendPhoneNotification(phone_preferences.phone, textMessage);
              }

              // email receipt to purchaser
              var buyerEmail = options.email
              var purchaseReceipt = [
                'You have just now purchased ',
                options.totalUnits,
                ' units of ',
                options.gift.name,
                ' at a total price of $',
                (charge.amount/100).toFixed(2),
                '. Your transaction receipt for this purchase is: ',
                charge.id,
                '. Please keep this for your records. You can follow up with your purchase by emailing the seller at: ',
                email_preferences.email,
                ' for any further follow-up related to this order.'
              ].join('')
              var html = emailToHTML('PURCHASE RECEIPT!', purchaseReceipt);
              sendEmailNotification(email_preferences.email, html, textMessage, 'New Gift Purchase from O . S . H .');

              future.return('your gift purchase was successful, your order will be fulfilled by the campaign creator');



            } else {
              future.throw(new Meteor.Error("donation", "payment failed"));
            }
          }));
          return future.wait();
        };  
    },
    userMerchSale: function(options, cb) {
        check(options, Object);
        if (Meteor.isClient) return;

        // console.log(options)

        var user = Users.findOne({_id: options.uid});

        var stripe = require("stripe")(
          StripeServerKey
        );
        var future = new (Npm.require('fibers/future'))();
        stripe.charges.create({
          amount: Math.floor(options.amount * 100),
          currency: "usd",
          source: options.token.id,
          transfer_group: user._id
        }, Meteor.bindEnvironment(function(err, charge) {
          if (err) return future.return(err.message);
          if (charge) {
            options.user = miniMe()

            options.user.email = myEmail()
            options.message = options.user.name+' purchased '+options.gift.name+' for $'+options.amount.toFixed(2);
            options.created = new Date();
            options.receipt = charge;
            options.purchaser = myName();
            options.type = 'gift'
            delete options.gift['data'];
            // create offer notice
            Offers.insert(options);

            // decrement merch quantity and save
            var gifts = Meteor.user().gifts || [];
            var _gifts = [];
            for (var i = gifts.length - 1; i >= 0; i--) {
              var g = gifts[i];
              if (g.name===options.gift.name&&g.description===options.gift.description&&g.msrp===options.gift.msrp&&g.url===options.gift.url) {
                // CHANGE QUANTITY OF GOODS HERE
                options.order.forEach(function(o) {
                  g.quantity[o.key] = g.quantity[o.key] - o.quantity
                })
              };
              _gifts.push(g);
            };

            delete options['receipt']
            // create receipt
            createReceipt({
              order: options,
              owner: user._id,
              title: options.artistName,
              slug: 'personal merchandise',
              amount: options.amount,
              purpose: 'gift purchase',
              receipt: charge
            });
            // create notification
            createNotification({
              user: user._id,
              message: options.message,
              title: options.user.name,
              slug: 'personal merchandise',
              purpose: options.name + ' purchase'
            });
            
            
            var notification_preferences = user.notification_preferences || {};
            var email_preferences = notification_preferences.email || {};
            var phone_preferences = notification_preferences.phone || {};
            /**
                sendEmailNotification(email, html, text, subject)
                sendPhoneNotification(phone, body)
              */
            var textMessage = options.message;
            if (email_preferences.email&&email_preferences.verification===true) {
              /** send email notification */
              var html = emailToHTML('GIFT PURCHASE!', textMessage);
              sendEmailNotification(email_preferences.email, html, textMessage, 'New Gift Purchase from O . S . H .');
            }

            if (phone_preferences.phone&&phone_preferences.verification===true) {
              /** send phone notification */
              sendPhoneNotification(phone_preferences.phone, textMessage);
            }

            future.return('your gift purchase was successful, your order will be fulfilled by this artist.');
          } else {
            future.throw(new Meteor.Error("donation", "payment failed"));
          }
        }));
        return future.wait();
    },
    /** FINISH PROJECT */
    closeProject: function(slug) {
        check(slug, String);
        if (Meteor.isServer) {
          var project = Projects.findOne({slug: slug});
          // TODO, update influence scores
          var board = Boards.findOne({slug: slug});
          Projects.update({slug: slug}, { $set: { archived: true } });
          Boards.update({slug: slug}, { $set: { archived: true } });
          Cards.update({boardId: board._id}, { $set: { archived: true } });
          Receipts.update({
            projectId: project._id
          }, {$set: {
            projFinished: true
          }})
        };
        if (Meteor.isClient) {
          vex.dialog.confirm({
            message: 'This campaign is history.', 
            callback: function() {
              Router.go('Home');
            }
          });
        };
    },
    /** ADD COMMENT */
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
              ownerName: user.firstName + ' ' + user.lastName,
              ownerAvatar:user.avatar,
              createdAt: moment().format("MMMM D, YYYY"),
              createTimeActual: moment().format()
            });
          } else {
            $('#comment-box').val('');
          }
        } else {
          vex.dialog.alert('You must be signed in to do that.');
        } 
    },
    /** ADD MESSAGE */
    addProjectMessage: function(options) {
      check(options, Object);
      if (Meteor.isClient) return;
      // console.log('in addProjectMessage')
      var fullURL = 'https://csc5w.app.goo.gl?link=https://opensourcehollywood.org/message/project/' + options.slug + '/' + options.user;
      var miniURL = getMiniURL(fullURL);
      ProjectMessages.insert({
        project: options.project,
        slug: options.slug,
        title: options.title,
        user: options.user,
        text: options.text,
        ownerId: Meteor.user()._id,
        ownerName: Meteor.user().firstName + ' ' + Meteor.user().lastName,
        ownerAvatar:Meteor.user().avatar,
        createdAt: moment().format("MMMM D, YYYY"),
        createTimeActual: new Date()
      });

      return createNotification({
          user: options.user,
          message: ['You have a new message in your negotiations with', myName(), 'update in your negotiations.'].join(' '),
          title: options.title,
          slug: options.slug,
          purpose: 'new message',
          subject: 'Negotiations Update'
      })
    },
    /** TRANSFER FUNDS */
    transferFunds: function(options, cb) {
        // origin, account transfer from
        // to = Meteor.user().bank.id
        check(options, Object);
        if (Meteor.isServer) {
          if (!Meteor.user().bank||!Meteor.user().bank.currency||!Meteor.user().bank.account) return 'please configure your transfer configurations in EDIT PROFILE to continue';
          var project = Projects.findOne({slug:options.slug});
          // calculate how much to transfer
          // do transfer 90%
          // keep 10% in account
          var fundsTransferred = project.fundsTransferred||0;
          var funded = project.funded;
          var availableTransfer = funded-fundsTransferred;
          if (availableTransfer*1.1<1) return 'insufficient funds available for transfer';
          fundsTransferred+=availableTransfer;
          
          var future = new (Npm.require('fibers/future'))();
          var stripe = require("stripe")(
            StripeServerKey
          );
          stripe.transfers.create({
            amount: Math.floor(availableTransfer*.90),
            currency: Meteor.user().bank.currency,
            destination: Meteor.user().bank.account,
            transfer_group: project.slug,
          }, Meteor.bindEnvironment(function(err, transfer) {
            // asynchronously called
            if (err) return future.return(err.message);
            Projects.update({_id:project._id}, { $set: {fundsTransferred:fundsTransferred}});
            createReceipt({
              order: {
                transfer: true
              },
              title: project.title,
              slug: project.slug,
              owner: project.ownerId,
              amount: availableTransfer*0.9,
              purpose: 'transfer',
              receipt: transfer,
            });
            future.return('a $'+(availableTransfer*0.9).toFixed(2)+' transfer was made, and will be processed during the next business week');
          }));
          return future.wait();
        };
    },
    /** CRON 1 */
    projectsHousekeeping: function() {
        console.log(new Array(100).join('&'));
        var projects = Projects.find({}).fetch();
        // console.log(projects.length)
        // evaluate if donative offer expired

        // refund and remove donative offer 
    },
    onboardNewUser: function() {

        Meteor.users.update({_id: Meteor.user()._id}, {$set: {didOnboard: true}});
    },
    /** CREATE BLOG */
    createBlog: function(options) {
        check(options, Object);
        if (Meteor.isServer) {
          if (options._image) {
            var fn = guid() + new Date().getTime();
            uploadToS3({
              name: fn,
              data: options._image
            });
            options.image = 'https://s3-us-west-2.amazonaws.com/producehour/headshots/' + fn;
          } 
          options.banner = 'https://picsum.photos/1140/450?image=' + (Math.floor(Math.random() * 1084)+1);
          delete options['image'];
          options.created = new Date();
          options.author = {
            name: 'Bob Rich',
            avatar: 'https://s3-us-west-2.amazonaws.com/producehour/bob.png',
            description: 'Bob is an author, indipendent filmmaker, and advocate for open sourcing the production process. He\'s generously sharing his keen insights, observations, and experiences with the world at large, and we are fortunate to have his creative writing featured on our service.',
            id: 'h6hMjCTqgvju6S6ES'
          };
          var blog = Blogs.insert(options);      
        }
        if (Meteor.isClient) {
          vex.dialog.alert('new blog created');
        };
    },
    /** FLAG MATERIAL */
    flagComplaint: function(options) {
        check(options, Object);
        var html = prettyHtml(options, options.complaint);
        if (Meteor.isServer) sendEmailNotification('aug2uag@gmail.com', html, JSON.stringify(options, null, 4), 'FLAGGED CONTENT!!')
        if (Meteor.isClient) vex.dialog.alert('this content has been flagged for review, thank you for your report');
    },
    /** REVENUE SHARING - INITIAL PURCHASE */
    buyShares: function(options) {
        check(options, Object);
        var user = Meteor.user();
        var project = Projects.findOne({slug: options.slug});
        var totalShares = project.availableShares;
        var sharesPurchased = 0;
        var _shares = options.donationObject.shares;
        while (_shares> 0) {
          if (totalShares > _shares) {
            sharesPurchased+=_shares;
            totalShares-=_shares;
            _shares = 0;
          } else {
            _shares-=1;
          }
        };
        if (Meteor.isServer) {
          var stripe = require("stripe")(
            StripeServerKey
          );
          var future = new (Npm.require('fibers/future'))();
          options.amount = sharesPurchased * project.mpps;
          var stripeAmount = Math.floor(options.amount * 100);
          stripe.charges.create({
            amount: stripeAmount,
            currency: "usd",
            source: options.token.id,
            transfer_group: project.slug
          }, Meteor.bindEnvironment(function(err, charge) {
            if (err) return future.return(err.message);
            if (charge) {
              options.user = miniMe()

              options.user.email = myEmail()
              options.message = 'Purchase ' + options.shares + ' shares';
              options.uid = Meteor.user()&&Meteor.user()._id||'anon';
              options.slug = project.slug;
              options.created = new Date();
              delete options['token'];
              options.receipt = charge;

              /**
                create Shares
                deprecate availableShares
                */
              var d = new Date;
              var shares = Shares.insert({
                total: project.totalShares,
                shares: sharesPurchased,
                currentOwner: options.user,
                ownerHistory: [user._id],
                transactionDates: [d],
                lastTransaction: d,
                projectId: project._id,
                projectSlug: project.slug,
                projectName: project.title,
                earningsToDate: 0,
                earnings: [],
                projectOwner: {
                  name: project.ownerName,
                  id: project.ownerId 
                }
              }); 
              
              var projectShares = project.shares || [];
              projectShares.unshift(shares);
              var projectFunded = project.funded  + options.amount;

              // update project
              Projects.update({
                _id: project._id
              }, { 
                $set: { 
                  shares: projectShares, 
                  availableShares: totalShares,
                  funded: projectFunded
                }
              });
              // create receipt
              createReceipt({
                order: {
                  shares: true,
                  id: shares._id
                },
                title: project.title,
                slug: project.slug,
                owner: project.ownerId,
                amount: options.amount,
                purpose: 'shares purchase',
                receipt: charge
              });
              // create notification
              createNotification({
                user:project.ownerId,
                message: options.message,
                title: project.title,
                slug: project.slug,
                purpose: 'shares purchase'
              });

              var projectOwner = Users.findOne({_id: project.ownerId});
              var notification_preferences = projectOwner.notification_preferences || {};
              var email_preferences = notification_preferences.email || {};
              var phone_preferences = notification_preferences.phone || {};
              /**
                  sendEmailNotification(email, html, text, subject)
                  sendPhoneNotification(phone, body)
                */
              var textMessage = options.message;
              if (email_preferences.email&&email_preferences.verification===true) {
                /** send email notification */
                var html = emailToHTML('SHARES PURCHASE!', textMessage);
                sendEmailNotification(email_preferences.email, html, textMessage, 'New Shares Purchase from O . S . H .');
              }
              if (phone_preferences.phone&&phone_preferences.verification===true) {
                /** send phone notification */
                sendPhoneNotification(phone_preferences.phone, textMessage);
              }
              future.return('You purchased ' + sharesPurchased + ' shares at $' + project.mpps + ' per share. ' + new Date().toLocaleDateString() + ' @ O . S . H . Tell your friends about us on Facebook, Instagram, and Twitter. Tag us for you daily chance to win campaign shares!');
            } else {
              future.throw(new Meteor.Error("shares purchase", "payment failed"));
            }
          }));
          return future.wait();
        }
    },
    /** ENTER NEGOTIATIONS WITH APPLICANT */
    pokeApplicant: function(options) {
        check(options, Object);
        if (Meteor.isClient) return;
        /** update all offers from user to this project */
        var project = Projects.findOne({slug: options.slug});
        var updateObj = {
          $set: null
        };
        var crewApplicants = [];
        var ctx = options.ctx
        var position = options.position

        if (ctx==='crew') {
          (project.crewApplicants||[]).forEach(function(a) {
            if (a.uid === options.uid&&a.position===position) {
              a.poke = true;
              crewApplicants.push(a);
            }
          });
          updateObj = {
            $set: { crewApplicants: crewApplicants }
          };
        } else {
          (project.roleApplicants||[]).forEach(function(a) {
            if (a.uid === options.uid&&a.position===position) {
              a.poke = true;
              roleApplicants.push(a);
            }
          });
          updateObj = {
            $set: { roleApplicants: roleApplicants }
          };
        }

        Projects.update({slug: options.slug}, updateObj);
        /** send project message to initiate negotiations */
        var fullURL = 'https://csc5w.app.goo.gl?link=https://opensourcehollywood.org/message/project/' + options.slug + '/' + options.uid;
        var miniURL = getMiniURL(fullURL);
        var msg = (options.audition&&options.audition!=='N/A') ? 'You\'ve been selected to submit audition information for the ' + ctx + ' role "' + position + '", please upload your audition.' : 'You have been elected to negotiate your offer for the ' + ctx + ' role "' + position + '".';
        ProjectMessages.insert({
          project: options.project,
          slug: options.slug,
          title: project.title,
          user: options.uid,
          text: msg,
          ownerId: Meteor.user()._id,
          ownerName: 'OPEN SOURCE HOLLYWOOD',
          ownerAvatar: '/img/logo.png',
          createdAt: moment().format("MMMM D, YYYY"),
          createTimeActual: new Date()
        });
        notifyByEmailAndPhone({
          user: options.uid,
          title: 'Congratulations, you have been elected to negotiate your offer.',
          message: msg + ' at (you must be logged in) ' + miniURL,
          subject: 'Invitation to negotiate || O . S . H .'
        });
    },
    /** REJECT USER FROM PROJECT */
    rejectUserFromProject: function(offers) {
        check(offers, Array);
        if (Meteor.isClient) return;
        var message = '';
        var applicantId = offers[0]&&offers[0].offer&&offers[0].offer.user&&offers[0].offer.user.id||null
        if (!applicantId) return
        var slug = offers[0].slug
        var project = Projects.findOne({slug: slug});
        var message='Your application for '+project.title+' was declined.'
        var usersApplied = project.usersApplied;
        var idxApplied = usersApplied.indexOf(applicantId);
        usersApplied.splice(idxApplied, 1)
        var crewApplicants = project.crewApplicants
        var roleApplicants = project.roleApplicants
        var refunds = project.refunds||[]
        for (var i = crewApplicants.length - 1; i >= 0; i--) {
            var ca = crewApplicants[i]
            if (ca.user&&ca.user.id===applicantId) crewApplicants.splice(i, 1);
        };

        for (var i = roleApplicants.length - 1; i >= 0; i--) {
            var ra = roleApplicants[i]
            if (ra.user&&ra.user.id===applicantId) roleApplicants.splice(i, 1);
        };
        var stripeTransactions = []
        var receipts = []
        var refundAmount = 0

        for (var i = 0; i < offers.length; i++) {
            var o = offers[i]
            if (o.receipts) {
                o.receipts.forEach(function(receipt) {
                  stripeTransactions.push({
                      id: receipt.id,
                      amount: receipt.amount/100
                  })
                  refundAmount+=receipt.amount/100
                })
            };
        };
        if (refundAmount>0) message = [message, 'You were refunded $' + (refundAmount/100).toFixed(2) + '.'].join(' ');

        var stripe = require("stripe")(
            StripeServerKey
        );

        function declinedUserTransactionsProcess(o) {
            var tx = o&&o.id||null
            var amount = o&&o.amount||0
            if (!tx) {
                return finalRejectApplicantHandler();
            } else {
                return declinedUserRefund(tx, project, amount, receipts, function(err) {
                    return declinedUserTransactionsProcess(stripeTransactions.shift())
                })
            }
        }

        function finalRejectApplicantHandler() {
            refunds = refunds.concat(receipts)
            // reject all offers from this applicant to this project
            deleteRejectedOffers(offers)

            Projects.update({_id: project._id}, 
                { 
                $set: {
                  usersApplied: usersApplied,
                  crewApplicants: crewApplicants,
                  roleApplicants: roleApplicants,
                  refunds: refunds
                }
            })

            return createNotification({
                user:applicantId,
                message:message,
                title: project.title,
                slug: project.slug,
                purpose: 'declined'
            })
        }

        return declinedUserTransactionsProcess(stripeTransactions.shift())
    },
    /**
      acceptAgreement
      @params {Object}
          @params {Array} list of offers & decisions - offers
          @params {Object} project
            - slug
            - _id
          @params {Object} user
            - firstname
            - lastname
            - _id
    */
    authorFinalizeAgreement: function(options) {
        check(options, Object)
        approveUserToProject(options)
        markOffersPendingOff(options.offers)
        return true
    },
    /** COUNTER OFFER */
    counterRoleOffer: function(options) {
        check(options, Object);
        if (Meteor.isClient) return;
        // console.log('applicantCounterOffer');
        // console.log(new Array(100).join(' y'))
        // console.log(JSON.stringify(options, null, 4))
        var offerTypes = []
        var offerRoles = []
        var userObject = null
        var toDeleteId = []

        options.context.offers.forEach(function(o) {
          if (offerTypes.indexOf(o.ctx)===-1) offerTypes.push(o.ctx)
          if (offerRoles.indexOf(o.position)===-1) offerRoles.push(o.position)
          if (!userObject) userObject = o.user
          toDeleteId.push(o._id)
        })

        var o = Offers.findOne({_id: toDeleteId[0]})
        delete o['_id']
        delete o['offer']

        o.offer = {
          ctx: offerTypes.join(', '),
          position: offerRoles.join(', '),
          type: 'hired',
          pay: parseInt(options.counteroffer.financials)||0,
          equity: parseInt(options.counteroffer.equities)||0,
          slug: options.context.project.slug,
          appliedFor: offerRoles.join(', '),
          audition: 'N/A',
          uid: userObject.id,
          user: userObject,
          needsApplicantAction: true,
          authorCounterOffer: true,
          customTerms: options.negotiationTerms,
          customLimits: options.negotiationDamages
        }

        Offers.insert(o)
    },
    /** ADD AUDITION URL */
    addAuditionURL: function(options) {
          check(options, Object);
          /** options.url append to application object */
          if (Meteor.isClient) return;
          Offers.update({_id: options.offer._id}, {$set: { url: options.url }});
    },
    /** APPLICANT REJECTS COUNTER OFFER */
    applicantRejectOffer: function(options) {
      check(options, Object);
      if (Meteor.isServer) {
        var applicantId = options.user._id
        var project = Projects.findOne({_id: options.project._id});
        var usersApproved = project.usersApproved || [];
        var usersApplied = project.usersApplied || [];
        var crewApplicants = project.crewApplicants || [];
        var castApplicants = project.roleApplicants || []


        // refund moneys if any
        crewApplicants.forEach(function(a) {
          if (a.receipt) {
            declinedUserRefund(a.receipt.id, project, a.receipt.amount, null, function() {})
          }
        })

        castApplicants.forEach(function(a) {
          if (a.receipt) {
            declinedUserRefund(a.receipt.id, project, a.receipt.amount, null, function() {})
          }
        })


        // remove user from crewApplicants & roleApplicants
        for (var i = crewApplicants.length - 1; i >= 0; i--) {
          var a = crewApplicants[i]
          if (a.user.id===applicantId) crewApplicants.splice(i, 1)
        }

        for (var i = castApplicants.length - 1; i >= 0; i--) {
          var a = castApplicants[i]
          if (a.user.id===applicantId) castApplicants.splice(i, 1)
        }

        // remove offers ( user + project )
        deleteRejectedOffers(options.offers)

        // remove communications
        ProjectMessages.remove({user: options.user._id, project: project._id})
        // ProjectMessages.update({user: options.user._id, project: project._id}, {$set: {archived:true}})

        // email author and notify
        var projectAuthor = Users.findOne({_id: project.ownerId})
        var notification_preferences = projectAuthor.notification_preferences || {}
        var email_preferences = notification_preferences.email || {}
        var phone_preferences = notification_preferences.phone || {}
        /**
          sendEmailNotification(email, html, text, subject)
          sendPhoneNotification(phone, body)
        */
        var textMessage = 'Applicant rejected your counter-offer for campaign: ' + project.title + '. '
        if (email_preferences.email&&email_preferences.verification===true) {
            /** send email notification */
            var html = emailToHTML('counteroffer rejected', textMessage)
            sendEmailNotification(email_preferences.email, html, textMessage, 'Counteroffer rejected on O . S . H .')
        }

        if (phone_preferences.phone&&phone_preferences.verification===true) {
            /** send phone notification */
            sendPhoneNotification(phone_preferences.phone, textMessage)
        }

      }
    },
    /** APPLICANT FINALIZES AGREEMENT */
    applicantFinalizeAgreement: function(options) {
      check(options, Object);
      if (!Meteor.isClient) return;
      return approveUserToProject(options)
    },
    markMerchFulfillment: function(options) {
      check(options, Object)
      Receipts.update({
        _id: options._id
      }, {
        $set: {
          fulfilled: true
        }
      })
    },
    offerProjectAsset: function(options) {
      check(options, Object)

      if (Meteor.isClient) return;

      var project = options.project
      delete options['project']

      var me = Meteor.user()

      var o = {
          ctx: 'offer',
          type: 'assets',
          assets: options.assets,

          expressOffer: {
            offer: parseInt(options.offer),
            days: parseInt(options.days),
            message: options.message
          },

          offeror: me._id,
          offeree: project.ownerId,
          slug: project.slug,
          title: project.title,
          banner: project.banner,
          pending: true,
          offer: {
            ctx: 'assets',
            appliedFor: 'campaign asset leasing',
            message: 'campaign asset leasing',
            position: options.assets.map(function(a) { return a.name }).join(', '),
            amount: 0,
            paid: 0
          }
      }

      o.offer.user = miniMe()
      o.offer.user.email = myEmail()

      if (o.expressOffer.days) {
        var d = new Date()
        d.setHours(d.getHours() + ((o.expressOffer.days||10) * 24))
        o.expiration = d
      };

      o.created = new Date()

      var offer = Offers.insert(o)
      createNotification({
          user: o.offeree,
          message: ['You have a new request for leasing ', options.assets.map(function(a) { return a.name }).join(', '), ' assets. Please check your active negotiations under DASHBOARD to access this item.'].join(''),
          purpose: 'assets',
          offer: offer,
          title: 'New request for your assets.'
      })

      if (!o.offer.user.email)
        return 'You successfully offered this resource. Without your email notifications, your ability to be reached is limited. Please configure your email in your profile settings.'

      return 'You successfully offered this resource.'
      // if (me.notification_preferences&&me.notification_preferences.phone&&me.notification_preferences.phone.verification)
      //   o.offerorPhone = me.notification_preferences.phone.phone
    },
    addOfferMessage: function(options) {
      check(options, Object)

      if (Meteor.isClient) return;

      var o = Offers.findOne({_id: options.offer})

      var messages = o.messages||[]
      messages.push({
          text: options.text,
          ownerId: Meteor.user()._id,
          ownerName: Meteor.user().firstName + ' ' + Meteor.user().lastName,
          ownerAvatar:Meteor.user().avatar,
          createdAt: moment().format("MMMM D, YYYY"),
          createTimeActual: new Date()
      })

      Offers.update({_id: o._id}, {$set: {messages: messages}})
    },
    acceptAssetsOffer: function(options) {
      check(options, Object)
      if (Meteor.isClient) return;

      var me = Meteor.user()

      var project = Projects.findOne({slug: options.project.slug})
      var backers = project.backers || [];
      if (Meteor.user()&&Meteor.user()._id) {
        if (backers.indexOf(Meteor.user()._id)===-1) backers.push(Meteor.user()._id);
      };

      Projects.update({slug: project.slug}, { $set: { backers: backers } })

      createNotification({
        user: options.offer.offer.user.id,
        name: options.offer.offer.user.name,
        message: ['Your offer for leasing assets was accepted for the campaign ', options.project.title, '.'].join(''),
        title: options.project.title,
        slug: options.project.slug,
        purpose: 'assets',
        subject: ['Your offer for leasing assets was accepted for the campaign ', options.project.title, '.'].join('')
      })

      createReceipt({
        order: options,
        owner: options.offer.offer.user.id,
        email: myEmail(),
        slug: 'resource leasing',
        amount: options.offer.offer.amount,
        purpose: 'resource leasing'
      });

      markOffersPendingOff([options.offer])

      return 'Congratulations, you have leased this item. Please follow-up with the resource owner.'
    },
    rejectAssetsOffer: function(options) {
      check(options, Object)
      
      createNotification({
        user: options.offer.offer.user.id,
        name: options.offer.offer.user.name,
        message: ['Your offer for leasing assets was rejected for the campaign ', options.project.title, '.'].join(''),
        title: options.project.title,
        slug: options.project.slug,
        purpose: 'assets',
        subject: ['Your offer for leasing assets was rejected for the campaign ', options.project.title, '.'].join('')
      })

      rejectedOffers([options.offer])
    },
    /**
      @function
      subscription donation for projects and users
      distinguishes with `type` attribute
      */
    createSubscriptionDonation: function(options) {
      check(options, Object)
      if (Meteor.isClient) return;

      if (!Meteor.user()||!Meteor.user().customer) {
        return 'You must update your profile for this feature to be available.'
      };

      var model = options.type==='user' ? Users.findOne({_id:options.user}) : Projects.findOne({slug:options.slug})

      var customerId = Meteor.user().customer.id
      var donationId = model.donate.id
      options.stripeAmount = options.amount * 100

      var future = new (Npm.require('fibers/future'))();
      var stripe = require("stripe")(
        StripeServerKey
      );

      stripe.customers.createSource(customerId, {
        source: options.token.id
      }, Meteor.bindEnvironment(function(err, source) {
        if (err) future.return('There was an error processing your request, please try again.');
        stripe.plans.create({
          amount: options.stripeAmount,
          interval: options.frequency,
          product: donationId,
          currency: "usd",
        }, Meteor.bindEnvironment(function(err, plan) {
          // asynchronously called
          if (err) future.return('There was an error processing your request, please try again.');
          stripe.subscriptions.create({
            customer: customerId,
            items: [
              {
                plan: plan.id,
              },
            ]
          }, Meteor.bindEnvironment(function(err, subscription) {
              // asynchronously called
              if (err) future.return('There was an error processing your request, please try again.');

              options.subscription = subscription
              options.owner = Meteor.user()._id
              options.created = new Date()
              options.subscriber = miniMe()
              // create subscription object
              Subscriptions.insert(options)

              // update project funded
              if (options.slug) Projects.update({slug: options.slug}, {$inc: {funded: options.amount}})

              future.return('Your subscription was processed successfully.');

          }));
        }));
      }));
      return future.wait();
    },
    cancelSubscription: function(options) {
      check(options, Object)
      if (Meteor.isClient) return;
      var subscription = Subscriptions.findOne({
        _id: options._id
      })
      var future = new (Npm.require('fibers/future'))();
      var stripe = require("stripe")(
        StripeServerKey
      );
      stripe.subscriptions.del(
        subscription.subscription.id,
        Meteor.bindEnvironment(function(err, confirmation) {
          // asynchronously called
          if (err) future.return('Error canceling your subscription, try again or email us (hello@opensourcehollywood.org).');
          Subscriptions.update({_id: subscription._id}, {$set:{ archived:true, cancel:confirmation }})
          future.return('Subscription canceled.');
        }
      ));
      return future.wait(); 
    },
    leaseRequest: function(options) {
      check(options, Object)
      if (Meteor.isClient) return;
      var _id = options.offer._id

      function updateOfferLeaseReq() {
        var offer = Offers.findOne({ _id: _id})
        var msg1 = ['You have a new offer for your Asset. The offer includes time specifications, and may also include a payment of escrow that is pending your decision. We will automatically decline this offer if there is no response within 72 hours.'], msg2 = ['You have made an offer for assets with time specifications. We are now waiting for the owner of the assets to make their decision. If they reject your offer, you will be notified and your funds returned to you. Thanks for your order and for using O . S . H .'], msg3
        delete options['assets']
        delete options['offer']

        var u = { offereeDecision: true }

        if (options.receipt) {
          msg3 = [' An escrow payment of $', (options.receipt.amount/100).toFixed(2), ' is collected and available for this item upon approval.'].join('')
          u.receipt = options.receipt
          delete options['receipt']
        }
        
        u.consideration = options
        var d = new Date()
        u.offerMadeOn = d
        u.offerEndsOn = new Date(d.setHours(d.getHours() + 72))
        Offers.update({ _id: _id }, { $set: u })

        // create notifications for both parties
        var offereeMsg = msg3 ? msg2.concat(msg3).join(' ') : msg2.join('')
        var offerorMsg = msg3 ? msg1.concat(msg3).join(' ') : msg1.join('')
        createNotification({
            user: offer.offeror,
            message: offerorMsg,
            title: 'Assets leasing offer.',
            slug: 'Resource procurement for ' + myName() + '.',
            purpose: 'assets'
        })

        createNotification({
            user: offer.offeree,
            message: offereeMsg,
            title: 'Assets leasing offer.',
            slug: 'Resource procurement for ' + myName() + '.',
            purpose: 'assets'
        })
      }


      if (options.token) {

        var stripe = require("stripe")(
          StripeServerKey
        );


        var future = new (Npm.require('fibers/future'))();

        stripe.charges.create({
          amount: Math.floor(options.stripePaid * 100),
          currency: "usd",
          source: options.token.id,
          transfer_group: options.offer.offeror
        }, Meteor.bindEnvironment(function(err, charge) {
          if (err) return future.return(err.message);
          if (charge) {
            
            options.receipt = charge
            updateOfferLeaseReq()

            future.return('Your payment succeeded and is currently in escrow.\n\nYou may revoke your offer anytime prior to it\'s acceptance.');
          } else {
            future.throw(new Meteor.Error("error", "payment failed"));
          }
        }));

        return future.wait();

      };

      updateOfferLeaseReq()

    },
    directLeaseOffer: function(options) {
      check(options, Object)
      if (Meteor.isClient) return;

      // create offer in the state of offereeDecision  + consideration data etc. 
      var user = options.user // id, name, avatar
      var asset = options.assets[0]

      var me = Meteor.user()
      var d = new Date()

      var o = {
          ctx: 'offer',
          type: 'assets',
          assets: options.assets,

          expressOffer: {
            offer: parseInt(options.offer),
            days: parseInt(options.days),
            message: options.message
          },

          offeree: me._id,
          offeror: user.id,
          avatar: user.avatar,
          pending: true,
          offereeDecision: true,
          consideration: options,
          offerMadeOn: d,
          offerEndsOn: new Date(d.setHours(d.getHours() + 72)),
          offer: {
            ctx: 'assets',
            appliedFor: 'campaign asset leasing',
            message: 'campaign asset leasing',
            position: options.assets.map(function(a) { return a.name }).join(', '),
          }
      }

      o.offer.user = miniMe()
      o.offer.user.email = myEmail()
      o.created = new Date()
      
      function finishDirectLeaseOffer(isFuture) {
        var offer = Offers.insert(o)
        var msg = ['You have a new request for leasing ', o.assets.map(function(a) { return a.name }).join(', '), ' assets. Please check your active negotiations under DASHBOARD to access this item.']


        if (o.receipt) {
          msg = msg.concat([' An escrow payment of $', (o.receipt.amount/100).toFixed(2), ' is collected and available for this item upon approval.'].join(''))
        }

        createNotification({
            user: o.offeree,
            message: msg.join(''),
            purpose: 'assets',
            offer: offer,
            title: 'New request for your assets.'
        })

        if (isFuture) {
          if (!o.offer.user.email)
            return future.return('You successfully offered this resource. Without your email notifications, your ability to be reached is limited. Please configure your email in your profile settings.')

          future.return('You successfully mad the offer requesting this resource.')
        } else {
          if (!o.offer.user.email)
            return 'You successfully offered this resource. Without your email notifications, your ability to be reached is limited. Please configure your email in your profile settings.'

          return 'You successfully mad the offer requesting this resource.' 
        }  
      }

      if (options.token) {
        console.log('in token handler')
        var future = new (Npm.require('fibers/future'))();
        var stripe = require("stripe")(
            StripeServerKey
        );
        stripe.charges.create({
          amount: Math.floor(options.stripePaid * 100),
          currency: "usd",
          source: options.token.id,
          transfer_group: options.user.id
        }, Meteor.bindEnvironment(function(err, charge) {
          if (err) return future.return(err.message);
          if (charge) {
            o.receipt = charge
            finishDirectLeaseOffer(true)
          } else {
            future.throw(new Meteor.Error("error", "payment failed"));
          }
        }));
        return future.wait();
      } else {
        finishDirectLeaseOffer()
      }

    },
    revokeLeaseRequest: function(options) {
      check(options, Object)
      if (Meteor.isClient) return
      var offer = Offers.findOne({ _id: options._id })
      if (options.receipt) {
        var future = new (Npm.require('fibers/future'))();
        var stripe = require("stripe")(
            StripeServerKey
        );
        stripe.refunds.create({
            charge: options.receipt.id,
        }, Meteor.bindEnvironment(function(err, receipt) {
            if (err) return future.return(err.message);

            Offers.update({ _id: options._id }, {
              $set: {
                rejected: true,
                pending: false,
                refund: receipt
              }
            })


            console.log('did refund ok')

            createNotification({
                user: offer.offeree,
                message: ['Your offer for leasing ', options.assets.map(function(a) { return a.name }).join(', '), ' assets was rejected, and you were refunded your escrow amount of $', options.receipt.amount/100, ' that will be automatically transferred to you.'].join(''),
                purpose: 'assets',
                offer: options._id,
                title: 'Your request for assets was rejected.'
            })

            future.return('You have successfully revoked your offer, and were refunded your escrow.\n\nThe funds will apply in 2 - 3 business days to the source of the original payment.');
        }));

        return future.wait();
      };

      Offers.update({ _id: options._id }, {
        $set: {
          rejected: true,
          pending: false,
        }
      })

      createNotification({
          user: offer.offeror,
          message: ['Your offer for leasing ', options.assets.map(function(a) { return a.name }).join(', ') ,' assets was revoked.'].join(''),
          purpose: 'assets',
          offer: options._id,
          title: 'Your request for assets was revoked.'
      })

      return 'You have successfully revoked this offer.'
      // refund if receipt
      // update object to rejected
      // notify rejection and/or refund 
    },
    rejectLeaseRequest: function(options) {
      check(options, Object)
      if (Meteor.isClient) return
      // refund if receipt
      // update object to rejected
      // notify rejection and/or refund 
      if (options.receipt) {
        var future = new (Npm.require('fibers/future'))();
        var stripe = require("stripe")(
            StripeServerKey
        );
        stripe.refunds.create({
            charge: options.receipt.id,
        }, Meteor.bindEnvironment(function(err, receipt) {
            if (err) return future.return(err.message);

            Offers.update({ _id: options._id }, {
              $set: {
                rejected: true,
                pending: false,
                refund: receipt
              }
            })

            createNotification({
                user: options.offeree,
                message: ['Your offer for leasing ', options.assets.map(function(a) { return a.name }).join(', '), ' assets was rejected, and you were refunded your escrow amount of $', options.receipt.amount/100, ' that will be automatically transferred to you.'].join(''),
                purpose: 'assets',
                offer: options._id,
                title: 'Your request for assets was rejected.'
            })

            future.return('You have successfully rejected this offer, and any escrow money deposited was refunded.');
        }));

        return future.wait();
      };

      Offers.update({ _id: options._id }, {
        $set: {
          rejected: true,
          pending: false,
        }
      })

      createNotification({
          user: offer.offeree,
          message: ['Your offer for leasing ', options.assets.map(function(a) { return a.name }).join(', ') ,' assets was rejected.'].join(''),
          purpose: 'assets',
          offer: options._id,
          title: 'Your request for assets was rejected.'
      })

      return 'You have successfully rejected this offer.'
    },
    approveLeaseRequest: function(options) {
      check(options, Object)
      console.log('in approveLeaseRequest')
      console.log(options)
      if (Meteor.isClient) return
      // update object to completed
      // money transfer to offeree

      if (options.receipt) {

        // transfer 92% of funds to offeror


      };

      Offers.update({ _id: options._id }, {
        $set: {
          accepted: true,
          pending: false,
        }
      })

      console.log('offer updated')

      createNotification({
          user: options.offeree,
          message: ['Your offer for leasing ', options.assets.map(function(a) { return a.name }).join(', ') ,' assets was accepted.'].join(''),
          purpose: 'assets',
          offer: options._id,
          title: 'Your request for assets was accepted.'
      })

      var msg = ['You have now accepted to lease these assets.']
      if (options.receipt) {
        msg = msg.concat([['$', (options.receipt.amount/100), ' was applied to your account.'].join('')])
      };

      return msg.join(' ')

    },
    editExpressOffer: function(_id, options) {
      check(_id, String)
      check(options, Object)
      if (Meteor.isClient) return
      var u = {}
      if (options.offer) u['expressOffer.offer'] = options.offer
      if (options.message) u['expressOffer.message'] = options.message

      Offers.update({ _id: _id }, {
        $set: u
      })
    }
}); 

