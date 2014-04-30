function OoyalaPlayerBlock(runtime, element) {
    OO.ready(function() {
        var content_id = $('.ooyalaplayer', element).data('content-id');
        var player_id = $('.ooyalaplayer', element).data('player-id');
        var transcript_id = $('.ooyalaplayer', element).data('transcript-id');
        var dom_id = $('.ooyalaplayer', element).data('dom-id');
        var player_token = $('.ooyalaplayer', element).data('player-token');
        var transcript_enabled = $('.ooyalaplayer', element).data('transcript-enabled');
        var overlays = $('.ooyala-overlays .ooyala-overlay', element);

        // move the transcript widget into the right place in the DOM
        // after it is injected by the 3Play JS code
        $('#transcript_'+transcript_id).appendTo('.transcript-container-'+dom_id);

        var player_options = {
            /*onCreate: window.onCreate,*/
            autoplay: false
        };

        if (player_token) {
            player_options.embedToken = player_token;
        }

        var id = 'ooyala-player-'+ dom_id;
        if (!_.isUndefined(window[id])) {
            window[id].destroy();
        }

        window[id] = OO.Player.create(dom_id, content_id, player_options);

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

        if (transcript_enabled === 'True') {
            // The 3PlayMedia transcript plugin is made to load after the window "load" event. In
            // Studio, we load things differently, so we need something to initialize the plugin.
            // setup a simple interval to check if we can start the initialization.
            var interval_id = setInterval(function() {
                if (!_.isUndefined(run_p3)) {
                    p3_window_loaded = true;
                    run_p3();
                    clearInterval(interval_id);
                }
            }, 500);
        }
    });
}
