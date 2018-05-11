function vexFlag(usr) {
  vex.dialog.open({
    message: 'Request to Remove',
    input: [
      '<div> ',
        '<form> ',
          '<div class="checkbox">',
            '<label style="display: grid;">',
              '<input type="checkbox" value="" name="t1" id="t1">',
              'Obscene content, whether images or text',
            '</label>',
          '</div>',
          '<div class="checkbox">',
            '<label style="display: grid;">',
              '<input type="checkbox" value="" name="t2" id="t2">',
              'Malicious content',
            '</label>',
          '</div>',
          '<div class="checkbox">',
            '<label style="display: grid;">',
              '<input type="checkbox" value="" name="t3" id="t3">',
              'Content that is mislabelled, misplaced, or categorized incorrectly',
            '</label>',
          '</div>',
          '<div class="checkbox">',
            '<label style="display: grid;">',
              '<input type="checkbox" value="" name="t4" id="t4">',
              'Spam and solicitations',
            '</label>',
          '</div>',
          '<div class="checkbox">',
            '<label style="display: grid;">',
              '<input type="checkbox" value="" name="t5" id="t5">',
              'Violations of site policy',
            '</label>',
          '</div>',
          '<div class="checkbox">',
            '<label style="display: grid;">',
              '<input type="checkbox" value="" name="t6" id="t6">',
              'Copyrighted work',
            '</label>',
          '</div>',
          '<div class="checkbox">',
            '<label style="display: grid;">',
              '<input type="checkbox" value="" name="t7" id="t7">',
              'Descriptions/solicitation of illegal acts',
            '</label>',
          '</div>',
        '</form>',
      '</div>',
      '<div class="flagdesc"> ',
        '<form> ',
          '<textarea class="form-control" rows="3" placeholder="enter here" name="t8" id="t8"></textarea> ',
        '</form> ',
      '</div>'
    ].join(''),
    callback: function (data) {
      if (
          !$("#t1").is(':checked')&&
          !$("#t2").is(':checked')&&
          !$("#t3").is(':checked')&&
          !$("#t4").is(':checked')&&
          !$("#t5").is(':checked')&&
          !$("#t6").is(':checked')&&
          !$("#t7").is(':checked')&&
          !$("#t8").val()
        ) return;
      Meteor.call('flagComplaint', {
        url: backupURL = 'https://app.opensourcehollywood.org/profile/'+usr._id,
        complaint: {
          'Obscene content, whether images or text': $("#t1").is(':checked'),
          'Malicious content': $("#t2").is(':checked'),
          'Content that is mislabelled, misplaced, or categorized incorrectly': $("#t3").is(':checked'),
          'Spam and solicitations': $("#t4").is(':checked'),
          'Violations of site policy': $("#t5").is(':checked'),
          'Copyrighted work': $("#t6").is(':checked'),
          'Descriptions/solicitation of illegal acts': $("#t7").is(':checked')
        },
        msg: $("#t8").val()
      });
    }
  })
}

Template.profile.helpers({
	formattedBio: function() {
		var that =  this;
		setTimeout(function() {
		  if (that.bio) $('#formatted_desc').html(that.bio);
		  else $('#formatted_desc').text('apparently this user likes to keep an air of mystery about them');
		}, 800);
	},
	userProjects: function() {
		return Projects.find({ownerId: this._id});
	},
	isVideo: function() {
		var falsy = false;
		if (this.url.indexOf('vimeo')>-1||this.url.indexOf('youtube')>-1) falsy = true;
		return falsy;
	},
	userReels: function() {
		return this.reels.reverse();
	},
	influenceScore: function() {
		return this.influenceScore;
	},
	avatar: function() {
		return this.avatar;
	},
	name: function() {
		return this.firstName + ' ' + this.lastName;
	},
	createdAt: function() {
		return moment(this.createdAt).format('MM-DD-YYYY');
	},
	hasLinks: function() {
		return this.socialLinks && this.socialLinks.length > 0;
	},
	links: function() {
		return this.socialLinks || ['this user has not shared any social media links'];
	},
	hasWorks: function() {
		return this.onlineWorks && this.onlineWorks.length > 0;
	},
	works: function() {
		return this.onlineWorks || ['this user has not shared any social media links'];
	},
	hasIAM: function() {
		return this.iam && this.iam.length > 0;	
	},
	hasInterests: function() {
		return this.interests && this.interests.length > 0;	
	},
	iams: function() {
		if (!this.iam.length) {
			return 'this user has not specified any specialties or interests'
		};
		return this.iam.join(', ');	
	},
	interests: function() {
		return this.interests || [];	
	},
	hasWebsite: function() {
		return this.website && this.website.indexOf('htt') > -1;	
	},
	website: function() {
		return this.website;	
	},
	hasHeadshots: function() {
		return this.headshots && this.headshots.length > 0;		
	},
	headshots: function() {
		return this.headshots.map(function(i) {
			i.url = 'https://s3-us-west-2.amazonaws.com/producehour/headshots/' + i.url;
			return i;
		});	
	},
	shareData: function() {
	    ShareIt.configure({
	        sites: {
	            'facebook': {
	                'appId': '1790348544595983'
	            }
	        }
	    });
	    var roles;
	    if (!this.iam.length) {
			roles = 'Amazing talent available on O . S . H . (https://opensourcehollywood.org).';
		};
		roles = this.iam.join(', ');	

	    var backupURL = 'https://app.opensourcehollywood.org/profile/'+this._id;
	    return {
	      title: [this.firstName, this.lastName,'on Open Source Hollywood! <opensourcehollywood.org>'].join(' '),
	      author: 'Open Source Hollywood',
	      excerpt: roles,
	      summary: roles,
	      description: roles,
	      thumbnail: this.avatar,
	      image: this.avatar,
	      url: backupURL
	    }
	},
	profileHasMedia: function() {
		return this.reels.length>0;
	}
});

Template.profile.events({
  'click #reportthis': function(e) {
    e.preventDefault();
    /** show vex dialog */
    vexFlag(this);
  }
})


Template.settings.helpers({
	avatar: function() {
		return Meteor.user().avatar;
	},
	bio: function() {
		return Meteor.user().bio || 'you don\'t have a bio';
	},
	links: function() {
		if (Meteor.user().social.length === 0) {
			return 'you don\'t have social links';
		} else {
			return Meteor.user().social.join('<br>');
		};
	}
});


Template.profile.onRendered(function() {
   setTimeout(function() {
      $('.fb-share').html('<li class="fa fa-facebook"></li>');
      $('.tw-share').html('<li class="fa fa-twitter"></li>');
      $('.pinterest-share').html('<li class="fa fa-pinterest"></li>');
      $('.googleplus-share').html('<li class="fa fa-google-plus"></li>');
      $('#genreclick1').click();
   }, 133);
 });