(function(){
	var tabPanel = function($li){
		var selector = $li.find("a").attr("href");
		return $(selector);
	}

	$.fn.myTabs = function(){
		
			
		
		$.each(this, function(i, ul){
			var $ul = $([ul]);
			var $activeLi;

			// initialization
			$.each($ul.children(), function(i, li){
				var $li = $([li]);
				if ( i == 0){
					$activeLi = $li;
				} else {
					var $div = tabPanel($li);
					$div.hide();
				}
			});


			// listen to all ul's click events
			$ul.children().bind("click", function(){
				// 'this' becomes the li element that's clicked
				tabPanel($activeLi).hide();
				$activeLi = $([this]);
				tabPanel($activeLi).show();
			});

		});

	};
})();
