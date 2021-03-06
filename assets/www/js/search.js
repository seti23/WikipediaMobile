function search(isSuggestion) {
	if($('#search').hasClass('inProgress')) {
		window.frames[0].stop();
		$('#search').removeClass('inProgress');
		return;
	}
	if (hasNetworkConnection()) {
		var searchParam = $('#searchParam').val();

		if (searchParam == '') {
			hideOverlays();
			return;
		}

		showSpinner();
		$('#search').addClass('inProgress');

		if(!isSuggestion) {
			var url = urlForTitle(searchParam);
			goToResult(url);
			return;
		}

		var requestUrl = currentLocale.url + "/w/api.php";
		$.ajax({
			type: 'GET',
			url: requestUrl,
			data: {
				action: 'opensearch',
				search: searchParam,
				format: 'json'
			},
			success: function(data) {
				displayResults(data, isSuggestion);
			}
		});
	} else {
		noConnectionMsg();
		hideOverlays();
	}
}

function urlForTitle(title) {
    return currentLocale.url + "/wiki/" + encodeURIComponent(title.replace(/ /g, '_'));
}

function displayResults(results, isSuggestion) {
	setActiveState();
	var formattedResults = "";

	if (results != null) {
		results = JSON.parse(results);

		if (results.length > 0) {
			var searchParam = results[0];
			var searchResults = results[1];

			for (var i=0;i<searchResults.length;i++) {
				var article = searchResults[i];
				var url = urlForTitle(article);

				formattedResults += "<div data-page-url=\'" + url + "\' class='listItemContainer' onclick=\"javascript:goToResult(\'" + url + "\');\">";
				formattedResults += "<div class='listItem'>";
				formattedResults += "<span class='iconSearchResult'></span>";
				formattedResults += "<span class='text'>" + article + "</span>";
				formattedResults += "</div>";
				formattedResults += "</div>";
			}
		} else {
			formattedResults += "<div class='listItemContainer'>";
			formattedResults += "<div class='listItem'>";
			formattedResults += "<span class='iconSearchResult'></span>";
			formattedResults += "<span class='text'>No results found</span>";
			formattedResults += "</div>";
			formattedResults += "</div>";
		}
	} else {
		// no result from the server...
	}

	formattedResults += "<div class='listItemContainer' onclick='javascript:hideOverlays();'>";
	formattedResults += "<div class='listItem'>Close</div>";
	formattedResults += "</div>";

	$('#resultList').html(formattedResults);

	// Replace icon of savd pages in search suggestions
	var bookmarksDB = new Lawnchair({name:"bookmarksDB"}, function() {
		$("#resultList .listItemContainer").each(function() {
			var container = this;
			var url = $(this).attr('data-page-url');
			bookmarksDB.exists(url, function(exists) {
				if(exists) {
					$(container).find(".iconSearchResult").removeClass("iconSearchResult").addClass("iconSavedPage");
				}
			});
		});
	});

	$('#search').removeClass('inProgress');
	hideSpinner();
	hideOverlays();

	$('#searchresults').show();
	$('#content').hide();
	
}

function goToResult(url) {
	if (hasNetworkConnection()) {
		navigateToPage(url);
		hideOverlays();
	} else {
		noConnectionMsg();
	}
}

function showSpinner() {
	$('.titlebar .spinner').css({display:'block'});
	$('#clearSearch').css({height:0});
}

function hideSpinner() {
	$('.titlebar .spinner').css({display:'none'});	
	$('#clearSearch').css({height:30});
}
