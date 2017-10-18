const css = ['main.css', 'core.css', 'images.css', 'forms.css', 'calendar.css', 'sticker.css', 'aging.import.css', 'print.css', 'temp.css', 'datepicker.import.css', 'icons.css', 'body.css', 'header.css', 'attachment.css', 'list.css', 'labels.css', 'member.css', 'fullcalendar.css'];
const StripePublicKey = 'pk_test_Dgvlv9PBf6RuZJMPkqCp00wg';
var donationObject = {};
var currentSlug, currentTitle, destinationAccount;
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
    amount: Math.abs(Math.floor(options.amount*100))<1?1:Math.abs(Math.floor(options.amount*100)),
    currency: 'usd',
    name: options.message,
    description: options.description || 'opensourcehollywood.org',
    panelLabel: 'Pay Now',
    token: function(_token) {
      if (_token) {
        options.token = _token;
        Meteor.call(options.route, options, function(err, result) {
          if (err) bootbox.alert('your payment failed');
          bootbox.alert(result)

        });
      } else {
        bootbox.alert('your payment did not succeed');
      }
    }
  });
}

Template.projectView.helpers({
  website: function() {
    currentSlug = this._slug || '';
    currentTitle = this.project.title || '';
    destinationAccount = this.project.account && this.project.account.id || '';
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
              message: 'Donation to ' + currentTitle,
              description: '$' + donationObject.amount + ' donated',
              destination: destinationAccount,
              donationObject: donationObject,
              route: 'donateToProject',
              slug: was._slug
            });
          }
        }
      }
    });
  },
  'click .general_need-response': function(e) {
    e.preventDefault();
    var was = this;
    var intmodal = bootbox.dialog({
      title: 'Resource Needed',
      message: '<div class="bs-callout bs-callout-danger"><h4>'+was.category+'</h4> <p>'+was.description+'</p> </div>',
      buttons: {
        danger:  {
          label: 'Cancel',
          className: "btn-danger",
          callback: function() { intmodal.modal('hide') }
        },
        success: {
          label: "LEND RESOURCE",
          className: "btn-success",
          callback: function() {
            intmodal.modal('hide')
            // add user to requested resource
            Meteor.call("lendResource", {
              slug: currentSlug,
              asset: was.category
            });
            bootbox.alert('Your offer was successfully dispatched, thank you !');
          }
        }
      }
    });
  },
  'click .crew_detail': function(e) {
    e.preventDefault();
    var was = this;
    var buttons = {
      danger:  {
        label: 'Close',
        className: "btn-danger",
        callback: function() { intmodal.modal('hide') }
      }
    }
    var intmodal = null;
    if (was.status==='needed') {
      buttons.success = {
        label: "APPLY",
        className: "btn-success",
        callback: function() {
          intmodal.modal('hide')
          /**
              ask for pay: [equity and/or pay]
              gratis or conditional donation: pay (default 0)
          */
          var innermodal = bootbox.dialog({
            title: was.title.toUpperCase(),
            message: '<div class="container" style=" position: relative; width: 100%;"><h3> <p class="align-center bootbox">Thanks for applying</p></h3><h5> <p class="align-center bootbox">what are your terms?</p></h5><div class="btn-group btn-group-apply-modal col-md-12" data-toggle="buttons"> <div class="col-md-6"> <label class="btn btn-default" style=" display: block;"> <input type="radio" name="apply_type" id="hired" value="hired">HIRED </label> </div><div class="col-md-6"> <label class="btn btn-default" style=" display: block;"> <input type="radio" name="apply_type" id="sourced" value="sourced">SOURCED </label> </div></div><div id="apply_instruct" class="col-md-12"> <h5> <p class="align-center bootbox">choose <code>HIRED</code> for paid gigs and <code>SOURCED</code> for others</p></h5></div><div class="row" id="forhired" hidden> <div id="apply_instruct" class="col-md-8 col-md-offset-2"> <h5> <p class="align-center bootbox bootpadded">define how much money and/or equity you request for the job</p></h5> </div><div class="col-md-12"> <div class="col-md-6"> <div class="input-group input-group-sm"> <span class="input-group-addon">$</span> <input type="number" class="form-control contrastback" placeholder="Amount ($)" min="1" id="apply-pay"> <span class="input-group-addon">for payment</span> </div></div><div class="col-md-6"> <div class="input-group input-group-sm"> <span class="input-group-addon">%</span> <input type="number" class="form-control contrastback" placeholder="Amount (%)" min="1" max="100" id="apply-equity"> <span class="input-group-addon">for equity</span> </div></div></div></div><div class="row" id="forsourced" hidden> <div class="col-md-10 col-md-offset-1"> <div class="bootpadded"> <div class="input-group input-group-sm"> <span class="input-group-addon">$</span> <input type="number" class="form-control contrastback" placeholder="Amount (in US Dollars)" min="1" id="apply-gratis"> </div></div><div class="input-group input-group-sm"> <h4> <p class="align-center bootbox bootpadded">your donation is conditioned by your acceptance to the project based on the project owner\'s decision</p></h4> </div></div></div></div>',
            buttons: {
              danger:  {
                label: 'Cancel',
                className: "btn-danger",
                callback: function() { innermodal.modal('hide') }
              }, 
              success: {
                label: "PROCEED",
                className: "btn-success",
                callback: function() {
                  var s = $("input:radio[name='apply_type']:checked").val(), o = {ctx:'crew', position:was.title};
                  if (s==='hired') {
                    var pay = parseFloat($('#apply-pay').val());
                    var equity = parseFloat($('#apply-equity').val());
                    o.type = 'hired';
                    o.pay=pay||0;
                    o.equity=equity||0;
                  } else {
                    var pay = parseFloat($('#apply-gratis').val());
                    o.type = 'sourced';
                    o.pay=pay||0;
                  }
                  if (!o.pay) o.type='hired';
                  if (o.pay) o.amount = o.pay;
                  o.message = currentTitle + ' crew offer';
                  o.destination = destinationAccount;
                  o.route = 'applyToProject';
                  o.slug = currentSlug;
                  o.appliedFor = was.title;
                  if (o.pay&&o.type!=='hired') makeStripeCharge(o);
                  else Meteor.call(o.route, o, function(err, result) {
                    bootbox.alert(err||result);
                  });
                  
                  
                }
              }
            }
          }).on('shown.bs.modal', function (e) {
            $("input:radio[name='apply_type']").change(function(){
              $('#apply_instruct').hide();
                var _val = $(this).val();
               if(_val==='hired'){
                $('#forhired').show();
                $('#forsourced').hide();
               }else{
                $('#forhired').hide();
                $('#forsourced').show(); 
               }
            });
          });
        }
      }
    }
    intmodal = bootbox.dialog({
      title: was.title.toUpperCase(),
      message: '<div class="bs-callout bs-callout-danger"><h4>This crew position is currently '+((was.status==='needed')?'':'NOT')+' AVAILABLE for applicants to apply.</h4> <p>'+was.description+'</p> </div>',
      buttons: buttons
    });
  },
  'click .role_detail': function(e) {
    e.preventDefault();
    var was = this;
    var buttons = {
      danger:  {
        label: 'Close',
        className: "btn-danger",
        callback: function() { intmodal.modal('hide') }
      }
    }
    var intmodal = null;
    if (was.status==='needed') {
      buttons.success = {
        label: "APPLY",
        className: "btn-success",
        callback: function() {
          intmodal.modal('hide')
          // add user to requested resource
          Meteor.call("lendResource", {
            slug: currentSlug,
            asset: was.category
          });
          /**
              ask for pay: [equity and/or pay]
              gratis or conditional donation: pay (default 0)
          */
          var innermodal = bootbox.dialog({
            title: was.role.toUpperCase(),
            message: '<div class="container" style=" position: relative; width: 100%;"><h3> <p class="align-center bootbox">Thanks for applying</p></h3><h5> <p class="align-center bootbox">what are your terms?</p></h5><div class="btn-group btn-group-apply-modal col-md-12" data-toggle="buttons"> <div class="col-md-6"> <label class="btn btn-default" style=" display: block;"> <input type="radio" name="apply_type" id="hired" value="hired">HIRED </label> </div><div class="col-md-6"> <label class="btn btn-default" style=" display: block;"> <input type="radio" name="apply_type" id="sourced" value="sourced">SOURCED </label> </div></div><div id="apply_instruct" class="col-md-12"> <h5> <p class="align-center bootbox">choose <code>HIRED</code> for paid gigs and <code>SOURCED</code> for others</p></h5></div><div class="row" id="forhired" hidden> <div id="apply_instruct" class="col-md-8 col-md-offset-2"> <h5> <p class="align-center bootbox bootpadded">define how much money and/or equity you request for the job</p></h5> </div><div class="col-md-12"> <div class="col-md-6"> <div class="input-group input-group-sm"> <span class="input-group-addon">$</span> <input type="number" class="form-control contrastback" placeholder="Amount ($)" min="1" id="apply-pay"> <span class="input-group-addon">for payment</span> </div></div><div class="col-md-6"> <div class="input-group input-group-sm"> <span class="input-group-addon">%</span> <input type="number" class="form-control contrastback" placeholder="Amount (%)" min="1" max="100" id="apply-equity"> <span class="input-group-addon">for equity</span> </div></div></div></div><div class="row" id="forsourced" hidden> <div class="col-md-10 col-md-offset-1"> <div class="bootpadded"> <div class="input-group input-group-sm"> <span class="input-group-addon">$</span> <input type="number" class="form-control contrastback" placeholder="Amount (in US Dollars)" min="1" id="apply-gratis"> </div></div><div class="input-group input-group-sm"> <h4> <p class="align-center bootbox bootpadded">your donation is conditioned by your acceptance to the project based on the project owner\'s decision</p></h4> </div></div></div></div>',
            buttons: {
              danger:  {
                label: 'Cancel',
                className: "btn-danger",
                callback: function() { innermodal.modal('hide') }
              }, 
              success: {
                label: "PROCEED",
                className: "btn-success",
                callback: function() {
                  var s = $("input:radio[name='apply_type']:checked").val(), o = {ctx:'cast', position:was.role};
                  if (s==='hired') {
                    var pay = parseFloat($('#apply-pay').val());
                    var equity = parseFloat($('#apply-equity').val());
                    o.type = 'hired';
                    if (pay&&typeof pay==='number'&&pay>1) o.pay=pay;
                    if (equity&&typeof equity==='number'&&equity>1) o.equity=equity;
                  } else {
                    var pay = parseFloat($('#apply-gratis').val());
                    o.type = 'sourced';
                    if (pay&&typeof pay==='number'&&pay>=0) o.pay=pay;
                  }
                  if (!o.pay) o.type='hired';
                  if (o.pay) o.amount = o.pay;
                  o.message = currentTitle + ' cast offer';
                  o.destination = destinationAccount;
                  o.route = 'applyToProject';
                  o.slug = currentSlug;
                  o.appliedFor = was.role;
                  if (o.pay&&o.type!=='hired') makeStripeCharge(o);
                  else Meteor.call(o.route, o, function(err, result) {
                    bootbox.alert(err||result);
                  });
                }
              }
            }
          }).on('shown.bs.modal', function (e) {
            $("input:radio[name='apply_type']").change(function(){
              $('#apply_instruct').hide();
                var _val = $(this).val();
               if(_val==='hired'){
                $('#forhired').show();
                $('#forsourced').hide();
               }else{
                $('#forhired').hide();
                $('#forsourced').show(); 
               }
            });
          });
        }
      }
    }
    intmodal = bootbox.dialog({
      title: was.role.toUpperCase(),
      message: '<div class="bs-callout bs-callout-danger"><h4>This cast position is '+((was.status==='needed')?'':'NOT')+' AVAILABLE for applicants to apply.</h4> <p>'+was.description+'</p> </div>',
      buttons: buttons
    });
  },
  'click .purchase_gift': function(e) {
    e.preventDefault();
    var was = this, o={gift:was};
    // popup get address for delivery
    // leave phone number and email
    // send to fulfill
    var intmodal = bootbox.dialog({
      title: 'PURCHASE GIFT',
      message: '<div class="container" style=" position: relative; width: 100%;"><h3> <p class="align-center bootbox">'+was.name+'</p></h3><h5> <p class="align-center bootbox">'+was.description+'</p></h5><div class="row"> <div id="apply_instruct" class="col-md-8 col-md-offset-2"> <h5> <p class="align-center bootbox bootpadded">please enter shipping addressing and purchase info</p></h5> </div><div class="col-md-12"> <div class="col-md-6 bootpadded"> <label for="address-gift">street address</label> <div class="input-group input-group-sm"> <span class="input-group-addon"></span> <input type="text" class="form-control contrastback" placeholder="e.g. 6925 Hollywood Blvd" id="address-gift"> </div></div><div class="col-md-6 bootpadded"> <label for="city-gift">city name</label> <div class="input-group input-group-sm"> <span class="input-group-addon"></span> <input type="text" class="form-control contrastback" placeholder="e.g. Hollywood" id="city-gift"> </div></div><div class="col-md-6 bootpadded"> <label for="state-gift">state name</label> <div class="input-group input-group-sm"> <span class="input-group-addon"></span> <input type="text" class="form-control contrastback" placeholder="e.g. CA or California" id="state-gift"> </div></div><div class="col-md-6 bootpadded"> <label for="zip-gift">zip code</label> <div class="input-group input-group-sm"> <span class="input-group-addon"></span> <input type="text" class="form-control contrastback" placeholder="e.g. 90028" id="zip-gift"> </div></div><div class="col-md-6 bootpadded"> <label for="email-gift">correspondence email</label> <div class="input-group input-group-sm"> <span class="input-group-addon"></span> <input type="text" class="form-control contrastback" placeholder="e.g. yours@email.com" id="email-gift"> </div></div><div class="col-md-6 bootpadded"> <label for="phone-gift">correspondence phone number</label> <div class="input-group input-group-sm"> <span class="input-group-addon"></span> <input type="text" class="form-control contrastback" placeholder="e.g. (310) 555-1212" id="phone-gift"> </div></div></div></div>',
      buttons: {
        danger:  {
          label: 'Cancel',
          className: "btn-danger",
          callback: function() { intmodal.modal('hide') }
        }, 
        success: {
          label: "Purchase",
          className: "btn-success",
          callback: function() {
            o.address = $('#address-gift').val(), o.city = $('#city-gift').val(), o.state = $('#state-gift').val(), o.zip = $('#zip-gift').val(), o.email = $('#email-gift').val(), o.phone = $('#phone-gift').val();
            if (!o.address||!o.city||!o.state||!o.zip||!o.email||!o.phone) return;
            var innermodal = bootbox.dialog({
              title: 'VERIFY GIFT PURCHASE',
              message: '<div class="container" style=" position: relative; width: 100%;"><h3> <p class="align-center bootbox">Please Verify Purchase</p></h3><h5> <p class="align-center bootbox">$'+was.msrp+' gift purchase with shipping and correspondence information as below.</p></h5><ul class="alt"> <li>address: '+o.address.toUpperCase()+'</li><li>city: '+o.city.toUpperCase()+'</li><li>state: '+o.state.toUpperCase()+'</li><li>zip: '+o.zip+'</li><li>email: '+o.email.toLowerCase()+'</li><li>phone: '+o.phone+'</li></ul></div>',
              buttons: {
                danger:  {
                  label: 'Cancel',
                  className: "btn-danger",
                  callback: function() { innermodal.modal('hide') }
                }, 
                success: {
                  label: "PROCEED",
                  className: "btn-success",
                  callback: function() {
                    o.amount = was.msrp;
                    o.message = was.name + ' purchase';
                    o.destination = destinationAccount;
                    o.route = 'purchaseGift';
                    o.slug = currentSlug;
                    makeStripeCharge(o);
                  }
                }
              }
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
    if (bootbox.confirm("This action will permanently delete your project. Are you sure you want to continue?", function(r) {
      if (!r || r === false) return;
      Meteor.call("deleteProject", was._slug);
    }));
  },
  "click .start": function () {
    var was = this;
    Meteor.call("startProject", was._slug);
  },
  'click #submit-comment': function() {
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
     if ($(window).width() >= 770) {
      $('#upvote').css('left', '8px');
     } else {
      $('#upvote').css('left', '7px');
     }
 });