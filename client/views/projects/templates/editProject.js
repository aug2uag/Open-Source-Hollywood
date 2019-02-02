var gifts = [],
    osettings = {},
    positions = {},
    currentSlug = null, 
    currentTitle = null;

var consideration_icons = {
  pay: '<i class="glyphicon glyphicon-star"></i>',
  escrow: '<i class="glyphicon glyphicon-usd"></i>',
  time: '<i class="glyphicon glyphicon-time"></i>'
}

function statusShowAddedResource() {
  // $('.addingstatus').show()
}

function validateUrl(value) {
  return /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(value);
}

function showVexBudgetForm() {
  var raw = osettings.rawbudget||{};
  vex.dialog.open({
    message: 'BUDGET FORM',
    input: [
      '<h4 class="title">Fill out the budget form to help define your budget. Whole dollar amounts only please.</h4>',
      '<div class="embed-responsive embed-responsive-4by3" style="overflow: auto;height: auto;">',
        '<div class="panel-default">',
          '<div class="panel-heading">GENERAL COSTS</div>',
          '<div class="panel-body">',
            '<div class="col-sm-12 col-md-6">',
                '<label for="dev_cost"> development cost </label>',
                '<input type="number" class="budgetform" name="dev_cost" id="dev_cost" min="0" value="' + (raw.dev_cost ? raw.dev_cost : 0) +'" />',
            '</div>',
            '<div class="col-sm-12 col-md-6">',
                '<label for="insurance_cost"> insurance costs </label>',
                '<input type="number" class="budgetform" name="insurance_cost" id="insurance_cost" min="0" value="' + (raw.insurance_cost ? raw.insurance_cost : 0) +'" />',
            '</div>',
            '<div class="col-sm-12 col-md-6">',
                '<label for="legal_cost"> legal &amp; accounting </label>',
                '<input type="number" class="budgetform" name="legal_cost" id="legal_cost" min="0" value="' + (raw.legal_cost ? raw.legal_cost : 0) +'" />',
            '</div>',
            '<div class="col-sm-12 col-md-6">',
                '<label for="travel_cost"> travel, meetings </label>',
                '<input type="number" class="budgetform" name="travel_cost" id="travel_cost" min="0" value="' + (raw.travel_cost ? raw.travel_cost : 0) +'" />',
            '</div>',
            '<div class="col-sm-12 col-md-6">',
                '<label for="food_cost"> food </label>',
                '<input type="number" class="budgetform" name="food_cost" id="food_cost" min="0" value="' + (raw.food_cost ? raw.food_cost : 0) +'" />',
            '</div>',
            '<div class="col-sm-12 col-md-6">',
                '<label for="supplied_cost"> office supplies </label>',
                '<input type="number" class="budgetform" name="supplied_cost" id="supplied_cost" min="0" value="' + (raw.supplied_cost ? raw.supplied_cost : 0) +'" />',
            '</div>',
            '<div class="col-sm-12 col-md-6">',
                '<label for="starting_budget"> starting budget </label>',
                '<input type="number" class="budgetform" name="starting_budget" id="starting_budget" min="0" value="' + (raw.starting_budget ? raw.starting_budget : 0) +'" />',
            '</div>',
            '<div class="col-sm-12 col-md-6">',
                '<label for="misc_gen_cost"> miscellaneous </label>',
                '<input type="number" class="budgetform" name="misc_gen_cost" id="misc_gen_cost" min="0" value="' + (raw.misc_gen_cost ? raw.misc_gen_cost : 0) +'" />',
            '</div>',
          '</div>',
        '</div>',
        '<div class="panel-default">',
          '<div class="panel-heading">PRODUCTION COSTS</div>',
          '<div class="panel-body">',
            '<div class="col-sm-12 col-md-6">',
                '<label for="staff_cost"> staff </label>',
                '<input type="number" class="budgetform" name="staff_cost" id="staff_cost" min="0" value="' + (raw.staff_cost ? raw.staff_cost : 0) +'" />',
            '</div>',
            '<div class="col-sm-12 col-md-6">',
                '<label for="extras_cost"> extras </label>',
                '<input type="number" class="budgetform" name="extras_cost" id="extras_cost" min="0" value="' + (raw.extras_cost ? raw.extras_cost : 0) +'" />',
            '</div>',
            '<div class="col-sm-12 col-md-6">',
                '<label for="wardrobe_cost"> wardrobe </label>',
                '<input type="number" class="budgetform" name="wardrobe_cost" id="wardrobe_cost" min="0" value="' + (raw.wardrobe_cost ? raw.wardrobe_cost : 0) +'" />',
            '</div>',
            '<div class="col-sm-12 col-md-6">',
                '<label for="makeup_cost"> makeup &amp; hair </label>',
                '<input type="number" class="budgetform" name="makeup_cost" id="makeup_cost" min="0" value="' + (raw.makeup_cost ? raw.makeup_cost : 0) +'" />',
            '</div>',
            '<div class="col-sm-12 col-md-6">',
                '<label for="set_design_cost"> set design </label>',
                '<input type="number" class="budgetform" name="set_design_cost" id="set_design_cost" min="0" value="' + (raw.set_design_cost ? raw.set_design_cost : 0) +'" />',
            '</div>',
            '<div class="col-sm-12 col-md-6">',
                '<label for="set_construction_cost"> set construction </label>',
                '<input type="number" class="budgetform" name="set_construction_cost" id="set_construction_cost" min="0" value="' + (raw.set_construction_cost ? raw.set_construction_cost : 0) +'" />',
            '</div>',
            '<div class="col-sm-12 col-md-6">',
                '<label for="set_rigging_cost"> set rigging </label>',
                '<input type="number" class="budgetform" name="set_rigging_cost" id="set_rigging_cost" min="0" value="' + (raw.set_rigging_cost ? raw.set_rigging_cost : 0) +'" />',
            '</div>',
            '<div class="col-sm-12 col-md-6">',
                '<label for="operations_cost"> operations </label>',
                '<input type="number" class="budgetform" name="operations_cost" id="operations_cost" min="0" value="' + (raw.operations_cost ? raw.operations_cost : 0) +'" />',
            '</div>',
            '<div class="col-sm-12 col-md-6">',
                '<label for="gear_rental_cost"> gear rentals </label>',
                '<input type="number" class="budgetform" name="gear_rental_cost" id="gear_rental_cost" min="0" value="' + (raw.gear_rental_cost ? raw.gear_rental_cost : 0) +'" />',
            '</div>',
            '<div class="col-sm-12 col-md-6">',
                '<label for="gear_purchase_cost"> gear purchases </label>',
                '<input type="number" class="budgetform" name="gear_purchase_cost" id="gear_purchase_cost" min="0" value="' + (raw.gear_purchase_cost ? raw.gear_purchase_cost : 0) +'" />',
            '</div>',
            '<div class="col-sm-12 col-md-6">',
                '<label for="engineer_cost"> engineers </label>',
                '<input type="number" class="budgetform" name="engineer_cost" id="engineer_cost" min="0" value="' + (raw.engineer_cost ? raw.engineer_cost : 0) +'" />',
            '</div>',
            '<div class="col-sm-12 col-md-6">',
                '<label for="electric_cost"> electric </label>',
                '<input type="number" class="budgetform" name="electric_cost" id="electric_cost" min="0" value="' + (raw.electric_cost ? raw.electric_cost : 0) +'" />',
            '</div>',
            '<div class="col-sm-12 col-md-6">',
                '<label for="cloud_cost"> cloud services </label>',
                '<input type="number" class="budgetform" name="cloud_cost" id="cloud_cost" min="0" value="' + (raw.cloud_cost ? raw.cloud_cost : 0) +'" />',
            '</div>',
            '<div class="col-sm-12 col-md-6">',
                '<label for="soft_cost"> software purchases </label>',
                '<input type="number" class="budgetform" name="soft_cost" id="soft_cost" min="0" value="' + (raw.soft_cost ? raw.soft_cost : 0) +'" />',
            '</div>',
          '</div>',
        '</div>',
        '<div class="panel-default">',
          '<div class="panel-heading">POST-PRODUCTION COSTS</div>',
          '<div class="panel-body">',
            '<div class="col-sm-12 col-md-6">',
                '<label for="editing_cost"> editing </label>',
                '<input type="number" class="budgetform" name="editing_cost" id="editing_cost" min="0" value="' + (raw.editing_cost ? raw.editing_cost : 0) +'" />',
            '</div>',
            '<div class="col-sm-12 col-md-6">',
                '<label for="creative_writing_cost"> creative writing </label>',
                '<input type="number" class="budgetform" name="creative_writing_cost" id="creative_writing_cost" min="0" value="' + (raw.creative_writing_cost ? raw.creative_writing_cost : 0) +'" />',
            '</div>',
            '<div class="col-sm-12 col-md-6">',
                '<label for="marketing_cost"> marketing </label>',
                '<input type="number" class="budgetform" name="marketing_cost" id="marketing_cost" min="0" value="' + (raw.marketing_cost ? raw.marketing_cost : 0) +'" />',
            '</div>',
            '<div class="col-sm-12 col-md-6">',
                '<label for="misc_post_cost"> miscellaneous </label>',
                '<input type="number" class="budgetform" name="misc_post_cost" id="misc_post_cost" min="0" value="' + (raw.misc_post_cost ? raw.misc_post_cost : 0) +'" />',
            '</div>',
          '</div>',
        '</div>',
      '</div>',
    ].join(''),
    buttons: [
        $.extend({}, vex.dialog.buttons.YES, { text: 'Calculate' }),
        $.extend({}, vex.dialog.buttons.NO, { text: 'Close' }),
    ],
    callback: function (data) {
      osettings.rawbudget = data
      var costTally = 0;
      for (var key in data) {
        if (key === 'starting_budget') continue;
        costTally+=Math.abs(parseInt(data[key]));
      }
      if (costTally>0) {
        $('#budget').val(costTally);
        $('#starting').val(data.starting_budget||0);
        $('#hiddenbudget').show();
        localStorage.setItem('budget', JSON.stringify(data));  
      } else {
        $('#hiddenbudget').hide();
      }
    }
  });
};

function deleteRow(e) {
  e.preventDefault();
  $(this).closest('tr').remove();
}

function setNewProjectBanner(file) {
  var reader = new FileReader();
  reader.onload = function(readerEvt) {
    osettings.banner.data = readerEvt.target.result;

    /** set file.name to span of inner el */
    $('#banner_file_name').text(file.name);
    $('#hidden_banner_name').show();
  }; 
  reader.readAsDataURL(file);
}

function removeGift(e) {
  e.preventDefault();
  var idx = $($(this).closest('tr')).index();
  gifts.splice(idx, 1);
  $(this).closest('tr').remove();
}

function returnProjectCreateDetails(o) {
  o = o || {};
  o.phase = $('#phase').val()
  o.videoExplainer = $('#video_explainer').val();
  if (o.videoExplainer) {
    var vimeo = /^https:\/\/vimeo.com\/[\d]{8,}$/;
    var youtube = /^https:\/\/youtu.be\/[A-z0-9]{9,}$/;
    if (o.videoExplainer.indexOf('vimeo')>-1) {
      var patternMatch = /^https:\/\/vimeo.com\/([\d]{8,}$)/;
      var videoID = o.videoExplainer.match(patternMatch)[1];
      o.videoExplainer = 'https://player.vimeo.com/video/' + videoID + '?autoplay=0&loop=1&autopause=0';
    } else {
      try {
        var patternMatch = /^https:\/\/youtu.be\/([A-z0-9]{9,}$)/;
        var videoID = o.videoExplainer.match(patternMatch)[1];
        o.videoExplainer = 'https://www.youtube.com/embed/' + videoID;
      } catch(e) { };
    };
  };

  // (2) remove default category value
  o.category = $('#category').find(":selected").text();
  try {
    if (o.category.toLowerCase().indexOf('format')>-1) delete o['category'];
  } catch(e) { delete o['category']; }

  // (3) check location and continue
  o.zip = $('#location').val() && $('#location').val().replace(' ', '') || '';
  o.title = $('#title').val() || 'untitled';
  o.logline = $('#logline').val() || 'eligible for support';
  o.genre = $('#genre').find(":selected").text();
  o.production_company = $('#prodorg').val();
  o.author_list = $('#authorlist').val();
  o._gifts = gifts;
  o.website = $('#website').val();
  o.rawbudget = osettings.rawbudget
  delete osettings['rawbudget']

  try {
    var descriptionText = $('#summernote').summernote('code').replace(/(<script.*?<\/script>)/g, '');
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
  } catch(e){}

  o.creatorsInfo = $('#creators_info').val();
  o.historyInfo = $('#history_info').val();
  o.plansInfo = $('#plans_info').val();
  o.needsInfo = $('#needs_info').val();
  o.significanceInfo = $('#significance_info').val();
  
  if (osettings.banner&&osettings.banner.data) {
    o._banner = osettings.banner.data;
    o.bannerFileName = osettings.banner.file.name
  }
  
  var crew = $('.crew-val'); 
  o.crew = positions.crew||[];

  var cast = $('.cast-val');
  o.cast = positions.cast||[];

  var needs = $('.needs-val');
  o.needs = positions.needs||[];

  var social = $('.social-val');
  o.social = positions.social||[];

  /** budget info */
  var budgetSheet = localStorage.getItem('budget');
  if (budgetSheet) {
    o.budgetSheet = JSON.parse(budgetSheet);
    o.budget = parseInt($('#budget').val());
    o.funded = parseInt($('#starting').val());
    localStorage.removeItem('budget');
  };

  /** equity info */
  var equityInfo = localStorage.getItem('revshare');
  if (equityInfo) {
    o.equityInfo = JSON.parse(equityInfo);
    o.totalShares = o.availableShares = parseFloat($('#assign').val()) * 100;
    o.mpps = parseInt($('#minimumassign').val()||1);
    localStorage.removeItem('revshare');
  };

  delete o['showDialog'];
  return o;
}

var selectOptionsGenre = {
  meta: {
    Feature: 'mixed',
    Short: 'mixed',
    Series: 'mixed',
    Sketch: 'mixed',
    Animation: 'mixed',
    'Live Performance': 'performance',
    Writing: 'writing',
    'Art & Illustrations': 'art',
    Musical: 'audio',
    Podcast: 'podcast',
    Other: 'all'
  },
  art: '<option val="Advertising">Advertising</option><option val="Book Cover">Book Cover</option><option val="Album Art">Album Art</option><option val="Cartoon">Cartoon</option><option val="Comics">Comics</option><option val="Concept Art">Concept Art</option><option val="Poster">Poster</option><option val="Classical Painting">Classical Painting</option><option val="Classical Sculpting">Classical Sculpting</option><option val="Other">Other</option>',
  writing: '<option val="Tragedy">Tragedy</option><option val="Comedy">Comedy</option><option val="Fantasy">Fantasy</option><option val="Adventure">Adventure</option><option val="Mystery">Mystery</option><option val="Graphic Novel">Graphic Novel</option><option val="Satire">Satire</option><option val="Childrens">Childrens</option><option val="Poetry">Poetry</option><option val="Other">Other</option>',
  mixed: '<option val="Drama">Drama</option><option val="Comedy">Comedy</option><option val="Documentary">Documentary</option><option val="Educational">Educational</option><option val="Game Show">Game Show</option><option val="Music Video">Music Video</option><option val="Musical">Musical</option><option val="Reality">Reality</option><option val="News">News</option><option val="Sports">Sports</option><option val="Variety">Variety</option><option val="Kids">Kids</option><option val="Cooking">Cooking</option><option val="Other">Other</option>',
  audio: '<option val="Folk">Folk</option><option val="Classical">Classical</option><option val="Contemporary">Contemporary</option><option val="Soul">Soul</option><option val="Jazz">Jazz</option><option val="Rock">Rock</option><option val="Metal">Metal</option><option val="Pop">Pop</option><option val="Hip Hop">Hip Hop</option><option val="EDM">EDM</option><option val="Other">Other</option>',
  performance: '<option val="Ballet">Ballet</option><option val="Opera">Opera</option><option val="Dance">Dance</option><option val="Theater">Theater</option><option val="Other">Other</option>',
  podcast: '<option val="Comedy">Comedy</option><option val="Culture">Culture</option><option val="Politics">Politics</option><option val="Arts">Arts</option><option val="Technology">Technology</option><option val="Other">Other</option>',
  all: function() {
    var acc = [selectOptionsGenre['art'], selectOptionsGenre['writing'], selectOptionsGenre['mixed'], selectOptionsGenre['audio'], selectOptionsGenre['performance'], selectOptionsGenre['podcast']].join('').split('</option>')
    var agg = []
    acc.forEach(function(a) {
      if (agg.indexOf(a)===-1) agg.push(a);
    })
    return agg.sort().join('</option>')
  }
}


function appendCampaignMerchTable(o) {
  var tblRow = [
    '<tr class="gift-val">',
      '<td>'+o.name+'</td>',
      '<td>'+o.type+'</td>',
      '<td>'+o.description+'</td>',
      '<td>'
  ];
  
  if (o.secondaryData) tblRow.push('<strong><small>DATA:</small></strong>&nbsp;'+o.secondaryData);
  if (o.disclaimer) tblRow.push('<br><strong><small>DISCLAIMER:</small></strong>&nbsp;'+o.disclaimer);
  tblRow = tblRow.concat([
    '</td>',
      '<td>'+o.msrp+'</td>',
      '<td><button class="removeGift button special">X</button></td></tr>'
  ]);
  $('#gift-table').append(tblRow.join(''));
  $('.removeGift').off();
  $('.removeGift').on('click', removeGift);
};

Template.editProject.events({
  'click #cast_oshx': function(e) {
    var val = $(e.target).attr('val')
    if (val==='skip') return;
      if ($(e.target).prop('checked')) {
        $('#cast_pay_amounth').show()
      } else {
        $('#cast_pay_amounth').hide()
      }
  },
  'click #crew_oshx': function(e) {
    var val = $(e.target).attr('val')
    if (val==='skip') return;
      if ($(e.target).prop('checked')) {
        $('#crew_pay_amounth').show()
      } else {
        $('#crew_pay_amounth').hide()
      }
  },
  'click #file_gift': function(e) {
    $('#gift_file').click();
  },
  'click .bread_show_resources': function(e) {
    $('.show_resources_toggle').hide()
    $('.bread_show_resources').removeClass('bold')
    $(e.target).addClass('bold')
    var v= $(e.target).attr('val')
    var id = '#show_options_' + v
    $(id).show()
    $('#show_options_crew2').text($(e.target).attr('aux'))
  },
  'click .camp_show_resources': function(e) {
    $('.camp_resources_toggle').hide()
    $('.camp_show_resources').removeClass('bold')
    $(e.target).addClass('bold')
    var v= $(e.target).attr('val')
    var id = '#' + v
    $(id).show()
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
  'change #banner_file': function (e, template) {
      if (e.currentTarget.files && e.currentTarget.files[0]) {
        osettings.banner = {};
        
        var files = e.target.files;
        osettings.banner = osettings.banner||{}
        osettings.banner.file = files[0];

        if (osettings.banner.file.type.indexOf("image")==-1) {
          vex.dialog.alert('Invalid File, you can only upload a static image for your profile picture');
          return;
        };

        return setNewProjectBanner(osettings.banner.file);
      }
  },
  'click #showbudget': function(e) {
    e.preventDefault();
    showVexBudgetForm();
  },
  'click #update_campaign': function(e) {
    e.preventDefault();
    $('.addingstatus').hide()
    var o = returnProjectCreateDetails({slug: currentSlug});
    Meteor.call('editProject', o);
    vex.dialog.alert("Project updated!");
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
  'input #gift-title': function() {$('#add-gift').removeClass('btn'), $('#add-gift').removeClass('disabled') },
  'input #needs-description': function() {$('#add-needs').removeClass('btn'), $('#add-needs').removeClass('disabled') },
  'input #crew-title': function() { $('#add-crew').removeClass('btn'), $('#add-crew').removeClass('disabled') },
  'input #cast-title': function() { $('#add-cast').removeClass('btn'), $('#add-cast').removeClass('disabled') },
  'input #social-title': function() { $('#add-social').removeClass('btn'), $('#add-social').removeClass('disabled') },
  'click #add-crew': function(e) {
    e.preventDefault();
    statusShowAddedResource()
    $('#crewtabletoggle').show()
    var title = $('#crew-title').val(), 
        description = $('#crew-description').val(), 
        audition = $('#crew-audition').val() || 'N/A',
        consideration = $('.crew_consideration:checked').map(function(a) { return $(this).val() }).get(),
        pay_offer = $('#oshchx_crew').val()||0,
        status = 'needed';
    $('#oshchx_crew').val('')
    positions.crew = positions.crew || []
    var o = {
      title: title,
      description: description,
      audition: audition,
      consideration: consideration,
      pay_offer: pay_offer
    }
    
    if (!consideration.length) return vex.dialog.alert('You must select at least one consideration / offer type for this role.');
    positions.crew.push(o)
    Session.set('crew', positions.crew)
    $('#newCrewForm')[0].reset()
    $('#update_campaign').click()
    // var payIcons = consideration.map(function(c) { return consideration_icons[c] })
    // if (title && description && status) $('#crew-table').append('<tr class="crew-val"><td>'+title+'</td><td>'+description+'<br><small>eligible for:&nbsp;</small>'+payIcons.join(' ')+'</td><td>'+audition+'</td><td><button class="deleteRow button special" ctx="crew" val=\''+JSON.stringify(o)+'\'>X</button></td></tr>');
    // $('.deleteRow').off();
    // $('.deleteRow').on('click', deleteRow);
    // $('#crew-title').val(''), 
    // $('#crew-description').val(''),
    // $('#crew-audition').val(''), 
    // $("#crew-radio-needed").prop("checked", true);
  },
  'click #add-cast': function(e) {
    e.preventDefault();
    statusShowAddedResource()
    $('#casttabletoggle').show()
    var title = $('#cast-title').val(), 
        description = $('#cast-description').val(), 
        audition = $('#cast-audition').val() || 'N/A',
        consideration = $('.cast_consideration:checked').map(function(a) { return $(this).val() }).get(),
        pay_offer = $('#oshchx_cast').val()||0,
        status = 'needed';
    $('#oshchx_cast').val('')
    var o = {
      title: title,
      description: description,
      audition: audition,
      consideration: consideration,
      pay_offer: pay_offer
    }
    positions.cast = positions.cast || []
    
    if (!consideration.length) return vex.dialog.alert('You must select at least one consideration / offer type for this role.');

    positions.cast.push(o)
    Session.set('cast', positions.cast)

    $('.deleteRow').off();
    $('.deleteRow').on('click', deleteRow);

    $('#newCastForm')[0].reset()
    $('#update_campaign').click()
    // var payIcons = consideration.map(function(c) { return consideration_icons[c] })
    // if (title && description && status) $('#cast-table').append('<tr class="cast-val"><td>'+title+'</td><td>'+description+'<br><small>eligible for:&nbsp;</small>'+payIcons.join(' ')+'</td><td>'+audition+'</td><td><button class="deleteRow button special" ctx="cast" val=\''+JSON.stringify(o)+'\'>X</button></td></tr>');
    
    // $('#cast-title').val(''), 
    // $('#cast-description').val(''), 
    // $('#cast-audition').val(''), 
    // $("#cast-radio-needed").prop("checked", true);
  },
  'click #add-needs': function(e) {
    e.preventDefault();
    statusShowAddedResource()
    $('#needstabletoggle').show()

    positions.needs = positions.needs||[]
    positions.needs.push({
      category: $('#needs-category').val(),
      description: $('#needs-description').val()
    })

    $('.deleteRow').off();
    $('.deleteRow').on('click', deleteRow);

    Session.set('needs', positions.needs)

    $('#newNeedsForm')[0].reset()
    $('#update_campaign').click()

    // var cat = , description = ;
    // if (cat.toLowerCase().indexOf('category')>-1) return;
    // if (cat && description) $('#needs-table').append();
    // $('.deleteRow').off();
    // $('.deleteRow').on('click', deleteRow);
    // $("#needs-category").val($("#needs-category option:first").val()), $('#needs-description').val(''), $('#needs-quantity').val('');
  },
  'click #add-social': function(e) {
    e.preventDefault();
    $('#display_link_data').show()
    positions.social = positions.social || []
    positions.social.push({
      name: $('#social-title').val(),
      address: $('#social-url').val()
    })
    Session.set('social', positions.social)
    $('#newSocialForm')[0].reset()
    $('#update_campaign').click()
    // if (title && url) $('#social-table').append('<tr class="social-val"><td>'+title+'</td><td>'+url+'</td><td><button class="deleteRow button special">X</button></td></tr>');
    // $('.deleteRow').on('click', deleteRow);
    // $('#social-title').val(''), $('#social-url').val('');
  },
  'change #merchtype': function(e) {
    e.preventDefault();
    var giftType = $('#merchtype option:selected').val();
    if (giftType.indexOf('Select')>-1) return alert('please select merchandise type');
    $('#merchtypehidden').show();
    if (giftType==='Apparel') {
      $('#apparelsizes').show();
      $('#perishabledetails').hide();
    } else if (giftType==='Perishable') {
      $('#apparelsizes').hide();
      $('#merch_handling').prop("placeholder", "Shelf Life and Handling Instructions");
      $('#perishabledetails').show();
    } else {
      $('#apparelsizes').hide();
      $('#merch_handling').prop("placeholder", "Details and Handling Instructions");
      $('#perishabledetails').show();
    };
  },
  'click #add-gift': function(e) {
    e.preventDefault();

    $('#merchtabletoggle').show()
    var o = {};
    o.name = $('#gift-title').val(), o.description = $('#gift-description').val(), o.msrp = parseFloat($('#gift-msrp').val());
    if (!o.name || Number.isFinite(o.msrp) === false || o.msrp < 1) return alert('please correct the name or price information to continue');
    if (osettings.giftImage&&osettings.giftImage.data) o.data = osettings.giftImage.data;
    else o.url = 'https://s3-us-west-2.amazonaws.com/producehour/placeholder_gift.jpg';
    // get type
    o.type = $('#merchtype option:selected').val();
    if (o.type.indexOf('Select')>-1) return alert('please select merchandise type');
    if (o.type==='Apparel') {

      o.quantity = {}

      $('.apparelsize').each(function() {
        o.quantity[$(this).val()] = parseInt($('#' + $(this).attr('val')).val()||0)
      })

      for (var key in o.quantity) {
        if (!o.quantity[key]) {
          delete o.quantity[key]
        };
      }

      o.secondaryData = Object.keys(o.quantity)

      if (!o.secondaryData.length) return vex.dialog.alert('You should have at least one size available for sale to continue.');

    } else {
      o.secondaryData = $('#merch_handling').val();
      o.quantity = {all: $('#oneoff').val()||1}
    };
    o.disclaimer = $('#merch_disclaimer').val();
    osettings.giftImage = {};
    gifts.push(o);
    // console.log(gifts)
    appendCampaignMerchTable(o);
    
    $('#gift-title').val(''), $('#gift-description').val(''), $('#gift-quantity').val(''), $('#gift-msrp').val('');
    /** set file.name to span of inner el */
    $('#gift_file_name').text('');
    $('#merch_handling').val('');
    $('#merch_disclaimer').val('');
    $('.merch_quantity').val('');
    $('#oneoff').val('');
    $('.apparelsize:checkbox:checked').each(function(idx, el){ return $(el).prop("checked", false);})
    $('#hidden_gift_name').hide();
  },
});

Template.editProject.helpers({
  projCrew: function() {
    return Session.get('crew')
  },
  projCast: function() {
    return Session.get('cast')
  },
  projNeeds: function() {
    return Session.get('needs')
  },
  projSocial: function() {
    return Session.get('social')
  },
  roleStar: function() { if (this.consideration.indexOf('pay')>-1) { return true } return false },
  roleTime: function() { if (this.consideration.indexOf('time')>-1) { return true } return false },
  roleDollar: function() { if (this.consideration.indexOf('escrow')>-1) { return true } return false },
  self: function() {
    return JSON.stringify(this)
  },
  noUserEmail: function() {
    if (Meteor.user()&&Meteor.user().notification_preferences&&Meteor.user().notification_preferences.email&&Meteor.user().notification_preferences.email.verification) {
      return false
    };

    if (Meteor.user()&&Meteor.user().notification_preferences&&Meteor.user().notification_preferences.phone&&Meteor.user().notification_preferences.phone.verification) {
      return false
    };

    return true

  },
  init: function() {
    gifts = this.gifts;
    currentSlug = this._slug;
    currentTitle = this.title;
  },
  neededCheck: function() {
    if (!this.status || this.status==='needed') {
      return 'checked'
    };
  },
  fulfilledCheck: function() {
    if (this.status==='fulfilled') {
      return 'checked'
    };
  },
  thisProjectString: function() {
    return JSON.stringify(this.project)
  }
});

Template.editProject.rendered = function () {
  $('.deleteRow').on('click', deleteRow);
  positions = {};
  setTimeout(function() {
    var script = document.createElement('script');
    script.src = "/js/scripts.min.js";
    document.head.appendChild(script);
  }, 987);
  $('#summernote').summernote({
    toolbar: [
      // [groupName, [list of button]]
      ['style', ['clear', 'fontname', 'strikethrough', 'superscript', 'subscript', 'fontsize', 'color']],
      ['para', ['paragraph', 'style']],
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
        $('.note-toolbar').css('z-index', '0');
        $('.note-editable').off()
        $('.note-editable').on('click', function() {
          if ($('.note-editable').html().indexOf('your campaign description here.')>-1) $('.note-editable').html('');
        })
      }
    }
  });
  try {
    var newProject = JSON.parse($('#thisCurrentProject').attr('val'));
    $('#thisCurrentProject').remove();

    // console.log(newProject)

    if (newProject.videoExplainer) $('#video_explainer').val(newProject.videoExplainer);
    if (newProject.category) $("#category option[value='"+newProject.category+"']").prop('selected', true).trigger('change');
    if (newProject.zip) $('#location').val(newProject.zip);
    if (newProject.title&&newProject.title!=='untitled') $('#title').val(newProject.title);
    if (newProject.logline&&newProject.logline!=='eligible for support') $('#logline').val(newProject.logline);
    if (newProject.genre) $("#genre option[value='"+newProject.genre+"']").prop('selected', true);
    if (newProject.phase) $('#phase').val(newProject.phase);
    if (newProject.website) $('#website').val(newProject.website);
    if (newProject.production_company) $('#prodorg').val(newProject.production_company);
    if (newProject.gifts&&newProject.gifts.length) {
      gifts = newProject.gifts;
      newProject.gifts.forEach(function(g) {
        appendCampaignMerchTable(g);
      });
      $('#merchtabletoggle').show()
    };
    osettings.rawbudget = newProject.rawbudget||null;
    if (newProject._banner||newProject.banner) {
      (function() {
        var filename = newProject&&newProject.bannerFileName||null;
        if (!filename||filename===null||filename.toLowerCase()==='this is the name of the file uploaded') return;
        $('#banner_file_name').text(filename);
        $('#hidden_banner_name').show();
      }())
    };
    if (newProject.author_list) $('#authorlist').val(newProject.author_list);
    if (newProject.description) $('#summernote').summernote('code', newProject.description);
    if (newProject.creatorsInfo) $('#creators_info').val(newProject.creatorsInfo);
    if (newProject.historyInfo) $('#history_info').val(newProject.historyInfo);
    if (newProject.plansInfo) $('#plans_info').val(newProject.plansInfo);
    if (newProject.needsInfo) $('#needs_info').val(newProject.needsInfo);
    if (newProject.significanceInfo) $('#significance_info').val(newProject.significanceInfo);


    positions.crew = newProject.crew||[]
    Session.set('crew', positions.crew)
    if (positions.crew.length) $('#crewtabletoggle').show();

    positions.cast = newProject.cast||[]
    Session.set('cast', positions.cast)
    if (positions.cast.length) $('#casttabletoggle').show();

    positions.needs = newProject.needs||[]
    Session.set('needs', positions.needs)
    
    if (positions.needs.length) $('#needstabletoggle').show();

    positions.social = newProject.social||[]
    Session.set('social', positions.social)
    // console.log(positions.social)
    if (positions.social.length) $('#display_link_data').show()


    /**
      1) test
      2) add budget
      3) add equity info
     */

    
    $('.deleteRow').off();
    $('.deleteRow').on('click', deleteRow);

  } catch (e) {}
};