function OoyalaPlayerBlock(runtime, element) {
    var Player = {
        init: function(){
            this.data = this.getPlayerData();
            this.identifier = 'ooyala-player-'+ this.data.domId;
            this.playbackSpeed = 1;
            this.ccLang = this.data.ccLang;

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
                ccLang: $('.ooyalaplayer', element).data('cc-lang')
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

                // subscribe to p3sdk events
                p3sdk_ready(this);

                // Set CC and transcript to user language preference
                if(window['changeCCLanguage_' + this.data.domId]){
                  window['changeCCLanguage_' + this.data.domId](this.ccLang);
                  var currentSelected = $('.p3sdk-interactive-transcript-track.selected', element);
                  currentSelected.trigger('click');
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
            playerSettingsSaved: function (ev, payload) {
                this.ccLang = payload.closedCaptionOptions.language;

                var ccLang = this.ccLang;
                var currentSelected = $('.p3sdk-interactive-transcript-track.selected', element);

                if(currentSelected.length){
                    var langCode = currentSelected.data('lang-code');
                    var langName = currentSelected.data('lang-name');

                    // change transcript language if it's different from CC language
                    if(ccLang != langCode && ccLang != langName){
                        currentSelected.removeClass('selected');

                        var langElement = $('.p3sdk-interactive-transcript-track', element).filter(
                            '[data-lang-code=' + ccLang + '], [data-lang-name=' + ccLang + ']'
                        );

                        langElement.addClass('selected');
                        langElement.trigger('click');
                    }
                }

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
                var currentSelected = $('.p3sdk-interactive-transcript-track.selected', element);
                var downloadUrl = currentSelected.attr('remote-src');
                var lang = currentSelected.attr('data-lang-code');

                // Only English language is supported in PDF format by 3play
                // for other languages, use .txt format
                if(lang == 'en'){
                    downloadUrl = downloadUrl.replace('.html', '.pdf');
                }else{
                    downloadUrl = downloadUrl.replace('.html', '.txt');
                }

                location.href = downloadUrl + '?dl=1';
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

    function publishEvent(data){
        $.ajax({
            type: "POST",
            url: runtime.handlerUrl(element, 'publish_event'),
            data: JSON.stringify(data)
        });
    }

    function p3sdk_ready(playerObj){
        // Get current instance of p3sdk
        var p3instance = p3sdk.get(playerObj.identifier);

        p3$(p3instance).bind("transcript:track_selected", function(name, atts){
          $('.p3sdk-interactive-transcript-track.selected', element).removeClass('selected');
          $(atts.target_element).addClass('selected');

          var newLang = $(atts.target_element).data('lang-code');

          // "Arabic" is code for Arabic language in Ooyala Player
          newLang = newLang == 'ar'? 'Arabic': newLang;

          // if CC language is different from transcript language
          if(playerObj.ccLang != newLang){
              if(window['changeCCLanguage_' + playerObj.data.domId]){
                  window['changeCCLanguage_' + playerObj.data.domId](newLang);
              }
          }
        });
    }

    OOV4.ready(function () {
        Player.init();
    });
}
