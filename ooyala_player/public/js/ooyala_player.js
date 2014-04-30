function OoyalaPlayerBlock{{ location_name }}(runtime, element) {
    OO.ready(function() {
        var content_id = $('.ooyalaplayer', element).data('content-id');
        var player_id = $('.ooyalaplayer', element).data('player-id');
        var transcript_id = $('.ooyalaplayer', element).data('transcript-id');

        // move the transcript widget into the right place in the DOM
        // after it is injected by the 3Play JS code
        $('#transcript_'+transcript_id).appendTo('.transcript-container');

        window[player_id] = OO.Player.create('{{dom_id}}', content_id, {
            /*onCreate: window.onCreate,*/
            autoplay: false,
            {% if self.enable_player_token %}
            embedToken : '{{ self.player_token }}'
            {% endif %}
        });

        var pop = Popcorn('.video');

        {{ overlay_fragments|safe }}

        pop.play();

        {% if self.transcript_enabled %}
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
        {% endif %}
    });
}
