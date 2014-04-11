function OoyalaPlayerBlock(runtime, element) {
    OO.ready(function() {
        var content_id = $('.ooyalaplayer', element).data('content-id');
        var player_id = $('.ooyalaplayer', element).data('player-id');

         window[player_id] = OO.Player.create('ooyalaplayer', content_id, {
           /*onCreate: window.onCreate,*/
           autoplay: false
         });
    });

    var script = document.createElement( 'script' );
    script.type = 'text/javascript';
    script.src = '//static.3playmedia.com/p/projects/12901/files/375889/embed.js?plugin=transcript&settings=width:640,height:240,skin:frost,can_collapse:true,collapse_onload:true,can_print:true,can_download:true,scan_view:true&player_type=ooyala&player_id=635104fd644c4170ae227af2de27deab';

    $('.metadata', element).append(script);
}
