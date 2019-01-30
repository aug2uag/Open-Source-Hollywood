var gifts = [];
var osettings = {};
var positions = {};
var consideration_icons = {
  pay: '<i class="glyphicon glyphicon-star"></i>',
  escrow: '<i class="glyphicon glyphicon-usd"></i>',
  time: '<i class="glyphicon glyphicon-time"></i>'
}
var autoSaveNewProjInterval = null;

var StripePublicKey = 'pk_test_Dgvlv9PBf6RuZJMPkqCp00wg';

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
  $('#merchtabletoggle').show()
};

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

function returnProjectCreateDetails(o) {
  o = o || {};

  o.phase = $('#phase').val()


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
    if (o.showDialog&&!vimeo.test(o.videoExplainer)&&!youtube.test(o.videoExplainer)) {
      vex.dialog.alert('your video URL link is invalid, please select the question mark for help, correct the mistake and try again or contact us');
      return null;
    }
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
  // if (o.category.indexOf('Format')>-1) return vex.dialog.alert('Please select a valid category and genre.');

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

    if (plainTextplainText.indexOf('your campaign description here.')===-1) {
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
  
  if (osettings.banner.data) {
    o._banner = osettings.banner.data;
    o.bannerFileName = osettings.banner.file.name
  }
  else o.banner = 'https://s3-us-west-2.amazonaws.com/producehour/placeholder_banner.jpg';
  
  var crew = $('.crew-val'); 
  o.crew = positions.crew||[];

  var cast = $('.cast-val');
  o.cast = positions.cast||[];

  var needs = $('.needs-val');
  o.needs = positions.needs||[];

  var social = $('.social-val');
  o.social = [];
  social.each(function(i, el) {
    var _o = {};
    var arr = $(el).children('td');
    _o.name = $(arr[0]).text();
    _o.address = $(arr[1]).text();
    o.social.push(_o);
  });

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
    o.assignmentLife = $('.assignment_length:checked').val();
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

function validateUrl(value) {
  return /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(value);
}

function deleteRow(e) {
  e.preventDefault();
  var ctx = $(e.target).attr('ctx')
  if (ctx) {
    try {
      var idx = $($(this).closest('tr')).index();
  
      var val = JSON.parse($(e.target).attr('val'))

      if (ctx==='crew') {
        positions.crew.splice(idx, 1);
      };

      if (ctx==='cast') {
        positions.cast.splice(idx, 1);
      };
    } catch(e) {}
  };

  $(this).closest('tr').remove();
}

function removeGift(e) {
  e.preventDefault();
  var idx = $($(this).closest('tr')).index();
  gifts.splice(idx, 1);
  $(this).closest('tr').remove();
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

Template.newProject.onRendered(function() {
  gifts = [];
  osettings = {};
  osettings.banner = {};
  osettings.giftImage = {};
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
        $('.note-editable').html('<p>Enter your campaign description here. Do not include details that are sensitive. The information here will be displayed publicly.</p>');
        $('.note-toolbar').css('z-index', '0');
        $('.note-editable').off()
        $('.note-editable').on('click', function() {
          if ($('.note-editable').html().indexOf('your campaign description here.')>-1) $('.note-editable').html('');
        })
      }
    }
  });

  // console.log(new Array(100).join('1 '))
  
  try {
    var newProject = JSON.parse(localStorage.getItem('projectnew'));
    if (!newProject||!autoSaveNewProjInterval) {
      $('#resetNewProjCacheBtn').hide()
      return
    };
    // console.log(new Array(100).join(' 2'))
    if (newProject.videoExplainer) $('#video_explainer').val(newProject.videoExplainer);
    if (newProject.category) $("#category option[value='"+newProject.category+"']").prop('selected', true).trigger('change');
    if (newProject.zip) $('#location').val(newProject.zip);
    if (newProject.title&&newProject.title!=='untitled') $('#title').val(newProject.title);
    if (newProject.logline&&newProject.logline!=='eligible for support') $('#logline').val(newProject.logline);
    if (newProject.genre) $("#genre option[value='"+newProject.genre+"']").prop('selected', true);
    if (newProject.website) $('#website').val(newProject.website);
    if (newProject.production_company) $('#prodorg').val(newProject.production_company);
    if (newProject.gifts&&newProject.gifts.length) {
      gifts = newProject.gifts;
      newProject.gifts.forEach(function(g) {
        appendCampaignMerchTable(g);
      });
    };
    if (newProject._banner||newProject.banner) {
      (function() {
        var filename = newProject.bannerFileName;
        if (!filename||filename===null||filename.toLowerCase()==='this is the name of the file uploaded') return;
        $('#banner_file_name').text(filename);
        $('#hidden_banner_name').show();
      }())
    };

    // console.log(new Array(100).join('3 '))
    if (newProject.author_list) $('#authorlist').val(newProject.author_list);
    if (newProject.description) $('#summernote').summernote('code', newProject.description);
    if (newProject.creatorsInfo) $('#creators_info').val(newProject.creatorsInfo);
    if (newProject.historyInfo) $('#history_info').val(newProject.historyInfo);
    if (newProject.plansInfo) $('#plans_info').val(newProject.plansInfo);
    if (newProject.needsInfo) $('#needs_info').val(newProject.needsInfo);
    if (newProject.significanceInfo) $('#significance_info').val(newProject.significanceInfo);
    osettings.rawbudget = newProject.rawbudget||null;
    if (newProject.crew&&newProject.crew.length) {
      newProject.crew.forEach(function(c) {
        $('#crew-table').append('<tr class="crew-val"><td>'+c.title+'</td><td>'+c.description+'</td><td>'+c.audition+'</td><td><button class="deleteRow button special">X</button></td></tr>');
      });
      $('#newProjCrewAccord').removeClass('krown-accordion');
      $('#crewtabletoggle').show()
    };

    if (newProject.cast&&newProject.cast.length) {
      newProject.cast.forEach(function(c) {
        $('#cast-table').append('<tr class="cast-val"><td>'+c.title+'</td><td>'+c.description+'</td><td>'+c.audition+'</td><td><button class="deleteRow button special">X</button></td></tr>');
      });
      $('#newProjCastAccord').removeClass('krown-accordion');
      $('#casttabletoggle').show()
    };

    if (newProject.needs&&newProject.needs.length) {
      newProject.needs.forEach(function(n) {
        $('#needs-table').append('<tr class="needs-val"><td>'+n.category+'</td><td>'+n.description+'</td><td><button class="deleteRow button special">X</button></td></tr>');
      });
      $('#newProjNeedsAccord').removeClass('krown-accordion');
      $('#needstabletoggle').show()
    };

    if (newProject.social&&newProject.social.length) {
      newProject.social.forEach(function(s) {
        $('#social-table').append('<tr class="social-val"><td>'+s.name+'</td><td>'+s.address+'</td><td><button class="deleteRow button special">X</button></td></tr>');
      });
      $('#newproj_social_accord').removeClass('krown-accordion');
      $('#display_link_data').show()
    };

    if (newProject._gifts&&newProject._gifts.length) {
      newProject._gifts.forEach(function(g) {
        appendCampaignMerchTable(g);
      });
      $('#newProjGiftAccord').removeClass('krown-accordion');
    };

    /**
      1) test
      2) add budget
      3) add equity info
     */

    
    $('.deleteRow').off();
    $('.deleteRow').on('click', deleteRow);


    // console.log(new Array(100).join('# '))
    // console.log('finish onRendered')

  } catch(e) { } 
});

function showVexWithInput(message, input) {
  vex.dialog.open({
    message: message,
    input: input.join(''),
    buttons: [
        $.extend({}, vex.dialog.buttons.NO, { text: 'Close' })
    ]
  });
}

Template.newProject.events({
  'click #cast_oshx': function(e) {
      if ($(e.target).prop('checked')) {
        $('#cast_pay_amounth').show()
      } else {
        $('#cast_pay_amounth').hide()
      }
  },
  'click #crew_oshx': function(e) {
      if ($(e.target).prop('checked')) {
        $('#crew_pay_amounth').show()
      } else {
        $('#crew_pay_amounth').hide()
      }
  },
  'click .bread_show_resources': function(e) {
    $('.show_resources_toggle').hide()
    $('.bread_show_resources').removeClass('bold')
    $(e.target).addClass('bold')
    var v= $(e.target).attr('val')
    var id = '#show_options_' + v
    $(id).show()
  },
  'click .bread_show_story': function(e) {
    $('.story_toggler').hide()
    $('.bread_show_story').removeClass('bold')
    $(e.target).addClass('bold')
    var v= $(e.target).attr('val')
    var id = '#story_' + v
    $(id).show()
  },
  'click #file_gift': function(e) {
    $('#gift_file').click();
  },
  'click #showbudget': function(e) {
    e.preventDefault();
    showVexBudgetForm();
  },
  'click .showbudget': function(e) {
    e.preventDefault();
    showVexBudgetForm();
  },
  'click #showrevsharing': function(e) {
    e.preventDefault();
    /** sign agreement form and show fields */
        vex.dialog.open({
      message: 'REVENUE SHARING CONFIGURATION',
      input: [
        '<div class="" style="overflow: auto;">',
          '<div class="panel-default">',
            '<small>by allowing revenue sharing, you are exposing yourself to legal liability and risk; please learn <a href="/terms">all terms</a> before proceeding</small>',
            '<div class="panel-body">',
              '<div class="col-sm-12">',
                  '<label for="rev_fullname"> full legal name </label>',
                  '<input type="text" class="revshareagreement" name="rev_fullname" id="rev_fullname" min="0" placeholder="enter full legal name" />',
              '</div>',
              '<div class="col-sm-12">',
                  '<label for="rev_province"> city or province and country name </label>',
                  '<input type="text" class="revshareagreement" name="rev_province" id="rev_province" min="0" placeholder="enter city or province and country name" />',
              '</div>',
              '<div class="col-sm-12">',
                  '<label for="rev_contact"> contact email or phone number </label>',
                  '<input type="text" class="revshareagreement" name="rev_contact" id="rev_contact" min="0" placeholder="enter contact email or phone number" />',
              '</div>',
              '<div class="col-sm-12">',
                  '<label for="misc_post_cost"> AGREEMENT </label>',
                  '<div class="form-check">',
                    '<input class="form-check-input" type="checkbox" value="" id="agreement1" name="agreement1">',
                    '<label class="form-check-label" for="agreement1">',
                      'I understand this is a legal agreement.',
                    '</label>',
                  '</div>',
                  '<div class="form-check">',
                    '<input class="form-check-input" type="checkbox" value="" id="agreement2" name="agreement2">',
                    '<label class="form-check-label" for="agreement2">',
                      'I understand I need to share distribution data with stakeholders.',
                    '</label>',
                  '</div>',
                  '<div class="form-check">',
                    '<input class="form-check-input" type="checkbox" value="" id="agreement3" name="agreement3">',
                    '<label class="form-check-label" for="agreement3">',
                      'I promise to share revenues with investors.',
                    '</label>',
                  '</div>',
                  '<div class="form-check">',
                    '<input class="form-check-input" type="checkbox" value="" id="agreement4" name="agreement4">',
                    '<label class="form-check-label" for="agreement4">',
                      'I understand that I am accepting legal responsibility for selling interests in my campaign.',
                    '</label>',
                  '</div>',
              '</div>',
            '</div>',
          '</div>',
        '</div>',
      ].join(''),
      buttons: [
          $.extend({}, vex.dialog.buttons.YES, { text: 'PROCEED' }),
          $.extend({}, vex.dialog.buttons.NO, { text: 'CANCEL' }),
      ],
      callback: function (data) {
        if (!data) {
            // return console.log('Cancelled')
        }
        data.agreement1 = $("#agreement1").is(':checked');
        data.agreement2 = $("#agreement2").is(':checked');
        data.agreement3 = $("#agreement3").is(':checked');
        data.agreement4 = $("#agreement4").is(':checked');
        if (!data) return
        if (!data.rev_fullname) return alert('please fill out all information and agree to all conditions to continue, missing name information');
        if (!data.rev_province) return alert('please fill out all information and agree to all conditions to continue, missing your location information');
        if (!data.rev_contact) return alert('please fill out all information and agree to all conditions to continue, missing your contact information');
        if (!data.agreement1) return alert('please agree to all terms to continue');
        if (!data.agreement2) return alert('please agree to all terms to continue');
        if (!data.agreement3) return alert('please agree to all terms to continue');
        if (!data.agreement4) return alert('please agree to all terms to continue');
        $('#hiddenequity').show();
        alert('CONGRATULATIONS! you are now eligible for revenue sharing on this campaign; to continue please fill out how much percent of your campaign you are opening for revenue sharing, and the minimum price per share')
        localStorage.setItem('revshare', JSON.stringify(data));
      }
    });
  },
  'click #whatisassign': function(e) {
    e.preventDefault();
    showVexWithInput('Percent Campaign for Auction', [
      '<h4 class="title">Public Auction for Revenue Sharing</h4>',
      '<div class="embed-responsive embed-responsive-4by3">',
        '<small>',
          'You can specify a percentage of your campaign\'s revenues for public auction. ',
          'To do this option, include how much percent you want open to sales (minimum 10% required). ',
          'This will result in 100x the assignments of virtual shares or tokens that you can sell. ',
          'For example, if you specify 10% for assignments then this will result in the issuance of 1,000 shares. ',
          'The default minimum price per share for auction is $1 and can be changed below. ',
          'You can change or set the minimum amount for purchase in one share below. ',
        '</small>',
        '<p>&nbsp;</p>',
        '<small>',
          'This sale represents a <u>LEGAL CONTRACT</u> where you promise to share revenue to the purchaser. ',
        '</small>',
      '</div>',
    ]);
  },
  'click #vidurl': function(e) {
    e.preventDefault();
    showVexWithInput('How to link YouTube and Vimeo URLs', [
      '<div class="embed-responsive embed-responsive-4by3">',
      '<iframe class="embed-responsive-item" src="/img/vidurls.mp4"></iframe>',
      '</div>',
    ]);
  },
  'click #minassign': function(e) {
    e.preventDefault();
    showVexWithInput('Minimum price per share', [
      '<div class="embed-responsive embed-responsive-4by3">',
        '<header class="introduction">',
          '<p>&nbsp;</p>',
          '<small>',
            'This field defines the minimum price someone can offer for purchasing one share of the portion of your campaign that you made available in the percent assignments of your campaign. ',
          '</small>',
          '<p>&nbsp;</p>',
          '<small>',
            'The sale of each share represents a <u>LEGAL CONTRACT</u> where you promise to share revenue to the purchaser. ',
          '</small>',
        '</header>',
      '</div>',
    ]);
  },
  'change #assign': function(e) {
    e.preventDefault();
    var num = parseFloat($('#assign').val());
    try {
      num = num.toFixed(2);
    } catch(e) { throw e };
    num = parseFloat(num);
    if (num > 49) {
      return alert('you can assign a maximum of 49% of your project\'s future earnings');
    };
    if (isNaN(num)) {
      $('#equitydisplay').hide();
    } else {
      $('#numshares').text(num * 100);
      $('#numpercent').text(num);
      $('#shareval').text($('#minimumassign').val()||1);
      $('#assign').val(num);
      $('#equitydisplay').show();
    }
  },
  'change #minimumassign': function(e) {
    e.preventDefault();
    $('#shareval').text($('#minimumassign').val()||1);
  },
  'click #save_campaign_create_changes': function(e) {
    $('#resetNewProjCacheBtn').show();
    var o = returnProjectCreateDetails();
    if (!o) return;
    localStorage.setItem('projectnew', JSON.stringify(o));
    vex.dialog.alert('progress saved for this session');
    // poll input every 30 seconds
    clearInterval(autoSaveNewProjInterval);
    autoSaveNewProjInterval = setInterval(function(){ 
      var o = returnProjectCreateDetails();
      if (!o) return;
      localStorage.setItem('projectnew', JSON.stringify(o));
    }, 30000);
  },
  'click #create_campaign': function(e) {
    e.preventDefault();
    var o = returnProjectCreateDetails({showDialog: true});
    if (!o) return;

    // create virtual account for project
    // add funds to virtual account, non-refundable
    console.log('call addProject')
    $('#preloader').show()
    Meteor.call('addProject', o, function(err, res) {
      $('#preloader').hide()
      vex.dialog.alert(err||res||'there was an error, please try again');
      if (res) {
        localStorage.removeItem('projectnew')
        localStorage.removeItem('projectnew_banner')
        $('#resetNewProjCacheBtn').hide()
        clearInterval(autoSaveNewProjInterval);
        setTimeout(function() {
          Router.go('Home');
        }, 4181);
      }
    });
  },
  'change #banner_file': function (e, template) {
      if (e.currentTarget.files && e.currentTarget.files[0]) {
        osettings.banner = {};
        
        var files = e.target.files;
        osettings.banner.file = files[0];

        if (osettings.banner.file.type.indexOf("image")==-1) {
          vex.dialog.alert('Invalid File, you can only upload a static image for your profile picture');
          return;
        };

        return setNewProjectBanner(osettings.banner.file);
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
      $('#hide_genre').hide()
      $('#hidden_genre').show();
    } else {
      /** hide genres */
      $('#hidden_genre').hide();
      $('#hide_genre').show()
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
  'input #gift-title': function() {$('#add-gift').removeClass('btn'), $('#add-gift').removeClass('disabled') },
  'input #needs-description': function() {$('#add-needs').removeClass('btn'), $('#add-needs').removeClass('disabled') },
  'input #crew-title': function() { $('#add-crew').removeClass('btn'), $('#add-crew').removeClass('disabled') },
  'input #cast-title': function() { $('#add-cast').removeClass('btn'), $('#add-cast').removeClass('disabled') },
  'input #social-title': function() { $('#add-social').removeClass('btn'), $('#add-social').removeClass('disabled') },
  'click #add-crew': function(e) {
    e.preventDefault();
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
    positions.crew.push(o)
    if (!consideration.length) return vex.dialog.alert('You must select at least one consideration / offer type for this role.');
    var payIcons = consideration.map(function(c) { return consideration_icons[c] })
    if (title && description && status) $('#crew-table').append('<tr class="crew-val"><td>'+title+'</td><td>'+description+'<br><small>eligible for:&nbsp;</small>'+payIcons.join(' ')+'</td><td>'+audition+'</td><td><button class="deleteRow button special" ctx="crew" val=\''+JSON.stringify(o)+'\'>X</button></td></tr>');
    $('.deleteRow').off();
    $('.deleteRow').on('click', deleteRow);
    $('#crew-title').val(''), 
    $('#crew-description').val(''),
    $('#crew-audition').val(''), 
    $("#crew-radio-needed").prop("checked", true);
  },
  'click #add-cast': function(e) {
    e.preventDefault();
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
    positions.cast.push(o)
    if (!consideration.length) return vex.dialog.alert('You must select at least one consideration / offer type for this role.');
    var payIcons = consideration.map(function(c) { return consideration_icons[c] })
    if (title && description && status) $('#cast-table').append('<tr class="cast-val"><td>'+title+'</td><td>'+description+'<br><small>eligible for:&nbsp;</small>'+payIcons.join(' ')+'</td><td>'+audition+'</td><td><button class="deleteRow button special" ctx="cast" val=\''+JSON.stringify(o)+'\'>X</button></td></tr>');
    $('.deleteRow').off();
    $('.deleteRow').on('click', deleteRow);
    $('#cast-title').val(''), 
    $('#cast-description').val(''), 
    $('#cast-audition').val(''), 
    $("#cast-radio-needed").prop("checked", true);
  },
  'click #add-needs': function(e) {
    e.preventDefault();
    positions.needs = positions.needs || []
    var o = {
      category: $('#needs-category').val(),
      description: $('#needs-description').val()
    }
    if (!o.category) return;
    positions.needs.push(o)
    $('#needstabletoggle').show()
    $('#needs-table').append('<tr class="needs-val"><td>'+o.category+'</td><td>'+o.description+'</td><td><button class="deleteRow button special">X</button></td></tr>');
    $('.deleteRow').off();
    $('.deleteRow').on('click', deleteRow);
    $("#needs-category").val($("#needs-category option:first").val()), $('#needs-description').val(''), $('#needs-quantity').val('');
  },
  'click #add-social': function(e) {
    e.preventDefault();
    $('#display_link_data').show()
    var title = $('#social-title').val(), url = $('#social-url').val();
    if (title && url) $('#social-table').append('<tr class="social-val"><td>'+title+'</td><td>'+url+'</td><td><button class="deleteRow button special">X</button></td></tr>');
    $('.deleteRow').on('click', deleteRow);
    $('#social-title').val(''), $('#social-url').val('');
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

    var o = {};
    o.name = $('#gift-title').val(), o.description = $('#gift-description').val(), o.msrp = parseFloat($('#gift-msrp').val());
    if (!o.name || Number.isFinite(o.msrp) === false || o.msrp < 1) return alert('please correct the name or price information to continue');
    if (!osettings.giftImage.data) o.url = 'https://s3-us-west-2.amazonaws.com/producehour/placeholder_gift.jpg';
    else o.data = osettings.giftImage.data;
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


    for (var key in o.quantity) {
      var _i = parseInt(o.quantity[key])
      if (!Number.isInteger(_i)||_i<=0) {
        delete o.quantity[key]
      }
    }

    if (!Object.keys(o.quantity).length)
      return vex.dialog.alert('there is no valid quantity for sale, please correct and try again')



    gifts.push(o);
    // console.log(gifts)
    appendCampaignMerchTable(o);
    $('#newProjFormMerch')[0].reset()
  },
  'click .login': function(e){
    e.preventDefault();
    localStorage.setItem('redirectURL', '/create');
    lock.show();
  }
});

Template.newProject.helpers({
  noUserEmail: function() {
    if (Meteor.user()&&Meteor.user().notification_preferences&&Meteor.user().notification_preferences.email&&Meteor.user().notification_preferences.email.verification) {
      return false
    };

    if (Meteor.user()&&Meteor.user().notification_preferences&&Meteor.user().notification_preferences.phone&&Meteor.user().notification_preferences.phone.verification) {
      return false
    };

    return true
  },
  cachedNewProject: function() {
    var hasCached = false
    try {
      var obj = JSON.parse(localStorage.getItem('projectnew'));
      for (var propName in obj) { 
        if (obj[propName] === null || obj[propName] === undefined) {
          delete obj[propName];
        }
      }
      if (Object.keys(obj).length>0) hasCached = true;
    } catch(e) { } finally {
      return hasCached
    }
  },
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
