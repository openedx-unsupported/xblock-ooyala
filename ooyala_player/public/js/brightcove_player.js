function BrightcovePlayerXblock(runtime, element) {
    var Player = {
        init: function (player) {
            this.player = player;
            this.data = this.getPlayerData();
            this.completionPublished = false;
            this.transcriptLang = this.data.ccLang;
            this.ccLang = null;

            this.subscribePlayerEvents();

            if(this.data.autoplay === "True")
                this.player.play();
        },
        getPlayerData: function () {
            return {
                videoId: $('.video-js', element).data('video-id'),
                playerId: $('.video-js', element).attr('id'),
                completePercentage: toFloat($('.video-js', element).data('complete-percentage')),
                autoplay: $('.video-js', element).data('autoplay'),
                ccLang: $('.video-js', element).data('cc-lang')
            }
        },
        subscribePlayerEvents: function(){
            this.player.on('timeupdate', this.eventHandlers.timeupdate.bind(this));
            this.player.on('loadedmetadata', this.eventHandlers.metadataloaded.bind(this));
            $('.print-transcript-btn', element).on('click', this.eventHandlers.printTranscript.bind(this));
            $('.transcript-download-btn', element).on('click', this.eventHandlers.downloadTranscript.bind(this));
            $('.p3sdk-interactive-transcript-collapse-visible', element).on('click', this.eventHandlers.toggleTranscript.bind(this));
            $('.transcript-track', element).on('click', this.eventHandlers.getTranscript.bind(this));
            $(element).on('Transcript:changed', this.eventHandlers.transcriptChanged.bind(this));
        },
        eventHandlers: {
            metadataloaded: function(){
                this.showTranscript();
                this.player.on('texttrackchange', this.eventHandlers.ccChanged.bind(this));
            },
            timeupdate: function (evt, payload) {
                var currentTime = evt.target.player.currentTime();
                var duration = evt.target.player.duration();

                if (this.completionPublished === false && (currentTime / duration) >= this.data.completePercentage){
                    $.ajax({
                        type: 'POST',
                        url: runtime.handlerUrl(element, 'publish_completion'),
                        data: JSON.stringify({
                            completion: 1.0
                        }),
                        error: function () {
                            console.log('Completion progress not saved.')
                        }
                    });
                    this.completionPublished = true;
                }
            },
            toggleTranscript: function (evt) {
                $('.collapsable', element).toggle();
                var collapsed = $('.collapsable', element).data('collapsed');
                var btn = $(evt.currentTarget).children('a');

                if(collapsed == true){
                    btn.html(btn.attr('label_when_expanded'));
                    $('.collapsable', element).data('collapsed', false);
                }else{
                    btn.html(btn.attr('label_when_collapsed'));
                    $('.collapsable', element).data('collapsed', true);
                }
            },
            ccChanged: function (evt) {
                this.ccLang = currentCCLang(this.player.textTracks());

                // Update stored language preference
                if (this.ccLang != this.data.ccLang) {
                    var updateUrl = runtime.handlerUrl(element, 'store_language_preference');

                    // user has turned off CC
                    if(this.ccLang === undefined){
                        this.ccLang = 'off';
                    }

                    $.ajax({
                        type: "POST",
                        data: JSON.stringify({'lang': this.ccLang}),
                        url: updateUrl,
                        context: this,
                        success: function (data) {
                            this.data.ccLang = this.ccLang;
                        }
                    });
                }

                if (!this.ccAndTranscriptMatch()){
                    var langElement = $('.transcript-track', element).filter(
                        '[data-lang-code=' + this.ccLang + '], [data-lang-name=' + this.ccLang + ']'
                    );

                    if(langElement.length == 0){
                      // try a 2 letter scheme for match
                      var ccLang = this.ccLang.substr(0, 2);
                      $('.transcript-track', element).each(function(){
                         var transcriptLang = $(this).data('lang-code').substr(0,2);
                         if(transcriptLang == ccLang){
                           langElement = $(this);
                         }
                      });
                    }

                    langElement.trigger('click');
                }
            },
            printTranscript: function () {
                var w = window.open();
                var content = $('.transcript-content', element);
                w.document.write(content.html());
                w.document.close();
                w.focus();
                w.print();
                setTimeout(function(){w.close();}, 100)
            },
            downloadTranscript: function () {
                var currentSelected = $('.transcript-track.selected', element);
                var downloadUrl = currentSelected.attr('remote-src');
                var lang = currentSelected.attr('data-lang-code');

                if(currentSelected.hasClass('imported-transcript'))
                    return download('transcript-' + lang, $('.transcript-content', element).text());

                // download transcript in pdf format
                downloadUrl = downloadUrl.replace('.html', '.pdf');
                location.href = downloadUrl + '?dl=1';
            },
            getTranscript: function (evt) {
                var langElement = $(evt.currentTarget);
                var currentSelected = $('.transcript-track.selected', element);

                if(currentSelected.length)
                    currentSelected.removeClass('selected');

                langElement.addClass('selected');

                var threeplayId = langElement.data('3play-id');
                var transcriptUrl = runtime.handlerUrl(element, 'load_transcript');

                $.ajax({
                    type: "POST",
                    data: JSON.stringify({'threeplay_id': threeplayId, 'video_id': this.data.videoId}),
                    url: transcriptUrl,
                    context: this,
                    success: function (data) {
                        var transcript = data.content;
                        if(transcript){
                            this.transcriptLang = langElement.data('lang-code');
                            $('.transcript-content', element).html(transcript);
                            setTranscriptDirection();
                            // trigger transcript change event
                            $(element).trigger('Transcript:changed');
                        }
                    }
                });
            },
            transcriptChanged: function(){
                if(this.ccAndTranscriptMatch() || this.data.ccLang == 'off')
                    return;

                // change CC accordingly
                var tracks = this.player.textTracks();
                var trackFound = false;

                for (var i = 0; i < (tracks.length); i++) {
                    var trackLang = tracks[i].language;
                    if (trackLang) {
                        if (trackLang === this.transcriptLang) {
                            tracks[i].mode = "showing";
                            this.ccLang = this.transcriptLang;
                            trackFound = true;
                        }else {
                            tracks[i].mode = "disabled";
                        }
                    }
                }

                // if user selected cc doesn't exist, try using 2 letter codes
                // ignoring dialetcs
                if(trackFound === false){
                    var transcriptLang = this.transcriptLang.substr(0, 2);
                    for (var i = 0; i < (tracks.length); i++) {
                        var trackLang = tracks[i].language.substr(0, 2);
                        if (trackLang === transcriptLang) {
                            tracks[i].mode = "showing";
                            this.ccLang = this.transcriptLang;
                            trackFound = true;
                        }else {
                            tracks[i].mode = "disabled";
                        }
                    }
                }

                // if user selected cc doesn't exist, select the first available
                if(trackFound === false){
                    for (var i = 0; i < (tracks.length); i++) {
                        var trackLang = tracks[i].language;
                        if (trackLang) {
                            tracks[i].mode = "showing";
                            this.ccLang = this.transcriptLang;
                            break;
                        }
                    }
                }
            }
        },
        ccAndTranscriptMatch: function(){
          if(this.ccLang)
            return this.ccLang.substr(0,2) == this.transcriptLang.substr(0,2);

          return false;
        },
        showTranscript: function() {
            var currentSelected = $('.transcript-track.selected', element);

            // if user's saved lang exists select it
            // otherwise select first lang from available languages
            if(currentSelected.length){
                currentSelected.trigger('click');
            }else{
                var transcripts = $('.transcript-track', element);

                // give a try to 2 letter scheme
                var userLang = this.transcriptLang.substr(0, 2);
                transcripts.each(function(){
                   var transcriptLang = $(this).data('lang-code').substr(0, 2);
                   if(transcriptLang == userLang){
                     currentSelected = $(this);
                   }
                });

                if(currentSelected.length){
                  currentSelected.trigger('click');
                  return;
                }

                // select first language
                if(transcripts.length) {
                    currentSelected = $(transcripts[0]);
                    currentSelected.trigger('click');
                }else{
                    // trigger transcript change event
                    $(element).trigger('Transcript:changed');
                }
            }
        }
    };

    function setTranscriptDirection() {
        var currentSelected = $('.transcript-track.selected', element);
        var langDir = currentSelected.data('lang-dir');
        var dir = langDir == 'rtl' ? 'right' : 'left';

        $('.transcript-content > p', element).css('textAlign', dir);
    }

    function toFloat(str){
        // converts localized decimals back to . notations
        if($.type(str) === "string")
            return parseFloat(str.replace(/,(\d+)$/,'.$1'));
        return str;
    }

    function download(filename, text) {
        var element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
        element.setAttribute('download', filename);

        element.style.display = 'none';
        document.body.appendChild(element);

        element.click();
        document.body.removeChild(element);
    }

    function currentCCLang(tracks){
        for (var i = 0; i < (tracks.length); i++) {
            if(tracks[i].mode === "showing")
                return tracks[i].language;
        }
    }

    var playerID = $('.video-js', element).attr('id');
    videojs.getPlayer(playerID).ready(function () {
        Player.init(this);
    });
}
