Template.profile.helpers({
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
	avatar: function() {
		return this.avatar;
	},
	bio: function() {
		return this.bio || 'apparently this user likes to keep an air of mystery about them';
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
	}
});


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
