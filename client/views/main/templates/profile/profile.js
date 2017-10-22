Template.profile.helpers({
	userProjects: function() {
		return Projects.find({ownerId: this._id});
	},
	avatar: function() {
		return this.avatar;
	},
	bio: function() {
		return this.bio || 'no bio available';
	},
	name: function() {
		return this.firstName + ' ' + this.lastName;
	},
	createdAt: function() {
		return moment(this.createdAt).format();
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
	iam: function() {
		return this.iam || [];	
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

Template.profile.onRendered(function() {
	var was = this;
	var url = 'url(' + was.data.avatar + ')';
	$('.banner').css("background-image", url); 
	var colors = {
		secondary: '#ed4e7c',
		primary: '#36e2be'
	}
	
	function ready(fn) {
		if (document.readyState != 'loading'){
			fn();
		} else {
			document.addEventListener('DOMContentLoaded', fn);
		}
	}

	ready(function() {
		var counts = [90, 70, 50, 45, 80, 60, 40, 65, 55, 85, 60, 70];
		var interests = was.data.iam.map(function(i) {
			return i.toUpperCase();
		});
		var icounts = counts.splice(0, interests.length);
		var data = {
			labels: interests,
			datasets: [
				{
					data: icounts,
					fillColor: 'transparent',
					strokeColor: colors.secondary,
					pointColor: colors.secondary
				}
			]
		};

		var radarOpts = {
			pointLabelFontFamily: "'Roboto Condensed', 'Roboto', sans-serif",
			pointLabelFontStyle: '200',
			pointLabelFontSize: 12,
			pointLabelFontColor: '#333',
			pointDotRadius: 4,
			angleLineColor: 'rgba(255,255,255,0.1)',
			scaleLineColor: 'rgba(255,255,255,0.1)',
			scaleOverride: true,
			scaleSteps: 2,
			scaleStepWidth: 50,
			showTooltips: false
		};

		// var ctx = document.getElementById("skills-radar").getContext("2d");
		// var radar = new Chart(ctx).Radar(data, radarOpts);
	});


		$(document).ready(function(){
		  $("img").click(function(){
		  var t = $(this).attr("src");
		  $(".modal-body").html("<img src='"+t+"' class='modal-img'>");
		  $("#myModal").modal();
		});

		$("video").click(function(){
		  var v = $("video > source");
		  var t = v.attr("src");
		  $(".modal-body").html("<video class='model-vid' controls><source src='"+t+"' type='video/mp4'></source></video>");
		  $("#myModal").modal();  
		});
		});//EOF Document.ready

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
