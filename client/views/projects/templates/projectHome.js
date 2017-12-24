const StripePublicKey = 'pk_test_imJVPoEtdZBiWYKJCeMZMt5A';

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


Template.projectHome.helpers({
  foo: function() {
    var x = Meteor.user();
    if (!x) return false;
    return !(x.primaryRole || (x.iam&&x.iam.length));
  },
  defaultQ: function() {
    if (this.logline.length>101) return this.logline.substr(0, 98)+'..';
    return this.logline;
  },
  formattedTitle: function() {
    if (this.title.length>24) return this.title.substr(0, 22)+'..';
    return this.title;
  },
  castLn: function() {
    var x = this.cast.filter(function(e){if(e.status==='needed')return true}).length;
    var msg_;
    if (x===0) msg_=' none';
    if (x===1) msg_=' role';
    else msg_ = ' roles';
    return (x + msg_);
  },
  crewLn: function() {
    var x = this.crew.filter(function(e){if(e.status==='needed')return true}).length;
    var msg_;
    if (x===0) msg_=' none';
    if (x===1) msg_=' position';
    else msg_ = ' positions';
    return (x + msg_);
  },
  counts3: function() {
    var x = Session.get('pCount');
    x = x || 0;
    return x > 3 && Meteor.user();
  },
  counts30: function() {
    var x = Session.get('pCount');
    x = x || 0;
    return x > 30;
  },
  projects: function () {
    var pLimit = Session.get('pLimit') || 30;
    Session.set('pLimit', pLimit);
    if (Session.equals('order', 'hot')) {
      var p = Projects.find({isApproved:true, archived: false, isLive: {$ne: true}}, {sort: {count: -1, createTimeActual: -1, title: 1}, skip: Session.get('pSkip'), limit: Session.get('pLimit')});
      Session.set('pCount', p.count());
      return p;
    }
    else if (Session.equals('order', 'top')){
      var p = Projects.find({isApproved:true, archived: false, isLive: {$ne: true}}, {sort: {count: -1}, skip: Session.get('pSkip'), limit: Session.get('pLimit')});
      Session.set('pCount', p.count());
      return p;
    }
    else if (Session.equals('order', 'newest')) {
      var p = Projects.find({isApproved:true, archived: false, isLive: {$ne: true}}, {sort: {createTimeActual: -1}, skip: Session.get('pSkip'), limit: Session.get('pLimit')});
      Session.set('pCount', p.count());
      return p;
    }
    else if (Session.equals('order', 'alphabetical')) {
      var p = Projects.find({isApproved:true, archived: false, isLive: {$ne: true}}, {sort: {title: 1}, skip: Session.get('pSkip'), limit: Session.get('pLimit')});
      Session.set('pCount', p.count());
      return p;
    }
    else if (Session.equals('order', 'film')) {
      var p = Projects.find({isApproved:true, archived: false, isLive: {$ne: true}, purpose: "Motion Pictures/Theatrical"}, {sort: {createTimeActual: -1}, skip: Session.get('pSkip'), limit: Session.get('pLimit')});
      Session.set('pCount', p.count());
      return p;
    }
    else if (Session.equals('order', 'music')) {
      var p = Projects.find({isApproved:true, archived: false, isLive: {$ne: true}, purpose: "Music/Score"}, {sort: {createTimeActual: -1}, skip: Session.get('pSkip'), limit: Session.get('pLimit')});
      Session.set('pCount', p.count());
      return p;
    }
    else if (Session.equals('order', 'books')) {
      var p = Projects.find({isApproved:true, archived: false, isLive: {$ne: true}, purpose: "Writing/Novel"}, {sort: {createTimeActual: -1}, skip: Session.get('pSkip'), limit: Session.get('pLimit')});
      Session.set('pCount', p.count());
      return p;
    }
    else { /*by default the tab is on hot, in hot order */
      var p = Projects.find({isApproved:true, archived: false, isLive: {$ne: true}}, {sort: {count: -1, createTimeActual: -1, title: 1}, skip: Session.get('pSkip'), limit: Session.get('pLimit')});
      Session.set('pCount', p.count());
      return p;
    }
  }
});

Template.projectHome.events({
  "click #hot": function(){
    Session.set('order', 'hot');
  },
  "click #top": function(){
    Session.set('order', 'top');
  },
  "click #newest": function(){
    Session.set('order', 'newest');
  },
  "click #alphabetical": function(){
    Session.set('order', 'alphabetical');
  },
  "click #film": function(){
    Session.set('order', 'film');
  },
  "click #music": function(){
    Session.set('order', 'music');
  },
  "click #books": function(){
    Session.set('order', 'books');
  },
  "click .next": function() {
    var s = Session.get('pSkip');
    s = s + 30;
    Session.set('pSkip', s);
  },
  "click .prev": function() {
    var s = Session.get('pSkip');
    if (s !== 0 && s > 0){
      s = s - 30;
      Session.set('pSkip', s);
    }
  }
});

Template.projectHome.events({
  'click #createnewproject': function(e) {
    if (!Meteor.user()) {
      return bootbox.alert('you must sign in to do that')
    };
    Router.go('Create Project');
  },
  'click .quick_apply': function(e) {
    e.preventDefault();
    var was = this;
    var innermodal = bootbox.dialog({
      title: 'Apply for a position',
      message: '<div class="container" style=" position: relative; width: 100%;"> <h3> <p class="align-center bootbox">Thanks for applying</p></h3> <h5> <p class="align-center bootbox">what are your terms?</p></h5> <div class="btn-group btn-group-apply-modal col-md-12" data-toggle="buttons"> <div class="col-md-6"> <label class="btn btn-default" style=" display: block;"> <input type="radio" name="apply_type" id="hired" value="hired">HIRED </label> </div><div class="col-md-6"> <label class="btn btn-default" style=" display: block;"> <input type="radio" name="apply_type" id="sourced" value="sourced">SOURCED </label> </div></div><div id="apply_instruct" class="col-md-12"> <h5> <p class="align-center bootbox">choose <code>HIRED</code> for paid gigs and <code>SOURCED</code> for others</p></h5> </div><div class="row" id="forhired" hidden> <div id="apply_instruct" class="col-md-8 col-md-offset-2"> <h5> <p class="align-center bootbox bootpadded">define how much money and/or equity you request for the job</p></h5> </div><div class="col-md-12"> <div class="col-md-6"> <div class="input-group input-group-sm"> <span class="input-group-addon">$</span> <input type="number" class="form-control contrastback" placeholder="Amount ($)" min="1" id="apply-pay"> <span class="input-group-addon">for payment</span> </div></div><div class="col-md-6"> <div class="input-group input-group-sm"> <span class="input-group-addon">%</span> <input type="number" class="form-control contrastback" placeholder="Amount (%)" min="1" max="100" id="apply-equity"> <span class="input-group-addon">for equity</span> </div></div></div></div><div class="row" id="forsourced" hidden> <div class="col-md-12"> <div class="input-group input-group-sm col-md-10 col-md-offset-1"> <h5> <p class="align-center bootbox bootpadded">offer a donation with an expiration, your donation is conditioned by your acceptance to the project based on the project owner\'s decision before the expiration date</p></h5> </div><div class="col-md-6"> <div class="input-group input-group-sm"> <span class="input-group-addon">$</span> <input type="number" class="form-control contrastback" placeholder="Amount (in US Dollars)" min="1" id="apply-gratis"> </div></div><div class="col-md-6"> <div class="input-group input-group-sm"> <span class="input-group-addon"><i class="glyphicon glyphicon-calendar"></i></span> <input type="date" class="form-control contrastback" placeholder="select expiration" id="apply-gratis-exp"> </div></div></div></div></div>',
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
            var s = $("input:radio[name='apply_type']:checked").val(), o = {ctx:'crew', position:'ANY'};
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
              o.expires=$('#apply-gratis-exp').val();
            }
            if (!o.pay) o.type='hired';
            if (o.pay) o.amount = o.pay;
            o.message = 'APPLY: "'+was.title+'"';
            o.route = 'applyToProject';
            o.slug = was.slug;
            o.appliedFor = 'any cast or crew position that is the best fit';
            if (o.pay&&o.type!=='hired') makeStripeCharge(o);
            else Meteor.call(o.route, o, function(err, result) {
              bootbox.alert(result||'your application was successful pending your payment');
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
})

Template.projectHome.rendered = function () {
   $(document).ready(function(){
      $("#loadVideo").bind("click", function(){
        videoUrl = $(this).attr("data-video-src")
        $("#video").attr("src", videoUrl)
      });
      $('.login').html('<i class="fa fa-sign-in"></i>&nbsp;&nbsp;&nbsp;Sign In');
    });
};
