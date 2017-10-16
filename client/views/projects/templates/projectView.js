const css = ['main.css', 'core.css', 'images.css', 'forms.css', 'calendar.css', 'sticker.css', 'aging.import.css', 'print.css', 'temp.css', 'datepicker.import.css', 'icons.css', 'body.css', 'header.css', 'attachment.css', 'list.css', 'labels.css', 'member.css', 'fullcalendar.css'];
const StripePublicKey = 'pk_test_Dgvlv9PBf6RuZJMPkqCp00wg';
var donationObject = {};
function loadcss(f){
    var href = '/css/' + f;
    var ref=document.createElement("link")
    ref.setAttribute("rel", "stylesheet")
    ref.setAttribute("type", "text/css")
    ref.setAttribute("href", href)
    document.getElementsByTagName("head")[0].appendChild(ref)
};

function makeStripeCharge(options) {
  StripeCheckout.open({
    key: StripePublicKey,
    amount: options.amount * 100,
    currency: 'usd',
    name: options.message,
    description: options.description,
    panelLabel: 'Pay Now',
    token: function(_token) {
      if (_token) {
        bootbox.alert('your payment succeeded, thanks !')
        options.token = _token;
        if (options.route === 'donateToProject') {
          Meteor.call('donateToProject', options);
        };
      } else {
        bootbox.alert('your payment did not succeed');
      }
    }
  });
}

Template.projectView.helpers({
  website: function() {
    console.log(this)
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
  crowdsourced: function() {
    return this.selectedSegment === 'Crowdsourced';
  },
  crowdfunded: function() {
    return this.selectedSegment === 'Crowdfunded';
  },
  isBoth: function() {
    return this.selectedSegment === 'Both' || this.selectedSegment !== 'Crowdsourced' && this.selectedSegment !== 'Crowdfunded';
  }
})

Template.projectView.events({
  'click #donation_add_to': function(e) {
    e.preventDefault();
    donationObject = {};
    var amt = parseFloat($('#donation_amount').val());
    if (amt && typeof amt === 'number' && amt >= 5) {
      $('#total_usd').text(amt);
      $('#transfer_amt').text((amt*.05).toFixed(2));
      var funds = parseFloat($('#proj_funds').text());
      if (funds>1) $('#percent_total').text(((amt/funds)*100).toFixed(1)+'%');
      else $('#percent_total').text('infinity');
      donationObject.amount = amt;
      donationObject.user = {
        first: Meteor.user().firstName,
        last: Meteor.user().lastName,
        email: Meteor.user().email,
        id: Meteor.user()._id
      }
      $('#donation_btn').prop('disabled', false);
      $('#donation_btn').html('Donate to Campaign !');
    };
  },

  'click #donation_btn': function(e) {
    e.preventDefault();
    var was = this;
    var intmodal = bootbox.dialog({
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
              message: 'Donation to ' + was.project.title,
              description: '$' + donationObject.amount + ' donated',
              destination: was.project.account && was.project.account.id,
              donationObject: donationObject,
              route: 'donateToProject',
              slug: was._slug
            });
          }
        }
      }
    });
  },


  "click #boardButton": function() {
    $('html').css('visibility', 'hidden');
    setTimeout(function() {
        $('html').css('visibility', 'visible');
    }, 500);
    css.forEach(function(f) {
        loadcss(f);
    });
  },
  "click .closeProj": function () {
    var was = this;
    if (bootbox.confirm("Are you sure you want to close this project?", function(r) {
      if (!r || r === false) return;
      Meteor.call("closeProject", was._slug);
    }));
  },
  "click .delete": function () {
    var was = this;
    if (bootbox.confirm("Are you sure you want to delete this?", function(r) {
      if (!r || r === false) return;
      Meteor.call("deleteProject", was._slug);
    }))l
  },
  "click .start": function () {
    var was = this;
    if (bootbox.confirm("By starting the project, you allow members you approved on the project to access the board; others will no longer be able to join this project, and the approved members' contributions will be applied for use towards production. <strong>By agreeing, you will be assuming the risk and responsibility of the members' contributions funds</strong>. Would you like to proceed?", function(r) {
      if (!r || r === false) return;
      Meteor.call("startProject", was._slug);
    }));
  },
  'click #submit-comment': function() {
    var text = document.getElementById('comment-box').value;
    document.getElementById('comment-box').innerHTML = '';
    Meteor.call('addProjectComment', this._slug, 0, text);
  },
  'click #apply_campaign': function() {

  },
  'click #fund_funded': function() {
    var was = this;

    var gifts = was.gifts || [];
    gifts = gifts.filter(function(g) {
      if (!g.claimed) return g;
    });
    var giftsTable = '';
    if (gifts.length > 0) {
      giftsTable += '<table class="table table-striped" style="height:100px;overflow:scroll;">';
      giftsTable += '<thead><tr><th>#</th><th>Description</th><th>Value</th><th>#</th></tr></thead><tbody>';
      gifts.forEach(function(g, idx) {
        if (g.claimed) return;
        giftsTable += '<tr>';
        giftsTable += '<td>' + g.title + '</td>';
        giftsTable += '<td>' + g.description + '</td>';
        giftsTable += '<td>$' + g.value + '</td>';
        giftsTable += '<td><a href="#" class="accept_gift" btn btn-success" id="' + idx + '">Select</a></td>';
        giftsTable += '</tr>';
      });
      giftsTable += '</tbody></table>';
    };
    var _message = '';
    if (giftsTable) {
      _message += '<h1>Select a gift or donate a designated amount</h1>' + giftsTable;
    } else {
      _message += '<p class="lead">There are currently no gifts available from this campaign. Enter the amount you wish to support.</p>';
    }
    _message += '<label for="application_support" style="display:break;">Define the dollar amount you wish to support this campaign, 5% transaction fee applies:</label><div class="input-group"><span class="input-group-addon">$</span><input id="application_support" type="number" class="form-control" placeholder="the amount of your support"></div>';

    var intmodal = bootbox.dialog({
      title: 'Your Financial Support',
      message: _message,
      buttons: {
        danger:  {
          label: 'Cancel',
          className: "btn-danger",
          callback: function() { initialDialog.modal('hide') }
        },
        success: {
          label: "Support " + was.title,
          className: "btn-success",
          callback: function() {
            initialDialog.modal('hide')
            var contribution = parseInt($('#application_support').val());
            if (!contribution || contribution < 0) {
              contribution = 0;
            };
            var dollarValue = parseInt(contribution);
            var processingFee = (contribution * 0.05);
            dollarValue += processingFee;
            var __desc = '$' + contribution.toFixed(2) + ' to Open Source Hollywood campaign.';
            Meteor.call('addUserToProject', contribution, dollarValue, was._slug, __desc, was.title, false, true);
          }
        }
      }
    });

    $('.accept_gift').on('click', function(e) {
      var idx = parseInt(this.id), _gift = gifts[idx];
      bootbox.dialog({
        title: 'Your Financial Support',
        message: '<p class="lead">Please confirm your gift:</p><br><h3>' + _gift.title + '<h3><br>' + _gift.description + '<br>$' + _gift.value,
        buttons: {
          danger:  {
            label: 'Cancel',
            className: "btn-danger",
            callback: function() { intmodal.modal('hide') && initialDialog.modal('hide') }
          },
          success: {
            label: "Support " + was.title,
            className: "btn-success",
            callback: function() {
              intmodal.modal('hide');
              initialDialog.modal('hide');
              var contribution = _gift.value;
              if (!contribution || contribution < 0) {
                intmodal.modal('hide');
                initialDialog.modal('hide');
                return;
              };
              var dollarValue = parseInt(contribution);
              var processingFee = (contribution * 0.05);
              dollarValue += processingFee;
              var __desc = '$' + contribution.toFixed(2) + ' to Open Source Hollywood campaign.';
              Meteor.call('supportProjectForGift', contribution, dollarValue, was._slug, __desc, was.title, _gift);
            }
          }
        }
      });
    });
    
  },
  'click #fund_sourced': function() {
    var was = this;
    var initialDialog = bootbox.dialog({
      title: 'How would you like to participate?',
      message: '<div class="modal-content col-xs-10 col-xs-offset-1"> <section class="row" style=" padding-top: 5px;"> <div class="col-xs-8 col-xs-offset-2"> <p class="lead text-center">Choose among two options:</p><hr/> </div></section> <div class="row"> <article class="col-xs-6"> <div class="cards" style="padding-bottom: 10px;"> <span class="glyphicon glyphicon-flash icon"></span> <hr class="divider"/> <h2 class="title">Angel</h2> <div class="info fontcard"> <hr class="divider"/> <p class="lead" style="font-size: medium;">Financiers and capital support.</p><a id="goFund" class="btn btn-lg btn-success center-block">Go Fund!</a> </div></div></article> <article class="col-xs-4"> <div class="cards" style="padding-bottom: 10px;"> <span class="glyphicon glyphicon-ice-lolly-tasted icon"></span> <hr class="divider"/> <h2 class="title">Professional</h2> <div class="info fontcard"> <hr class="divider"/> <p class="lead" style="font-size: medium;">Apply to join for consideration.</p><a id="makeOffer" class="btn btn-lg btn-success center-block">Make Offer!</a> </div></div></article> </div></div>',
      buttons: {
        danger: {
          label: "Cancel",
          className: "btn-danger",
          callback: function() {
            
          }
        }
      }
    });

    $('#goFund').on('click', function(e) {
      // show gifts in table
      // show dollar amounts input
      var gifts = was.gifts || [];
      gifts = gifts.filter(function(g) {
        if (!g.claimed) return g;
      });
      var giftsTable = '';
      if (gifts.length > 0) {
        giftsTable += '<table class="table table-striped" style="height:100px;overflow:scroll;">';
        giftsTable += '<thead><tr><th>#</th><th>Description</th><th>Value</th><th>#</th></tr></thead><tbody>';
        gifts.forEach(function(g, idx) {
          if (g.claimed) return;
          giftsTable += '<tr>';
          giftsTable += '<td>' + g.title + '</td>';
          giftsTable += '<td>' + g.description + '</td>';
          giftsTable += '<td>$' + g.value + '</td>';
          giftsTable += '<td><a href="#" class="accept_gift" btn btn-success" id="' + idx + '">Select</a></td>';
          giftsTable += '</tr>';
        });
        giftsTable += '</tbody></table>';
      };
      var _message = '';
      if (giftsTable) {
        _message += '<h1>Select a gift or donate a designated amount</h1>' + giftsTable;
      } else {
        _message += '<p class="lead">There are currently no gifts available from this campaign. Enter the amount you wish to support.</p>';
      }
      _message += '<label for="application_support" style="display:break;">Define the dollar amount you wish to support this campaign, 5% transaction fee applies:</label><div class="input-group"><span class="input-group-addon">$</span><input id="application_support" type="number" class="form-control" placeholder="the amount of your support"></div>';

      var intmodal = bootbox.dialog({
        title: 'Your Financial Support',
        message: _message,
        buttons: {
          danger:  {
            label: 'Cancel',
            className: "btn-danger",
            callback: function() { initialDialog.modal('hide') }
          },
          success: {
            label: "Support " + was.title,
            className: "btn-success",
            callback: function() {
              initialDialog.modal('hide')
              var contribution = parseInt($('#application_support').val());
              if (!contribution || contribution < 0) {
                contribution = 0;
              };
              var dollarValue = parseInt(contribution);
              var processingFee = (contribution * 0.05);
              dollarValue += processingFee;
              var __desc = '$' + contribution.toFixed(2) + ' to Open Source Hollywood campaign.';
              Meteor.call('addUserToProject', contribution, dollarValue, was._slug, __desc, was.title, false, true);
            }
          }
        }
      });

      $('.accept_gift').on('click', function(e) {
        var idx = parseInt(this.id), _gift = gifts[idx];
        bootbox.dialog({
          title: 'Your Financial Support',
          message: '<p class="lead">Please confirm your gift:</p><br><h3>' + _gift.title + '<h3><br>' + _gift.description + '<br>$' + _gift.value,
          buttons: {
            danger:  {
              label: 'Cancel',
              className: "btn-danger",
              callback: function() { intmodal.modal('hide') && initialDialog.modal('hide') }
            },
            success: {
              label: "Support " + was.title,
              className: "btn-success",
              callback: function() {
                intmodal.modal('hide');
                initialDialog.modal('hide');
                var contribution = _gift.value;
                if (!contribution || contribution < 0) {
                  intmodal.modal('hide');
                  initialDialog.modal('hide');
                  return;
                };
                var dollarValue = parseInt(contribution);
                var processingFee = (contribution * 0.05);
                dollarValue += processingFee;
                var __desc = '$' + contribution.toFixed(2) + ' to Open Source Hollywood campaign.';
                Meteor.call('supportProjectForGift', contribution, dollarValue, was._slug, __desc, was.title, _gift);
              }
            }
          }
        });

      });
    });

    $('#applyToday').on('click', function(e) {
      // show bootbox with number input as original
      bootbox.dialog({
        title: 'Payment Necessary',
        message: '<h1>By paying, you agree to the following:</h1><p class="lead">Money will be transfered contingent upon your acceptance, and the campaign starting. Once transfered, a refund cannot be recovered. A $2 application fee and 5% transfer fee apply.</p><div class="input-group" style="display:inline-flex;"><label for="application_amount">Your offer:</label><span class="input-group-addon">$</span><input id="application_amount" type="number" class="form-control" placeholder="enter the amount you wish to support"></div>',
        buttons: {
          danger:  {
            label: 'Cancel',
            className: "btn-danger",
            callback: function() { initialDialog.modal('hide') }
          },
          success: {
            label: "Apply to " + was.title,
            className: "btn-success",
            callback: function() {
              initialDialog.modal('hide')
              var contribution = parseInt($('#application_amount').val());
              if (!contribution || contribution < 0) {
                contribution = 0;
              };
              var dollarValue = parseInt(contribution);
              var processingFee = 2 + (contribution * 0.05);
              dollarValue += processingFee;
              var __desc = '$' + contribution.toFixed(2) + ' to Open Source Hollywood campaign.';
              Meteor.call('addUserToProject', contribution, dollarValue, was._slug, __desc, was.title, false, false);
            }
          }
        }
      });
    });

  },
  'click #fund': function() {
    var was = this;
    var initialDialog = bootbox.dialog({
      title: 'How would you like to participate?',
      message: '<div class="modal-content col-xs-10 col-xs-offset-1"> <section class="row" style=" padding-top: 5px;"> <div class="col-xs-8 col-xs-offset-2"> <p class="lead text-center">Choose among three options:</p><hr/> </div></section> <div class="row"> <article class="col-xs-4"> <div class="cards" style="padding-bottom: 10px;"> <span class="glyphicon glyphicon-flash icon"></span> <hr class="divider"/> <h2 class="title">Angel</h2> <div class="info fontcard"> <hr class="divider"/> <p class="lead" style="font-size: medium;">Financiers and capital support.</p><a id="goFund" class="btn btn-lg btn-success center-block">Go Fund!</a> </div></div></article> <article class="col-xs-4"> <div class="cards" style="padding-bottom: 10px;"> <span class="glyphicon glyphicon-bookmark icon"></span> <hr class="divider"/> <h2 class="title">Joint Venture</h2> <div class="info fontcard"> <hr class="divider"/> <p class="lead" style="font-size: medium;">Apply with an offer to support.</p><a id="applyToday" class="btn btn-lg btn-success center-block">Apply Today!</a> </div></div></article> <article class="col-xs-4"> <div class="cards" style="padding-bottom: 10px;"> <span class="glyphicon glyphicon-ice-lolly-tasted icon"></span> <hr class="divider"/> <h2 class="title">Professional</h2> <div class="info fontcard"> <hr class="divider"/> <p class="lead" style="font-size: medium;">Apply to join for consideration.</p><a id="makeOffer" class="btn btn-lg btn-success center-block">Make Offer!</a> </div></div></article> </div></div>',
      buttons: {
        danger: {
          label: "Cancel",
          className: "btn-danger",
          callback: function() {
            
          }
        }
      }
    });

    $('#goFund').on('click', function(e) {
      // show gifts in table
      // show dollar amounts input
      var gifts = was.gifts || [];
      gifts = gifts.filter(function(g) {
        if (!g.claimed) return g;
      });
      var giftsTable = '';
      if (gifts.length > 0) {
        giftsTable += '<table class="table table-striped" style="height:100px;overflow:scroll;">';
        giftsTable += '<thead><tr><th>#</th><th>Description</th><th>Value</th><th>#</th></tr></thead><tbody>';
        gifts.forEach(function(g, idx) {
          if (g.claimed) return;
          giftsTable += '<tr>';
          giftsTable += '<td>' + g.title + '</td>';
          giftsTable += '<td>' + g.description + '</td>';
          giftsTable += '<td>$' + g.value + '</td>';
          giftsTable += '<td><a href="#" class="accept_gift" btn btn-success" id="' + idx + '">Select</a></td>';
          giftsTable += '</tr>';
        });
        giftsTable += '</tbody></table>';
      };
      var _message = '';
      if (giftsTable) {
        _message += '<h1>Select a gift or donate a designated amount</h1>' + giftsTable;
      } else {
        _message += '<p class="lead">There are currently no gifts available from this campaign. Enter the amount you wish to support.</p>';
      }
      _message += '<label for="application_support" style="display:break;">Define the dollar amount you wish to support this campaign, 5% transaction fee applies:</label><div class="input-group"><span class="input-group-addon">$</span><input id="application_support" type="number" class="form-control" placeholder="the amount of your support"></div>';

      var intmodal = bootbox.dialog({
        title: 'Your Financial Support',
        message: _message,
        buttons: {
          danger:  {
            label: 'Cancel',
            className: "btn-danger",
            callback: function() { initialDialog.modal('hide') }
          },
          success: {
            label: "Support " + was.title,
            className: "btn-success",
            callback: function() {
              initialDialog.modal('hide')
              var contribution = parseInt($('#application_support').val());
              if (!contribution || contribution < 0) {
                contribution = 0;
              };
              var dollarValue = parseInt(contribution);
              var processingFee = (contribution * 0.05);
              dollarValue += processingFee;
              var __desc = '$' + contribution.toFixed(2) + ' to Open Source Hollywood campaign.';
              Meteor.call('addUserToProject', contribution, dollarValue, was._slug, __desc, was.title, false, true);
            }
          }
        }
      });

      $('.accept_gift').on('click', function(e) {
        var idx = parseInt(this.id), _gift = gifts[idx];
        bootbox.dialog({
          title: 'Your Financial Support',
          message: '<p class="lead">Please confirm your gift:</p><br><h3>' + _gift.title + '<h3><br>' + _gift.description + '<br>$' + _gift.value,
          buttons: {
            danger:  {
              label: 'Cancel',
              className: "btn-danger",
              callback: function() { intmodal.modal('hide') && initialDialog.modal('hide') }
            },
            success: {
              label: "Support " + was.title,
              className: "btn-success",
              callback: function() {
                intmodal.modal('hide');
                initialDialog.modal('hide');
                var contribution = _gift.value;
                if (!contribution || contribution < 0) {
                  intmodal.modal('hide');
                  initialDialog.modal('hide');
                  return;
                };
                var dollarValue = parseInt(contribution);
                var processingFee = (contribution * 0.05);
                dollarValue += processingFee;
                var __desc = '$' + contribution.toFixed(2) + ' to Open Source Hollywood campaign.';
                Meteor.call('supportProjectForGift', contribution, dollarValue, was._slug, __desc, was.title, _gift);
              }
            }
          }
        });

      });
    });

    $('#applyToday').on('click', function(e) {
      // show bootbox with number input as original
      bootbox.dialog({
        title: 'Payment Necessary',
        message: '<h1>By paying, you agree to the following:</h1><p class="lead">Money will be transfered contingent upon your acceptance, and the campaign starting. Once transfered, a refund cannot be recovered. A $2 application fee and 5% transfer fee apply.</p><div class="input-group" style="display:inline-flex;"><label for="application_amount">Your offer:</label><span class="input-group-addon">$</span><input id="application_amount" type="number" class="form-control" placeholder="enter the amount you wish to support"></div>',
        buttons: {
          danger:  {
            label: 'Cancel',
            className: "btn-danger",
            callback: function() { initialDialog.modal('hide') }
          },
          success: {
            label: "Apply to " + was.title,
            className: "btn-success",
            callback: function() {
              initialDialog.modal('hide')
              var contribution = parseInt($('#application_amount').val());
              if (!contribution || contribution < 0) {
                contribution = 0;
              };
              var dollarValue = parseInt(contribution);
              var processingFee = 2 + (contribution * 0.05);
              dollarValue += processingFee;
              var __desc = '$' + contribution.toFixed(2) + ' to Open Source Hollywood campaign.';
              Meteor.call('addUserToProject', contribution, dollarValue, was._slug, __desc, was.title, false, false);
            }
          }
        }
      });
    });

    $('#makeOffer').on('click', function(e) {
      bootbox.dialog({
        title: 'Your Professional Offer',
        message: '<label for="application_offer" style="display:break;">Define the dollar amount offer for your participation in this campaign:</label><div class="input-group"><span class="input-group-addon">$</span><input id="application_offer" type="number" class="form-control" placeholder="the amount for your participation"></div>',
        buttons: {
          danger:  {
            label: 'Cancel',
            className: "btn-danger",
            callback: function() { initialDialog.modal('hide') }
          },
          success: {
            label: "Make Offer",
            className: "btn-success",
            callback: function() {
              initialDialog.modal('hide')
              var contribution = parseInt($('#application_offer').val());
              if (!contribution || contribution < 0) {
                contribution = 0;
              };
              var dollarValue = parseInt(contribution);
              var processingFee = 2 + (contribution * 0.03);
              dollarValue += processingFee;
              var __desc = '$' + contribution.toFixed(2) + ' to Open Source Hollywood campaign.';
              Meteor.call('addUserToProject', contribution, dollarValue, was._slug, __desc, was.title, true, false);
            }
          }
        }
      });
    });
  },
  'click #upvote': function() {
    Meteor.call('upvoteProject', this._slug);
  },
  'click #downvote': function() {
    Meteor.call('downvoteProject', this._slug);
  }
});


Template.projectView.onRendered(function() {
     if ($(window).width() >= 770) {
      $('#upvote').css('left', '8px');
     } else {
      $('#upvote').css('left', '7px');
     }
 });