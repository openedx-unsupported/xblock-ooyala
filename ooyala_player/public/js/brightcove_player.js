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
                completePercentage: $('.video-js', element).data('complete-percentage'),
                autoplay: $('.video-js', element).data('autoplay'),
                ccLang: $('.video-js', element).data('cc-lang')
            }
        },
        subscribePlayerEvents: function(){
            this.player.on('timeupdate', this.eventHandlers.timeupdate.bind(this));
            this.player.on('texttrackchange', this.eventHandlers.ccChanged.bind(this));
            this.player.on('loadedmetadata', this.showTranscript.bind(this));
            $('.print-transcript-btn', element).on('click', this.eventHandlers.printTranscript.bind(this));
            $('.transcript-download-btn', element).on('click', this.eventHandlers.downloadTranscript.bind(this));
            $('.transcript-track', element).on('click', this.eventHandlers.getTranscript.bind(this));
            $(element).on('Transcript:changed', this.eventHandlers.transcriptChanged.bind(this));
        },
        eventHandlers: {
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
            ccChanged: function (evt) {
                this.ccLang = currentCCLang(this.player.textTracks());
                
                // Update stored language preference
                if (this.ccLang != this.data.ccLang) {
                    var updateUrl = runtime.handlerUrl(element, 'store_language_preference');

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

                if (this.transcriptLang != this.ccLang){
                    var langElement = $('.transcript-track', element).filter(
                        '[data-lang-code=' + this.ccLang + '], [data-lang-name=' + this.ccLang + ']'
                    );

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
                w.close();
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

                this.transcriptLang = langElement.data('lang-code');

                 // trigger transcript change event
                $(element).trigger('Transcript:changed');

                if(langElement.hasClass('imported-transcript')){
                    // need to load transcript ourselves
                    var threeplayId = langElement.data('3play-id');
                    var trascriptId = langElement.data('transcript-id');
                    var transcriptUrl = runtime.handlerUrl(element, 'load_transcript');

                    $.ajax({
                        type: "POST",
                        data: JSON.stringify({'threeplay_id': threeplayId, 'transcript_id': trascriptId}),
                        url: transcriptUrl,
                        context: this,
                        success: function (data) {
                            var transcript = data.content;
                            if(transcript){
                                var p3Instance = p3sdk.get(this.data.playerId);

                                if(p3Instance && p3Instance.interactive_transcripts)
                                    p3Instance.interactive_transcripts[0].set_transcript(transcript);
                            }
                        }
                    });
                }
            },
            transcriptChanged: function(){
                if(this.ccLang == this.transcriptLang)
                    return;

                // change CC accordingly
                var tracks = this.player.textTracks();
                var trackFound = false;

                for (var i = 0; i < (tracks.length); i++) {
                    var trackLang = tracks[i].language.substr(0, 2);
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

                // if user selected cc dosn't exist, select the first available
                if(trackFound === false){
                    if(tracks.length){
                        tracks[0].mode = "showing";
                        this.ccLang = this.transcriptLang;
                    }
                }
            }
        },
        showTranscript: function() {
            // transcript direction control
            var p3Instance = p3sdk.get(this.data.playerId);
            if(p3Instance){
                p3$(p3Instance).bind("transcript:track_loaded", function (name, atts){
                    setTranscriptDirection();
                });
            }

            $('.p3sdk-container', element).toggleClass('hide');
            var currentSelected = $('.transcript-track.selected', element);
            
            // if user's saved lang exists select it
            // otherwise select first lang from available languages
            if(currentSelected.length){
                currentSelected.trigger('click');
            }else{
                var transcripts = $('.transcript-track', element);
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
