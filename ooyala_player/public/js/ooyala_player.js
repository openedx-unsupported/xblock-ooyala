function OoyalaPlayerBlock(runtime, element) {
    OO.ready(function() {
        var content_id = $('.ooyalaplayer', element).data('content-id');
        var player_id = $('.ooyalaplayer', element).data('player-id');
        var transcript_id = $('.ooyalaplayer', element).data('transcript-id');
        var transcript_enabled = $('.ooyalaplayer', element).data('transcript-enabled');
        var dom_id = $('.ooyalaplayer', element).data('dom-id');
        var player_token = $('.ooyalaplayer', element).data('player-token');
        var overlays = $('.ooyala-overlays .ooyala-overlay', element);

        var player_options = {autoplay: true};

        if (player_token) {
            player_options.embedToken = player_token;
        }

        var id = 'ooyala-player-'+ dom_id;
        if (!_.isUndefined(window[id])) {
            window[id].destroy();
        }

        function publish_event(data) {
            $.ajax({
                type: "POST",
                url: runtime.handlerUrl(element, 'publish_event'),
                data: JSON.stringify(data)
            });
        }

        function publish_open_close_event(event_type) {
            publish_event({
                event_type: event_type,
                time: player.getPlayheadTime(),
                player_state: player.getState()
            });
        }

        function publish_play_pause_event(event_type) {
            publish_event({
                event_type: event_type,
                time: player.getPlayheadTime(),
                playback_rate: video_node.playbackRate
            });
        }

        /* we have to initialize the window[player_id], internal OO requirement? */
        var player = window[id] = window[player_id] = OO.Player.create(dom_id, content_id, player_options);
        var video_node = $('.ooyalaplayer', element).find('video.video')[0];

        player.mb.subscribe(OO.EVENTS.PLAYBACK_READY, 'eventLogger', function(ev, payload) {
            publish_event({event_type: 'xblock.ooyala.player.loaded'});
        });

        player.mb.subscribe(OO.EVENTS.PLAYED, 'eventLogger', function(ev, payload) {
            publish_event({event_type: 'xblock.ooyala.player.ended'});
        });

        player.mb.subscribe(OO.EVENTS.PLAYING, 'eventLogger', function(ev, payload) {
            publish_play_pause_event('xblock.ooyala.player.playing');
        });

        player.mb.subscribe(OO.EVENTS.PAUSED, 'eventLogger', function(ev, payload) {
            publish_play_pause_event('xblock.ooyala.player.paused');
        });

        player.mb.subscribe(OO.EVENTS.WILL_PLAY_FROM_BEGINNING, 'eventLogger', function(ev, payload) {
            publish_event({
                event_type: 'xblock.ooyala.player.started-from-beginning',
                is_autoplay: player_options.autoplay,
                playback_rate: video_node.playbackRate
            });
        });

        player.mb.subscribe(OO.EVENTS.SEEK, 'eventLogger', function(ev, payload) {
            publish_event({
                event_type: 'xblock.ooyala.player.jumped-to',
                old_time: player.getPlayheadTime(),
                new_time: payload
            });
        });

        player.mb.subscribe(OO.EVENTS.FULLSCREEN_CHANGED, 'eventLogger', function(ev, payload) {
            if (payload) {
                publish_open_close_event('xblock.ooyala.player.full-screen.opened');
            } else {
                publish_open_close_event('xblock.ooyala.player.full-screen.closed');
            };

        });

        var old_rate = 1;
        video_node.onratechange = function() {
            publish_event({
                event_type: 'xblock.ooyala.player.speed-changed',
                time: player.getPlayheadTime(),
                player_state: player.getState(),
                old_rate: old_rate,
                new_rate: video_node.playbackRate
            });
            old_rate = video_node.playbackRate;
        };

        var pop = Popcorn('#' + dom_id + ' .video');

        overlays.each(function(i, overlay) {
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

        pop.play();

        var container = $(".transcript-container-"+dom_id);
        var toggle_buttons = container.find(".show-hide-transcript-btn");
        var print_buttons = container.find(".print-transcript-btn");
        var content = container.find(".transcript-content");
        var footer = container.find(".transcript-footer");

        toggle_buttons.click(function() {
            if (content.is(":visible")) {
                toggle_buttons.html("Show transcript");
                publish_open_close_event('xblock.ooyala.transcript.closed')
            } else {
                toggle_buttons.html("Hide transcript");
                publish_open_close_event('xblock.ooyala.transcript.opened')
            }
            content.toggle("fast");
            footer.toggle("fast");
        });

        print_buttons.click(function () {
            w = window.open();
            w.document.write(content.html());
            w.print();
            w.close();
        });
    });
}
