function OoyalaPlayerBlock(runtime, element) {
    OO.ready(function() {

        var content_id = $('.ooyalaplayer', element).data('content-id');
        var player_id = $('.ooyalaplayer', element).data('player-id');
        var transcript_id = $('.ooyalaplayer', element).data('transcript-id');

        // move the transcript widget into the right place in the DOM
        // after it is injected by the 3Play JS code
        $('#transcript_'+transcript_id).appendTo('.transcript-container');

         window[player_id] = OO.Player.create('ooyalaplayer', content_id, {
           /*onCreate: window.onCreate,*/
           autoplay: false
         });

        var pop = Popcorn('.video');

       pop.footnote({
         start: 39,
         end: 45,
         text: "Thats <b>Sasha!!</b> one of our colleagues!",
         target: "ooyala-overlay"
       });

       pop.footnote({
         start: 4,
         end: 15,
         text: "<a href='http://www.edx.org'>Welcome</a> to <b>McKinsey Academys 7 STEP APPROACH!!</b>!",
         target: "ooyala-overlay"
       });

       pop.play();

    });

}
