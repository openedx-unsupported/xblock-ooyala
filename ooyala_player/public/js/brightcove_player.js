function BrightcovePlayerXblock(runtime, element) {
    var Player = {
        init: function (player) {
            this.player = player;
            this.data = this.getPlayerData();
            this.subscribePlayerEvents();
            this.completionPublished = false;
        },
        getPlayerData: function () {
            return {
                videoId: $('.video-js', element).data('video-id'),
                playerId: $('.video-js', element).attr('id'),
                completePercentage: $('.video-js', element).data('complete-percentage')
            }
        },
        subscribePlayerEvents: function(){
            this.player.on('timeupdate', this.eventHandlers.timeupdate.bind(this));
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
            }
        }
    };

    var playerID = $('.video-js', element).attr('id');
    videojs.getPlayer(playerID).ready(function () {
        Player.init(this);
    });
}
