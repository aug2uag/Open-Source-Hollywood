
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
        if (Meteor.user()) {
          Meteor.call(options.route, options, function(err, result) {
            if (err) return vex.dialog.alert('your payment failed');
            vex.dialog.alert(result)
          });
        } else {
          // confirm dialog
          vex.dialog.alert({
            message: 'Please confirm the following to finalize payment.',
            input: [
              '<ul>',
                '<li class="wcheckbox">',
                    '<label class="with-square-checkbox">',
                        '<input id="ageverify" name="ageverify" type="checkbox">',
                        '<span>I am 18 years of age or older.</span>',
                    '</label>',
                '</li>',
                '<li class="wcheckbox">',
                    '<label class="with-square-checkbox">',
                        '<input id="payverify" name="payverify" type="checkbox">',
                        '<span>I am authorized to make payments with the payment method I selected.</span>',
                    '</label>',
                '</li>',
                '<li class="wcheckbox">',
                    '<label class="with-square-checkbox">',
                        '<input id="refverify" name="refverify" type="checkbox">',
                        '<span>I understand my payment is non-refundable and will be immediately applied to the campaign\'s budget.</span>',
                    '</label>',
                '</li>',
              '</ul>',
              '<div class="form-group">',
                  '<label for="signature">Sign Your Name</label>',
                  '<input type="text" class="form-control" name="signature" id="signature" placeholder="enter your name here">',
              '</div>',
            ].join(''),
            callback: function(data) {
              if (!data.ageverify) {
                vex.dialog.alert('you must be 18 or older to continue, your payment was cancelled');
                return
              } else if (!data.payverify) {
                vex.dialog.alert('you must be authorized for the transaction, your payment was cancelled');
                return
              } else if (!data.refverify) {
                vex.dialog.alert('you must agree to our terms to continue, your payment was cancelled');
                return
              } else if (!data.signature) {
                vex.dialog.alert('you must provide a signature, your payment was cancelled');
                return
              } 
              data.date = new Date();
              options.anonymous_verification = data;
              Meteor.call(options.route, options, function(err, result) {
                if (err) return vex.dialog.alert('your payment failed');
                vex.dialog.alert(result)
              });
            }
          });
        }
        
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

/** show roles dialog */
function displayRoleTypeDialog(list, options) {
  vex.closeTop();
  var isMeteorUser = Meteor.user&&Meteor.user()||false;
  var inputHTML = list.map(function(c, idx) {
    var typeofRole = c.title ? 'a crew position' : c.role ? 'a cast position' : 'a resource needed';
    var _html = '<div class="vex-custom-field-wrapper" id="displayroles">';
    _html += '<div class="row"><div class="col-sm-12"><div class="thumbnail"><div class="caption"><h3 style="margin-bottom: 10px;">' + (c.title||c.role||c.category) + '</h3><p style="margin-bottom: 13px;font-weight:200">'+ typeofRole +'</p><p style="margin-bottom: 5px">' + c.description + '</p>';
    if (isMeteorUser) {
      _html += '<div class="btn-toolbar">';
      if (options.apply_pay) _html+='<a href="#" class="btn btn-default btn-group apply-pay" role="button" idx="'+idx+'">Request Pay</a>'
      if (options.apply_time) _html+='<a href="#" class="btn btn-default btn-group apply-time" role="button" idx="'+idx+'">Donate Time</a>'
      if (options.apply_donate) _html+='<a href="#" class="btn btn-default btn-group apply-donate" role="button" idx="'+idx+'">Offer Pay</a>'
      _html+='</div>';
    }
    _html += '</div></div></div></div>';
    _html += '</div>';
    return _html;
  }).join('');
  if (list.length===0) inputHTML='<p>&nbsp;</p><h3>&nbsp;&nbsp;There are no roles available.</h3>';
  vex.dialog.alert({
      message: options.title,
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
        var was = this;
        setTimeout(function() {
            // Either of these lines will do the trick, depending on what browsers you need to support.
            was.rootEl.scrollTop = 0;
            was.contentEl.scrollIntoView(true);
            $(was.$vex).scrollTop(0)
        }, 0)
        $('.apply-pay').on('click', function(e) {
          var position = list[parseInt($(this).attr('idx'))];
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
          var position = list[parseInt($(this).attr('idx'))];
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
          var position = list[parseInt($(this).attr('idx'))];
          vex.closeAll();
          /** ask user to define how much pay for resource */
          innerVexApply({
            message: 'How much will you donate for this role.',
            label: 'Money amount (USD), refunded in 5 business days unless accepted.',
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
}

Template.projectView.helpers({
  thumbsupactive: function() {
    // if me in upvote 'active' : null
    if (this.project.upvotedUsers.indexOf(Meteor.user()._id)>-1) return 'active';
  },
  numLikes: function() {
    return this.project.upvotedUsers.length;
  },
  projectBudgetIfExists: function() {
    if (this.project.budget) {
      return this.project.budget;
    } else {
      return this.project.funded;
    }
  },
  projectFundedIfExists: function() {
    if (this.project.budget) {
      return '$'+this.project.funded+' raised';
    } else {
      return 'funds raised';
    }
  },
  showNeeded: function() {
    if (this.project.budget) return 'needed';
  },
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
  anyRoles: function() {
    return Meteor.user()&&(this.project.needs.length>0||this.project.cast.length>0||this.project.crew.length>0);
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
      title: this.project.title+'" on Open Source Hollywood! <opensourcehollywood.org>',
      author: this.project.ownerName,
      excerpt: this.project.logline||this.project.descriptionText,
      summary: this.project.logline||this.project.descriptionText,
      description: this.project.logline||this.project.descriptionText,
      thumbnail: this.project.banner,
      image: this.project.banner,
      video: this.project.videoExplainer,
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
    var isMeteorUser = Meteor.user&&Meteor.user()||false;
    var inputHTML = castPositions.map(function(c, idx) {
      var _html = '<div class="vex-custom-field-wrapper">';
      _html += '<div class="row"><div class="col-sm-12"><div class="thumbnail"><div class="caption"><h3>' + c.role + '</h3><p>' + c.description + '</p>';
      if (isMeteorUser) _html += '<div class="btn-toolbar"><a href="#" class="btn btn-default btn-group apply-pay" role="button" idx="'+idx+'">Request Pay</a><a href="#" class="btn btn-default btn-group apply-time" role="button" idx="'+idx+'">Donate Time</a><a href="#" class="btn btn-default btn-group apply-donate" role="button" idx="'+idx+'">Offer Pay</a></div>';
      _html += '</div></div></div></div>';
      _html += '</div>';
      return _html;
    }).join('');
    vex.dialog.alert({
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
          var was = this;
          setTimeout(function() {
              // Either of these lines will do the trick, depending on what browsers you need to support.
              was.rootEl.scrollTop = 0;
              was.contentEl.scrollIntoView(true);
              $(was.$vex).scrollTop(0)
          }, 0)
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
              label: 'Money amount (USD), refunded in 5 business days unless accepted.',
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
    var isMeteorUser = Meteor.user&&Meteor.user()||false;
    var inputHTML = crewPositions.map(function(c, idx) {
      var _html = '<div class="vex-custom-field-wrapper">';
      _html += '<div class="row"><div class="col-sm-12"><div class="thumbnail"><div class="caption"><h3>' + c.title + '</h3><p>' + c.description + '</p>';
      if (isMeteorUser) _html += '<div class="btn-toolbar"><a href="#" class="btn btn-default btn-group apply-pay" role="button" idx="'+idx+'">Request Pay</a><a href="#" class="btn btn-default btn-group apply-time" role="button" idx="'+idx+'">Donate Time</a><a href="#" class="btn btn-default btn-group apply-donate" role="button" idx="'+idx+'">Offer Pay</a></div>'
      _html += '</div></div></div></div>';
      _html += '</div>';
      return _html;
    }).join('');
    vex.dialog.alert({
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
          var was = this;
          setTimeout(function() {
              // Either of these lines will do the trick, depending on what browsers you need to support.
              was.rootEl.scrollTop = 0;
              was.contentEl.scrollIntoView(true);
              $(was.$vex).scrollTop(0)
          }, 0)
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
              label: 'Money amount (USD), refunded in 5 business days unless accepted.',
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
    var isMeteorUser = Meteor.user&&Meteor.user()||false;
    var inputHTML = projectNeeds.map(function(c, idx) {
      var _html = '<div class="vex-custom-field-wrapper">';
      _html += '<div class="row"><div class="col-sm-12"><div class="thumbnail"><div class="caption"><h3>' + c.category + '</h3><p>' + c.description + '</p>';
      if (isMeteorUser) _html += '<div class="btn-toolbar"><a href="#" class="btn btn-default btn-group apply-pay" role="button" idx="'+idx+'">Request Pay</a><a href="#" class="btn btn-default btn-group apply-time" role="button" idx="'+idx+'">Donate Time</a></div>'
      _html += '</div></div></div></div>';
      _html += '</div>';
      return _html;
    }).join('');
    vex.dialog.alert({
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
          var was = this;
          setTimeout(function() {
              // Either of these lines will do the trick, depending on what browsers you need to support.
              was.rootEl.scrollTop = 0;
              was.contentEl.scrollIntoView(true);
              $(was.$vex).scrollTop(0)
          }, 0)
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
  'click #join-roles': function(e) {
    e.preventDefault();
    /**

      cast crew or resource
      cast / crew => select role
      resource => select resource

     */

    displayRoleTypeDialog( ((this.project.crew||[]).concat((this.project.cast||[]))).concat((this.project.needs||[])) , {
      title: 'Select Role',
      apply_pay: true
    });
  },
  'click #offer-donation': function(e) {
    e.preventDefault();
    /** prompt enter donation amount */
    /**

      donate time or money
      time => choose cast crew resource, choose item
      money => express or conditional
      express => enter amount
      conditional => select role (show cast and crew roles)

     */

    var was = this;

    function moneyDonationTypeHelper() {
      /** show help dialog on top */
      var dialogInput = [
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
          '<p>1) EXPRESS DONATIONS are traditional money donations where you transfer a specified amount of money directly to the campaign.</p>',
          '<p>2) CONDITIONAL DONATIONS are donations that are given in return for consideration and approval to a role. These are refunded within 5 days unless you were considered and accepted to the role. In order to make a conditional donation, you must specify a role you are donating towards.</p>',
        '</div>'
      ]
      vex.dialog.alert({
        message: 'There are two types of money donations you can make.',
        input: dialogInput.join('')
      });
    }

    function expressOrConditionalMoneyConfig() {
      $('.dty').on('click', function(e) {
        if ($(this).attr('id').indexOf('express')>-1) {
          displayExpressDonationDialog();
        } else {
          displayRoleTypeDialog((was.project.crew||[]).concat((was.project.cast||[])), {
            title: 'Select Role',
            apply_donate: true
          });
        }
      });
      $('#helpmedonate').on('click', function(e) {
        moneyDonationTypeHelper();
      });
    }

    /** express v conditional dialog */
    function displayMoneyTypeDialog() {
      vex.closeTop();
      var dialogInput = [
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
          '<div class="bs-example" data-example-id="simple-justified-button-group">',
            '<div class="btn-group btn-group-justified" role="group" aria-label="Justified button group">',
              '<a href="#" id="dexpress" class="btn btn-default dty" role="button">Express</a>',
              '<a href="#" id="dconditional" class="btn btn-default dty" role="button">Conditional</a>',
            '</div>',
            '<br>',
            '<a id="helpmedonate" href="#"><span class="glyphicon glyphicon-question-sign" aria-hidden="true"></span>&nbsp;&nbsp;<small>HELP</small></a>',
            '</div>',
          '</div>',
        '</div>'
      ]
      vex.dialog.alert({
        message: 'Choose Money Donation Type',
        input: dialogInput.join(''),
        buttons: [
          $.extend({}, vex.dialog.buttons.NO, { text: 'CLOSE' })
        ],
        callback: function(){},
        afterOpen: expressOrConditionalMoneyConfig
      });
    }

    /** express donation dialog (0a) */
    function displayExpressDonationDialog() {
      vex.closeTop();
      var dialogInput = [
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
      ]
      vex.dialog.open({
        message: 'Enter donation amount.',
        input: dialogInput.join(''),
        callback: expressDonationHandler
      });
    }

    /** express donation final handler (0b) */
    function expressDonationHandler(data) {
      if (!data||!data.donation) return;
      var amt = Math.abs(parseInt(data.donation));
      if (amt>0) {
        var donationObject = {};
        if (Meteor.user()) {
          donationObject = {
            first: Meteor.user().firstName,
            last: Meteor.user().lastName,
            email: Meteor.user().email,
            id: Meteor.user()._id,
            amount: amt
          }
        } else {
          donationObject = {
            first: 'anonymous',
            last: 'patron',
            id: 'anon_donation',
            amount: amt
          }
        }
        makeStripeCharge({
          amount: amt,
          message: 'Donation to ' + currentTitle,
          description: '$' + amt + ' donated',
          donationObject: donationObject,
          route: 'donateToProject',
          slug: currentSlug
        });
      }
    }

    function timeDateDonateConfig() {
      $('.dtm').on('click', function(e) {
        e.preventDefault();
        if ($(this).attr('id').indexOf('time')>-1) {
          // donate time options
          displayRoleTypeDialog( ((was.project.crew||[]).concat((was.project.cast||[]))).concat((was.project.needs||[])) , {
            title: 'Select Role',
            apply_time: true
          });
        } else {
          // donate money options
          displayMoneyTypeDialog();
        }

      })
    }

    // return (this.project.needs.length>0||this.project.cast.length>0||this.project.crew.length>0)
    var anyRoles = (this.project.needs.length>0||this.project.cast.length>0||this.project.crew.length>0);
    if (!anyRoles||!Meteor.user()) {
      // express donation only
      return displayExpressDonationDialog();
    };

    var msg1 = Meteor.user() ? 'Would you like to donate money or time?' : 'Enter donation amount.';

    var dialogInput = [
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
          '<div class="bs-example" data-example-id="simple-justified-button-group">',
            '<div class="btn-group btn-group-justified" role="group" aria-label="Justified button group">',
              '<a href="#" id="dmoney" class="btn btn-default dtm" role="button">Donate Money</a>',
              '<a href="#" id="dtime" class="btn btn-default dtm" role="button">Donate Time</a>',
            '</div>',
            '</div>',
          '</div>',
        '</div>'
    ]

    vex.dialog.alert({
      message: msg1,
      input: dialogInput.join(''),
      buttons: [
        $.extend({}, vex.dialog.buttons.NO, { text: 'CLOSE' })
      ],
      callback: function(){},
      afterOpen: timeDateDonateConfig
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
        // $.extend({}, vex.dialog.buttons.YES, { text: 'Mark as Fulfilled' }),
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
        message: ['   Details of ',was.name,'. Purchase below.'].join(''),
        buttons: [
          $.extend({}, vex.dialog.buttons.YES, { text: 'PURCHASE' }),
          $.extend({}, vex.dialog.buttons.NO, { text: 'Close' }),
        ],
        input: [

                        '<figure class="snip1165 red">',
                          '<img src="',
                          was.url,
                          '" alt="sample63"/>',
                          '<figcaption>',
                            '<h3>',
                            was.name,
                            '</h3>',
                            '<p>',
                              was.description,
                            '</p>',
                            '<hr>',
                            '<h3 style="margin-top:8px;margin-bottom:0px">$',
                            was.msrp,
                            '</h3>',
                          '</figcaption>',
                        '</figure>',


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
        },
        afterOpen: function() {
          var was = this;
          setTimeout(function() {
              // Either of these lines will do the trick, depending on what browsers you need to support.
              was.rootEl.scrollTop = 0;
              was.contentEl.scrollIntoView(true);
              $(was.$vex).scrollTop(0)
          }, 0)
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
  'click #thumbsup': function() {
    if ($('#thumbsup').hasClass('active')) {
      Meteor.call('downvoteProject', this._slug);
      $('#thumbsup').removeClass('active');
    } else {
      Meteor.call('upvoteProject', this._slug);
      $('#thumbsup').addClass('active');
    }
  }
});

Template.projectView.onRendered(function() {
  if ($(window).width()<580) {
    setTimeout(function() {
      $($( ".tabs-select" )[1]).prepend('<i id="crazed_foo" class="fa fa-chevron-down fa-2x" style="position:absolute;pointer-events:none;"></i>');
      $('#genreclick2').click();
    }, 610);
  }
  if (!Meteor.user()) {
      localStorage.setItem('redirectURL', '/projects/' + this.data.project.slug + '/' + this.data.project.ownerId);
  } 
   setTimeout(function() {
      $('.fb-share').html('<li class="fa fa-facebook"></li>');
      $('.tw-share').html('<li class="fa fa-twitter"></li>');
      $('.pinterest-share').html('<li class="fa fa-pinterest"></li>');
      $('.googleplus-share').html('<li class="fa fa-google-plus"></li>');
      $('#genreclick1').click();
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