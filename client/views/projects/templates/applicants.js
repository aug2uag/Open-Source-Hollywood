Template.applicantsContracts.helpers({
	foo: function() {
		console.log(this)
	},
	castCrew: function() {
		var agg = []
		this.projects.forEach(function(p) {
			if (p.castApplicants&&p.castApplicants.length) {
				p.castApplicants.forEach(function(c) { 
					c.projectId = p.id
					c.slug = p.slug
					c.title = p.title
				})
				agg = agg.concat(p.castApplicants)
			};
			if (p.crewApplicants&&p.crewApplicants.length) {
				p.crewApplicants.forEach(function(c) { 
					c.projectId = p.id
					c.slug = p.slug
					c.title = p.title
				})
				agg = agg.concat(p.crewApplicants)
			};
		})
		return agg
	},
	roleSummary: function() {
		return [this.message, 'for role:', this.appliedFor].join(' ')
	}
})