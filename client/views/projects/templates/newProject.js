var gifts = [];
var osettings = {};

var selectOptionsGenre = {
  meta: {
    Feature: 'mixed',
    Indie: 'mixed',
    Series: 'mixed',
    Sketch: 'mixed',
    Animations: 'mixed',
    Theater: 'mixed',
    Ensemble: 'audio',
    Performance: 'performance',
    'Music Video': 'audio',
    Podcast: 'podcast',
    Other: 'mixed'
  },
  mixed: '<option val="Drama">Drama</option><option val="Comedy">Comedy</option><option val="Documentary">Documentary</option><option val="Educational">Educational</option><option val="Game Show">Game Show</option><option val="Musical">Musical</option><option val="Reality">Reality</option><option val="News">News</option><option val="Sports">Sports</option><option val="Variety">Variety</option><option val="Kids">Kids</option><option val="Cooking">Cooking</option><option val="Other">Other</option>',
  audio: '<option val="Folk">Folk</option><option val="Classical">Classical</option><option val="Contemporary">Contemporary</option><option val="Soul">Soul</option><option val="Jazz">Jazz</option><option val="Rock">Rock</option><option val="Metal">Metal</option><option val="Pop">Pop</option><option val="Hip Hop">Hip Hop</option><option val="EDM">EDM</option><option val="Other">Other</option>',
  performance: '<option val="Ballet">Ballet</option><option val="Opera">Opera</option><option val="Dance">Dance</option><option val="Theatre">Theatre</option><option val="Other">Other</option>',
  podcast: '<option val="Comedy">Comedy</option><option val="Culture">Culture</option><option val="Politics">Politics</option><option val="Arts">Arts</option><option val="Technology">Technology</option><option val="Other">Other</option>'
}

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

var StripePublicKey = 'pk_test_Dgvlv9PBf6RuZJMPkqCp00wg';
Template.newProject.onRendered(function() {
  gifts = [];
  osettings = {};
  osettings.banner = {};
  osettings.giftImage = {};
  $(document).ready(function() {
    $('#summernote').summernote({
      toolbar: [
        // [groupName, [list of button]]
        ['style', ['bold', 'underline', 'clear', 'fontname', 'strikethrough', 'superscript', 'subscript', 'fontsize', 'color']],
        ['para', ['ul', 'ol', 'paragraph', 'style']],
        ['height', ['height']],
        ['misc', ['undo', 'redo']],
        ['insert', ['picture', 'video', 'table', 'hr']]
      ],
      height: 300,
      minHeight: null,
      maxHeight: null,
      focus: false,
      tooltip: false,
      callbacks: {
        onInit: function() {
          $('.note-editable').html('<p><span class="large">Enter your campaign description here.</span><br>You can copy / paste text from another source here or use the menu above to format text and insert images from a valid URL.</p><p>&nbsp;</p>');
        }
      }
    });
  });
});

Template.newProject.events({
  'click #file_gift': function(e) {
    $('#gift_file').click();
  },
  'click #vidurl': function(e) {
      e.preventDefault();
      vex.dialog.open({
        message: 'How to link YouTube and Vimeo URLs',
        input: [
        '<div class="embed-responsive embed-responsive-4by3">',
        '<iframe class="embed-responsive-item" src="/img/vidurls.mp4"></iframe>',
        '</div>',
        ].join(''),
        buttons: [
            $.extend({}, vex.dialog.buttons.NO, { text: 'Close' })
        ]
    });
  },
  'click #create_campaign': function(e) {
    e.preventDefault();
    var o = {};

    // (1) check video sanity
    /** 
        check youtube / vimeo format
        /^https:\/\/vimeo.com\/[\d]{8,}$/
        https://vimeo.com/262118158
        /^https:\/\/youtu.be\/[A-z0-9]{9,}$/
        https://youtu.be/cWjz9pB70vc
      */
    o.videoExplainer = $('#video_explainer').val();
    if (o.videoExplainer) {
      var vimeo = /^https:\/\/vimeo.com\/[\d]{8,}$/;
      var youtube = /^https:\/\/youtu.be\/[A-z0-9]{9,}$/;
      if (!vimeo.test(o.videoExplainer)&&!youtube.test(o.videoExplainer)) return vex.dialog.alert('your video URL link is invalid, please select the question mark for help, correct the mistake and try again or contact us');
      if (o.videoExplainer.indexOf('vimeo')>-1) {
        var patternMatch = /^https:\/\/vimeo.com\/([\d]{8,}$)/;
        var videoID = o.videoExplainer.match(patternMatch)[1];
        o.videoExplainer = 'https://player.vimeo.com/video/' + videoID + '?autoplay=0&loop=1&autopause=0';
      } else {
        var patternMatch = /^https:\/\/youtu.be\/([A-z0-9]{9,}$)/;
        var videoID = o.videoExplainer.match(patternMatch)[1];
        o.videoExplainer = 'https://www.youtube.com/embed/' + videoID;
      }
    };

    // (2) check required fields
    o.category = $('#category').find(":selected").text();
    if (o.category.toLowerCase().indexOf('format')>-1) return vex.dialog.alert('please select category or genre');

    // (3) check location and continue
    o.zip = $('#location').val() && $('#location').val().replace(' ', '') || '';
    o.title = $('#title').val() || 'untitled';
    o.logline = $('#logline').val() || 'nothing to see here';
    o.purpose = $('#genre').find(":selected").text();
    o.genre = $('#genre').find(":selected").text();
    o._gifts = gifts;
    if (validateUrl($('#website').val())) o.website = $('#website').val();

    var descriptionText = $('#summernote').summernote('code');
    var plainText = $("#summernote").summernote('code')
              .replace(/<\/p>/gi, " ")
              .replace(/<br\/?>/gi, " ")
              .replace(/<\/?[^>]+(>|$)/g, "")
              .replace(/&nbsp;|<br>/g, " ")
              .trim();

    if (plainText&&plainText!=='Enter your campaign description here. You can copy / paste text from another source here or use the menu above to format text and insert images from a valid URL.') {
      o.description = descriptionText;
      o.descriptionText = plainText;
    } else {
      o.description = '';
    };
    o.budget = $('#budget').val();
    o.creatorsInfo = $('#creators_info').val();
    o.historyInfo = $('#history_info').val();
    o.plansInfo = $('#plans_info').val();
    o.needsInfo = $('#needs_info').val();
    o.significanceInfo = $('#significance_info').val();
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

    Meteor.call('addProject', o, function(err, res) {
      vex.dialog.alert(err||res);
      if (!err) {
        setTimeout(function() {
          Router.go('Home');
        }, 987);
      };
    });
  },
  'change #banner_file': function (e, template) {
      if (e.currentTarget.files && e.currentTarget.files[0]) {
        osettings.banner = {};
        var reader = new FileReader();
        var files = e.target.files;
        var file = files[0];
        if (file.type.indexOf("image")==-1) {
          vex.dialog.alert('Invalid File, you can only upload a static image for your profile picture');
          return;
        };
        reader.onload = function(readerEvt) {
            osettings.banner.data = readerEvt.target.result;
            /** set file.name to span of inner el */
            $('#banner_file_name').text(file.name);
            $('#hidden_banner_name').show();
          }; 
        reader.readAsDataURL(file);
      }
  },
  'change #category': function() {
    var cat = $('#category').val();
    var meta = selectOptionsGenre.meta[cat];
    if (meta) {
      var opts = selectOptionsGenre[meta];
      /** show genres, update opts */
      $('#genre')
      .find('option')
      .remove()
      .end()
      .append(opts)
      $('#hidden_genre').show();
    } else {
      /** hide genres */
      $('#hidden_genre').hide();
    }


  },
  'change #gift_file': function (e, template) {
      if (e.currentTarget.files && e.currentTarget.files[0]) {
        osettings.giftImage = {};
        var reader = new FileReader();
        var files = e.target.files;
        var file = files[0];
        if (file.type.indexOf("image")==-1) {
          vex.dialog.alert('Invalid File, you can only upload a static image for your sales item');
          return;
        };
        reader.onload = function(readerEvt) {
            osettings.giftImage.data = readerEvt.target.result;
            /** set file.name to span of inner el */
            $('#gift_file_name').text(file.name);
            $('#hidden_gift_name').show();
        }; 
        reader.readAsDataURL(file);
      }
  },
  'click #add-crew': function(e) {
    e.preventDefault();
    var title = $('#crew-title').val(), description = $('#crew-description').val(), status = 'needed';
    if (title && description && status) $('#crew-table').append('<tr class="crew-val"><td>'+title+'</td><td>'+description+'</td><td>'+status+'</td><td><button class="deleteRow button special">X</button></td></tr>');
    $('.deleteRow').on('click', deleteRow);
    $('#crew-title').val(''), $('#crew-description').val(''), $("#crew-radio-needed").prop("checked", true);
  },

  'click #add-cast': function(e) {
    e.preventDefault();
    var title = $('#cast-title').val(), description = $('#cast-description').val(), status = 'needed';
    if (title && description && status) $('#cast-table').append('<tr class="cast-val"><td>'+title+'</td><td>'+description+'</td><td>'+status+'</td><td><button class="deleteRow button special">X</button></td></tr>');
    $('.deleteRow').on('click', deleteRow);
    $('#cast-title').val(''), description = $('#cast-description').val(''), $("#cast-radio-needed").prop("checked", true);
  },

  'click #add-needs': function(e) {
    e.preventDefault();
    var cat = $('#needs-category').val(), description = $('#needs-description').val();
    if (cat.toLowerCase().indexOf('category')>-1) return;
    if (cat && description) $('#needs-table').append('<tr class="needs-val"><td>'+cat+'</td><td>'+description+'</td><td><button class="deleteRow button special">X</button></td></tr>');
    $('.deleteRow').on('click', deleteRow);
    $("#needs-category").val($("#needs-category option:first").val()), $('#needs-description').val(''), $('#needs-quantity').val('');
  },

  'click #add-social': function(e) {
    e.preventDefault();
    var title = $('#social-title').val(), url = $('#social-url').val();
    if (title && url) $('#social-table').append('<tr class="social-val"><td>'+title+'</td><td>'+url+'</td><td><button class="deleteRow button special">X</button></td></tr>');
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
    $('#gift-table').append('<tr class="gift-val"><td>'+o.name+'</td><td>'+o.description+'</td><td>'+o.quantity+'</td><td>'+o.msrp+'</td><td><button class="removeGift button special">X</button></td></tr>');
    $('.removeGift').on('click', removeGift);
    $('#gift-title').val(''), $('#gift-description').val(''), $('#gift-quantity').val(''), $('#gift-msrp').val('');
    /** set file.name to span of inner el */
    $('#gift_file_name').text('');
    $('#hidden_gift_name').hide();
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
