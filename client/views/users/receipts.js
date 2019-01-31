Template.main_receipts.helpers({
	foo: function() {
		console.log(this)
	},
	formatDate: function() {
		return moment(this.created).format('MMMM Do, YYYY')
	},
	formatTitle: function() {
		var leading = [this.purpose, 'for'].join(' ')
		if (this.purpose==='apply') leading = 'application donation for ';

		if (this.type==='credit'&&this.purpose==='donation') {
			return ['you received a donation from', this.name, 'for', this.title].join(' ')
		};

		return [leading, this.title].join(' ')
	},
	formatAmount: function() {
		return this.amount
	},
	formatStatus: function() {
		if (this.refund) {
			return 'refund'
		};

		if (this.type==='credit'&&this.purpose==='donation') {
			return 'donation'
		};

		if (this.purpose==='apply') {
			if (this.pending) return 'pending decision';
			return 'donation for role'
		};

		return 'charge'
	},
	formatLink: function() {
		return ['/transaction/',this._id].join('')
	},
	formatLinkTitle: function() {
		if (this.linkTitle) return this.linkTitle;
		return 'view details'
	},
})