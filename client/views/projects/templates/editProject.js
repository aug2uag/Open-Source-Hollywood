var gifts = [],
    osettings = {};
    osettings.giftImage = {},
    currentSlug = null, 
    currentTitle = null;

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

Template.editProject.events({
  'click #update_campaign': function(e) {
    e.preventDefault();
    console.log('in 1')
    var o = {slug: currentSlug};
    o._gifts = gifts;
    var crew = $('.crew-val'); 
    o.crew = [];
    crew.each(function(i, el) {
      var _o = {};
      var arr = $(el).children('td');
      _o.title = $(arr[0]).text();
      _o.description = $(arr[1]).text();
      _o.audition = $(arr[2]).text();
      _o.status = $('input[name='+('crew-radio'+i)+']:checked').val();
      o.crew.push(_o);
    });

    var cast = $('.cast-val');
    o.cast = [];
    cast.each(function(i, el) {
      var _o = {};
      var arr = $(el).children('td');
      _o.role = $(arr[0]).text();
      _o.description = $(arr[1]).text();
      _o.audition = $(arr[2]).text();
      _o.status = $('input[name='+('cast-radio'+i)+']:checked').val();
      o.cast.push(_o);
    });

    var needs = $('.needs-val');
    o.needs = [];
    needs.each(function(i, el) {
      var _o = {};
      var arr = $(el).children('td');
      _o.category = $(arr[0]).text();
      _o.description = $(arr[1]).text();
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
    console.log('in 2')

    // create virtual account for project
    // add funds to virtual account, non-refundable
    Meteor.call('editProject', o);
    vex.dialog.alert("Project updated!");
    console.log('in 3')
    $('.after-the-fact').remove();
    try {
      glowToClick();
    } catch(e) {
      console.log(e)
    }
  },
  'change #gift_file': function (e, template) {
      if (e.currentTarget.files && e.currentTarget.files[0]) {
        osettings.giftImage = {};
        var reader = new FileReader();
        var files = e.target.files;
        var file = files[0];
        if (file.type.indexOf("image")==-1) {
          vex.dialog.alert('Invalid File, you can only upload a static image for your profile picture');
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
    var countRows = $('.crew-val').length||0;
    var title = $('#crew-title').val(), 
        description = $('#crew-description').val(), 
        audition = $('#crew-audition').val() || 'N/A',
        status = 'needed';
    if (title && description && status) 
      $('#crew-table').append('<tr class="crew-val after-the-fact"><td colspan="2">'+title+'</td><td colspan="2">'+description+'</td><td colspan="2">'+audition+'</td><td><div class="col-sm-12 col-md-4 margin_bottom20"><div class="form-check form-check-inline"><input type="radio" id="crew-radio-needed'+countRows+'" name="crew-radio'+countRows+'" value="needed" '+(status==='needed'?'checked':'')+'><label for="crew-radio-needed'+countRows+'">Needed</label></div><div class="form-check form-check-inline"><input type="radio" id="crew-radio-fulfilled'+countRows+'" name="crew-radio'+countRows+'" value="fulfilled"  '+(status==='fulfilled'?'checked':'')+'><label for="crew-radio-fulfilled'+countRows+'">Fulfilled</label></div></div></td><td><button class="deleteRow button special">X</button></td></tr>');
    $('.deleteRow').on('click', deleteRow);
    $('#crew-title').val(''), $('#crew-description').val(''), $('#crew-audition').val(''), $("#crew-radio-needed").prop("checked", true);
  },

  'click #add-cast': function(e) {
    e.preventDefault();
    var countRows = $('.cast-val').length||0;
    var title = $('#cast-title').val(), 
        description = $('#cast-description').val(), 
        audition = $('#cast-audition').val() || 'N/A',
        status = 'needed';
    if (title && description && status) 
      $('#cast-table').append('<tr class="cast-val after-the-fact"><td colspan="2">'+title+'</td><td colspan="2">'+description+'</td><td colspan="2">'+audition+'</td><td><div class="col-sm-12 col-md-4 margin_bottom20"><div class="form-check form-check-inline"><input type="radio" id="cast-radio-needed'+countRows+'" name="cast-radio'+countRows+'" value="needed" '+(status==='needed'?'checked':'')+'><label for="cast-radio-needed'+countRows+'">Needed</label></div><div class="form-check form-check-inline"><input type="radio" id="cast-radio-fulfilled'+countRows+'" name="cast-radio'+countRows+'" value="fulfilled"  '+(status==='fulfilled'?'checked':'')+'><label for="cast-radio-fulfilled'+countRows+'">Fulfilled</label></div></div></td><td><button class="deleteRow button special">X</button></td></tr>');
    $('.deleteRow').on('click', deleteRow);
    $('#cast-title').val(''), description = $('#cast-description').val(''), $('#cast-audition').val(''), $("#cast-radio-needed").prop("checked", true);
  },

  'click #add-needs': function(e) {
    e.preventDefault();
    var cat = $('#needs-category').val(), description = $('#needs-description').val();
    if (cat.toLowerCase().indexOf('category')>-1) return;
    if (cat && description) $('#needs-table').append('<tr class="needs-val"><td>'+cat+'</td><td>'+description+'</td><td><button class="deleteRow button small">X</button></td></tr>');
    $('.deleteRow').on('click', deleteRow);
    $("#needs-category").val($("#needs-category option:first").val()), $('#needs-description').val(''), $('#needs-quantity').val('');
  },

  'click #add-social': function(e) {
    e.preventDefault();
    var title = $('#social-title').val(), url = $('#social-url').val();
    if (title && url) $('#social-table').append('<tr class="social-val after-the-fact"><td>'+title+'</td><td>'+url+'</td><td><button class="deleteRow button small">X</button></td></tr>');
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
      o.secondaryData = $('.apparelsize:checkbox:checked').map(function(el){ return $(this).val();}).get();
    } else {
      o.secondaryData = $('#merch_handling').val();
    };
    o.disclaimer = $('#merch_disclaimer').val();
    osettings.giftImage = {};
    gifts.push(o);
    console.log(gifts)
    var tblRow = [
      '<tr class="gift-val after-the-fact">',
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
    $('.removeGift').on('click', removeGift);
    $('#gift-title').val(''), $('#gift-description').val(''), $('#gift-quantity').val(''), $('#gift-msrp').val('');
    /** set file.name to span of inner el */
    $('#gift_file_name').text('');
    $('#merch_handling').val('');
    $('#merch_disclaimer').val('');
    $('.apparelsize:checkbox:checked').each(function(idx, el){ return $(el).prop("checked", false);})
  }
});

Template.editProject.helpers({
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
  }
});

Template.editProject.rendered = function () {
  $('.deleteRow').on('click', deleteRow);
};