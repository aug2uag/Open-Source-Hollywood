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
// var stripe = require("stripe")(
//   StripeServerKey
// );

function DEBUG(char, num) {
  console.log(new Array(num).join(char))
}


function myName() {
  if (!Meteor.user()) return 'anonymous patron';
  return Meteor.user().firstName + ' ' + Meteor.user().lastName;
}

function notifyByEmailAndPhone(options) {
  // user, title, message, subject
  var recipient = Users.findOne({_id: options.user});

  console.log('options notifyByEmailAndPhone:')
  console.log(options)
  console.log(new Array(100).join('9 '))
  console.log(recipient)

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
    from: Meteor.user()&&Meteor.user()._id||'anon',
    avatar: Meteor.user()&&Meteor.user().avatar||'https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Gold_Star.svg/2000px-Gold_Star.svg.png',
    title: options.title,
    slug: options.slug,
    purpose: options.purpose,
    created: new Date()
  });

  notifyByEmailAndPhone({
    user: options.user,
    message: options.message,
    title: options.title,
    subject: options.title
  });
}

function createReceipt(options) {
  /**
    NEEDS:
  title, slug, amount, purpose, receipt
    */
  if (!Meteor.user()) return;
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

function declineOfferAndRemove(options) {
    console.log(new Array(10).join('$ '))
    console.log('in declineOfferAndRemove')
    Offers.remove/*update*/({
        'user.id': options.applicantId,
        slug: options.slug,
        position: options.position,
        type: options.type,
        ctx: options.ctx
    }/*, {
        $set: { 
            declined: true,
            completed: true
        }
    }*/)
}

function approveAndUpdateOffer(options) {
    console.log(new Array(10).join('* '))
    console.log('in approveAndUpdateOffer')
    Offers.update({
        'user.id': options.applicantId,
        slug: options.slug,
        position: options.position,
        type: options.type,
        ctx: options.ctx
    }, {
        $set: { 
            declined: false,
            completed: true
        }
    })
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
            amount: amount,
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
          console.log(new Array(100).join('#'))

          phone = phone.replace(/\D/g,'');
          console.log(phone)
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
        if (Meteor.isClient&&options.showDialog) {
          vex.dialog.alert('Your profile was updated', function() {
            Router.go('Home');
          });
        } else {
          var ipAddr = this.connection&&this.connection.clientAddress||'127.0.0.1';
          var userAgent = this.connection.httpHeaders['user-agent'];
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
                  console.log('in upgradeProfile 1')
                  console.log('failed to bind environment')
                }));
              }, function() {
                console.log('in upgradeProfile 2')
                console.log('failed to bind environment')
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
            if (!Meteor.user().account) {
              var stripe = require("stripe")(
                StripeServerKey
              );
              stripe.accounts.create({
                country: 'US',
                type: 'custom',
                "tos_acceptance" : {
                  "date" : Math.round(new Date().getTime()/1000),
                  "ip" : ipAddr,
                  "user_agent" : userAgent
                }
              }, Meteor.bindEnvironment(function(err, account) {
                if (err) {
                  console.log(err)
                };
                // asynchronously called
                if (account) {
                  Meteor.users.update({_id: Meteor.user()._id}, {$set: { account: account }});
                };
              }));
            };
          };
        }
    },
    /** DEFAULT VIRTUAL ACCOUNT */
    createBankingAccount: function() {
        if (!Meteor.user().account) {
          var ipAddr = this.connection&&this.connection.clientAddress||'127.0.0.1';
          var userAgent = this.connection.httpHeaders['user-agent'];
          var stripe = require("stripe")(
            StripeServerKey
          );
          stripe.accounts.create({
            country: 'US',
            type: 'custom',
            "tos_acceptance" : {
              "date" : Math.round(new Date().getTime()/1000),
              "ip" : ipAddr,
              "user_agent" : userAgent
            }
          }, Meteor.bindEnvironment(function(err, account) {
            if (err) {
              console.log(err)
            };
            // asynchronously called
            if (account) {
              Meteor.users.update({_id: Meteor.user()._id}, {$set: { account: account }});
            };
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
        var shouldExit = false;
        check(options, Object);
        var ownerId = Meteor.user()._id,
            slug = ownerId.substr(ownerId.length - 4) + new Date().getTime(),
            _user = {
              userId: ownerId,
              isAdmin: true
            },
            permission = 'public',
            members = [_user],
            future;

        // does project with the same name exist for this producer?
        // https://maps.googleapis.com/maps/api/geocode/json?components=postal_code=01210|country:PL&key=AIzaSyDDUJ4ZQNWvF4x2C7AbnPR8-PZEoQGCnLs
        // https://maps.googleapis.com/maps/api/geocode/json?components=postal_code=91316|country:US&key=AIzaSyDDUJ4ZQNWvF4x2C7AbnPR8-PZEoQGCnLs
        if (Meteor.isServer) {
          future = new (Npm.require('fibers/future'))();
          var previousProjectExists = Projects.findOne({title: options.title})
          if (previousProjectExists) {
            console.log('project already exists')
            future.throw(new Meteor.Error("Error: duplicate title", "This campaign contains a title identical to a previous project of yours. Please update the campaign to a new title so it is unique."))
            return
          }
          if (/** country ==US, postal_code is 5 digits */!options.country||options.country==='US') {
            if (!options.zip.match(/\d{5}/)) {
              if(future)future.throw(new Meteor.Error("invalid zip", "Invalid postal code, please enter a valid one."));
            };
          };
          var requestParams = {
            uri:    ['https://maps.googleapis.com/maps/api/geocode/json?address=',options.zip,',',options.country||'US','&key=AIzaSyDDUJ4ZQNWvF4x2C7AbnPR8-PZEoQGCnLs'].join(''),
            method: 'GET'
          };
          request( requestParams, Meteor.bindEnvironment(function ( err, response, geoOptions ) {

            if (geoOptions) {
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
              options.purpose = options.category;

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
              createNotification({
                user: options.ownerId,
                message: 'You created a new campaign.',
                title: options.title,
                slug: options.slug,
                purpose: 'new campaign'
              });

              if(future)future.return('Project created! Check your Dashboard for information about applicants, and to share your project with the world.');
            } else {
              if(future)future.throw(new Meteor.Error("campaign create", "Invalid location, please enter a valid location code."));
            }
          }));
          if (future) return future.wait();
        };     
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
      options.user = {
        id: Meteor.user()._id,
        name: myName(),
        avatar: Meteor.user().avatar
      }
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
        if (options.type==='sourced') {
          // set date to object and sanitize
          var d = new Date();
          var defaultDate = d.setHours(d.getHours()+(24*3));
          if (!options.expires) {
            options.expires=defaultDate;
          } else {
            options.expires = new Date(options.expires);
            var _d = new Date();
            if (options.expires<_d) return cb('you selected an invalid expiration');
          }
        };
        var key=options.ctx==='crew'?'crewApplicants':'roleApplicants';
        if (Meteor.isServer) {
          var project = Projects.findOne({slug: options.slug});
          var __key =options.ctx==='crew'?'crew':'cast';
          options.audition = project[__key].audition||'N/A';
          var usersApplied = project.usersApplied;
          options.uid = Meteor.user()._id;
          if (usersApplied.indexOf(options.uid)===-1) usersApplied.push(options.uid);
          options.user = {
            id: Meteor.user()._id,
            name: myName(),
            avatar: Meteor.user().avatar
          }
          options.created = new Date();
          var mappedValues = project[key] || [];
          var mappedStings = mappedValues.map(function(o){return o.user.id});
          // prevent duplicates
          var updateObj = {$set:{usersApplied: usersApplied}};
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
              message: options.message,
              title: project.title,
              slug: project.slug,
              purpose: 'apply'
            });
          }

          // console.log(options)
          // console.log('\n-- -- --\n')
          var successMessage = 'you have successfully applied for ' + options.appliedFor;
          if (options.type==='hired'||!options.pay) {
            saveToProject();
            Offers.insert(options);
            // console.log('applied for hire')
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
                  var html = emailToHTML('NEW APPLICANT!', textMessage);
                  sendEmailNotification(email_preferences.email, html, textMessage, 'New Applicant from O . S . H .');
                }

                if (phone_preferences.phone&&phone_preferences.verification===true) {
                  /** send phone notification */
                  sendPhoneNotification(phone_preferences.phone, textMessage);
                }

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
              options.user = {
                id: Meteor.user()&&Meteor.user()._id||'anon',
                name: myName(),
                avatar: Meteor.user()&&Meteor.user().avatar||'/img/star.png'
              }
              options.message = options.user.name+' purchased '+options.gift.name+' for $'+options.amount.toFixed(2);
              options.uid = Meteor.user()&&Meteor.user()._id||'anon';
              options.slug = project.slug;
              options.created = new Date();
              delete options['token'];
              delete options.gift['data'];
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
                user: options.user
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
                message: options.message,
                title: project.title,
                slug: project.slug,
                purpose: 'gift purchase'
              });
              // create offer notice
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
                var html = emailToHTML('GIFT PURCHASE!', textMessage);
                sendEmailNotification(email_preferences.email, html, textMessage, 'New Gift Purchase from O . S . H .');
              }

              if (phone_preferences.phone&&phone_preferences.verification===true) {
                /** send phone notification */
                sendPhoneNotification(phone_preferences.phone, textMessage);
              }

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
        if (Meteor.isServer) {
          var user = Users.findOne({_id: options.uid});
          options.uid = Meteor.user()&&Meteor.user()._id||'anon';
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
              options.user = {
                id: Meteor.user()&&Meteor.user()._id||'anon',
                name: myName(),
                avatar: Meteor.user()&&Meteor.user().avatar||'/img/star.png'
              }
              options.message = options.user.name+' purchased '+options.gift.name+' for $'+options.amount.toFixed(2);
              options.uid = Meteor.user()&&Meteor.user()._id||'anon';
              options.created = new Date();
              options.receipt = charge;
              options.purchaser = myName();
              delete options.gift['data'];
              var giftPurchases = user.giftPurchases || [];
              giftPurchases.push(options);

              // update project
              Meteor.users.update({_id: user._id}, {$set: {giftPurchases: giftPurchases}});
              // create receipt
              createReceipt({
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
              // create offer notice
              Offers.insert(options);
              
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

              future.return('your gift purchase was successful, your order will be fulfilled by ' + options.artistName);
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
          
          var project = Projects.findOne({slug: options.slug});
          delete options['slug'];
          var usersApplied = project.usersApplied;
          
          var usersApproved = project.usersApproved || [];
          var equityAllocated = project.equityAllocated || 0;
          var funded = project.funded || 0;
          var applicants = project[key];
          var message = options.user.name + ' was approved for ';

          var key=options.ctx==='crew'?'crewApplicants':'roleApplicants';
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
            // make notification
            createNotification({
              user:options.user.id,
              message: options.user.name+' donated $'+options.pay+'!',
              title: project.title,
              slug: project.slug,
              purpose: 'donation'
            });
          }

          // give user permission to board
          var board = Boards.findOne({slug: project.slug});
          // if member not in board then add
          Boards.update({slug: project.slug}, { $push: { members: {
            "userId" : options.user.id,
            "isAdmin" : false
          }}});

          function finalUpdateHandler(idx) {
            /** TODO: automatically reject other users applying for the same role?? */
            // add user to project
            applicants.splice(i,1);
            var uid = options.user.id;
            if (usersApplied.indexOf(uid)>-1) {
              var idx = usersApplied.indexOf(uid);
              usersApplied.splice(idx, 1);
            };
            if (usersApproved.indexOf(uid)===-1) usersApproved.push(uid);
            var updateObj = { 
              usersApplied: usersApplied, 
              usersApproved: usersApproved, 
              equityAllocated: equityAllocated, 
              funded: funded 
            };
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
            if (options.ctx===el.ctx&&options.type===el.type&&options.pay===el.pay&&options.equity===el.equity&&options.appliedFor===el.appliedFor&&options.created.toString()===el.created.toString()) {
              if (options.receipt&&el.receipt) {
                if (options.receipt.id===el.receipt.id) {
                  // console.log('222222222222222222222222222')
                  return finalUpdateHandler(i);
                };
              } else {
                // console.log('11111111111111111111111111111111')
                return finalUpdateHandler(i);
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
        if (Meteor.isServer) {
          check(options, Object);
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
          notifyByEmailAndPhone({
            user: options.user,
            title: 'You have an update in your negotiations.',
            message: 'Please visit (you must be logged in) ' + miniURL,
            subject: 'Negotiations Update'
          });
        } 
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
              title: project.title,
              slug: project.slug,
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
              options.user = {
                id: Meteor.user()&&Meteor.user()._id,
                name: myName(),
                avatar: Meteor.user()&&Meteor.user().avatar
              }
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
                title: project.title,
                slug: project.slug,
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







    /** REJECT USER FROM PROJECT */
    rejectUserFromProject: function(offers) {
        check(offers, Array);
        var message = '';
        if (Meteor.isServer) {
            var applicantId = offers[0]&&offers[0].user&&offers[0].user.id||null
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
                if (o.receipt) {
                    stripeTransactions.push({
                        id: o.receipt.id,
                        amount: o.pay
                    })
                    refundAmount+=o.receipt.amount
                };
            };

            if (refundAmount>0) message = [message, 'You were refunded $' + (refundAmount/100).toFixed(2) + '.'].join(' ');

            var stripe = require("stripe")(
                StripeServerKey
            );

            function declinedUserTransactionsProcess(o) {
                var tx = o.id
                var amount = o.amount
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
                Offers.remove({
                'user.id': applicantId,
                slug: slug
                    }, {
                    $set: { 
                        declined: true,
                        completed: true
                    }
                }, { multi: true })

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

            };
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
        check(options, Object);

        function filterOffers(o, forApprove, amountFunded) {
            // add approved offers to list of approved
            var keys = Object.keys(o)
            var decision = keys[0]
            var offer = o[decision]

            // accept is set in projectMessage.js
            if ((forApprove && decision==='accept')||(!forApprove&&decision!=='approve')) {
              // if donation offer, add to amountApplied
              if (o.type==='sourced'&&o.pay>0&&amountFunded!==null) {
                amountFunded += o.pay;
              };
              return offer
            } 
        }

        var applicantId = options.user._id

        var applicantName = options.user.firstName||'' + ' ' + options.user.lastName||''
        if (!applicantName.trim()) applicantName = 'applicant';
        if (Meteor.isServer&&options.project&&options.project._id) {
            var project = Projects.findOne({_id: options.project._id});


            // is the user the project author or applicant ???
            var isAuthor = project.ownerId===Meteor.user()._id ? true : false


            // console.log(new Array(100).join(' i'))
            // console.log(project)
            var negotiations = project.negotiations || [];

            // console.log('\nnegotations:')
            // console.log(negotiations)

            var agreementsFinal = project.agreementsFinal || [];
            var usersApproved = project.usersApproved || [];
            var usersApplied = project.usersApplied || [];
            var crewApplicants = project.crewApplicants || [];
            var castApplicants = project.roleApplicants || [];
            var equityAllocated = project.equityAllocated || 0;
            var funded = project.funded || 0;
            var message = options.user.firstName + ' ' + options.user.lastName + ' was approved for a role in the campaign named ' + options.project.title + '. ';

            // list of approved roles
            var offersAgg = [], userUID, slugID, malformedDetection, amountFunded = 0;
            var offers = options.offers.filter(function(o) {
                return filterOffers(o, true, amountFunded)
            }).map(function(o) {
                return o.accept
            });


            // refund declined offers if they have receipt
            var declinedOffers = options.offers.filter(function(o) {
                return filterOffers(o, false, null)
            }).map(function(o) {
                return o.decline
            });

            offers.forEach(function(o) {
                approveAndUpdateOffer({
                    applicantId: applicantId,
                    slug: project.slug,
                    position: o.position,
                    type: o.type,
                    ctx: o.ctx
                })
            })

            // each declined function remove offer and refund where appropriate
            declinedOffers.forEach(function(o) {
                if (o&&o.receipt) {
                    var receipt = o.receipt
                    console.log(new Array(100).join('8 '))
                    console.log('do decline user && refund / reject offer')
                    declinedUserRefund(receipt.id, project, o.pay, null, function() {
                        declineOfferAndRemove({
                            applicantId: applicantId,
                            slug: project.slug,
                            position: o.position,
                            type: o.type,
                            ctx: o.ctx
                        })
                    })
                }
            })

            console.log(new Array(100).join('k '))
            console.log(JSON.stringify(offers, null, 4))
            console.log(new Array(100).join('| '))
            console.log(JSON.stringify(declinedOffers, null, 4))
            // return

            // console.log('\offersAgg:')
            // console.log(offersAgg)

            if (!offers.length) return false;

            var priceToPay = 0
            var amountReceivable = 0
            var equityOut = 0


            // price to pay / equity to distribute
            offers.forEach(function(o) {
                if (o.type==='hired') priceToPay += o.pay||0
                else amountReceivable += o.amount||0
                console.log('o.equity =', o.equity)
                equityOut += o.equity||0
            })

            if (priceToPay&&priceToPay>0) {
                message += project.ownerName + ' agrees to pay ' + applicantName + ' ' + priceToPay + ' USD for their role. ';
            };

            if (equityOut&&equityOut>0) {
                message += project.ownerName + ' agrees to pay ' + applicantName + ' ' + equityOut + ' shares in the ownership of the campaign. ';
            };

            if (amountReceivable>0) {
                message += 'Applicant agrees to pay ' + amountReceivable + ' USD towards costs for their role.';
            };

            // create notification object
            createNotification({
                user:options.user._id,
                message: message,
                title: options.project.title,
                slug: options.project.slug,
                purpose: 'approved'
            });

            // add to finalAgreements
            agreementsFinal.push({
                uid: options.user._id,
                roles: offers,
                message: message,
                priceToPay: priceToPay,
                amountReceivable: amountReceivable,
                equityOut: equityOut
            })

            // remove applicant from list of applicants
            for (var i = castApplicants.length - 1; i >= 0; i--) {
                var r = castApplicants[i]
                if (r.user.id===applicantId) castApplicants.splice(i, 1);
            };

            for (var i = crewApplicants.length - 1; i >= 0; i--) {
                var r = crewApplicants[i]
                if (r.user.id===applicantId) crewApplicants.splice(i, 1);
            };

            // update project
            if (usersApproved.indexOf(userUID)===-1) usersApproved.push(userUID);
            var updateObj = { 
                usersApplied: usersApplied, 
                usersApproved: usersApproved, 
                equityAllocated: equityAllocated + equityOut, 
                funded: funded + amountFunded,
                crewApplicants: crewApplicants,
                roleApplicants: castApplicants,
                agreementsFinal: agreementsFinal
            };


            console.log('update project, board, and message:')
            console.log(updateObj)

            Projects.update({_id: project._id}, { $set: updateObj });

            // update board
            var board = Boards.findOne({slug: project.slug});
            // if member not in board then add
            var boardMembers = board.members;
            var notInBoard = true;
            boardMembers.forEach(function(m) {
                if (m.userId===userUID) {
                  notInBoard = false;
                  return;
                };
            });

            if (notInBoard) {
                Boards.update({slug: project.slug}, { $push: { members: {
                  "userId" : options.user._id,
                  "isAdmin" : false
                }}});
            };

            // archive communications





            ProjectMessages.update({user: options.user._id, project: project._id}, {$set: {archived:true}});

            // notify applicant of the decision
            var projectApplicant = Users.findOne({_id: options.user._id});
            var notification_preferences = projectApplicant.notification_preferences || {};
            var email_preferences = notification_preferences.email || {};
            var phone_preferences = notification_preferences.phone || {};
            /**
              sendEmailNotification(email, html, text, subject)
              sendPhoneNotification(phone, body)
            */
            var textMessage = 'Congratulations! You were selected and approved to join the campaign titled: ' + project.title + '. You now have access to the project board where tasks will be assigned to you. To access the board, view the project page from the main screen or from your DASHBOARD.';
            if (email_preferences.email&&email_preferences.verification===true) {
                /** send email notification */
                var html = emailToHTML('YOU ARE ON A NEW CAMPAIGN!', textMessage);
                sendEmailNotification(email_preferences.email, html, textMessage, 'Approval Notice from O . S . H .');
            }

            if (phone_preferences.phone&&phone_preferences.verification===true) {
                /** send phone notification */
                sendPhoneNotification(phone_preferences.phone, textMessage);
            }

            return true;
        };
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
  /** TOGGLE OFFER DURING NEGOTIATION */
  approveOrDenyRole: function(options) {
        check(options, Object);
        /** find role, update role */
        if (Meteor.isServer) {
          options.declined = options.declined || false;
          options.declined = !options.declined;
          Offers.update({_id: options._id}, options);
        };
  },
  /** ADD AUDITION URL */
  addAuditionURL: function(options) {
        check(options, Object);
        /** options.url append to application object */
        if (Meteor.isClient) return;
        Offers.update({_id: options.offer._id}, {$set: { url: options.url }});
  },
  /** UPDATE OFFER AGREEMENT */
  updateProjectNegotiations: function(options) {
        check(options, Object);
        if (Meteor.isServer&&options.ctx&&options.ctx.project&&options.ctx.project._id) {
          var project = Projects.findOne({_id:options.ctx.project._id});
          var negotiations = project.negotiations || [];
          var negotiatedRole, idx = 0;
          for (var i = 0; i < negotiations.length; i++) {
            if (negotiations[i].id === options.ctx.user._id) {
              negotiatedRole = negotiations[i];
              idx = i;
              break;
            };
          };
          negotiatedRole = negotiatedRole || {};
          negotiatedRole.id = negotiatedRole.id || options.ctx.user._id;
          negotiatedRole.signature = {};
          negotiatedRole.applicantVerified = false;
          negotiatedRole.authorVerified = false;
          negotiatedRole[options.switch] = options.value;
          negotiations[idx] = negotiatedRole;
          Projects.update({_id:project._id}, { $set: {negotiations:negotiations}});
        };
  },
  /** LOCK AGREEMENT AND OFFER TO APPLICANT */
  authorInitAgreement: function(options) {
        check(options, Object);
        /** does currentNegotiation exist? if not create */
        if (Meteor.isServer&&options.ctx&&options.ctx.project&&options.ctx.project._id) {
          var project = Projects.findOne({_id:options.ctx.project._id});
          var negotiations = project.negotiations || [];
          var negotiatedRole, idx = 0;
          for (var i = 0; i < negotiations.length; i++) {
            if (negotiations[i].id === options.ctx.user._id) {
              negotiatedRole = negotiations[i];
              idx = i;
              break;
            };
          };
          negotiatedRole = negotiatedRole || {};
          negotiatedRole.id = negotiatedRole.id || options.ctx.user._id;
          negotiatedRole.negotiationRoles = options.negotiationRoles;
          negotiatedRole.negotiationTerms = options.negotiationTerms;
          negotiatedRole.negotiationDamages = options.negotiationDamages;
          negotiatedRole.financials = options.financials;
          negotiatedRole.equities = options.equities;
          negotiatedRole.authorVerified = true;
          negotiations[idx] = negotiatedRole;
          Projects.update({_id:project._id}, { $set: {negotiations:negotiations}});
        };
  },
  /** APPLICANT FORMAL OFFER */
  applicantVerifyAgreement: function(options) {
        check(options, Object);
        console.log('applicantVerifyAgreement');
        if (Meteor.isServer&&options.project&&options.project._id) {
          var project = Projects.findOne({_id:options.project._id});
          var negotiations = project.negotiations || [];
          var negotiatedRole, idx = 0;
          for (var i = 0; i < negotiations.length; i++) {
            if (negotiations[i].id === options.user._id) {
              negotiatedRole = negotiations[i];
              idx = i;
              break;
            };
          };
          if (negotiatedRole) {
            negotiatedRole.applicantVerified = true;
            negotiations[idx] = negotiatedRole;
            Projects.update({_id:project._id}, { $set: {negotiations:negotiations}});
          };
        };
  },
  /** APPLICANT COUNTER OFFER */
  applicantCounterOffer: function(options) {
        check(options, Object);
        console.log('applicantCounterOffer');
        if (Meteor.isServer&&options.project&&options.project._id) {
          var project = Projects.findOne({_id:options.project._id});
          var negotiations = project.negotiations || [];
          var negotiatedRole, idx = 0;
          for (var i = 0; i < negotiations.length; i++) {
            if (negotiations[i].id === options.user._id) {
              negotiatedRole = negotiations[i];
              idx = i;
              break;
            };
          };
          if (negotiatedRole) {
            console.log(new Array(100).join('8'))
            negotiatedRole.applicantVerified = false;
            negotiatedRole.authorVerified = false;
            negotiations[idx] = negotiatedRole;
            Projects.update({_id:project._id}, { $set: {negotiations:negotiations}});
          };
        };
  },
  /** APPLICANT FINALIZES AGREEMENT */
  applicantFinalizeAgreement: function(options) {
        check(options, Object);
        if (Meteor.isServer&&options.project&&options.project._id) {
          var project = Projects.findOne({_id: options.project._id});
          var negotiations = project.negotiations;
          var usersApproved = project.usersApproved || [];
          var usersApplied = project.usersApplied || [];
          var crewApplicants = project.crewApplicants || [];
          var castApplicants = project.roleApplicants || [];
          var equityAllocated = project.equityAllocated || 0;
          var funded = project.funded || 0;
          var message = options.user.firstName + ' ' + options.user.lastName + ' was approved for a role in the campaign named ' + options.project.title + '. ';

          // list of approved roles
          var offersAgg = [], userUID, slugID, malformedDetection, amountFunded = 0;
          options.offers.forEach(function(o) {
            if (!o.declined) {
              /** add offer to approved */
              if (!userUID&&!slugID) {
                userUID = o.uid;
                slugID = o.slug;
              } else {
                // prevent malicious data
                if (userUID!==o.uid||slugID!==o.slug) {
                  malformedDetection = true;
                  return;
                };
              }
              // if donation offer, add to amountApplied
              if (o.type==='sourced'&&o.pay>0) {
                amountFunded += o.pay;
              };
              offersAgg.push(o);
            };
          });

          if (malformedDetection) return false;

          // find negotiation object
          var negotiationObject;
          negotiations.forEach(function(n) {
            if (n.id===userUID) {
              negotiationObject = n;
              return;
            };
          });

          // price to pay / equity to distribute
          var priceToPay = negotiationObject.financials&&parseInt(negotiationObject.financials);
          var equityOut = negotiationObject.equities&&parseInt(negotiationObject.equities);

          if (priceToPay&&priceToPay>0) {
            message += 'Agreed to pay ' + priceToPay + ' USD for this role. ';
          };

          if (equityOut&&equityOut>0) {
            message += 'Agreed to assign ' + equityOut + ' shares in the ownership of the campaign. ';
          };

          if (amountFunded>0) {
            message += 'Applicant agreed to pay ' + amountFunded + ' USD that was applied to your campaign funds.';
            createNotification({
              user:options.user._id,
              message: options.user.firstName+' '+options.user.lastName+' donated $'+amountFunded+'!',
              title: project.title,
              slug: project.slug,
              purpose: 'donation'
            });
          };

          // create notification object
          createNotification({
            user:options.user._id,
            message: message,
            title: options.project.title,
            slug: options.project.slug,
            purpose: 'approved'
          });

          // remove applicant from list of applicants
          offersAgg.forEach(function(o) { 
            var arr=o.ctx==='crew'?crewApplicants:castApplicants;
            for (var i = arr.length - 1; i >= 0; i--) {
              var itm = arr[i];
              if (itm.uid===userUID) {
                arr.splice(i, 1);
              };
            };
          });

          // update project
          if (usersApproved.indexOf(userUID)===-1) usersApproved.push(userUID);
          var updateObj = { 
            usersApplied: usersApplied, 
            usersApproved: usersApproved, 
            equityAllocated: equityAllocated + equityOut, 
            funded: funded + amountFunded,
            crewApplicants: crewApplicants,
            roleApplicants: castApplicants
          };
          Projects.update({_id: project._id}, { $set: updateObj });

          // update board
          var board = Boards.findOne({slug: project.slug});
          // if member not in board then add
          var boardMembers = board.members;
          var notInBoard = true;
          boardMembers.forEach(function(m) {
            if (m.userId===userUID) {
              notInBoard = false;
              return;
            };
          });

          if (notInBoard) {
            Boards.update({slug: project.slug}, { $push: { members: {
              "userId" : options.user._id,
              "isAdmin" : false
            }}});
          };

          // archive communications
          ProjectMessages.update({user: options.user._id, project: project._id}, {$set: {archived:true}});

          // notify applicant of the decision
          var projectApplicant = Users.findOne({_id: options.user._id});
          var notification_preferences = projectApplicant.notification_preferences || {};
          var email_preferences = notification_preferences.email || {};
          var phone_preferences = notification_preferences.phone || {};
          /**
              sendEmailNotification(email, html, text, subject)
              sendPhoneNotification(phone, body)
            */
          var textMessage = 'Congratulations! You were selected and approved to join the campaign titled: ' + project.title + '. You now have access to the project board where tasks will be assigned to you. To access the board, view the project page from the main screen or from your DASHBOARD.';
          if (email_preferences.email&&email_preferences.verification===true) {
            /** send email notification */
            var html = emailToHTML('YOU ARE ON A NEW CAMPAIGN!', textMessage);
            sendEmailNotification(email_preferences.email, html, textMessage, 'Approval Notice from O . S . H .');
          }

          if (phone_preferences.phone&&phone_preferences.verification===true) {
            /** send phone notification */
            sendPhoneNotification(phone_preferences.phone, textMessage);
          }

          return true;
        };
  }
}); 

