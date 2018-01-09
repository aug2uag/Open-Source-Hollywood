var StripePublicKey = 'pk_test_imJVPoEtdZBiWYKJCeMZMt5A';
var gifts = [];
var osettings = {};

function validateUrl(value) {
  return /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(value);
}

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

Template.newProject.onRendered(function() {
  gifts = [];
  osettings = {};
  osettings.banner = {};
  osettings.giftImage = {};
});

Template.newProject.events({
  'click #create_campaign': function(e) {
    e.preventDefault();
    var o = {};
    o.zip = $('#location').val() && $('#location').val().replace(' ', '') || '';
    if (o.zip.match(/\d{5}/)) {
      var url = 'https://api.zippopotam.us/us/' + o.zip;
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
            console.log(e)
            bootbox.alert('something went wrong, please try again')
          }
        };
      };

      client.send();
    } else {
      return bootbox.alert('invalid zip code, please try again');
    }

    function campcallback() {
      o.title = $('#title').val() || 'untitled';
      o.logline = $('#logline').val() || 'nothing to see here';
      o.category = $('#category').find(":selected").text();
      if (o.category.toLowerCase().indexOf('format')>-1) return bootbox.alert('please select category or genre');
      o.genre = $('#genre').find(":selected").text();
      o.purpose = $('#purpose').find(":selected").text();
      o._gifts = gifts;
      if (validateUrl($('#website').val())) o.website = $('#website').val();
      o.description = $('#description').val() || 'no description';
      o.creatorsInfo = $('#creators_info').val() || 'not provided';
      o.storyInfo = $('#story_info').val() || 'not provided';
      o.historyInfo = $('#history_info').val() || 'not provided';
      o.plansInfo = $('#plans_info').val() || 'not provided';
      o.needsInfo = $('#needs_info').val() || 'not provided';
      o.significanceInfo = $('#significance_info').val() || 'not provided';
      if (validateUrl($('#video_explainer').val())) o.videoExplainer = $('#video_explainer').val();
      if (osettings.banner.data) o._banner = osettings.banner.data;
      else o.banner = 'https://s3-us-west-2.amazonaws.com/producehour/placeholder_banner.jpg';
      var crew = $('.crew-val'); 
      o.crew = [];
      crew.each(function(i, el) {
        var _o = {};
        var arr = $(el).children('td');
        _o.title = $(arr[0]).text();
        _o.description = $(arr[1]).text();
        _o.status = $(arr[2]).text();
        o.crew.push(_o);
      });

      var cast = $('.cast-val');
      o.cast = [];
      cast.each(function(i, el) {
        var _o = {};
        var arr = $(el).children('td');
        _o.role = $(arr[0]).text();
        _o.description = $(arr[1]).text();
        _o.status = $(arr[2]).text();
        o.cast.push(_o);
      });

      var needs = $('.needs-val');
      o.needs = [];
      needs.each(function(i, el) {
        var _o = {};
        var arr = $(el).children('td');
        _o.category = $(arr[0]).text();
        _o.description = $(arr[1]).text();
        _o.quantity = $(arr[2]).text();
        o.needs.push(_o);
      });

      var social = $('.social-val');
      o.social = [];
      social.each(function(i, el) {
        var _o = {};
        var arr = $(el).children('td');
        _o.name = $(arr[0]).text();
        _o.address = $(arr[1]).text();
        o.social.push(_o);
      });

      // create virtual account for project
      // add funds to virtual account, non-refundable


      Meteor.call('addProject', o);

      // var budget = parseInt(options.budget) || 0;
      // options.processingFee = (budget * 0.05);
      // var _d2 = '<b>There\'s a $10 fee for hosting your project and storage, 5% on transfers, fees for additional storage apply. Do you agree to our <a href="/terms" target="_blank">Terms & Conditions</a>?';
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
    if (!osettings.giftImage.data) o.url = 'https://s3-us-west-2.amazonaws.com/producehour/placeholder_gift.jpg';
    else o.data = osettings.giftImage.data;
    osettings.giftImage = {};
    gifts.push(o);
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
