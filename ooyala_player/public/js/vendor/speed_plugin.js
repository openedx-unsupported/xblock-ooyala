/***
Created: Sept 16th, 2013 by Brian Weeks
Description: Replaces the rewind button with a playbackRate button (i.e. 1x, 1.5x, 2x)
Notes: Works in Safari and Chrome.  Only loads when playbackRate method is available.  Only tested with one player instance on page.
***/
OO.plugin("SpeedModule", function (OO, _, $, W) {
    /*
     * OO, namespace for PlayerV3
     * _, a reference to underscore.js lib.
     * $, a reference to jQuery lib.
     * W, a reference to window object.
     */

    var PlugIn = {};
    /*$('head').append('<link rel="stylesheet" type="text/css" href="speedButton.css">');*/


    // A constructor for the module class
    PlugIn.SpeedModule = function (mb, id) {
        this.mb = mb; // save message bus reference for later use
        this.id = id;
        this.current_rate = 1;
        this.playerDivId;
        this.init();
    };

    // public functions of the module object
    PlugIn.SpeedModule.prototype = {
        init: function () {
            // subscribe to relevant player events
            this.mb.subscribe(OO.EVENTS.PLAYER_CREATED, 'speedModule', _.bind(this.onPlayerCreated, this));
        },

        onPlayerCreated: function (event, elementId, params) {
            // First parameter is the event name
            // Second parameter is the elementId of player container
            // Third parameter is the list of parameters which were passed into player upon creation.

            this.playerRoot = $("#" + elementId);
            this.playerDivId = elementId;
            this.rootElement = this.playerRoot.parent();


            var playbackRate = document.getElementById(elementId).getElementsByClassName("video")[0].playbackRate;
            if(typeof playbackRate !== "undefined" ){
                //$('#'+elementId).after("initial rate: "+playbackRate);

                $('#'+elementId+' .oo_rewind').remove();
                var speed_btn = '<div class="oo_button oo_toolbar_item speedButton">1x</div>';

                $(speed_btn).insertAfter("#"+elementId+" .oo_scrubber");

                this.speedButton = this.rootElement.find('.speedButton');
                this.speedButton.click(_.bind(this.onSpeed, this, elementId));
            }else{
                $('#'+elementId).after('<div id="not-supported">Sorry, this demo requires HTML5 and a browser that supports the playbackRate method</div>');
            }

        },

        onSpeed: function (elementId) {
            //Pause and play addresses an issue with iPads, where the rate can not be changed during playback.
            this.mb.publish(OO.EVENTS.PAUSE, 'speedModule');

            if(this.current_rate === 1){
                this.current_rate = 1.5;
                $("#"+this.playerDivId+" .speedButton").html("1.5x");
            }else if(this.current_rate === 1.5){
                this.current_rate = 2;
                $("#"+this.playerDivId+" .speedButton").html("2x");
            }else {
                this.current_rate = 1 ;
                $("#"+this.playerDivId+" .speedButton").html("1x");
            }

            this.speed(this.current_rate);

        },

        speed: function (rate) {
            document.getElementById(this.playerDivId).getElementsByClassName("video")[0].playbackRate=rate;
            this.mb.publish(OO.EVENTS.PLAY, 'speedModule');
        },

        __end_marker: true
    };

    // Return the constructor of the module class.
    return PlugIn.SpeedModule;
});
