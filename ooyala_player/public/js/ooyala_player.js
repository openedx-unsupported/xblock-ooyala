function OoyalaPlayerBlock(runtime, element) {
    var Player = {
        init: function(){
            this.data = this.getPlayerData();
            this.identifier = 'ooyala-player-'+ this.data.domId;
            this.playbackSpeed = 1;
            this.ccLang = 'en'; //ToDo: make it dynamic

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

            window[this.identifier] = this.player = OO.Player
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
                configUrl: $('.ooyalaplayer', element).data('config-url')
            }
        },
        cleanUp: function(){
            if (window[this.identifier]){
                window[this.identifier].destroy();
            }
        },
        subscribePlayerEvents: function(){
            this.player.mb.subscribe(OO.EVENTS.PLAYBACK_READY, 'eventLogger', this.eventHandlers.playbackReady.bind(this));
            this.player.mb.subscribe(OO.EVENTS.PLAYED, 'eventLogger', this.eventHandlers.played.bind(this));
            this.player.mb.subscribe(OO.EVENTS.PAUSED, 'eventLogger', this.eventHandlers.paused.bind(this));
            this.player.mb.subscribe(OO.EVENTS.WILL_PLAY_FROM_BEGINNING, 'eventLogger', this.eventHandlers.startedFromBeginning.bind(this));
            this.player.mb.subscribe(OO.EVENTS.SEEK, 'eventLogger', this.eventHandlers.seek.bind(this));
            this.player.mb.subscribe(OO.EVENTS.FULLSCREEN_CHANGED, 'eventLogger', this.eventHandlers.fullScreenChanged.bind(this));
            this.player.mb.subscribe(OO.EVENTS.SAVE_PLAYER_SETTINGS, 'eventLogger', this.eventHandlers.playerSettingsSaved.bind(this));
            this.player.mb.subscribe(OO.EVENTS.SET_CLOSED_CAPTIONS_LANGUAGE, 'eventLogger', this.eventHandlers.closedCaptionsLangChanged.bind(this));
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
            closedCaptionsLangChanged: function (ev, payload) {
                log('now:' + payload);
                log('ccLang:' + this.ccLang);
            },
            playerSettingsSaved: function (ev, payload) {
                log('saved:' + payload.closedCaptionOptions.language);

                this.ccLang = payload.closedCaptionOptions.language;

                var ccLang = this.ccLang;
                var currentSelected = $('.p3sdk-interactive-transcript-track.selected', element);

                if(currentSelected.length){
                    var langCode = currentSelected.data('lang-code');
                    var langName = currentSelected.data('lang-name');

                    // change transcript language if it's different from CC language
                    if(ccLang != langCode && ccLang != langName){
                        currentSelected.removeClass('selected');

                        var langElement = $('.p3sdk-interactive-transcript-track').filter(
                            '[data-lang-code=' + ccLang + '], [data-lang-name=' + ccLang + ']'
                        );

                        langElement.addClass('selected');
                        langElement.trigger('click');
                    }
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
      p3$(p3sdk.get(0)).bind("transcript:track_selected", function(name, atts){
          $('.p3sdk-interactive-transcript-track.selected', element).removeClass('selected');
          $(atts.target_element).addClass('selected');

          var newLang = $(atts.target_element).data('lang-code');

          newLang = newLang == 'ar'? 'Arabic': newLang;

          // if CC language is different from transcript language
          if(playerObj.ccLang != newLang){
              log('setting: ' + newLang);
              if(window['changeCCLanguage']){
                  window.changeCCLanguage(newLang);
              }
          }
      });
    }

    OO.ready(function () {
        Player.init();
        p3sdk_ready(Player);
    });
}
