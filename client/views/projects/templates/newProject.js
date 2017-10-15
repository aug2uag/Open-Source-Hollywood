var gifts = [];
var osettings = {};

function deleteRow(e) {
  e.preventDefault();
  $(this).closest('tr').remove();
}

function removeGift(e) {
  e.preventDefault();
  var idx = $($(this).closest('tr')).index();
  gifts.splice(idx, 1);
  $(this).closest('tr').remove();
}

var StripePublicKey = 'pk_test_Dgvlv9PBf6RuZJMPkqCp00wg';
Template.newProject.onRendered(function() {
  gifts = [];
  osettings = {};
  osettings.banner = {};
  osettings.giftImage = {};
});

Template.newProject.events({
  'click #create_campaign': function(e) {
    e.preventDefault();
    console.log('foolala')
    /**
      title
      logline
      location
      website
      description
      category -- select
      creators_info            ==> textarea
      story_info               ==> textarea
      history_info            ==> textarea
      plans_info              ==> textarea
      needs_info               ==> textarea
      significance_info       ==> textarea
      team
      cast
      needs
      banner_file
      video_explainer
      social-table
      gifts-table
    */
    var o = {};
    var loc = $('#location').val() && $('#location').val().replace(' ', '') || '';
    if (loc.match(/\d{5}/)) {
      var url = 'https://api.zippopotam.us/us/' + loc;
      var client = new XMLHttpRequest();
      client.open("GET", url, true);
      client.onreadystatechange = function() {
        if(client.readyState == 4) {
          try {
            var data = JSON.parse(client.responseText);
            if (Object.keys(data).length === 0) return bootbox.alert('invalid zip code, please try again');
            if (data.country === 'United States') {
              var _o = data.places[0];
              o.city = _o['place name'];
              o.state = _o.state;
              campcallback();
            };
          } catch (e) {
            bootbox.alert('something went wrong, please try again')
          }
        };
      };

      client.send();
    } else {
      return bootbox.alert('invalid zip code, please try again');
    }

    function campcallback() {
      o.title = $('#title').val();
      o.logline = $('#logline').val();
      o.format = $('#category').find(":selected").text();
      if (o.primaryRole.toLowerCase().indexOf('format')>-1) delete o['primaryRole'];



      console.log(new Array(100).join('u'))
      console.log(o)
      
      // if (!options.title || !options.logline|| !options.details || !options.videoURL || !options.needs || !options.purpose) {
      //   bootbox.alert('enter values for all fields');
      //   return false;
      // };

      // if (options.videoURL.indexOf('youtu.be') > -1) {
      //   bootbox.alert('please select URL or embed URL, not this one');
      //   return;
      // } else if (options.videoURL.indexOf('youtube') > -1) {
      //   options.videoURL = options.videoURL.replace('watch?v=', 'embed/');
      // };
      
      // var budget = parseInt(options.budget) || 0;
      // options.processingFee = (budget * 0.05);
      // var _d2 = '<b>We charge a $10 fee for 1GB storage and 5% for money transfers, fees for additional storage apply. Do you agree to our <a href="/terms" target="_blank">Terms & Conditions</a>?';
      // bootbox.confirm(_d2, function(r) { 
      //   if (!r) return;
      //   StripeCheckout.open({
      //     key: StripePublicKey,
      //     amount: 1000,
      //     currency: 'usd',
      //     name: 'Create Campaign.',
      //     description: 'Open Source Hollywood Production Creation.',
      //     token: function(receipt) {
      //       options.receipt = receipt;
      //       Meteor.call('addProject', options);
      //       Session.set('needs', []);
      //       Session.set('gifts', []);
      //       return false;
      //     }
      //   });
      // });
    }
  },
  'change #banner_file': function (e, template) {
      if (e.currentTarget.files && e.currentTarget.files[0]) {
        osettings.banner = {};
        var reader = new FileReader();
        var files = e.target.files;
        var file = files[0];
        if (file.type.indexOf("image")==-1) {
          bootbox.alert('Invalid File, you can only upload a static image for your profile picture');
          return;
        };
        reader.onload = function(readerEvt) {
            osettings.banner.data = readerEvt.target.result;
          }; 
        reader.readAsDataURL(file);
      }
  },
  'change #gift_file': function (e, template) {
      if (e.currentTarget.files && e.currentTarget.files[0]) {
        osettings.giftImage = {};
        var reader = new FileReader();
        var files = e.target.files;
        var file = files[0];
        if (file.type.indexOf("image")==-1) {
          bootbox.alert('Invalid File, you can only upload a static image for your profile picture');
          return;
        };
        reader.onload = function(readerEvt) {
            osettings.giftImage.data = readerEvt.target.result;
        }; 
        reader.readAsDataURL(file);
      }
  },
  'click #add-crew': function(e) {
    e.preventDefault();
    var title = $('#crew-title').val(), description = $('#crew-description').val(), status = $('input[name=crew-radio]:checked').val();
    if (title && description && status) $('#crew-table').append('<tr class="crew-val"><td>'+title+'</td><td>'+description+'</td><td>'+status+'</td><td><button class="deleteRow button small">X</button></td></tr>');
    $('.deleteRow').on('click', deleteRow);
    $('#crew-title').val(''), $('#crew-description').val(''), $("#crew-radio-needed").prop("checked", true);
  },

  'click #add-cast': function(e) {
    e.preventDefault();
    var title = $('#cast-title').val(), description = $('#cast-description').val(), status = $('input[name=cast-radio]:checked').val();
    if (title && description && status) $('#cast-table').append('<tr class="cast-val"><td>'+title+'</td><td>'+description+'</td><td>'+status+'</td><td><button class="deleteRow button small">X</button></td></tr>');
    $('.deleteRow').on('click', deleteRow);
    $('#cast-title').val(''), description = $('#cast-description').val(''), $("#cast-radio-needed").prop("checked", true);
  },

  'click #add-needs': function(e) {
    e.preventDefault();
    var cat = $('#needs-category').val(), description = $('#needs-description').val(), quantity = parseInt($('#needs-quantity').val());
    if (cat.toLowerCase().indexOf('category')>-1) return;
    if (typeof quantity !== 'number' || quantity<1) return;
    if (cat && description && quantity) $('#needs-table').append('<tr class="needs-val"><td>'+cat+'</td><td>'+description+'</td><td>'+quantity+'</td><td><button class="deleteRow button small">X</button></td></tr>');
    $('.deleteRow').on('click', deleteRow);
    $("#needs-category").val($("#needs-category option:first").val()), $('#needs-description').val(''), $('#needs-quantity').val('');
  },

  'click #add-social': function(e) {
    e.preventDefault();
    var title = $('#social-title').val(), url = $('#social-url').val();
    if (title && url) $('#social-table').append('<tr class="social-val"><td>'+title+'</td><td>'+url+'</td><td><button class="deleteRow button small">X</button></td></tr>');
    $('.deleteRow').on('click', deleteRow);
    $('#social-title').val(''), $('#social-url').val('');
  },

  'click #add-gift': function(e) {
    e.preventDefault();
    var o = {};
    o.name = $('#gift-title').val(), o.description = $('#gift-description').val(), o.quantity = parseInt($('#gift-quantity').val()), o.msrp = parseFloat($('#gift-msrp').val());
    if (!o.name || !o.quantity || !o.msrp || typeof o.quantity !== 'number' || typeof o.msrp !== 'number' || o.quantity < 1 || o.msrp < 1) return;
    if (!osettings.giftImage.data) o.url = 'https://s3-us-west-2.amazonaws.com/producehour/placeholder_gift';
    else o.data = osettings.giftImage.data;
    osettings.giftImage = {};
    gifts.push(o);
    console.log('gift pushed');
    console.log(gifts)
    $('#gift-table').append('<tr class="social-val"><td>'+o.name+'</td><td>'+o.description+'</td><td>'+o.quantity+'</td><td>'+o.msrp+'</td><td><button class="removeGift button small">X</button></td></tr>');
    $('.removeGift').on('click', removeGift);
    $('#gift-title').val(''), $('#gift-description').val(''), $('#gift-quantity').val(''), $('#gift-msrp').val('');
  }
});

Template.newProject.helpers({
  needs: function() {
    var needs = Session.get('needs');
    var _needs = needs.map(function(el, idx) {
      return {
        need: el.need,
        tags: el.tags,
        id: idx
      }
    });
    return _needs;
  },
  gifts: function() {
    var gifts = Session.get('gifts');
    return gifts;
  },
  hasGifts: function() {
    var gifts = Session.get('gifts');
    return gifts && gifts.length > 0;
  },
  basicsTab: function() {
    return Session.get('basicsTab');
  },
  rewardsTab: function() {
    return Session.get('rewardsTab');
  },
  storyTab: function() {
    return Session.get('storyTab');
  },
  aboutTab: function() {
    return Session.get('aboutTab');
  },
  accountTab: function() {
    return Session.get('accountTab');
  },
  previewTab: function() {
    return Session.get('previewTab');
  },
  projectFiles: function() {
    return Session.get('campaignFiles').map(function(f, idx) {
      f.idx = idx;
      return f;
    });
  },
  hasCampaignFiles: function() {
    var files = Session.get('campaignFiles');
    return files && files.length > 0;
  }
});
