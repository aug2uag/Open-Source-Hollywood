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
    var o = {slug: currentSlug};
    o._gifts = gifts;
    var crew = $('.crew-val'); 
    o.crew = [];
    crew.each(function(i, el) {
      var _o = {};
      var arr = $(el).children('td');
      _o.title = $(arr[0]).text();
      _o.description = $(arr[1]).text();
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

    // create virtual account for project
    // add funds to virtual account, non-refundable
    Meteor.call('editProject', o);
    vex.dialog.alert("Project updated!");
    $('.after-the-fact').remove();
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
    var title = $('#crew-title').val(), description = $('#crew-description').val(), status = $('input[name=crew-radio]:checked').val();
    if (title && description && status) $('#crew-table').append('<tr class="crew-val after-the-fact"><td>'+title+'</td><td>'+description+'</td><td><div class="col-sm-12 col-md-4 margin_bottom20"><div class="form-check form-check-inline"><input type="radio" id="crew-radio-needed'+countRows+'" name="crew-radio'+countRows+'" value="needed" '+(status==='needed'?'checked':'')+'><label for="crew-radio-needed'+countRows+'">Needed</label></div><div class="form-check form-check-inline"><input type="radio" id="crew-radio-fulfilled'+countRows+'" name="crew-radio'+countRows+'" value="fulfilled"  '+(status==='fulfilled'?'checked':'')+'><label for="crew-radio-fulfilled'+countRows+'">Fulfilled</label></div></div></td><td><button class="deleteRow button special">X</button></td></tr>');
    $('.deleteRow').on('click', deleteRow);
    $('#crew-title').val(''), $('#crew-description').val(''), $("#crew-radio-needed").prop("checked", true);
  },

  'click #add-cast': function(e) {
    e.preventDefault();
    var countRows = $('.cast-val').length||0;
    var title = $('#cast-title').val(), description = $('#cast-description').val(), status = $('input[name=cast-radio]:checked').val();
    if (title && description && status) $('#cast-table').append('<tr class="cast-val after-the-fact"><td>'+title+'</td><td>'+description+'</td><td><div class="col-sm-12 col-md-4 margin_bottom20"><div class="form-check form-check-inline"><input type="radio" id="cast-radio-needed'+countRows+'" name="cast-radio'+countRows+'" value="needed" '+(status==='needed'?'checked':'')+'><label for="cast-radio-needed'+countRows+'">Needed</label></div><div class="form-check form-check-inline"><input type="radio" id="cast-radio-fulfilled'+countRows+'" name="cast-radio'+countRows+'" value="fulfilled"  '+(status==='fulfilled'?'checked':'')+'><label for="cast-radio-fulfilled'+countRows+'">Fulfilled</label></div></div></td><td><button class="deleteRow button special">X</button></td></tr>');
    $('.deleteRow').on('click', deleteRow);
    $('#cast-title').val(''), description = $('#cast-description').val(''), $("#cast-radio-needed").prop("checked", true);
  },

  'click #add-needs': function(e) {
    e.preventDefault();
    var cat = $('#needs-category').val(), description = $('#needs-description').val(), quantity = parseInt($('#needs-quantity').val());
    if (cat.toLowerCase().indexOf('category')>-1) return;
    if (typeof quantity !== 'number' || quantity<1) return;
    if (cat && description && quantity) $('#needs-table').append('<tr class="needs-val after-the-fact"><td>'+cat+'</td><td>'+description+'</td><td>'+quantity+'</td><td><button class="deleteRow button small">X</button></td></tr>');
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

  'click #add-gift': function(e) {
    e.preventDefault();
    var o = {};
    o.name = $('#gift-title').val(), o.description = $('#gift-description').val(), o.quantity = parseInt($('#gift-quantity').val()), o.msrp = parseFloat($('#gift-msrp').val());
    if (!o.name || !o.quantity || !o.msrp || typeof o.quantity !== 'number' || typeof o.msrp !== 'number' || o.quantity < 1 || o.msrp < 1) return;
    if (!osettings.giftImage.data) o.url = 'https://s3-us-west-2.amazonaws.com/producehour/placeholder_gift.jpg';
    else o.data = osettings.giftImage.data;
    osettings.giftImage = {};
    gifts.push(o);
    $('#gift-table').append('<tr class="gift-val after-the-fact"><td>'+o.name+'</td><td>'+o.description+'</td><td>'+o.quantity+'</td><td>'+o.msrp+'</td><td><button class="removeGift button small">X</button></td></tr>');
    $('.removeGift').on('click', removeGift);
    $('#gift-title').val(''), $('#gift-description').val(''), $('#gift-quantity').val(''), $('#gift-msrp').val('');
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