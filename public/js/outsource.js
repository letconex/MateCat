$.extend(UI, {
	outsourceInit: function() {
		$(".outsourceto .uploadbtn").click(function(e) {
			e.preventDefault();
		});
		$(".outsource").click(function() {
			$( ".outsourcemodal" ).show();
		});

		$(".more").click(function(e) {
			e.preventDefault();
			$(".content").toggle();
		});
		$(".more-table").click(function(e) {
			e.preventDefault();
			$(".content-table").toggle();
		});

        $( ".showprices" ).click(function() {
            $( this ).hide();
            $( ".revealprices" ).show();
        });

        $('.show_translator').click(function() {
            $(this).addClass('hide');
            $('.guaranteed_by').addClass('expanded');
            $('.delivery,.tprice,.pricebox').addClass('compress');
            $('.delivery').appendTo(".displaypriceperword ");
            $('.trustbox2').removeClass('hide');
            $('.translator_info_box').removeClass('hide');
            $('#forceDeliveryContainer').addClass('hide');
            $('.hide_translator').removeClass('hide');
        });
        $('.hide_translator').click(function() {
            $(this).addClass('hide');
            $('.guaranteed_by').removeClass('expanded');
            $('.delivery').appendTo(".delivery_container");
            $('.delivery,.tprice,.pricebox').removeClass('compress');
            $('.trustbox2').addClass('hide');
            $('.translator_info_box').addClass('hide');
            $('#forceDeliveryContainer').addClass('hide');
            $('.show_translator').removeClass('hide');
        });

        $( "input[name='revision']" ).click(function() {
            $(this).parent().toggleClass('noopacity');
            var fullTranslateUrl = $(".onyourown a.uploadbtn").attr("href");
            $(".translate[href='" + fullTranslateUrl.substr(fullTranslateUrl.indexOf("/translate/")) + "']").trigger( "click" );
            $('.revision_heading').toggleClass('hide');
        });

        //Added .translate class in html button because of double call to
        //API when displaying prices on showprices button ( class .in-popup was removed and .uploadbtn was too much widely used... )
		$(".translate").click(function(e) {
			var linkPieces = $( this ).attr( "href" ).split( "/" );
			var jPieces = linkPieces[ linkPieces.length - 1 ].split( "-" );
			var words = $( ".tablestats[data-pwd='" + jPieces[ 1 ] + "'] .stat-payable" ).text();

			$( ".title-source" ).text( $( "div[data-jid='" + jPieces[ 0 ] + "'] .source_lang" ).text() );
			$( ".title-target" ).text( $( "div[data-jid='" + jPieces[ 0 ] + "'] .target_lang" ).text() );
			$( ".title-words" ).text( words );

			if(config.enable_outsource) {
				e.preventDefault();
				$('.modal.outsource').addClass('loading');
                $('.outsource.modal .continuebtn').addClass('loading disabled');
                $('body').addClass('showingOutsourceTo');
				$('.outsource.modal input.out-link').val(window.location.protocol + '//' + window.location.host + $(this).attr('href'));
                $('.outsource.modal .uploadbtn').attr('href', $(this).attr('href'));
                resetOutsourcePopup( false );
                getOutsourceQuote( $( this ), "parseResult" );
				$('.outsource.modal').show();
				return false;
			}
		});

		$(".outsourcemodal").on('click', '.chunks input', function(e) {
			e.stopPropagation();
			UI.setPrices();
//		}).on('click', '.outsourcemodal .x-popup', function(e) {
//			UI.showOutsourceChoice();
		}).on('click', '.chunks td.outs', function(e) {
			e.stopPropagation();
			ch = $(this).find('input');
			if($(ch).attr('checked')) {
				$(ch).removeAttr('checked');
			} else {
				$(ch).attr('checked', 'checked');
			}
			UI.setPrices();
//		}).on('click', '.back', function(e) {
//			e.preventDefault();
//			UI.showOutsourceChoice();
		})

		$(".outsource.modal").on('click', '.continuebtn:not(.disabled)', function(e) {
			e.preventDefault();

            updateCartParameters();

			$('#continueForm input[name=url_ok]').attr('value', UI.url_ok);
			$('#continueForm input[name=url_ko]').attr('value', UI.url_ko);
            $('#continueForm input[name=data_key]').attr('value', UI.data_key);

            //IMPORTANT post out the quotes
			$('#continueForm input[name=quoteData]').attr('value', JSON.stringify( UI.quoteResponse ) );
			$('#continueForm').submit();
            $('#continueForm input[name=quoteData]').attr('value', '' );
		}).on('click', '.continuebtn.disabled', function(e) {
			e.preventDefault();
		});

		$("body").on('click', '.modal.outsource .x-popup', function(e) {
			$('.modal.outsource .displayprice').empty();
			$('.modal.outsource .delivery .time').empty();
			$('.modal.outsource .revealprices, .modal.outsource .showprices').hide();
            resetOutsourcePopup( true );
		});

        $( "#changecurrency" ).change( function(){
            var currencyFrom = $( ".displayprice").attr( "data-currency" );
            var currencyTo  = $( "#changecurrency option:selected" ).val();
            changeCurrency( $( ".displayprice").attr( "data-rawprice" ), currencyFrom, currencyTo, ".euro", ".displayprice", ".price_p_word" );
            changeCurrency( $( ".revision_price").attr( "data-rawprice" ), currencyFrom, currencyTo, ".revision_currency", ".revision_price", "" );
        });

        $( "#changeTimezone" ).change( function(){
            var timezoneFrom = $( "span.time").attr( "data-timezone" );
            var timezoneTo = $( "#changeTimezone option:selected" ).val();
            changeTimezone( $( "span.time").attr( "data-rawtime" ), timezoneFrom, timezoneTo, "span.time" );
            changeTimezone( $( "span.revision_delivery").attr( "data-rawtime" ), timezoneFrom, timezoneTo, "span.revision_delivery" );
            updateTimezonesDescriptions( timezoneTo );
        });
	},
	getFarthestDate: function() {
		farthest = new Date(0);
		$('.outsourcemodal .chunks tr:not(.thead):has(input[checked=checked])').each(function() {
			dd = new Date($(this).attr('data-delivery'));
			if(dd.getTime() > farthest.getTime()) farthest = dd;
		})

        var timeOffset = ( -dd.getTimezoneOffset() / 60 );

        //check for international API support on ECMAScript
        if ( window.Intl && typeof window.Intl === "object" ){
            //Assume it's supported, lets localize
            var timeZone   = Intl.DateTimeFormat().resolved.timeZone.replace('San_Marino', 'Rome');
            var extendedTimeZone = '( GMT ' + ( timeOffset > 0 ? '+' : '' ) + timeOffset + ' ' + timeZone + ' )';
            $('.outsource.modal .total span.displayprice').text( Intl.NumberFormat('en').format( chunk.price ) );
        } else {
            var extendedTimeZone = '( ' + dd.toString().replace(/^.*GMT.*\(/, "").replace(/\)$/, "") + ' - GMT ' + ( timeOffset > 0 ? '+' : '' ) + timeOffset + ' )';
            $('.outsource.modal .total span.displayprice').text( parseFloat( chunk.price ).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,') );
        }

		return $.format.date(farthest, "D MMMM") + ' at ' + $.format.date(farthest, "hh:mm") + ' ' + extendedTimeZone;
	}
//	showOutsourceChoice: function() {
//		$('.outsourcemodal h1').text('Here is the link to your new translation job');
//		$('.outsourcemodal section.outs').hide();
//		$('.outsourcemodal section.choose').show();
//	},
});


function getOutsourceQuote( clickedButton, callbackFunction ) {
    var row = clickedButton.parents('.tablestats');

    APP.doRequest({
        data: {
            action: 'outsourceTo',
            pid: $('#pid').attr('data-pid'),
            ppassword: $("#pid").attr("data-pwd"),
            fixedDelivery: $( "#forceDeliveryChosenDate" ).text(),
            typeOfService: $( "input[name='revision']" ).is(":checked") ? "premium" : "professional",
            jobs: [
                {
                    jid: row.attr('data-jid'),
                    jpassword: row.attr('data-pwd')
                }
            ]
        },
        context: clickedButton.parents('.totaltable').find('.languages .splitnum').text(),
        error: function() {
            // UI.failedConnection(0, 'outsourceToTranslated');
        },
        success: function(d) {
            if( callbackFunction == "parseResult" ) {
                parseResult( this, d, clickedButton );
            } else if( callbackFunction == "precomputeOutsourceQuotesRecursive" ) {
                precomputeOutsourceQuotesRecursive();
            }
        }
    });
}


function parseResult( chunkId, returnedData, clickedButton ) {
    //IMPORTANT this store the quote response to a class variable
    //to be posted out when Order Button is pressed
    UI.quoteResponse = returnedData.data[0];

    var chunks = returnedData.data[0];
    var ind = 0;
    $.each(chunks, function(index) {
        if(clickedButton.id == chunkId) ind = index;
    });
    var chunk = returnedData.data[0][ind];
    var row = clickedButton.parents('.tablestats');

    UI.url_ok = returnedData.return_url.url_ok;
    UI.url_ko = returnedData.return_url.url_ko;
    UI.data_key = row.attr('data-jid') + "-" + row.attr('data-pwd') + "-" + $( "#forceDeliveryChosenDate" ).text();

    //this tell to the ui if price box sould be displayed immediately
    if( chunk.show_info == '1' ){
        $(".showprices" ).click();
    } else {
        $(".showprices" ).show();
    }

    // a generic error
    if( chunk.quote_result != 1 ){
        $(".outsourceto").addClass( "quoteError" );
        $('.modal.outsource').removeClass('loading');
        $('.outsource #changeTimezone,.outsource #changecurrency,.paymentinfo,.modal.outsource .contact_box, .modal.outsource .more, .needitfaster').addClass("hide");
        $('.ErrorMsgQuoteError').removeClass('hide');
        $('#forceDeliveryContainer').css('top','465px');
        $('.addrevision, .delivery_details span.time, .delivery_label,.euro,.displayprice,.displaypriceperword, .delivery_details span.zone2').addClass('hide');
        $('.needitfaster').html('Change delivery date');
        $('.outsource.modal .continuebtn').addClass('hide');
        return false;
    }

    // job already outsourced
    if( chunk.outsourced == 1 ) {
        renderOutsourcedQuote( chunk );
        return false;
    }

    // delivery date too strict
    if( chunk.quote_available != 1 ) {
        $(".outsourceto").addClass("quoteNotAvailable");
        $('.modal.outsource').removeClass('loading');
        $('.ErrorMsgquoteNotAvailable').removeClass('hide');
        $('.guaranteed_by .more, .delivery_details span.time, .delivery_label,.euro,.displayprice,.displaypriceperword, .delivery_details span.zone2, .revision_delivery, .revision_price_box,#delivery_before_time').addClass('hide');
        $('.needitfaster').html('Change delivery date');
        $('#forceDeliveryContainer #delivery_not_available').removeClass('hide');
        $('.outsource.modal .forceDeliveryButtonOk').addClass('disabled');
        return false;
    }

    renderNormalQuote( chunk );
}


function renderNormalQuote( chunk ) {
    // if the customer has a timezone in the cookie, then use it
    // otherwise attempt to guess it from his browser infos
    var isRevisionChecked = $( "input[name='revision']" ).is( ":checked" );
    var deliveryToShow = ( isRevisionChecked ) ?  chunk.r_delivery : chunk.delivery;
    var priceToShow = ( isRevisionChecked ) ? parseFloat( chunk.r_price ) + parseFloat( chunk.price ) : chunk.price;

    renderLocalizationInfos( priceToShow, deliveryToShow, chunk.r_price, chunk.r_delivery );

    if( new Date( deliveryToShow ).getTime() < $( "#forceDeliveryChosenDate" ).text() ) {
        $( ".delivery_container > .delivery").addClass( "faster" );
        $('#delivery_before_time').removeClass('hide');
        $("#delivery_manual_error").addClass( "hide" );
        $('.modal.outsource .tooltip').removeClass('hide');

    } else {
        $( ".delivery_container > .delivery").removeClass( "faster" );
        $('#delivery_before_time').addClass('hide');
        $('.modal.outsource .tooltip').addClass('hide');
    }


    // no info available about translator
    if( chunk.show_translator_data != 1 ) {
        $('.outsourceto').addClass("translatorNotAvailable");
        $('.outsource.modal .minus,').hide();
        $('.trustbox2').removeClass('hide');
        $('.translator_bio,.outsource.modal .more,.trustbox1, .translator_not_found,.translator_not_found, .trust_text p:first-child').addClass('hide');
        return false;
    }


    var subjectsString = "";
    if (chunk.t_chosen_subject.length > 0 && chunk.t_subjects.length > 0) {
        subjectsString = "<strong>" + chunk.t_chosen_subject + "</strong>, " + chunk.t_subjects;
    } else if (chunk.t_chosen_subject.length > 0) {
        subjectsString = "<strong>" + chunk.t_chosen_subject + "</strong>";
    } else {
        subjectsString = chunk.t_subjects;
    }

    $(".translator_name > strong").text(chunk.t_name);
    $(".experience").text(chunk.t_experience_years);
    $(".subjects").html(subjectsString);
    $(".translated_words").html(chunk.t_words_total.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,"));

    var voteToShow = ( isRevisionChecked ) ? chunk.r_vote : chunk.t_vote;

    if( chunk.show_revisor_data != 1 ) {
        $(".outsourceto").addClass("revisorNotAvailable");
        voteToShow = chunk.t_vote;
    }

    $(".score_number").text(parseInt(voteToShow) + "%");
}


function renderOutsourcedQuote( chunk ) {
    $(".outsourceto").addClass("outsourced");
    $('.modal.outsource').removeClass('loading');
    $('.needitfaster,#changecurrency,#changeTimezone,.show_translator,.addrevision,.outsource.modal .continuebtn').addClass('hide');
    $('.outsource.modal .tprice').append('<a class="checkstatus standardbtn" href="'+chunk.link_to_status+'" target="_blank">View status</a>').removeClass('hide');
    $('.outsourced .heading').append('<span class="outsource_notify"><span class="icon-check"></span> Outsourced</span>');

    if (chunk.typeOfService == "premium") {
        $('.revision_heading').removeClass('hide');
    } else {
        $('.revision_heading').addClass('hide');
    }

    renderLocalizationInfos( chunk.price, chunk.delivery );
    $( 'span.zone2').html( $( '#changeTimezone option:selected').attr( "data-description-long" ) );
}


function renderLocalizationInfos( price, delivery, revision_price, revision_delivery ) {
    // if the customer has a timezone in the cookie, then use it
    // otherwise attemp to guess it from his browser infos
    var timezoneToShow = readCookie( "matecat_timezone" );
    if ( timezoneToShow == "" ) {
        timezoneToShow = -1 * ( new Date().getTimezoneOffset() / 60 );
    }

    // update the timezone (both the displayed and the stored ones)
    changeTimezone(delivery, -1 * ( new Date().getTimezoneOffset() / 60 ), timezoneToShow, "span.time");
    if( revision_delivery ) {
        changeTimezone(revision_delivery, -1 * ( new Date().getTimezoneOffset() / 60 ), timezoneToShow, "span.revision_delivery");
    }
    updateTimezonesDescriptions( timezoneToShow );
    $( "#changeTimezone option[value='" + timezoneToShow + "']").attr( "selected", "selected" );


    // if the customer has a currency in the cookie, then use it
    // otherwise use the default one
    var currToShow = readCookie( "matecat_currency" );
    if ( currToShow == "" ) {
        currToShow = "EUR";
    }

    // update the currency (both the displayed and the stored ones)
    changeCurrency( price, "EUR", currToShow, ".euro", ".displayprice", ".price_p_word");
    if( revision_price ) {
        changeCurrency(revision_price, "EUR", currToShow, ".revision_currency", ".revision_price", "");
    }

    $( "#changecurrency option[value='" + currToShow + "']").attr( "selected", "selected" );
}


function changeCurrency( amount, currencyFrom, currencyTo, elementToUpdateSymbol, elementToUpdateValue, elementToUpdatePPW ) {
    $('.tprice').removeClass('blink');
    APP.doRequest({
        data: {
            action: 'changeCurrency',
            amount: amount,
            currencyFrom: currencyFrom,
            currencyTo: currencyTo
        },
        success: function (d) {
            $('.tprice').addClass('blink');
            $( elementToUpdateValue ).attr( "data-rawprice", d.data );
            $( elementToUpdateValue ).attr( "data-currency", currencyTo );
            $( elementToUpdateSymbol ).attr( "data-currency", currencyTo );

            $( elementToUpdateSymbol ).text( $( "#changecurrency" ).find( "option[value='" + currencyTo + "']" ).attr( "data-symbol" ) );
            $( elementToUpdateValue ).text( parseFloat( d.data).toFixed( 2).replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,") );

            if( elementToUpdatePPW.length > 0 ) {
                var numWords = parseFloat($(".title-words").text().replace(",", ""));

                if(numWords == 0){
                    numWords = 1;
                }

                $(elementToUpdatePPW).text(( parseFloat(d.data) / numWords ).toFixed(3).replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,"));
            }

            $('.outsource.modal .continuebtn').removeClass('disabled');
            $('.modal.outsource').removeClass('loading');

            setCookie( "matecat_currency", currencyTo );
        }
    });
}


function changeTimezone( date, timezoneFrom, timezoneTo, elementToUpdate ){
    var dd = new Date( date.replace(/-/g, "/") );
    dd.setMinutes( dd.getMinutes() + (timezoneTo - timezoneFrom) * 60 );
    $( elementToUpdate ).text( $.format.date(dd, "d MMMM") + ' at ' + $.format.date(dd, "hh") + ":" + $.format.date(dd, "mm") + " " + $.format.date(dd, "a") );

    $( elementToUpdate ).attr("data-timezone", timezoneTo);
    $( elementToUpdate ).attr("data-rawtime", dd.toUTCString());

    setCookie( "matecat_timezone", timezoneTo );
}

function updateTimezonesDescriptions( selectedTimezone ) {
    $( "#changeTimezone" ).find( "option").each( function() {
        $( this ).text( $( this ).attr( "data-description-long" ) );
    });

    var selectedElement = $( "#changeTimezone" ).find( "option[value='" + selectedTimezone + "']");
    selectedElement.text( selectedElement.attr( "data-description-short" ) );
}


function readCookie( cookieName ) {
    cookieName += "=";
    var cookies = document.cookie.split(';');

    for ( var i = 0; i < cookies.length; i++ ) {
        var cookie = cookies[i].trim();

        if ( cookie.indexOf( cookieName ) == 0 )
            return cookie.substring( cookieName.length, cookie.length );
    }
    return "";
}


function setCookie( cookieName, cookieValue ) {
    var expiration = new Date();
    expiration.setYear( new Date().getFullYear() + 1);
    document.cookie = cookieName + "=" + cookieValue + "; expires=" + expiration.toUTCString() + "; path=/";
}


function updateCartParameters() {
    var linkPieces = $( "a.uploadbtn.in-popup").attr( "href").split( "/" );
    var jobData = linkPieces[ linkPieces.length - 1].split( "-" );

    APP.doRequest({
        data: {
            action: 'outsourceTo',
            pid: $('#pid').attr('data-pid'),
            ppassword: $("#pid").attr("data-pwd"),
            fixedDelivery: $( "#forceDeliveryChosenDate" ).text(),
            typeOfService: $( "input[name='revision']" ).is(":checked") ? "premium" : "professional",
            jobs: [
                {
                    jid: jobData[0],
                    jpassword: jobData[1]
                }
            ]
        },
        success: function () {}
    });

}


function resetOutsourcePopup( resetHard ) {
    $( ".outsourceto").attr( "class", "outsourceto" );
    $('.needitfaster').html('Need it faster?');
    $('.trustbox2').attr( "class", "trustbox2" );
    $('.trustbox1').attr( "class", "trustbox1" );
    $('.translator_bio').attr( "class", "translator_bio" );
    $('.translator_info_box').attr( "class", "translator_info_box" );
    $('.revision_delivery').attr( "class", "revision_delivery" );
    $('.revision_price_box').attr( "class", "revision_price_box" );
    $('.guaranteed_by.expanded').attr( "class", "guaranteed_by" );
    $('.tprice.compress').attr( "class", "tprice" );
    $( ".show_translator.more").attr( "class", "show_translator more" );
    $( ".hide_translator.more").attr( "class", "hide_translator more" );
    $('.popup-box.pricebox.compress').attr( "class", "popup-box pricebox" );
    $('.delivery').appendTo(".delivery_container").attr("class","delivery");
    $('.modal.outsource .continuebtn, .modal.outsource .contact_box,.paymentinfo,.outsource #changeTimezone,.outsource #changecurrency,.addrevision, .guaranteed_by .more, .delivery_details span.time, .delivery_label,.euro,.displayprice,.displaypriceperword, .delivery_details span.zone2, .needitfaster').removeClass('hide');
    $('.ErrorMsg,.modal.outsource .tooltip, .outsource_notify, .delivery_before_time, .checkstatus, #delivery_not_available, .trustbox2, .translator_info_box, .hide_translator.more').addClass('hide');

    if( resetHard )
        $('#forceDeliveryContainer').addClass("hide");
}