function OoyalaPlayerBlock(runtime, element) {

    // Setup the speed plugin
    OoyalaPlayerSpeedPlugin();

    OO.ready(function() {
        var content_id = $('.ooyalaplayer', element).data('content-id');
        var player_id = $('.ooyalaplayer', element).data('player-id');
        var transcript_id = $('.ooyalaplayer', element).data('transcript-id');

        // move the transcript widget into the right place in the DOM
        // after it is injected by the 3Play JS code
        $('#transcript_'+transcript_id).appendTo('.transcript-container');

        window[player_id] = OO.Player.create('ooyalaplayer', content_id, {
            /*onCreate: window.onCreate,*/
            autoplay: false,
            {% if self.enable_player_token %}
            embedToken : '{{ self.player_token }}'
            {% endif %}
        });

        var pop = Popcorn('.video');

        {{ overlay_fragments|safe }}

        pop.play();

        {% if self.transcript_project_id and self.transcript_file_id %}
        // HACK to get the transcript plugin loaded in Studio.
        setTimeout(function() {
            p3_window_loaded = true;
            run_p3();
        }, 2000);
        {% endif %}
    });
}
