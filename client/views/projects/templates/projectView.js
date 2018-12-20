function goDiscovery() {
  try{
    var cb = document.getElementById('discoverybtn'); 
      cb.dispatchEvent(new MouseEvent('click', {
        view: window
      }));
  } catch(e){ window.location.assign('/discover');}
};

const StripePublicKey = 'pk_test_imJVPoEtdZBiWYKJCeMZMt5A'//'pk_live_GZZIrMTVcHHwJDUni09o09sq';
var donationObject = {};
var currentSlug, currentTitle, currentProject, me;

function ConvertToCSV(json) {
  var order = json.order
  var csv = 'Purchaser, Email, Phone, Shipping Name, Shipping Address 1, Shipping Address 2, Order, Purchase ID, Order ID, Total Units, Total Order\n'
  csv += [
    order.user.name, order.email, order.phone, order.name, order.address, [order.city, order.state, order.zip].join(' '),
    order.order.map(function(o) {
      return ['item: ', o.key, ' - quantity: ', o.quantity].join('')
    }).join(' ... '),
    order.receipt.id, 
    json._id, 
    order.totalUnits, 
    ['$', order.amount].join('')
  ].join(', ')

  var data, filename, link;

  filename = [json._id,'.csv'].join('');

  csv = 'data:text/csv;charset=utf-8,' + csv;
  data = encodeURI(csv);

  link = document.createElement('a');
  link.setAttribute('href', data);
  link.setAttribute('download', filename);
  link.click();
}

function quantOrdersTable(quantOrders, o, msrp) {
  var _order = [], totalOrder = 0
  quantOrders.forEach(function(o) {
    totalOrder+=o.quantity
    _order = _order.concat([
      '<tr><td>',
        o.key,
      '</td>',
      '<td>',
        o.quantity,
      '</td><td class="">&nbsp;$',
        o.quantity*msrp,
      '</td></tr>'
    ])
  })

  _order = _order.concat([
      '<tr><td class="center">&nbsp;</td><td class="center">&nbsp;</td>',
      '<td class="center"><b>$',
        totalOrder * msrp,
      '</b></td></tr>'
  ])

  return _order.join('')
}

function vexFlag(proj) {
  vex.dialog.open({
    message: 'Request to Remove',
    input: [
      '<div> ',
        '<form> ',
          '<div class="checkbox">',
            '<label style="display: grid;">',
              '<input type="checkbox" value="" name="t1" id="t1">',
              'Obscene content, whether images or text',
            '</label>',
          '</div>',
          '<div class="checkbox">',
            '<label style="display: grid;">',
              '<input type="checkbox" value="" name="t2" id="t2">',
              'Malicious content',
            '</label>',
          '</div>',
          '<div class="checkbox">',
            '<label style="display: grid;">',
              '<input type="checkbox" value="" name="t3" id="t3">',
              'Content that is mislabelled, misplaced, or categorized incorrectly',
            '</label>',
          '</div>',
          '<div class="checkbox">',
            '<label style="display: grid;">',
              '<input type="checkbox" value="" name="t4" id="t4">',
              'Spam and solicitations',
            '</label>',
          '</div>',
          '<div class="checkbox">',
            '<label style="display: grid;">',
              '<input type="checkbox" value="" name="t5" id="t5">',
              'Violations of site policy',
            '</label>',
          '</div>',
          '<div class="checkbox">',
            '<label style="display: grid;">',
              '<input type="checkbox" value="" name="t6" id="t6">',
              'Copyrighted work',
            '</label>',
          '</div>',
          '<div class="checkbox">',
            '<label style="display: grid;">',
              '<input type="checkbox" value="" name="t7" id="t7">',
              'Descriptions/solicitation of illegal acts',
            '</label>',
          '</div>',
        '</form>',
      '</div>',
      '<div class="flagdesc"> ',
        '<form> ',
          '<textarea class="form-control" rows="3" placeholder="enter here" name="t8" id="t8"></textarea> ',
        '</form> ',
      '</div>'
    ].join(''),
    callback: function (data) {
      if (
          !$("#t1").is(':checked')&&
          !$("#t2").is(':checked')&&
          !$("#t3").is(':checked')&&
          !$("#t4").is(':checked')&&
          !$("#t5").is(':checked')&&
          !$("#t6").is(':checked')&&
          !$("#t7").is(':checked')&&
          !$("#t8").val()
        ) return;
      Meteor.call('flagComplaint', {
        url: 'https://opensourcehollywood.org/projects/'+proj._slug+'/'+proj.ownerId,
        complaint: {
          'Obscene content, whether images or text': $("#t1").is(':checked'),
          'Malicious content': $("#t2").is(':checked'),
          'Content that is mislabelled, misplaced, or categorized incorrectly': $("#t3").is(':checked'),
          'Spam and solicitations': $("#t4").is(':checked'),
          'Violations of site policy': $("#t5").is(':checked'),
          'Copyrighted work': $("#t6").is(':checked'),
          'Descriptions/solicitation of illegal acts': $("#t7").is(':checked')
        },
        msg: $("#t8").val()
      });
    }
  });
};

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
};

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
};

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
};

/** show roles dialog */
function displayRoleTypeDialog(list, options) {
  vex.closeTop();
  // console.log(list, options)
  // console.log(new Array(10).join('1 2  '))
  var isMeteorUser = Meteor.user&&Meteor.user()||false;
  var inputHTML = list.map(function(c, idx) {
    var typeofRole = c.ctx === 'crew' ? 'a crew position' : c.ctx === 'cast' ? 'a cast position' : 'a resource needed';
    var _html = '<div class="vex-custom-field-wrapper" id="displayroles">';
    _html += '<div class="row"><div class="col-sm-12"><div class="thumbnail"><div class="caption"><h3 style="margin-bottom: 10px;">' + (c.title||c.role||c.category) + '</h3><p style="margin-bottom: 13px;font-weight:200">'+ typeofRole +'</p><p style="margin-bottom: 5px">' + c.description + '</p>';
    if (isMeteorUser) {
      // console.log('what is ctx ?')
      // console.log(c.ctx)
      // console.log('raw c = ')
      // console.log(c)
      _html += '<div class="btn-toolbar">';

      if (options.apply_pay) _html+='<a href="#" class="btn btn-default btn-group apply-pay" role="button" idx="'+idx+'" ctx="' +c.ctx+'">Request Pay</a>'
      if (options.apply_time) _html+='<a href="#" class="btn btn-default btn-group apply-time" role="button" idx="'+idx+'" ctx="' +c.ctx+'">Donate Time</a>'

      if (c.ctx!=='need') {
        if (options.apply_donate) _html+='<a href="#" class="btn btn-default btn-group apply-donate" role="button" idx="'+idx+'" ctx="' +c.ctx+'">Offer Pay</a>'
      }

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
        if (options.signin) return $('.login').click();
        if (!data) {
            return
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
          var ctx = $(e.target).attr('ctx').trim()
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
                ctx:ctx, 
                position: position.title||position.role||position.category,
                type: 'hired',
                pay: amt,
                amount: amt,
                message: currentTitle + ' offer',
                route: 'applyToProject',
                slug: currentSlug,
                appliedFor: position.title||position.role||position.category
              };
              Meteor.call(o.route, o, function(err, result) {
                vex.dialog.alert(err||result);
              });
            };
          });
        });

        $('.apply-time').on('click', function(e) {
          var position = list[parseInt($(this).attr('idx'))];
          var ctx = $(e.target).attr('ctx').trim()
          vex.closeAll();
          var o = {
            ctx:ctx, 
            position: position.title||position.role||position.category,
            type: 'hired',
            pay: 0,
            amount: 0,
            message: currentTitle + ' offer (time donation)',
            route: 'applyToProject',
            slug: currentSlug,
            appliedFor: position.title||position.role||position.category
          };
          Meteor.call(o.route, o, function(err, result) {
            vex.dialog.alert(err||result);
          });
        });

        $('.apply-donate').on('click', function(e) {
          var position = list[parseInt($(this).attr('idx'))];
          var ctx = $(e.target).attr('ctx').trim()
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
                ctx:ctx, 
                position: position.title||position.role||position.category,
                type: 'sourced',
                pay: amt,
                amount: amt,
                message: currentTitle + ' offer (money and time donation)',
                route: 'applyToProject',
                slug: currentSlug,
                appliedFor: position.title||position.role||position.category
              };
              makeStripeCharge(o);
            };
          });
        });
      }
  })
};

Template.projectView.helpers({
  hasGifts: function() {
    return this.project.gifts&&this.project.gifts.length
  },
  thumbsupactive: function() {
    // if me in upvote 'active' : null
    if (this.project.upvotedUsers.indexOf(Meteor.user()._id)>-1) return 'active';
  },
  numBackers: function() {
    return this.backers&&this.backers.length||0;
  },
  hasEquity: function() {
    if (this.project.equityInfo&&
      this.project.equityInfo.agreement1&&
      this.project.equityInfo.agreement2&&
      this.project.equityInfo.agreement3&&
      this.project.equityInfo.agreement4) 
      return true;
    return false;
  },
  soldShares: function() {
    return this.project.totalShares - this.project.availableShares;
  },
  privateShares: function() {
    // how many total private shares?
    var percent = (this.project.totalShares || 0) / 100;
    return (100 - percent) * 100;
  },
  availableShares: function() {
    // how many available private shares?
    var percent = (this.project.totalShares || 0) / 100;
    var rem = (100 - percent) * 100;
    // list of private share holders
    var assigned = this.project.usersApproved.map(function(i) {
      return i&&i.equity||0;
    }).reduce(function(a, b) {
      return a + b;
    }, 0);
    return rem - assigned;
  },
  numUpdates: function() {
    var updates = this.project.updates||[];
    return updates.length;
  },
  numLikes: function() {
    return this.project.upvotedUsers.length||0;
  },
  projectBudgetIfExists: function() {
    if (this.project.budget) {
      return Number.isInteger(parseInt(this.project.budget)) ? this.project.budget : 0
    } else {
      return Number.isInteger(parseInt(this.project.funded)) ? this.project.funded : 0
    }
  },
  projectFundedIfExists: function() {
    if (this.project.budget) {
      var funds = Number.isInteger(parseInt(this.project.funded)) ? this.project.funded : 0
      return '$'+funds+' raised';
    } else {
      return 'funds raised';
    }
  },
  showNeeded: function() {
    if (this.project.budget) return 'needed';
  },
  fundedNumber: function() {
    return Number.isInteger(parseInt(this.project.funded)) ? this.project.funded : 0
  },
  formattedUpdateDate: function() {
    return moment(this.date).format('MM-DD-YYYY');
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
  anyRolesNoAuth: function() {
    return (this.project.needs.length>0||this.project.cast.length>0||this.project.crew.length>0);
  },
  anyShares: function() {
    return this.project.availableShares || 0;
  },
  mpps: function() {
    return this.project.mpps || 1;
  },
  formattedDescription: function() {
    var that =  this;
    setTimeout(function() {
      $('#formatted_desc').html(currentProject&&currentProject.description||'');
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
    var backupURL = 'https://opensourcehollywood.org/projects/'+this.project.slug+'/'+this.project.ownerId;
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
  }
});

Template.projectView.events({
  'click #view-need-positions': function(e) {
    /** display all cast positions */
    var projectNeeds = this.project.needs;
    var isMeteorUser = Meteor.user&&Meteor.user()||false;
    var inputHTML = projectNeeds.map(function(c, idx) {
        var _html = '<div class="vex-custom-field-wrapper">';
        _html += '<div class="row"><div class="col-sm-12"><div class="thumbnail"><div class="caption"><h3>' + c.category + '</h3><p>' + c.description + '</p>';
        if (isMeteorUser) _html += '<div class="btn-toolbar"><a href="#" class="btn btn-default btn-group apply-pay" role="button" idx="'+idx+'" ctx="' + c.ctx + '">Request Pay</a><a href="#" class="btn btn-default btn-group apply-time" role="button" idx="'+idx+'" ctx="' + c.ctx + '">Donate Time</a></div>'
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
  'click .dologin': function(e) {
    e.preventDefault();
    $('.login').click();
  },
  'click #reportthis': function(e) {
    e.preventDefault();
    /** show vex dialog */
    vexFlag(this);
  },
  'click #view-roles': function(e) {
    e.preventDefault();
    displayRoleTypeDialog( 
      (
        (this.project.crew||[]).map(function(r){ 
          r.ctx='crew' 
          return r
        }).concat((this.project.cast||[]).map(function(r){ 
          r.ctx='cast' 
          return r
        }))), {
      title: 'You must be signed in to apply or offer resources.',
      signin: true
    });
  },
  'click #join-roles': function(e) {
    e.preventDefault();
    /**

      cast crew or resource
      cast / crew => select role
      resource => select resource

     */

    displayRoleTypeDialog( ((this.project.crew||[]).map(function(r){ 
          r.ctx='crew' 
          return r
        }).concat((this.project.cast||[]).map(function(r){ 
          r.ctx='cast' 
          return r
        }))) , {
      title: 'Select Role',
      apply_pay: true,
      apply_donate: true,
      apply_time: true
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

      dialogInput = dialogInput.concat([
        '<div class="vex-custom-field-wrapper">',
          '<p>We are currently in test mode. You can make all your transactions with a test credit card number 4000 0000 0000 0077 exp 02/22 cvc 222 for your transactions.</p>',
        '</div>'
      ])

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
          displayMoneyTypeDialog();
      })
    }

    displayExpressDonationDialog()
  },
  'click #buy-shares': function(e) {
    e.preventDefault();
    /** vex dialog how many shares to purchase, purchase */
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
            '<label for="date">Number of shares (' + currentProject.mpps + ' USD per share).</label>',
            '<div class="vex-custom-input-wrapper">',
                '<input name="shares" type="number" />',
            '</div>',
        '</div>'
    ]


    dialogInput = dialogInput.concat([
      '<div class="vex-custom-field-wrapper">',
        '<p>We are currently in test mode. You can make all your transactions with a test credit card number 4000 0000 0000 0077 exp 02/22 cvc 222 for your transactions.</p>',
      '</div>'
    ])

    vex.dialog.open({
      message: 'How many shares?',
      input: dialogInput.join(''),
      callback: function(data) {
        if (!data||!data.shares) return;
        var amt = Math.abs(parseInt(data.shares)) * currentProject.mpps;
        if (!isNaN(amt) && amt>0) {
          var donationObject = {
            first: Meteor.user().firstName,
            last: Meteor.user().lastName,
            email: Meteor.user().email,
            id: Meteor.user()._id,
            amount: amt,
            shares: Math.abs(parseInt(data.shares))
          }
          
          makeStripeCharge({
            amount: amt,
            message: 'Purchase ' + data.shares + ' shares',
            description: data.shares + ' shares purchased on O . S . H .',
            donationObject: donationObject,
            route: 'buyShares',
            slug: currentSlug
          });
        }
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
    goDiscovery();
  },
  'click .fulfill_gift': function(e) {
    e.preventDefault();
    var was = this
    o={gift:this.order.gift}
    var orderSummary = [
      '<div class="row">',
        '<div class="col-sm-7">',
        this.order.gift.name,
        '<br>Order Summary</div>',
        '<div class="panel-body">',
          '<table class="table"><thead><tr><th>Type</th><th>Quantity</th><th>Total</th></tr></thead><tbody>',
          quantOrdersTable(this.order.order, o, this.order.gift.msrp),
          '</tbody></table>',
        '</div>',
      '</div>'
    ].join('')
    orderSummary = orderSummary + [
      '<div class="row">',
        '<div class="col-sm-7">Shipping Details</div>',
        '<div class="panel-body">',
          '<table class="table"><tbody>',
          '<tr><td>name</td><td>',this.order.name,'</td>',
          '<tr><td>address</td><td>',this.order.address,'</td>',
          '<tr><td>city</td><td>',this.order.city,'</td>',
          '<tr><td>state, zip</td><td>',[this.order.state, this.order.zip].join(', '),'</td>',
          '<tr><td>contact</td><td>',[this.order.email, this.order.phone].join('; '),'</td>',
          '</tbody></table>',
        '</div>',
      '</div>'
    ].join('')

    var buttons = [
        $.extend({}, vex.dialog.buttons.NO, { text: 'Close' })
    ]

    if (!was.fulfilled) {
      buttons.unshift($.extend({}, vex.dialog.buttons.NO, { text: 'Mark as Fulfilled', className: 'aquamarineB', click: function($vexContent, event) {
          this.value = 'fulfill';
          this.close()
      }}))
    }

    buttons.unshift($.extend({}, vex.dialog.buttons.NO, { text: 'Download', className: 'lemonB', click: function($vexContent, event) {
        this.value = 'report';
        this.close()
    }}))

    var user_name = this.user && this.user.name || '';
    var user_avatar = this.user && this.user.avatar || '';
    var vexOpen = true;
    var _vex = vex.dialog.open({
      title: 'Gift Fulfillment',
      input: orderSummary,
      buttons: buttons,
      callback: function (data) {
        if (!vexOpen) return;
        vexOpen = false;
          if (!data) {
              return
          }
          
          if (data==='fulfill') {
            Meteor.call('markMerchFulfillment', was)
          };

          if (data==='report') {
            ConvertToCSV(was)
          };

          _vex.close();
      }
    });
  },
  'click #donation_btn': function(e) {
    e.preventDefault();
    var was = this;

    var dialogInput = [
      '<label for="application_offer" style="display:break;">Please verify payment for $'+donationObject.amount+'</label>'
    ]

    var intmodal = vex.dialog.open({
      title: 'Your Donation',
      message: dialogInput.join(''),
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

    var dialogInput = [
      '<figure class="snip1165">',
        '<img src="',
        was.url||was.data,
        '" />',
        '<figcaption>',
          '<h3>',
          was.name,
          '</h3>',
          '<p>',
            was.description,
          '</p>',
          '<h4>ADDITIONAL INFORMATION:&nbsp;<br><small><strong>',
            was.secondaryData||'no additional information provided for this item',
          '</small></strong></h4>',
          '<h4>REFUND POLICY & DISCLAIMER:&nbsp;<br><small><strong>',
            was.disclaimer||'no refund policy or disclaimer provided for this item',
          '</small></strong></h4>',
          '<hr>',
          '<h6 style="margin-top:8px;margin-bottom:0px">$',
          was.msrp,
          '&nbsp;<span style="font-weight:300"><small>per unit</small></span></h6>',
        
    ]

    var quantityData = was.quantity

    if (was.type==='Apparel') {
      // show sizes / availability
      for (var key in quantityData) {
        dialogInput = dialogInput.concat([
          '<div class="row merchbottomborder t20">',
              '<div class="col-sm-12 col-md-5">',
                  '<div class="checkbox">',
                    '<input class="apparelsize" type="text" value="',
                    key,
                    '" readonly/>',
                  '</div>',
              '</div>',
              '<div class="col-sm-12 col-md-7">',
                  '<label style="font-weight:300">',
                    quantityData[key],
                    '&nbsp;units available',
                  '</label>',
                  '<input class="quantorder" type="number" min="0" val="',
                  key,
                  '" max="',
                  quantityData[key],
                  '" placeholder="how many units?">',
                  
              '</div>',
          '</div>'
        ])
      }
    } else {
      // ask quantity
      dialogInput = dialogInput.concat([
        '<div class="row merchbottomborder t20">',
            '<div class="col-sm-12">',
                '<label style="font-weight:300">',
                  quantityData.all,
                  '&nbsp;units available',
                '</label>',
                '<input class="quantorder" val="',was.name.replace('"',''),'" type="number" min="0" max="',
                quantityData.all,
                '" placeholder="how many units?">',
            '</div>',
        '</div>'
      ])
    }


    dialogInput = dialogInput.concat(['</figcaption>','</figure>'])
  
    var vex1Open = true, vex2Open = true, vex3Open = true;
    var vex1 = vex.dialog.open({
        message: [was.type, 'for sale'].join(' '),
        // message: ['   Details of ',was.name,'. Purchase below.'].join(''),
        buttons: [
          $.extend({}, vex.dialog.buttons.YES, { text: 'PURCHASE' }),
          $.extend({}, vex.dialog.buttons.NO, { text: 'Close' }),
        ],
        input: dialogInput.join(''),
        callback: function (data) {
            if (!data) {
                return
            }

            var quantOrders = [], totalOrder = 0
            $('.quantorder').each(function() {
              if (parseInt($(this).val())) {
                quantOrders.push({
                  key: $(this).attr('val'),
                  quantity: parseInt($(this).val())
                })
              };
            })

            for (var i = 0; i < quantOrders.length; i++) {
              var desiredQuant = quantOrders[i].quantity
              var actualQuant = was.quantity[quantOrders[i].key]
              if (desiredQuant>actualQuant) {
                vex1.close();
                vex.dialog.alert("You requested more items than were available. Please try again.")
                return
              } else {
                totalOrder+=desiredQuant
              }
            };

            var orderSummary = [
              '<div class="row">',
                '<div class="col-sm-7">',
                was.name,
                '<br>Order Summary</div>',
                '<div class="panel-body">',
                  '<table class="table"><thead><tr><th>Type</th><th>Quantity</th><th>Total</th></tr></thead><tbody>',
                  quantOrdersTable(quantOrders, o, was.msrp),
                  '</tbody></table>',
                '</div>',
              '</div>'
            ].join('')

            if (vex1Open) {
              vex1Open = false;
              vex1.close();

              var od = {}
              try {
                od = JSON.parse(localStorage.getItem('orderTemplate'))
              } catch(e) {}

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
                  orderSummary,
                  '<h5>Please complete your order:</h5>',
                  '<div class="vex-custom-field-wrapper">',
                      '<label for="address-gift">Recipient Name</label>',
                      '<div class="vex-custom-input-wrapper">',
                          '<input type="text" class="form-control contrastback" placeholder="enter name here" id="address-name"',
                          od.name ? ['value="', od.name, '"'].join(''):'',
                           '>',
                      '</div>',
                  '</div>',
                  '<div class="vex-custom-field-wrapper">',
                      '<label for="address-gift">Shipping Address</label>',
                      '<div class="vex-custom-input-wrapper">',
                          '<input type="text" class="form-control contrastback" placeholder="e.g. 6925 Hollywood Blvd" id="address-gift"',
                          od.address ? ['value="', od.address, '"'].join(''):'',
                           '>',
                      '</div>',
                  '</div>',
                  '<div class="vex-custom-field-wrapper">',
                      '<label for="city-gift">City</label>',
                      '<div class="vex-custom-input-wrapper">',
                          '<input type="text" class="form-control contrastback" placeholder="e.g. Hollywood" id="city-gift"',
                          od.city ? ['value="', od.city, '"'].join(''):'',
                           '>',
                      '</div>',
                  '</div>',
                  '<div class="vex-custom-field-wrapper">',
                      '<label for="state-gift">State</label>',
                      '<div class="vex-custom-input-wrapper">',
                          '<input type="text" class="form-control contrastback" placeholder="e.g. CA or California" id="state-gift"',
                          od.state ? ['value="', od.state, '"'].join(''):'',
                           '>',
                      '</div>',
                  '</div>',
                  '<div class="vex-custom-field-wrapper">',
                      '<label for="zip-gift">Zip Code</label>',
                      '<div class="vex-custom-input-wrapper">',
                          '<input type="text" class="form-control contrastback" placeholder="e.g. 90028" id="zip-gift"',
                          od.zip ? ['value="', od.zip, '"'].join(''):'',
                           '>',
                      '</div>',
                  '</div>',
                  '<div class="vex-custom-field-wrapper">',
                      '<label for="email-gift">Contact Email</label>',
                      '<div class="vex-custom-input-wrapper">',
                          '<input type="text" class="form-control contrastback" placeholder="e.g. yours@email.com" id="email-gift"',
                          od.email ? ['value="', od.email, '"'].join(''):'',
                           '>',
                      '</div>',
                  '</div>',
                  '<div class="vex-custom-field-wrapper">',
                      '<label for="email-gift">Verify Email</label>',
                      '<div class="vex-custom-input-wrapper">',
                          '<input type="text" class="form-control contrastback" placeholder="e.g. yours@email.com" id="email-gift-ver"',
                          od.email ? ['value="', od.email, '"'].join(''):'',
                           '>',
                      '</div>',
                  '</div>',
                  '<div class="vex-custom-field-wrapper">',
                      '<label for="phone-gift">Contact Phone</label>',
                      '<div class="vex-custom-input-wrapper">',
                          '<input type="text" class="form-control contrastback" placeholder="e.g. (310) 555-1212" id="phone-gift"',
                          od.phone ? ['value="', od.phone, '"'].join(''):'',
                           '>',
                      '</div>',
                  '</div>'
              ]

              var vex2 = vex.dialog.open({
                message: 'Order Information',
                buttons: [
                  $.extend({}, vex.dialog.buttons.YES, { text: 'CONTINUE' }),
                  $.extend({}, vex.dialog.buttons.NO, { text: 'Cancel' }),
                ],
                input: dialogInput.join(''),
                callback: function (data) {

                    if (!data) {
                        return
                    }
                    if (vex2Open) {
                      vex2Open = false;
                      vex2.close();
                      try {
                        o.name = $('#address-name').val(), o.address = $('#address-gift').val(), o.city = $('#city-gift').val(), o.state = $('#state-gift').val(), o.zip = $('#zip-gift').val(), o.email = $('#email-gift').val().toLowerCase().trim(), o.phone = $('#phone-gift').val();
                        if (o.email!==$('#email-gift-ver').val().toLowerCase().trim()) return vex.dialog.alert('invalid email, your email must match');
                        if (!o.address||!o.zip||!o.email) return vex.dialog.alert('invalid order information, please include address, email, and zipcode fields and try again');
                        localStorage.setItem('orderTemplate', JSON.stringify(o));
                        o.order = quantOrders;
                        o.amount = totalOrder * was.msrp;
                        o.totalUnits = totalOrder;
                        o.message = was.name + ' purchase';
                        o.route = 'purchaseGift';
                        o.slug = currentSlug;
                        var vex3 = vex.dialog.open({
                          message: 'Confirmation & Payment',
                          input: orderSummary + [
                            '<div class="row">',
                              '<div class="col-sm-7">Shipping Details</div>',
                              '<div class="panel-body">',
                                '<table class="table"><tbody>',
                                '<tr><td>name</td><td>',o.name,'</td>',
                                '<tr><td>address</td><td>',o.address,'</td>',
                                '<tr><td>city</td><td>',o.city,'</td>',
                                '<tr><td>state, zip</td><td>',[o.state, o.zip].join(', '),'</td>',
                                '<tr><td>contact</td><td>',[o.email, o.phone].join('; '),'</td>',
                                '</tbody></table>',
                              '</div>',
                            '</div>'
                          ].join(''),
                          callback: function(data) {
                            if (!data) return;
                            if (vex3Open) {
                              vex3Open = false
                              vex3.close()
                              makeStripeCharge(o)
                            };
                          }
                        })
                      } catch(e) {}
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
  },
  'click .offer_resource': function(e) {
    var assets = Meteor.user().assets||[]
    if (!assets.length)
      return vex.dialog.alert('You have not uploaded any assets, add assets in the "Settings" section.')

    var cat = this.category
    var asss = []
    assets.forEach(function(a) {
      if (cat===a.category) asss.push(a);
    })

    if (!asss.length)
      return vex.dialog.alert('You do not have assets to match this type, update your assets in the "Settings" section.')


    function addslashes( str ) {
        return (str + '').replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0');
    }

    var asssTr = asss.map(function(a, idx) { 
      return [
        '<tr>',
            '<td>',a.name,'</td>',
            '<td>',a.description,'</td>',
            "<th><a href='#!' class='select_asss'><i class='assscheck fa fa-check-circle' val='",
            idx,
            "'></i></a></th>",
        '</tr>'
      ].join('') 
    }).join('')


    var asssTable = [
      '<table class="table">',
          '<thead>',
            '<th>Name</th>',
            '<th>Description</th>',
            '<th>Select</th>',
          '</thead>',
          '<tbody id="gift-table">',
          asssTr,
          '</tbody>',
      '</table>',
      '<p><small><strong>Do you want to make an express offer?</strong></small></p>',
      '<div class="col-sm-12 col-md-8">',
          '<label><small>what is your offer for the selected assets?</small></label>',
          '<input type="number" min="0" max="999999" name="offer" placeholder="Enter price here" />',
      '</div>',
      '<div class="col-sm-12 col-md-8">',
          '<label><small>How many days is this offer good for?</small></label>',
          '<input type="number" min="3" max="90" name="days" placeholder="Enter number of days" />',
      '</div>',
      '<div class="col-sm-12 col-md-8">',
          '<label><small>Do you have a custom message?</small></label>',
          '<input type="text" name="message" placeholder="Enter your message here" />',
      '</div>',
    ].join('')

    var showVex1 = true
    var _vex1 = vex.dialog.open({
      message: ['Select ', cat, ' Asset to Offer'].join(''),
      input: asssTable,
        buttons: [
            $.extend({}, vex.dialog.buttons.YES, { text: 'OFFER', className: 'aquamarineB' }),
            $.extend({}, vex.dialog.buttons.NO, { text: 'Close' }),
        ],
      afterOpen: function() {
        $('.select_asss').off()
        $('.select_asss').on('click', function(e) {
          e.preventDefault()
          var i = $(e.target).closest('i')
          if ($(i).hasClass('fa-circle')) {
            $(i).removeClass('fa-circle').addClass('fa-check-circle')
          } else {
            $(i).removeClass('fa-check-circle').addClass('fa-circle')
          }
        })
      },
      callback: function(data) {
        if (showVex1&&data) {
          showVex1 = false
          var d = []
          $('.assscheck.fa-check-circle').each(function() {
            try { d.push(asss[parseInt($(this).attr('val'))]) } catch(e) { console.log(e) }
          })

          if (!d.length) {
            _vex1.close()
            return setTimeout(function() {
              vex.dialog.alert('None of your assets were checked!')
            }, 144)
          };

          data.assets = d
          data.project = currentProject
          data.slug = currentSlug
          Meteor.call('offerProjectAsset', data, function(e, r) {
            _vex1.close()
            return setTimeout(function() {
              vex.dialog.alert(r)
            }, 144)
          })
        };
      }

    })
  }
});

Template.projectView.onRendered(function() {
  if ($(window).width()<580) {
    setTimeout(function() {
      $($( ".tabs-select" )[1]).prepend('<i id="crazed_foo" class="fa fa-chevron-down fa-2x" style="position:absolute;pointer-events:none;"></i>');
      $('#genreclick2').click();
    }, 610);
  }
  
  setTimeout(function() {
      $('.fb-share').html('<li class="fa fa-facebook"></li>');
      $('.tw-share').html('<li class="fa fa-twitter"></li>');
      $('.pinterest-share').html('<li class="fa fa-pinterest"></li>');
      $('.googleplus-share').html('<li class="fa fa-google-plus"></li>');
      $('#genreclick1').click();
  }, 144);
});

/**
  @params { String } ctx - crewApplicants | roleApplicants
  @params { Object } project
  */
function uniqueApplicantsFromProject(ctx, project) {

  var unique = []
  var uids = []

  var arr = (project['roleApplicants']||[]).concat(project['crewApplicants']||[])

  for (var i = arr.length - 1; i >= 0; i--) {
    var a = arr[i]
    if (uids.indexOf(a.user.id)>-1) {
      continue
    } else {
      unique.push(a)
      uids.push(a.user.id)
    }
  }

  return unique
}

Template.applicants.helpers({
  assetsConsolidated: function() {
    return {
      cat: this.assets[0].category,
      names: this.assets.map(function(a) {
        return a.name
      }).join(', '),
      express: this.expressOffer.offer ? true : false
    }
  },
  fulfilled: function() {
    if (this.fulfilled) return true;
    return false
  },
  giftTotals: function() {
    var totalAmount = 0
    var purchases = this.purchases()
    for (var i = 0; i < purchases.length; i++) {
      var p = purchases[i]
      if (p.purpose==='gift purchase') totalAmount += parseFloat(p.amount)
    };

    return totalAmount
  },
  orderDate: function() {
    return new Date(this.created).toDateString()
  },
  isWidth: function() {
    return $(window).width() >= 770;
  },
  anon: function() {
    return this.user.id==='anon';
  },
  currentSlug: function() {
    return currentSlug
  },
  appliedFor: function() {
    return appliedFor;
  },
  applicants: function() {
    return uniqueApplicantsFromProject('roleApplicants', this.project)
  },
  hasApplicant: function() {
    var lnRoles = this.project&&this.project.roleApplicants&&this.project.roleApplicants.length||0
    var lnCrew = this.project&&this.project.crewApplicants&&this.project.crewApplicants.length||0
    return (lnRoles + lnCrew) > 0
  }
})

Template.applicants.events({
  'click .res_show_resources': function(e) {
    $('.resources_view_toggle').hide()
    $('.res_show_resources').removeClass('bold')
    $(e.target).addClass('bold')
    var v= $(e.target).attr('val')
    var id = '#' + v
    $(id).show()
  },
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
});

Template.applicantsHelper.helpers({
  currentSlug: function() {
    return currentSlug;
  },
  thisString: function() {
    return JSON.stringify(this)
  },
  foobar: function() {
    // console.log(new Array(100).join('# '))
    // console.log(this)
  },
  typeofRequest: function() {
    // console.log(this)
    // if (this.audition&&this.audition!=='N/A') return 'Request Audition';
    return 'Negotiate';
  },
  poke: function() {
    return this.poke;
  }
});

Template.applicantsHelper.events({
  'click .initiateNegotiate': function(e) {
    try {
      var val = JSON.parse($(e.target).attr('val'))
      Meteor.call('pokeApplicant', val);
    } catch(e) {
      vex.dialog.alert('There was an error, please try again later.');
    }
  }
});

Handlebars.registerHelper("inc", function(value, options) {
    return parseInt(value) + 1;
});