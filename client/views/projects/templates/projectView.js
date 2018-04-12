
const StripePublicKey = 'pk_test_imJVPoEtdZBiWYKJCeMZMt5A'//'pk_live_GZZIrMTVcHHwJDUni09o09sq';
var donationObject = {};
var currentSlug, currentTitle, currentProject, me;
function loadcss(f){
    var href = '/css/' + f;
    var ref=document.createElement("link");
    ref.setAttribute("rel", "stylesheet");
    ref.setAttribute("type", "text/css");
    ref.setAttribute("href", href);
    document.getElementsByTagName("head")[0].appendChild(ref);
};

function makeStripeCharge(options) {
  StripeCheckout.open({
    key: StripePublicKey,
    amount: Math.abs(Math.floor(options.amount*100))<1?1:Math.abs(Math.floor(options.amount*100)),
    currency: 'usd',
    name: options.message,
    bitcoin: true,
    description: options.description || 'opensourcehollywood.org',
    panelLabel: 'Pay Now',
    token: function(_token) {
      if (_token) {
        options.token = _token;
        Meteor.call(options.route, options, function(err, result) {
          if (err) return vex.dialog.alert('your payment failed');
          vex.dialog.alert(result)
        });
      } else {
        vex.dialog.alert('your payment did not succeed');
      }
    }
  });
}

function generateOfferMessage(offer){
  var message = "Please confirm:\n\nyou are accepting ";
  message+= offer.user.name;
  if (offer.type==='sourced') {
    var expiresOn = new Date(offer.expires).toLocaleDateString();
    message += ' as unpaid position that is offering $'+offer.pay+' conditioned to your agreement and that expires on '+expiresOn;
  } else {
    message += ' as paid position for ';
    if (offer.pay) message+='$'+offer.pay;
    if (offer.pay&&offer.equity) message+=' and ';
    if (offer.equity) message+=offer.equity+'%';
  }
  message+=' to join your campaign as '+offer.appliedFor;
  message+='. This is a binding agreement, and your acceptance also confirms your agreement to our Terms and Conditions.';
  return message;
}

function acceptUser(offer) {
  offer.slug = currentSlug;
  vex.dialog.confirm({
    message: generateOfferMessage(offer),
    buttons: [
      $.extend({}, vex.dialog.buttons.YES, { text: 'I WANT '+offer.user.name.toUpperCase()+' TO JOIN' }),
      $.extend({}, vex.dialog.buttons.NO, { text: 'Back' })
    ],
    callback: function (result) {
      if (result) {
        Meteor.call('acceptUserToProject', offer);
        vex.dialog.alert('you have accepted the user, you can update the status of your positions in the "Edit Campaign" section and by rejecting other users applying for the same position');
      }
    }
  });
}

function rejectUser(offer) {
  offer.slug = currentSlug;
  vex.dialog.confirm({
      message: "Please confirm: you are rejecting " + offer.user.name,
      buttons: [
        $.extend({}, vex.dialog.buttons.YES, { text: 'Yes' }),
        $.extend({}, vex.dialog.buttons.NO, { text: 'No' })
      ],
      callback: function (result) {
        if (result) {
          Meteor.call('rejectUserFromProject', offer);
        };
      }
  });
}

function innerVexApply(options, cb) {
  vex.dialog.open({
      message: options.message,
      input: [
          '<style>',
              '.vex-custom-field-wrapper {',
                  'margin: 1em 0;',
              '}',
              '.vex-custom-field-wrapper > label {',
                  'display: inline-block;',
                  'margin-bottom: .2em;',
              '}',
          '</style>',
          '<div class="vex-custom-field-wrapper">',
              '<label for="date">'+options.label+'</label>',
              '<div class="vex-custom-input-wrapper">',
                  '<input name="donation" type="number" />',
              '</div>',
          '</div>'
      ].join(''),
      callback: cb
    });
}

Template.projectView.helpers({
  formattedUpdateDate: function() {
    return moment(this.date).format('MM-DD-YYYY');
  },
  backers: function() {
    return this.project.donations&&this.project.donations.length||0;
  },
  castLN: function() {
    return this.project.cast.filter(function(e){if(e.status==='needed')return true}).length;
  },
  crewLN: function() {
    return this.project.crew.filter(function(e){if(e.status==='needed')return true}).length;
  },
  needLN: function() {
    return this.project.needs.length;
  },
  formattedDescription: function() {
    var that =  this;
    setTimeout(function() {
      $('#formatted_desc').html(that.project.description);
    }, 800);
  },
  shareData: function() {
    ShareIt.configure({
        sites: {
            'facebook': {
                'appId': '1790348544595983'
            }
        }
    });
    me = this.me;
    currentSlug = this.project.slug || '';
    currentTitle = this.project.title || '';
    currentProject = this.project;
    var backupURL = 'https://app.opensourcehollywood.org/projects/'+this.project.slug+'/'+this.project.ownerId;
    return {
      title: 'Check out "'+this.project.title+'" on Open Source Hollywood! <opensourcehollywood.org>',
      author: this.project.ownerName,
      excerpt: this.project.logline,
      summary: this.project.descriptionText,
      description: this.project.descriptionText,
      thumbnail: this.project.banner,
      image: this.project.banner,
      url: this.project.urlLink || backupURL
    }
  },
  subtitle: function() {
    var numGifts = 0;
    this.project.gifts&&this.project.gifts.forEach&&this.project.gifts.forEach(function(g) {
      if (g.quantity>0) numGifts+=1;
    });
    var teamPositions = 0;
    this.project.crew&&this.project.crew.forEach&&this.project.crew.forEach(function(c) {
      if (c.status&&c.status.indexOf&&c.status.indexOf('needed')>-1) teamPositions+=1;
    });
    var castPositions = 0;
    this.project.cast&&this.project.cast.forEach&&this.project.cast.forEach(function(c) {
      if (c.status&&c.status.indexOf&&c.status.indexOf('needed')>-1) castPositions+=1;
    });
    var msg='donate to campaign below';
    if (numGifts) {
      msg+=' or select from available gifts for purchase';
    };
    if (teamPositions) {
      msg+=', there are crew positions available for you to apply';
    };
    if (teamPositions&&castPositions) {
      msg+=', and roles are also available for you to apply';
    };
    if (!teamPositions&&castPositions) {
      msg+=', there are roles on this campaign available for you to apply';
    };
    var _msg = msg[0].toUpperCase() + msg.substr(1,msg.length-1) + '.';
    return _msg;
  },
  currentSlug: function() {
    return currentSlug;
  },
  producerReady: function() {
    if (!Meteor.user()) return false;
    return me&&me.iam&&me.iam.length||me&&me.primaryRole;
  },
  usersApplied: function() {
    return (this.project.roleApplicants&&this.project.roleApplicants.length||0)+(this.project.crewApplicants&&this.project.crewApplicants.length||0);
  },
  equityDistributed: function() {
    return this.project.equityAllocated||0;
  },
  isAllowed: function() {
    if (!Meteor.user()) return false;
    var projectOwnerId = this.project.ownerId;
    var acceptedUsers = this.project.usersApproved;
    var myId = Meteor.user()&&Meteor.user()._id||'myId';
    if (myId === projectOwnerId) return true;
    return acceptedUsers&&acceptedUsers.indexOf(myId)>-1;
  },
  website: function() {
    return this.project.website || 'not specified';
  },
  title: function() {
    return this.project.title;
  },
  author: function() {
    return 'a campaign by ' + this.project.ownerName;
  },
  projectRemovedNotBoard: function() {
    if (this.isLive) {
      var falsy = project.ownerId === Meteor.user()._id ? true : false;
      if (falsy === false) {
        project.usersApproved.forEach(function(u) {
          if (u.id === Meteor.user()._id) return falsy = true;
        });
      } 
      return ! falsy;
    } else {
      if (this.archived) return ! false;
      return ! true;
    }
  },
  isWidth: function() {
    return $(window).width() >= 770;
  }
})

Template.projectView.events({
  'click #view-cast-positions': function(e) {
    /** display all cast positions */
    var castPositions = this.project.cast;
    var inputHTML = castPositions.map(function(c, idx) {
      var _html = '<div class="vex-custom-field-wrapper">';
      _html += '<div class="row"><div class="col-sm-12"><div class="thumbnail"><div class="caption"><h3>' + c.role + '</h3><p>' + c.description + '</p><div class="btn-toolbar"><a href="#" class="btn btn-default btn-group apply-pay" role="button" idx="'+idx+'">Request Pay</a><a href="#" class="btn btn-default btn-group apply-time" role="button" idx="'+idx+'">Donate Time</a><a href="#" class="btn btn-default btn-group apply-donate" role="button" idx="'+idx+'">Offer Pay</a></div></div></div></div></div>';
      _html += '</div>';
      return _html;
    });
    vex.dialog.open({
        message: 'View and apply CAST positions:',
        contentCSS: { width: '100%', overflow: 'auto' },
        input: [
            '<style>',
                '.vex-custom-field-wrapper {',
                    'margin: 1em 0;',
                '}',
                '.vex-custom-field-wrapper > label {',
                    'display: inline-block;',
                    'margin-bottom: .2em;',
                '}',
            '</style>',
            inputHTML
        ].join(''),
        callback: function (data) {
          if (!data) {
              return console.log('Cancelled')
          }
        },
        afterOpen: function() {
          $('.apply-pay').on('click', function(e) {
            var position = castPositions[parseInt($(this).attr('idx'))];
            vex.closeAll();
            /** ask user to define how much pay for resource */
            innerVexApply({
              message: 'How much for your participation.',
              label: 'Amount of money (USD).',
            }, function(data) {
              var amt = data.donation || 0;
              amt = Math.abs(parseInt(amt));
              if (amt) {
                /** send offer to user, email user */
                var o = {
                  ctx:'cast', 
                  position: position.role,
                  type: 'hired',
                  pay: amt,
                  amount: amt,
                  message: currentTitle + ' cast offer',
                  route: 'applyToProject',
                  slug: currentSlug,
                  appliedFor: position.role
                };
                Meteor.call(o.route, o, function(err, result) {
                  vex.dialog.alert(err||result);
                });
              };
            });
          });

          $('.apply-time').on('click', function(e) {
            var position = castPositions[parseInt($(this).attr('idx'))];
            vex.closeAll();
            var o = {
              ctx:'cast', 
              position: position.role,
              type: 'hired',
              pay: 0,
              amount: 0,
              message: currentTitle + ' cast offer (time donation)',
              route: 'applyToProject',
              slug: currentSlug,
              appliedFor: position.role
            };
            Meteor.call(o.route, o, function(err, result) {
              vex.dialog.alert(err||result);
            });
          });

          $('.apply-donate').on('click', function(e) {
            var position = castPositions[parseInt($(this).attr('idx'))];
            vex.closeAll();
            /** ask user to define how much pay for resource */
            innerVexApply({
              message: 'How much will you donate for this role.',
              label: 'Money amount (USD), refunded in 3 days unless accepted.',
            }, function(data) {
              var amt = data.donation || 0;
              amt = Math.abs(parseInt(amt));
              if (amt) {
                /** send offer to user, email user */
                var o = {
                  ctx:'cast', 
                  position: position.role,
                  type: 'sourced',
                  pay: amt,
                  amount: amt,
                  message: currentTitle + ' cast offer (money and time donation)',
                  route: 'applyToProject',
                  slug: currentSlug,
                  appliedFor: position.role
                };
                makeStripeCharge(o);
              };
            });
          });
        }
    })
  },
  'click #view-crew-positions': function(e) {
    /** display all cast positions */
    var crewPositions = this.project.crew;
    var inputHTML = crewPositions.map(function(c, idx) {
      var _html = '<div class="vex-custom-field-wrapper">';
      _html += '<div class="row"><div class="col-sm-12"><div class="thumbnail"><div class="caption"><h3>' + c.title + '</h3><p>' + c.description + '</p><div class="btn-toolbar"><a href="#" class="btn btn-default btn-group apply-pay" role="button" idx="'+idx+'">Request Pay</a><a href="#" class="btn btn-default btn-group apply-time" role="button" idx="'+idx+'">Donate Time</a><a href="#" class="btn btn-default btn-group apply-donate" role="button" idx="'+idx+'">Offer Pay</a></div></div></div></div></div>';
      _html += '</div>';
      return _html;
    });
    vex.dialog.open({
        message: 'View and apply CREW positions:',
        contentCSS: { width: '100%', overflow: 'auto' },
        input: [
            '<style>',
                '.vex-custom-field-wrapper {',
                    'margin: 1em 0;',
                '}',
                '.vex-custom-field-wrapper > label {',
                    'display: inline-block;',
                    'margin-bottom: .2em;',
                '}',
            '</style>',
            inputHTML
        ].join(''),
        callback: function (data) {
          if (!data) {
              return console.log('Cancelled')
          }
        },
        afterOpen: function() {
          $('.apply-pay').on('click', function(e) {
            var position = crewPositions[parseInt($(this).attr('idx'))];
            vex.closeAll();
            /** ask user to define how much pay for resource */
            innerVexApply({
              message: 'How much for your participation.',
              label: 'Amount of money (USD).',
            }, function(data) {
              var amt = data.donation || 0;
              amt = Math.abs(parseInt(amt));
              if (amt) {
                /** send offer to user, email user */
                var o = {
                  ctx:'crew', 
                  position: position.title,
                  type: 'hired',
                  pay: amt,
                  amount: amt,
                  message: currentTitle + ' crew offer',
                  route: 'applyToProject',
                  slug: currentSlug,
                  appliedFor: position.title
                };
                Meteor.call(o.route, o, function(err, result) {
                  vex.dialog.alert(err||result);
                });
              };
            });
          });

          $('.apply-time').on('click', function(e) {
            var position = crewPositions[parseInt($(this).attr('idx'))];
            vex.closeAll();
            var o = {
              ctx:'crew', 
              position: position.title,
              type: 'hired',
              pay: 0,
              amount: 0,
              message: currentTitle + ' crew offer (time donation)',
              route: 'applyToProject',
              slug: currentSlug,
              appliedFor: position.title
            };
            Meteor.call(o.route, o, function(err, result) {
              vex.dialog.alert(err||result);
            });
          });

          $('.apply-donate').on('click', function(e) {
            var position = crewPositions[parseInt($(this).attr('idx'))];
            vex.closeAll();
            /** ask user to define how much pay for resource */
            innerVexApply({
              message: 'How much will you donate for this role.',
              label: 'Money amount (USD), refunded in 3 days unless accepted.',
            }, function(data) {
              var amt = data.donation || 0;
              amt = Math.abs(parseInt(amt));
              if (amt) {
                /** send offer to user, email user */
                var o = {
                  ctx:'crew', 
                  position: position.title,
                  type: 'sourced',
                  pay: amt,
                  amount: amt,
                  message: currentTitle + ' crew offer (money and time donation)',
                  route: 'applyToProject',
                  slug: currentSlug,
                  appliedFor: position.title
                };
                makeStripeCharge(o);
              };
            });
          });
        }
    })
  },
  'click #view-need-positions': function(e) {
    /** display all cast positions */
    var projectNeeds = this.project.needs;
    var inputHTML = projectNeeds.map(function(c, idx) {
      var _html = '<div class="vex-custom-field-wrapper">';
      _html += '<div class="row"><div class="col-sm-12"><div class="thumbnail"><div class="caption"><h3>' + c.category + '</h3><p>' + c.description + '</p><div class="btn-toolbar"><a href="#" class="btn btn-default btn-group apply-pay" role="button" idx="'+idx+'">Request Pay</a><a href="#" class="btn btn-default btn-group apply-time" role="button" idx="'+idx+'">Donate Time</a></div></div></div></div></div>';
      _html += '</div>';
      return _html;
    });
    vex.dialog.open({
        message: 'View and offer resources for project NEEDS:',
        contentCSS: { width: '100%', overflow: 'auto' },
        input: [
            '<style>',
                '.vex-custom-field-wrapper {',
                    'margin: 1em 0;',
                '}',
                '.vex-custom-field-wrapper > label {',
                    'display: inline-block;',
                    'margin-bottom: .2em;',
                '}',
            '</style>',
            inputHTML
        ].join(''),
        callback: function () { },
        afterOpen: function() {
          $('.apply-pay').on('click', function(e) {
            var needItem = projectNeeds[parseInt($(this).attr('idx'))];
            vex.closeAll();
            /** ask user to define how much pay for resource */
            innerVexApply({
              message: 'How much for your resource.',
              label: 'Amount of money (USD).',
            }, function(data) {
              var amt = data.donation || 0;
              amt = Math.abs(parseInt(amt));
              if (amt) {
                /** send offer to user, email user */
                Meteor.call("lendResource", {
                  slug: currentSlug,
                  asset: needItem.category,
                  offer: amt
                });
                vex.dialog.alert('resource offer submitted');
              };
            });
          });

          $('.apply-time').on('click', function(e) {
            console.log('apply for time')
            console.log($(this).attr('idx')) // ==> idx
            var needItem = projectNeeds[parseInt($(this).attr('idx'))];
            Meteor.call("lendResource", {
              slug: currentSlug,
              asset: needItem.category,
              offer: 0
            });
            vex.dialog.alert('resource offer submitted');
          });

        }
    })
  },
  'click #offer-donation': function(e) {
    e.preventDefault();
    /** prompt enter donation amount */
    vex.dialog.open({
      message: 'Enter donation amount.',
      input: [
          '<style>',
              '.vex-custom-field-wrapper {',
                  'margin: 1em 0;',
              '}',
              '.vex-custom-field-wrapper > label {',
                  'display: inline-block;',
                  'margin-bottom: .2em;',
              '}',
          '</style>',
          '<div class="vex-custom-field-wrapper">',
              '<label for="date">Amount to donate (USD).</label>',
              '<div class="vex-custom-input-wrapper">',
                  '<input name="donation" type="number" />',
              '</div>',
          '</div>'
      ].join(''),
      callback: function (data) {
        if (!data) {
            return console.log('Cancelled')
        }
        var amt = Math.abs(parseInt(data.donation));
        if (amt>0) {
          makeStripeCharge({
            amount: amt,
            message: 'Donation to ' + currentTitle,
            description: '$' + amt + ' donated',
            donationObject: {
              first: Meteor.user().firstName,
              last: Meteor.user().lastName,
              email: Meteor.user().email,
              id: Meteor.user()._id,
              amount: amt
            },
            route: 'donateToProject',
            slug: currentSlug
          });
        };
      }
    });
  },
  'click #submit-update': function(e) {
    e.preventDefault();
    /** unshift text and date */
    var updateText = $('#update-box').val();
    if (updateText) {
      Meteor.call('projectUpdateText', {
        slug: currentSlug,
        update: {
          text: updateText,
          date: new Date()
        }
      });
      vex.dialog.alert('update submitted');
      $('#update-box').val('');
    };
  },
  'click .login': function(e) {
    e.preventDefault();
    window.location.assign('/');
  },
  'click .accept': function(e) {
    e.preventDefault();
    acceptUser(this);
  },
  'click .reject': function(e) {
    e.preventDefault();
    rejectUser(this);
  },
  'click .fulfill_gift': function(e) {
    e.preventDefault();
    var user_name = this.user && this.user.name || '';
    var user_avatar = this.user && this.user.avatar || '';
    var vexOpen = true;
    var _vex = vex.dialog.open({
      title: 'Gift Fulfillment',
      input: '<div class="container" style="width:100%"> <h2>'+this.message+'</h2> <div class="row margin_bottom20"> <div class="col-xs-6"><label>Buyer Name</label> <h4>'+user_name+'</h4> </div><div class="col-xs-6"><label>Purchase Item</label> <h4>'+this.gift.name+'</h4> </div></div><div class="row margin_bottom40"> <div class="col-xs-6"> <label>Email</label> <h4>'+this.email+'</h4> </div><div class="col-xs-6"> <label>Phone</label> <h4>'+this.phone+'</h4> </div></div><div class="row"> <div class="col-xs-12" style="text-align:center"><label>SHIPPING INFO</label> <p class="align-center">'+this.address+'</p><p class="align-center">'+this.city+', '+this.state+' '+this.zip+'</p></div></div></div>',
      buttons: [
        $.extend({}, vex.dialog.buttons.YES, { text: 'Mark as Fulfilled' }),
        $.extend({}, vex.dialog.buttons.NO, { text: 'Close' })
      ],
      callback: function (data) {
          if (!data) {
              return console.log('Cancelled')
          }
          if (vexOpen) {
            vexOpen = false;
            _vex.close();
            console.log('MARK AS FULFILLED')
          };
      }
    });
  },
  'click #donation_btn': function(e) {
    e.preventDefault();
    var was = this;
    var intmodal = vex.dialog.open({
      title: 'Your Donation',
      message: '<label for="application_offer" style="display:break;">Please verify payment for $'+donationObject.amount+'</label>',
      buttons: {
        danger:  {
          label: 'Cancel',
          className: "btn-danger",
          callback: function() { intmodal.modal('hide') }
        },
        success: {
          label: "PROCEED",
          className: "btn-success",
          callback: function() {
            intmodal.modal('hide')
            makeStripeCharge({
              amount: donationObject.amount,
              message: 'Donation to ' + currentTitle,
              description: '$' + donationObject.amount + ' donated',
              donationObject: donationObject,
              route: 'donateToProject',
              slug: was._slug
            });
          }
        }
      }
    });
  },
  'click .purchase_gift': function(e) {
    e.preventDefault();
    var was = this, o={gift:was};
    var vex1Open = true, vex2Open = true;
    var vex1 = vex.dialog.open({
        message: was.name,
        buttons: [
          $.extend({}, vex.dialog.buttons.YES, { text: 'PURCHASE' }),
          $.extend({}, vex.dialog.buttons.NO, { text: 'Close' }),
        ],
        input: [
            '<div class="container" style="width:100%;">',
                '<div class="row">',
                    '<div class="col-xs-5">',
                        '<img class="img-responsive img-thumbnail margin_bottom20" src="'+was.url+'" style="max-height: 120px;max-width: 120px;">',
                    '</div>',
                    '<div class="col-xs-7">',
                        '<h4>$'+was.msrp+' ( ' + was.quantity+ ' units left )</h4>',
                    '</div>',
                    '<div class="col-xs-12">',
                        '<textarea readonly>' + was.description + '</textarea>',
                    '</div>',
                '</div>',
            '</div>'

        ].join(''),
        callback: function (data) {
            if (!data) {
                return console.log('Cancelled')
            }
            if (vex1Open) {
              vex1Open = false;
              vex1.close();
              var vex2 = vex.dialog.open({
                message: 'Order and Pay Info',
                buttons: [
                  $.extend({}, vex.dialog.buttons.YES, { text: 'CONTINUE' }),
                  $.extend({}, vex.dialog.buttons.NO, { text: 'Cancel' }),
                ],
                input: [
                    '<style>',
                        '.vex-custom-field-wrapper {',
                            'margin: 1em 0;',
                        '}',
                        '.vex-custom-field-wrapper > label {',
                            'display: inline-block;',
                            'margin-bottom: .2em;',
                        '}',
                    '</style>',
                    '<div class="vex-custom-field-wrapper">',
                        '<label for="address-gift">Shipping Address</label>',
                        '<div class="vex-custom-input-wrapper">',
                            '<input type="text" class="form-control contrastback" placeholder="e.g. 6925 Hollywood Blvd" id="address-gift">',
                        '</div>',
                    '</div>',
                    '<div class="vex-custom-field-wrapper">',
                        '<label for="city-gift">City</label>',
                        '<div class="vex-custom-input-wrapper">',
                            '<input type="text" class="form-control contrastback" placeholder="e.g. Hollywood" id="city-gift">',
                        '</div>',
                    '</div>',
                    '<div class="vex-custom-field-wrapper">',
                        '<label for="state-gift">State</label>',
                        '<div class="vex-custom-input-wrapper">',
                            '<input type="text" class="form-control contrastback" placeholder="e.g. CA or California" id="state-gift">',
                        '</div>',
                    '</div>',
                    '<div class="vex-custom-field-wrapper">',
                        '<label for="zip-gift">Zip Code</label>',
                        '<div class="vex-custom-input-wrapper">',
                            '<input type="text" class="form-control contrastback" placeholder="e.g. 90028" id="zip-gift">',
                        '</div>',
                    '</div>',
                    '<div class="vex-custom-field-wrapper">',
                        '<label for="email-gift">Contact Email</label>',
                        '<div class="vex-custom-input-wrapper">',
                            '<input type="text" class="form-control contrastback" placeholder="e.g. yours@email.com" id="email-gift">',
                        '</div>',
                    '</div>',
                    '<div class="vex-custom-field-wrapper">',
                        '<label for="phone-gift">Contact Phone</label>',
                        '<div class="vex-custom-input-wrapper">',
                            '<input type="text" class="form-control contrastback" placeholder="e.g. (310) 555-1212" id="phone-gift">',
                        '</div>',
                    '</div>'

                ].join(''),
                callback: function (data) {
                    if (!data) {
                        return console.log('Cancelled')
                    }
                    if (vex2Open) {
                      vex2Open = false;
                      vex2.close();
                      o.address = $('#address-gift').val(), o.city = $('#city-gift').val(), o.state = $('#state-gift').val(), o.zip = $('#zip-gift').val(), o.email = $('#email-gift').val(), o.phone = $('#phone-gift').val();
                      if (!o.address||!o.city||!o.state||!o.zip||!o.email||!o.phone) return vex.dialog.alert('invalid order information, please include all fields and try again');
                      o.amount = was.msrp;
                      o.message = was.name + ' purchase';
                      o.route = 'purchaseGift';
                      o.slug = currentSlug;
                      makeStripeCharge(o);
                    };
                }
              });
            };
        }
    });
  },
  "click #closeProj": function () {
    vex.dialog.confirm({
      message: 'Are you sure you want to close this project?',
      callback: function (r) {
        if (!r || r === false) return;
        Meteor.call("closeProject", currentSlug);
      }
    });
  },
  "click .start": function () {
    var was = this;
    Meteor.call("startProject", was._slug);
  },
  'click #submit-comment': function(e) {
    e.preventDefault();
    var text = document.getElementById('comment-box').value;
    document.getElementById('comment-box').innerHTML = '';
    Meteor.call('addProjectComment', this._slug, 0, text);
  },
  'click #upvote': function() {
    Meteor.call('upvoteProject', this._slug);
  },
  'click #downvote': function() {
    Meteor.call('downvoteProject', this._slug);
  }
});

Template.projectView.onRendered(function() {
     setTimeout(function() {
        $('.fb-share').html('<li class="fa fa-facebook"></li>');
        $('.tw-share').html('<li class="fa fa-twitter"></li>');
        $('.pinterest-share').html('<li class="fa fa-pinterest"></li>');
        $('.googleplus-share').html('<li class="fa fa-google-plus"></li>');
     }, 133);
 });

Template.applicants.helpers({
  anon: function() {
    return this.user.id==='anon';
  },
  currentSlug: function() {
    return currentSlug
  }
})

Template.applicants.events({
  'click .view_offer': function(e) {
    var was = this;
    vex.dialog.open({
      message: 'Details of the offer.',
      input: [
          '<style>',
              '.vex-custom-field-wrapper {',
                  'margin: 1em 0;',
              '}',
              '.vex-custom-field-wrapper > label {',
                  'display: inline-block;',
                  'margin-bottom: .2em;',
              '}',
          '</style>',
          '<div class="vex-custom-field-wrapper">',
              '<div class="vex-custom-input-wrapper">',
                  '<div class="container"> <div class="row d-flex justify-content-center"> <div class="col-md-5"> <div class="main-profile"> <div class="profile-header"> <img class="img-responsive img-thumbnail margin_bottom20" src="'+was.user.avatar+'" alt="'+was.user.name+'" style="max-height: 120px;max-width: 120px;"> <p class="align-center">Position: '+was.position+'</p> </div><div class="col col-xs-12"> <p class="align-center">'+was.message+' for '+ ((was.amount===0) ? 'no pay (time donation).' : (was.type==='hired') ? '$' + was.amount + ' requested pay.' : '$' + was.amount + ' donation offer.') +'</p></div></div></div></div></div>',
              '</div>',
          '</div>'
      ].join(''),
      callback: function (data) { }
    });
  }
})

Handlebars.registerHelper("inc", function(value, options) {
    return parseInt(value) + 1;
});