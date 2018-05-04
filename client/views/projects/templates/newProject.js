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
  /**
     *  Plugin name:SWEDitor
     *  Author: Moncho Varela / nakome
     *  Date: 20/10/2013 ten day for my birthday LOL
     *  @nakome on twitter
     */
    (function(window) {
      
      'use strict';
      
      
      function getTemplate(el) {
        // Template html
        var html = '<div class="box-editor">' +
            '<div id="thisForm">' +
            '<input type="hidden" name="myDoc">' +
            '<div id="toolBar2">' +
            '<label class="custom-select fontSi">' +
            '<select class="selectThis" data-chg="fontsize">' +
            '<option class="heading" selected>:: Size</option>' +
            '<option value="1">Very small</option>' +
            '<option value="2">A bit small</option>' +
            '<option value="3">Normal</option>' +
            '<option value="4">Medium-large</option>' +
            '<option value="5">Big</option>' +
            '<option value="6">Very big</option>' +
            '<option value="7">Maximum</option>' +
            '</select></label>' +
            '<a href="javascript:void(0);" class="intLink formatBlock" title="Left align"  data-fn="justifyleft">' +
            '<i class="fa fa-align-left"></i></a>' +
            '<a href="javascript:void(0);" class="intLink formatBlock" title="Center align"  data-fn="justifycenter">' +
            '<i class="fa fa-align-center"></i>' + '</a>' +
            '<a href="javascript:void(0);" class="intLink formatBlock" title="Right align"  data-fn="justifyright">' +
            '<i class="fa fa-align-right">' + '</i></a>' +
            '<a href="javascript:void(0);" class="intLink" title="Quote"  id="quote" data-fn="blockquote">' +
            '<i class="fa fa-quote-left"></i></a>' +
            '<a href="javascript:void(0);" class="intLink formatBlock" title="Add indentation"  data-fn="indent">' +
            '<i class="fa fa-indent"></i></a>' +
            '<a href="javascript:void(0);" class="intLink formatBlock" title="Get hr"  data-fn="inserthorizontalrule">' +
            'HR </a>' +
            ' <a href="javascript:void(0);" class="intLink" title="Get img" id="getImg" data-fn="insertImage">' +
            '<i class="fa fa-image">' + '</i></a>' +
            ' </div>' +
            '<div id="textBox" contenteditable="true">' +
            '</div></div></div>';
        // render html
        el.innerHTML = html;
      }
      
      function initDoc(fm, bx) {
        var elem = bx,
            sDefTxt;
        sDefTxt = bx.innerHTML;
        if (fm.checked) {
          setDocMode(true);
        }
      }
      
      function formatDoc(obj, val) {
        if (validateMode()) {
          document.execCommand(obj, false, val);
        }
      }
      
      
      function validateMode() {
        var thisForm = document.querySelector('#thisForm');
        if (!thisForm.checked) {
          return true;
        }
        alert("Uncheck \"Show HTML\".");
        return false;
      }
      
      function setDocMode(source, oDoc) {
        var sDefTxt = oDoc.innerHTML;
        var oContent;
        if (source) {
          oContent = document.createTextNode(sDefTxt);
          oDoc.innerHTML = "";
          var oPre = document.createElement("pre");
          oDoc.contentEditable = false;
          oPre.id = "sourceText";
          oPre.contentEditable = true;
          oPre.appendChild(oContent);
          oDoc.appendChild(oPre);
        } else {
          if (document.all) {
            sDefTxt = oDoc.innerText;
          } else {
            oContent = document.createRange();
            oContent.selectNodeContents(oDoc.firstChild);
            oDoc.innerHTML = oContent.toString();
          }
          oDoc.contentEditable = true;
        }
      }
      
      // extend options
      
      function extend(a, b) {
        for (var key in b) {
          if (b.hasOwnProperty(key)) {
            a[key] = b[key];
          }
        }
        return a;
      }
      
      function sweDitor(elem, options) {
        // The div of editor
        this.elem = elem;
        // The options  ex. this.options.type = hello
        this.options = extend(this.defaults, options);
        // Get Template
        getTemplate(elem);
        // Start init
        this._init();
      }
      
      sweDitor.prototype = {
        // this.options.type
        defaults: {
          textArea: 'editor_area',
          showTextarea: true
        },
        
        // this._init();
        _init: function() {
          var self = this;
          // Div of content
          this.box = document.querySelector('#textBox');
          // array for change event
          this.selects = Array.prototype.slice.call(this.elem.querySelectorAll('.selectThis'));
          // array for click event
          this.formats = Array.prototype.slice.call(this.elem.querySelectorAll('.formatBlock'));
          // get print id
          this.getPrint = document.getElementById('getPrint');
          // The textarea
          this.textArea = document.getElementById(this.options.textArea);
          // get clean id
          this.getClean = document.getElementById('getClean');
          // get img id 
          this.getImg = document.getElementById('getImg');
          // get switchbox
          this.quote = document.getElementById('quote');
          // get switchbox
          this.switchBox = document.getElementById('switchBox');
          // Init Doc function
          initDoc(this, this.textArea);
          this._initEvents();
        },
        
        // this._initEvents();
        _initEvents: function() {
          
          var self = this;
          
          //Show or hide textarea
          if (this.options.showTextarea === true) {
            self.textArea.style.display = 'block';
          } else {
            self.textArea.style.display = 'none';
          }
          
          // On ready copy text of text area
          this.box.innerHTML = this.textArea.textContent;
          // On keyup copy text on textarea
          this.box.addEventListener('keyup', function() {
            self.textArea.textContent = self.box.innerHTML;
          }, false);
          // On keydown copy text on textarea
          this.box.addEventListener('keydown', function() {
            self.textArea.textContent = self.box.innerHTML;
          }, false);
          // add event on change for  all selects 
          this.selects.forEach(function(el, i) {
            el.addEventListener('change', function() {
              formatDoc(this.getAttribute('data-chg'), this.value);
              self.textArea.textContent = self.box.innerHTML;
            }, false);
          });
          // img listener
          this.getImg.addEventListener('click', function() {
            var simg = prompt('Write the URL of image here', 'http:\/\/');
            if (simg && simg !== '') {
              formatDoc(this.getAttribute('data-fn'), simg);
              self.textArea.textContent = self.box.innerHTML;
            }
          }, false);
          
          // all other formats  
          this.formats.forEach(function(el, i) {
            el.addEventListener('click', function() {
              formatDoc(this.getAttribute('data-fn'));
              self.textArea.textContent = self.box.innerHTML;
            }, false);
          });
          // blockquote
          this.quote.addEventListener('click', function() {
            formatDoc('formatblock', this.getAttribute('data-fn'));
            self.textArea.textContent = self.box.innerHTML;
          }, false);
        }
        
      };
      
      // add to global namespace
      window.sweDitor = sweDitor;
      
    })(window);

    // Init editor
    new sweDitor(document.getElementById('editor_panel'),{
      textArea: 'editor_area', //id of textarea
      showTextarea: false // if true show hidden text area
    });

    setTimeout(function() {
      $('#textBox').html('<p><span class="large">Enter your campaign description here.</span><br>You can copy / paste text from another source here or use the menu above to format text and insert images from a valid URL.</p><p>&nbsp;</p>');
    }, 800);
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

    if (o.zip.match(/\d{5}/)) {
      var url = 'https://api.zippopotam.us/us/' + o.zip;
      var client = new XMLHttpRequest();
      client.open("GET", url, true);
      client.onreadystatechange = function() {
        if(client.readyState == 4) {
          try {
            var data = JSON.parse(client.responseText);
            if (Object.keys(data).length === 0) return vex.dialog.alert('please enter location zip code to continue');
            if (data.country === 'United States') {
              var _o = data.places[0];
              o.city = _o['place name'];
              o.state = _o.state;
              campcallback();
            };
          } catch (e) {
            console.log(e)
            vex.dialog.alert('your location zip code could not be verified, please contact us or try again')
          }
        };
      };

      client.send();
    } else {
      return vex.dialog.alert('an invalid zip code was detected, please try again');
    }

    function campcallback() {
      o.title = $('#title').val() || 'untitled';
      o.logline = $('#logline').val() || 'nothing to see here';
      o.purpose = $('#genre').find(":selected").text();
      o.genre = $('#genre').find(":selected").text();
      o._gifts = gifts;
      if (validateUrl($('#website').val())) o.website = $('#website').val();
      var descriptionText = $('#textBox').text().trim();
      if (descriptionText&&descriptionText!=='Enter your campaign description here.You can copy / paste text from another source here or use the menu above to format text and insert images from a valid URL.') {
        o.description = $('#textBox').html();
        o.descriptionText = descriptionText;
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

      Meteor.call('addProject', o);
    }
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
