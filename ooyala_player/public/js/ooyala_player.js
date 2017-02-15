function OoyalaPlayerBlock(runtime, element) {
    var Player = {
        init: function(){
            this.data = this.getPlayerData();
            this.identifier = 'ooyala-player-'+ this.data.domId;
            this.playbackSpeed = 1;
            this.ccLang = this.data.ccLang;
            this.transcriptLang = null;
            this.disableCC = this.data.ccDisabled == 'True';

            this.cleanUp();
            this.createPlayer();
            this.subscribePlayerEvents();
        },
        createPlayer: function(){
            var playerParam = {
                "pcode": this.data.pcode,
                "playerBrandingId": this.data.playerId,
                "autoplay": (this.data.autoplay === "True"),
                "skin": {
                    "config": this.data.configUrl
                }
            };

            window[this.identifier] = this.player = OOV4.Player
                .create(this.data.domId, this.data.contentId, playerParam);
        },
        getPlayerData: function (){
            return {
                contentId: $('.ooyalaplayer', element).data('content-id'),
                pcode: $('.ooyalaplayer', element).data('pcode'),
                playerId: $('.ooyalaplayer', element).data('player-id'),
                transcriptId: $('.ooyalaplayer', element).data('transcript-id'),
                transcriptEnabled: $('.ooyalaplayer', element).data('transcript-enabled'),
                domId: $('.ooyalaplayer', element).data('dom-id'),
                playerToken: $('.ooyalaplayer', element).data('player-token'),
                autoplay: $('.ooyalaplayer', element).data('autoplay'),
                overlays: $('.ooyala-overlays .ooyala-overlay', element),
                configUrl: $('.ooyalaplayer', element).data('config-url'),
                ccLang: $('.ooyalaplayer', element).data('cc-lang'),
                ccDisabled: $('.ooyalaplayer', element).data('cc-disabled')
            }
        },
        cleanUp: function(){
            if (window[this.identifier]){
                window[this.identifier].destroy();
            }
            
            // ToDo: (APROS Specific) Remove after fixing APROS JS
            $('#course-lessons').off('mouseup');
        },
        subscribePlayerEvents: function(){
            this.player.mb.subscribe(OOV4.EVENTS.PLAYBACK_READY, 'eventLogger', this.eventHandlers.playbackReady.bind(this));
            this.player.mb.subscribe(OOV4.EVENTS.PLAYED, 'eventLogger', this.eventHandlers.played.bind(this));
            this.player.mb.subscribe(OOV4.EVENTS.PAUSED, 'eventLogger', this.eventHandlers.paused.bind(this));
            this.player.mb.subscribe(OOV4.EVENTS.WILL_PLAY_FROM_BEGINNING, 'eventLogger', this.eventHandlers.startedFromBeginning.bind(this));
            this.player.mb.subscribe(OOV4.EVENTS.SEEK, 'eventLogger', this.eventHandlers.seek.bind(this));
            this.player.mb.subscribe(OOV4.EVENTS.FULLSCREEN_CHANGED, 'eventLogger', this.eventHandlers.fullScreenChanged.bind(this));
            this.player.mb.subscribe(OOV4.EVENTS.SAVE_PLAYER_SETTINGS, 'eventLogger', this.eventHandlers.playerSettingsSaved.bind(this));
            $('.print-transcript-btn', element).on('click', this.eventHandlers.printTranscript.bind(this));
            $('.transcript-download-btn', element).on('click', this.eventHandlers.downloadTranscript.bind(this));
            $('.transcript-track', element).on('click', this.eventHandlers.getTranscript.bind(this));
            $(element).on('CC:changed', this.eventHandlers.CcChanged.bind(this));
            $(element).on('Transcript:changed', this.eventHandlers.TranscriptChanged.bind(this));
        },
        eventHandlers: {
            playbackReady: function(ev, payload){
                publishEvent({event_type: 'xblock.ooyala.player.loaded'});

                // operations which needs <video> element are also placed here
                this.applyOverlays();
                if(isHtml5Video()){
                    var videoElement = getVideoNode();
                    videoElement.addEventListener("ratechange", this.eventHandlers.speedChanged.bind(this))
                }

                // Hide CC button
                if(this.disableCC){
                    // This event will be captured by the hide-CC functionality
                    // implemented in Skin code
                    this.player.mb.publish('CcHide');
                }

                // transcript direction control
                var p3Instance = p3sdk.get(this.identifier);
                if(p3Instance){
                    p3$(p3Instance).bind("transcript:track_loaded", function (name, atts){
                        setTranscriptDirection();
                    });
                }

                // Set CC & Transcript to user language preference
                var selected = $('.transcript-track.selected', element);
                // if user's saved lang exists select it
                // otherwise select first lang from available languages
                if(selected.length){
                    this.player.mb.publish('CcLanguageChanged', this.ccLang);
                }else{
                    var transcripts = $('.transcript-track', element);
                    if(transcripts.length) {
                        selected = $(transcripts[0]);
                        var lang = selected.data('lang-code');
                        this.player.mb.publish('CcLanguageChanged', lang);
                    }
                }

                // show transcript container
                $('.p3sdk-container', element).toggleClass('hide');
            },
            played: function(ev, payload){
                publishEvent({event_type: 'xblock.ooyala.player.ended'});
            },
            playing: function(ev, payload){
                publishEvent({
                    event_type: 'xblock.ooyala.player.playing',
                    time: this.player.getPlayheadTime(),
                    playback_rate: getPlaybackRate()
                });
            },
            paused: function(ev, payload){
                publishEvent({
                    event_type: 'xblock.ooyala.player.paused',
                    time: this.player.getPlayheadTime(),
                    playback_rate: getPlaybackRate()
                });
            },
            startedFromBeginning: function(ev, payload){
                 publishEvent({
                    event_type: 'xblock.ooyala.player.started-from-beginning',
                    is_autoplay: this.data.autoplay,
                    playback_rate: getPlaybackRate()
                });
            },
            seek: function(ev, payload){
                publishEvent({
                    event_type: 'xblock.ooyala.player.jumped-to',
                    old_time: this.player.getPlayheadTime(),
                    new_time: payload
                });
            },
            fullScreenChanged: function(ev, payload){
                var eventType;
                $('.ooyala-player-container', element).css('z-index', payload ? "999999" : "");

                if (payload) {
                    eventType = 'xblock.ooyala.player.full-screen.opened';
                }else {
                    eventType = 'xblock.ooyala.player.full-screen.closed';
                }
                publishEvent({
                    event_type: eventType,
                    time: this.player.getPlayheadTime(),
                    player_state: this.player.getState()
                });
            },
            speedChanged: function(){
                var newRate = getPlaybackRate();
                if (this.playbackSpeed === newRate){
                    return;
                }
                publishEvent({
                    event_type: 'xblock.ooyala.player.speed-changed',
                    time: this.player.getPlayheadTime(),
                    player_state: this.player.getState(),
                    old_rate: this.playbackSpeed,
                    new_rate: newRate
                });
                this.playbackRate = newRate;
            },
            CcChanged: function(){
                if(this.transcriptLang == this.ccLang)
                    return;

                var currentSelected = $('.transcript-track.selected', element);

                if(currentSelected.length)
                    currentSelected.removeClass('selected');

                var langElement = $('.transcript-track', element).filter(
                    '[data-lang-code=' + this.ccLang + '], [data-lang-name=' + this.ccLang + ']'
                );

                langElement.addClass('selected');
                langElement.trigger('click');
            },
            TranscriptChanged: function(){
                if(this.ccLang == this.transcriptLang)
                    return;
                
                this.player.mb.publish('CcLanguageChanged', this.transcriptLang);
            },
            playerSettingsSaved: function (ev, payload) {
                this.ccLang = payload.closedCaptionOptions.language;

                $(element).trigger('CC:changed');

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
                    var transcriptUrl = runtime.handlerUrl(element, 'load_transcript');

                    $.ajax({
                        type: "POST",
                        data: JSON.stringify({'threeplay_id': threeplayId}),
                        url: transcriptUrl,
                        context: this,
                        success: function (data) {
                            var transcript = data.content;
                            if(transcript){
                                var p3Instance = p3sdk.get(this.identifier);

                                if(p3Instance && p3Instance.interactive_transcripts)
                                    p3Instance.interactive_transcripts[0].set_transcript(transcript);
                            }
                        }
                    });
                }
            }
        },
        applyOverlays: function(){
            var pop = Popcorn('#' + this.data.domId + ' .video');

            this.data.overlays.each(function(i, overlay) {
                var start = $(overlay).data('start');
                var end = $(overlay).data('end');
                var text = $(overlay).data('text');
                var target = $(overlay).data('target');

                pop.footnote({
                    start: start,
                    end: end,
                    text: text,
                    target: target
                });
            });
        }
    };

    function setTranscriptDirection() {
        var currentSelected = $('.transcript-track.selected', element);
        var langDir = currentSelected.data('lang-dir');
        var dir = langDir == 'rtl' ? 'right' : 'left';

        $('.transcript-content > p', element).css('textAlign', dir);
    }

    function log(msg){
        console.log(msg);
    }

    function getVideoNode(){
        return $('.ooyalaplayer', element).find('video.video')[0];
    }

    function isHtml5Video(){
        return Boolean(getVideoNode);
    }

    function getPlaybackRate(){
        if (isHtml5Video()) {
            return getVideoNode().playbackRate;
        }
        return null;
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

    function publishEvent(data){
        $.ajax({
            type: "POST",
            url: runtime.handlerUrl(element, 'publish_event'),
            data: JSON.stringify(data)
        });
    }

    function isIE9() {
        return !!window.navigator.userAgent.match(/MSIE 9.0/);
    }
    
    if(isIE9()){
        // fallback to Player V3 for IE9
        $('.ooyala-player-container').css({width: 'auto', height: '428px'});
        OO.ready(function () {
            var playerData = Player.getPlayerData();
            var identifier = 'ooyala-player-'+ playerData.domId;
            window[identifier] = OO.Player.create(playerData.domId, playerData.contentId, {
                autoplay: playerData.autoplay
            });
        });
    }else{
        OOV4.ready(function () {
            Player.init();
        });
    }
}
