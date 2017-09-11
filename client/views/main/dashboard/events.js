Template.collapses.events({
	'click a[data-toggle="collapse"]': function(){
				
		var objectID=$(this).attr('href');
		
		if($(objectID).hasClass('in'))
			$(objectID).collapse('hide');
		
		else
			$(objectID).collapse('show');
	}
});
