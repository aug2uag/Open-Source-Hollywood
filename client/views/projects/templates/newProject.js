var StripePublicKey = 'pk_test_Dgvlv9PBf6RuZJMPkqCp00wg';
Template.newProject.onRendered(function() {
  Session.set('needs', []);
  Session.set('gifts', []);
  Session.set('campaignFiles', []);
});

Template.newProject.events({
  'submit .addProjectForm':function(e){
    e.preventDefault();
    var options = {};
    // get location
    var loc = e.target.location.value.replace(' ', '');
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
              var o = data.places[0];
              options.city = o['place name'];
              options.state = o.state;
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
      var genres = [];
      $('.genre_tag.active').each(function(idx,el) {
        genres.push($(el).html());
        $(el).toggleClass("active");
      });
      if (genres.length === 0) {
        bootbox.alert('you must selector Genres');
        return false;
      };
      var needs = Session.get('needs') || [];
      if (needs.length === 0) {
        var _needsAgg = [];
        $('.tag_need.active').each(function(idx,el) {
          _needsAgg.push($(el).html());
          $(el).toggleClass("active");
        });
        if ($('#needs').val()) {
          needs.push({
            need: $('#needs').val(),
            tags: needsAgg
          });
        }
        $('#needs').val('')
        if (needs.length === 0) {
          bootbox.alert('you must define Needs');
          return false;
        };
      };

      options.gifts = Session.get('gifts');
      options.files = Session.get('campaignFiles');
      options.title = e.target.title.value;
      options.logline = e.target.logline.value;
      options.videoURL = e.target.video.value;
      options.details = e.target.details.value;
      options.genres = genres;
      options.needs = needs;
      options.selectedSegment = selectedSegment;
      options.budget = e.target.budget.value;
      options.creators = $('#creators').val();
      options.story = $('#story').val();
      options.history = $('#history').val();
      options.plans = $('#plans').val();
      options.needsExplained = $('#needsExplained').val();
      options.significance = $('#significance').val();
      options.purpose = $( "#selector option:selected" ).text();
      if (!options.title || !options.logline|| !options.details || !options.videoURL || !options.needs || !options.purpose) {
        bootbox.alert('enter values for all fields');
        return false;
      };

      if (options.videoURL.indexOf('youtu.be') > -1) {
        bootbox.alert('please select URL or embed URL, not this one');
        return;
      } else if (options.videoURL.indexOf('youtube') > -1) {
        options.videoURL = options.videoURL.replace('watch?v=', 'embed/');
      };
      
      var budget = parseInt(options.budget) || 0;
      options.processingFee = (budget * 0.05);
      var _d2 = '<b>We charge a $10 fee for 1GB storage and 5% for money transfers, fees for additional storage apply. Do you agree to our <a href="/terms" target="_blank">Terms & Conditions</a>?';
      bootbox.confirm(_d2, function(r) { 
        if (!r) return;
        StripeCheckout.open({
          key: StripePublicKey,
          amount: 1000,
          currency: 'usd',
          name: 'Create Campaign.',
          description: 'Open Source Hollywood Production Creation.',
          token: function(receipt) {
            options.receipt = receipt;
            Meteor.call('addProject', options);
            Session.set('needs', []);
            Session.set('gifts', []);
            return false;
          }
        });
      });
    }

  },
  'click .select_tag': function(e) {
    e.preventDefault();
    $(e.target).toggleClass("active");
  },
  'click #add_need': function(e) {
    var needs = Session.get('needs');
    var needsAgg = [];
    $('.tag_need.active').each(function(idx,el) {
      needsAgg.push($(el).html());
      $(el).toggleClass("active");
    });
    if ($('#needs').val()) {
      needs.push({
        need: $('#needs').val(),
        tags: needsAgg
      });
      Session.set('needs', needs);
    }
    $('#needs').val('')
  },
  'click #add_gift': function(e) {
    bootbox.confirm("<form id='gift_value' action=''>\
        Gift title:<input id='gift_title' type='text' name='title' placeholder='title of your gift' /><br/>\
        Gift description:<input id='gift_description' type='text' name='description' placeholder='description of your gift' />\
        Gift offer:<input id='gift_offer' type='number' name='value' placeholder='dollar amount of your gift' />\
        </form>", 
    function(result) {
        if(result) { 
            var x = $('#gift_title').val(),
                y = $('#gift_description').val(),
                z = $('#gift_offer').val();
            if (x && y && z) {
              var gifts = Session.get('gifts');
              gifts.push({
                title: x,
                description: y,
                value: parseInt(z)
              });
              Session.set('gifts', gifts);
            };
            $('#gift_title').val('');
            $('#gift_description').val('');
            $('#gift_offer').val('');

          }
    });
    if ($('#needs').val()) {
      needs.push({
        need: $('#needs').val(),
        tags: needsAgg
      });
      Session.set('needs', needs);
    }
    $('#needs').val('')
  },
  'click .remove_need': function(e) {
    e.preventDefault();
    var _id = this.id;
    var needs = Session.get('needs');
    needs.forEach(function(n, i) {
      if (i === _id) {
        needs.splice(i, 1);
        return;
      };
    });
    Session.set('needs', needs);
  },
  'click .remove_gift': function(e) {
    e.preventDefault();
    var gifts = Session.get('gifts');
    var _id = this.title + this.description + this.value;
    gifts.forEach(function(g, idx) {
      var __id = g.title + g.description + g.value;
      if (__id === _id) {
        gifts.splice(idx, 1);
        return;
      };
    });
    Session.set('gifts', gifts);
  },
  'click #campaign_files': function(e) {
    e.preventDefault();
    if (Object.keys(osettings).length === 0) return;
    var reader = new FileReader();
    reader.onload = function(readerEvt) {
      var _campaignFiles = Session.get('campaignFiles');
      osettings.data = readerEvt.target.result;
      _campaignFiles.push(osettings);
      osettings = {};
      $('#fileInput').val('');
      Session.set('campaignFiles', _campaignFiles);
    };
    reader.readAsDataURL(osettings.file);
  },
  'change #fileInput': function (e, template) {
    // needs to collect all files
    // in one array
    // on create
    // iterate each, and store as s3

      if (e.currentTarget.files && e.currentTarget.files[0]) {
        osettings = {};
        var files = e.target.files;
        var file = files[0];
        osettings.file = file;
        osettings.size = file.size;
        osettings.type = file.type;
      }
  },
  'click .remove_file': function(e) {
    e.preventDefault;
    var _f = Session.get('campaignFiles');
    _f.splice(this.id, 1);
    Session.set('campaignFiles', _f);
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
