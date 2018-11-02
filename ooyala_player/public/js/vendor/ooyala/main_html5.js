(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
if (!OOV4) {
  OOV4 = {};
}

},{}],2:[function(require,module,exports){
require("./InitOOUnderscore.js");

var hazmatConfig = {}; // 'debugHazmat' flag needs to be set before plugins are loaded. If we added
// this flag to the OOV4 namespace, it would be overriden during plugin initalization,
// so we need to use a global var instead

if (window && !window.debugHazmat) {
  hazmatConfig = {
    warn: function () {
      return;
    }
  };
}

if (!OOV4.HM && (typeof window === 'undefined' || typeof window._ === 'undefined')) {
  OOV4.HM = require('hazmat').create(hazmatConfig);
} else if (!window.Hazmat) {
  require('hazmat');
}

if (!OOV4.HM) {
  OOV4.HM = window.Hazmat.noConflict().create(hazmatConfig);
}

},{"./InitOOUnderscore.js":3,"hazmat":7}],3:[function(require,module,exports){
require("./InitOO.js");

if (!window._) {
  window._ = require('underscore');
}

if (!OOV4._) {
  OOV4._ = window._.noConflict();
}

},{"./InitOO.js":1,"underscore":8}],4:[function(require,module,exports){
/**
 * @namespace OOV4
 */
(function (OOV4, _) {
  // External States

  /**
   * @description The Ooyala Player run-time states apply to an Ooyala player while it is running. These states apply equally to both HTML5 and Flash players.
   * State changes occur either through user interaction (for example, the user clickes the PLAY button), or programmatically via API calls. For more information,
   * see <a href="http://support.ooyala.com/developers/documentation/api/pbv4_api_events.html" target="target">Player Message Bus Events</a>.
   * @summary Represents the Ooyala Player run-time states.
   * @namespace OOV4.STATE
   */
  OOV4.STATE = {
    /** The embed code has been set. The movie and its metadata is currently being loaded into the player. */
    LOADING: 'loading',

    /**
     * One of the following applies:
     * <ul>
     *   <li>All of the necessary data is loaded in the player. Playback of the movie can begin.</li>
     *   <li>Playback of the asset has finished and is ready to restart from the beginning.</li>
     * </ul>
     */
    READY: 'ready',

    /** The player is currently playing video content. */
    PLAYING: 'playing',

    /** The player has currently paused after playback had begun. */
    PAUSED: 'paused',

    /** Playback has currently stopped because it doesn't have enough movie data to continue and is downloading more. */
    BUFFERING: 'buffering',

    /** The player has encountered an error that prevents playback of the asset. The error could be due to many reasons,
     * such as video format, syndication rules, or the asset being disabled. Refer to the list of errors for details.
     * The error code for the root cause of the error is available from the [OOV4.Player.getErrorCode()]{@link OOV4.Player#getErrorCode} method.
     */
    ERROR: 'error',

    /** The player has been destroyed via its [OOV4.Player.destroy(<i>callback</i>)]{@link OOV4.Player#destroy} method. */
    DESTROYED: 'destroyed',
    __end_marker: true
  }; // All Events Constants

  /**
   * @description The Ooyala Player events are default events that are published by the event bus.Your modules can subscribe to any and all of these events.
   * Use message bus events to subscribe to or publish player events from video to ad playback. For more information,
   * see <a href="http://support.ooyala.com/developers/documentation/api/pbv4_api_events.html" target="target">Player Message Bus Events</a>.
   * @summary Represents the Ooyala Player events.
   * @namespace OOV4.EVENTS
   */

  OOV4.EVENTS = {
    /**
     * A player was created. This is the first event that is sent after player creation.
     * This event provides the opportunity for any other modules to perform their own initialization.
     * The handler is called with the query string parameters.
     * The DOM has been created at this point, and plugins may make changes or additions to the DOM.<br/><br/>
     *
     *
     * @event OOV4.EVENTS#PLAYER_CREATED
     */
    PLAYER_CREATED: 'playerCreated',
    PLAYER_EMBEDDED: 'playerEmbedded',

    /**
     * An attempt has been made to set the embed code.
     * If you are developing a plugin, reset the internal state since the player is switching to a new asset.
     * Depending on the context, the handler is called with:
     *   <ul>
     *     <li>The ID (embed code) of the asset.</li>
     *     <li>The ID (embed code) of the asset, with options.</li>
     *   </ul>
     *
     *
     * @event OOV4.EVENTS#SET_EMBED_CODE
     */
    SET_EMBED_CODE: 'setEmbedCode',

    /**
     * HEVC playback availablility has been checked
     * The handler is called with:
     *   <ul>
     *     <li>canPlayHevc (boolean) If HEVC can be played in the current environment.</li>
     *   </ul>
     *
     *
     * @event OOV4.EVENTS#HEVC_CHECKED
     * @private
     */
    HEVC_CHECKED: 'hevcChecked',

    /**
     * An attempt has been made to set the embed code by Ooyala Ads.
     * If you are developing a plugin, reset the internal state since the player is switching to a new asset.
     * Depending on the context, the handler is called with:
     *   <ul>
     *     <li>The ID (embed code) of the asset.</li>
     *     <li>The ID (embed code) of the asset, with options.</li>
     *   </ul>
     *
     *
     * @event OOV4.EVENTS#SET_EMBED_CODE_AFTER_OOYALA_AD
     * @private
     */
    SET_EMBED_CODE_AFTER_OOYALA_AD: 'setEmbedCodeAfterOoyalaAd',

    /**
     * The player's embed code has changed. The handler is called with two parameters:
     * <ul>
     *    <li>The ID (embed code) of the asset.</li>
     *    <li>The options JSON object.</li>
     * </ul>
     *
     *
     * @event OOV4.EVENTS#EMBED_CODE_CHANGED
     */
    EMBED_CODE_CHANGED: 'embedCodeChanged',

    /**
     * An attempt has been made to set a new asset.
     * If you are developing a plugin, reset the internal state since the player is switching to a new asset.
     * Depending on the context, the handler is called with:
     *   <ul>
     *     <li>The asset Object</li>
     *     <li>The asset Object, with options.</li>
     *   </ul>
     *
     * <h5>Compatibility: </h5>
     * <p style="text-indent: 1em;">HTML5, Flash</p>
     *
     * @event OOV4.EVENTS#SET_ASSET
     */
    SET_ASSET: 'setAsset',

    /**
     * A new asset has been specified to for playback and has basic passed validation.
     * The handler will be called with an object representing the new asset.
     * The object will have the following structure:
     *   <ul>
     *     <li>{
     *           Content:
     *           <ul>
     *                 <li>title: String,</li>
     *                 <li>description: String,</li>
     *                 <li>duration: Number,</li>
     *                 <li>posterImages: Array,</li>
     *                 <li>streams: Array,</li>
     *                 <li>captions: Array</li>
     *           </ul>
     *     }</li>
     *
     *   </ul>
     *
     * <h5>Compatibility: </h5>
     * <p style="text-indent: 1em;">HTML5, Flash</p>
     *
     * @event OOV4.EVENTS#ASSET_CHANGED
     */
    ASSET_CHANGED: 'assetChanged',

    /**
     * An attempt has been made to update current asset for cms-less player.
     * The handler is called with:
     *   <ul>
     *     <li>The asset Object, with optional fields populated</li>
     *   </ul>
     *
     *
     * @event OOV4.EVENTS#UPDATE_ASSET
     * @public
     */
    UPDATE_ASSET: 'updateAsset',

    /**
     * New asset parameters were specified for playback and have passed basic validation.
     * The handler will be called with an object representing the new parameters.
     * The object will have the following structure:
     *   <ul> {
     *     <li> id: String </li>
     *     <li> content:
     *           <ul>
     *                 <li>title: String,</li>
     *                 <li>description: String,</li>
     *                 <li>duration: Number,</li>
     *                 <li>posterImages: Array,</li>
     *                 <li>streams: Array,</li>
     *                 <li>captions: Array</li>
     *           </ul>
     *     </li>
     *     <li> relatedVideos:
     *           <ul>
     *                 <li>title: String,</li>
     *                 <li>description: String,</li>
     *                 <li>thumbnailUrl: String,</li>
     *                 <li>asset: Object</li>
     *           </ul>
     *     </li>
     *   }</ul>
     *
     * <h5>Compatibility: </h5>
     * <p style="text-indent: 1em;">HTML5, Flash</p>
     *
     * @event OOV4.EVENTS#ASSET_UPDATED
     */
    ASSET_UPDATED: 'assetUpdated',

    /**
     * An <code>AUTH_TOKEN_CHANGED</code> event is triggered when an authorization token is issued by the Player Authorization API.<br/>
     * For example, in device registration, an authorization token is issued, as described in
     * <a href="http://support.ooyala.com/developers/documentation/concepts/device_registration.html" target="target">Device Registration</a>.
     * The handler is called with a new value for the authorization token.<br/><br/>
     *
     *
     * @event OOV4.EVENTS#AUTH_TOKEN_CHANGED
     */
    AUTH_TOKEN_CHANGED: "authTokenChanged",

    /**
     * The GUID has been set. The handler is called with the GUID.
     * <p>This event notifies plugin or page developers that a unique ID has been either generated or loaded for the current user's browser.
     * This is useful for analytics.</p>
     * <p>In HTML5, Flash, and Chromecast environments, a unique user is identified by local storage or a cookie. </p>
     * <p>To generate the GUID, Flash players use the timestamp indicating when the GUID is generated, and append random data to it.
     * The string is then converted to base64.</p>
     * <p>To generate the GUID, HTML5 players use the current time, browser
     * information, and random data and hash it and convert it to base64.</p>
     * <p>Within the same browser on the desktop, once a GUID is set by one platform
     * it is used for both platforms for the user. If a user clears their browser cache, that user's (device's) ID will be regenerated the next time
     * they watch video. Incognito modes will track a user for a single session, but once the browser is closed the GUID is erased.</p>
     * <p>For more information, see <b>unique user</b> <a href="http://support.ooyala.com/users/users/documentation/reference/glossary.html" target="target">Glossary</a>.</p>
     *
     *
     * @event OOV4.EVENTS#GUID_SET
     */
    GUID_SET: 'guidSet',
    WILL_FETCH_PLAYER_XML: 'willFetchPlayerXml',
    PLAYER_XML_FETCHED: 'playerXmlFetched',
    WILL_FETCH_CONTENT_TREE: 'willFetchContentTree',
    SAVE_PLAYER_SETTINGS: 'savePlayerSettings',

    /**
     * A content tree was fetched. The handler is called with a JSON object that represents the content data for the current asset.<br/><br/>
     *
     *
     * <h5>Analytics:</h5>
     * <p style="text-indent: 1em;">Records a <code>display</code> event. For more information see
     * <a href="http://support.ooyala.com/developers/documentation/concepts/analytics_plays-and-displays.html" target="target">Displays, Plays, and Play Starts</a>.</p>
     *
     * @event OOV4.EVENTS#CONTENT_TREE_FETCHED
     */
    CONTENT_TREE_FETCHED: 'contentTreeFetched',
    WILL_FETCH_METADATA: 'willFetchMetadata',

    /**
     * The metadata, which is typically set in Backlot, has been retrieved.
     * The handler is called with the JSON object containing all metadata associated with the current asset.
     * The metadata includes page-level, asset-level, player-level, and account-level metadata, in addition to
     * metadata specific to 3rd party plugins. This is typically used for ad and anlytics plugins, but can be used
     * wherever you need specific logic based on the asset type.<br/><br/>
     *
     *
     * @event OOV4.EVENTS#METADATA_FETCHED
     */
    METADATA_FETCHED: 'metadataFetched',

    /**
     * The skin metadata, which is set in Backlot, has been retrieved.
     * The handler is called with the JSON object containing metadata set in Backlot for the current asset.
     * This is used by the skin plug-in to deep merge with the embedded skin config.<br/><br/>
     *
     * @event OOV4.EVENTS#SKIN_METADATA_FETCHED
     */
    SKIN_METADATA_FETCHED: 'skinMetadataFetched',

    /**
     * The thumbnail metadata needed for thumbnail previews while seeking has been fetched and will be
     * passed through to the event handlers subscribing to this event.
     * Thumbnail metadata will have the following structure:
     * {
        data: {
          available_time_slices: [10],  //times that have thumbnails available
          available_widths: [100],       //widths of thumbnails available
          thumbnails: {
                10: {100: {url: http://test.com, height: 100, width: 100}}
          }
        }
      }
     * <br/><br/>
     *
     *
     * @event OOV4.EVENTS#THUMBNAILS_FETCHED
     * @public
     */
    THUMBNAILS_FETCHED: 'thumbnailsFetched',
    WILL_FETCH_AUTHORIZATION: 'willFetchAuthorization',

    /**
     * Playback was authorized. The handler is called with an object containing the entire SAS response, and includes the value of <code>video_bitrate</code>.
     * <p>For more information see
     * <a href="http://support.ooyala.com/developers/documentation/concepts/encodingsettings_videobitrate.html" target="target">Video Bit Rate</a>.</p>
     *
     *
     * @event OOV4.EVENTS#AUTHORIZATION_FETCHED
     */
    AUTHORIZATION_FETCHED: 'authorizationFetched',
    WILL_FETCH_AD_AUTHORIZATION: 'willFetchAdAuthorization',
    AD_AUTHORIZATION_FETCHED: 'adAuthorizationFetched',
    CAN_SEEK: 'canSeek',
    WILL_RESUME_MAIN_VIDEO: 'willResumeMainVideo',

    /**
     * The player has indicated that it is in a playback-ready state.
     * All preparations are complete, and the player is ready to receive playback commands
     * such as play, seek, and so on. The default UI shows the <b>Play</b> button,
     * displaying the non-clickable spinner before this point. <br/><br/>
     *
     *
     * @event OOV4.EVENTS#PLAYBACK_READY
     */
    PLAYBACK_READY: 'playbackReady',

    /**
     * Play has been called for the first time. <br/><br/>
     * The handler is called with the following arguments:
     * <ul>
     *   <li>The unix timestamp of the initial playtime</li>
     *   <li>True if the playback request was the result of an autoplay, false or undefined otherwise</li>
     * </ul>
     *
     *
     * @event OOV4.EVENTS#INITIAL_PLAY
     * @public
     */
    INITIAL_PLAY: "initialPlay",
    // when play is called for the very first time ( in start screen )
    WILL_PLAY: 'willPlay',

    /** The user has restarted the playback after the playback finished */
    REPLAY: 'replay',

    /**
     * The user is trying to set the playbackspeed of the main content.
     * <ul>
     *   <li>The desired speed</li>
     * </ul>
     * @event OOV4.EVENTS#SET_PLAYBACK_SPEED
     */
    SET_PLAYBACK_SPEED: "setPlaybackSpeed",

    /**
     * The playback speed changed. The handler is called with the following arguments:
     * <ul>
     *   <li>The id of the video whose playback speed changed.</li>
     *   <li>The new playback speed that was set.</li>
     * </ul>
     * @event OOV4.EVENTS#PLAYBACK_SPEED_CHANGED
     */
    PLAYBACK_SPEED_CHANGED: "playbackSpeedChanged",

    /**
     * The playhead time changed. The handler is called with the following arguments:
     * <ul>
     *   <li>The current time.</li>
     *   <li>The duration.</li>
     *   <li>The name of the buffer.</li>
     *   <li>The seek range.</li>
     *   <li>The id of the video (as defined by the module that controls it).</li>
     * </ul>
     *
     *
     * <h5>Analytics:</h5>
     * <p style="text-indent: 1em;">The first event is <code>video start</code>. Other instances of the event feed the <code>% completed data points</code>.</p>
     * <p style="text-indent: 1em;">For more information, see <a href="http://support.ooyala.com/developers/documentation/concepts/analytics_plays-and-displays.html">Displays, Plays, and Play Starts</a>.</p>
     *
     * @event OOV4.EVENTS#PLAYHEAD_TIME_CHANGED
     */
    PLAYHEAD_TIME_CHANGED: 'playheadTimeChanged',

    /**
     * The player is buffering the data stream.
     * The handler is called with the following arguments:
     * <ul>
     *   <li>The url of the video that is buffering.</li>
     *   <li>The playhead position.</li>
     *   <li>The id of the video that is buffering (as defined by the module that controls it).</li>
     * </ul><br/><br/>
     *
     *
     * @event OOV4.EVENTS#BUFFERING
     */
    BUFFERING: 'buffering',
    // playing stops because player is buffering

    /**
     * Play resumes because the player has completed buffering. The handler is called with the URL of the stream.
     * The handler is called with the following arguments:
     * <ul>
     *   <li>The url of the video that has buffered.</li>
     *   <li>The id of the video that has buffered (as defined by the module that controls it).</li>
     * </ul><br/><br/>
     *
     *
     * @event OOV4.EVENTS#BUFFERED
     */
    BUFFERED: 'buffered',

    /**
     * The player is downloading content (it can play while downloading).
     * The handler is called with the following arguments:
     * <ul>
     *   <li>The current time.</li>
     *   <li>The duration.</li>
     *   <li>The name of the buffer.</li>
     *   <li>The seek range.</li>
     *   <li>The id of the video (as defined by the module that controls it).</li>
     * </ul>
     * <br/><br/>
     *
     *
     * @event OOV4.EVENTS#DOWNLOADING
     */
    DOWNLOADING: 'downloading',
    // player is downloading content (could be playing while downloading)

    /**
     * Lists the available bitrate information. The handler is called with an array containing the available streams, each object includes:
     *   <ul>
     *     <li>bitrate: The bitrate in bits per second. (number|string)</li>
     *     <li>height: The vertical resolution of the stream. (number)</li>
     *     <li>width: The horizontal resolution of the stream. (number)</li>
     *   </ul>
     * If The video plugin supports automatic ABR, one stream will have a bitrate value of "auto".
     *
     * <p>For more information see
     * <a href="http://support.ooyala.com/developers/documentation/concepts/encodingsettings_videobitrate.html" target="target">Video Bit Rate</a>.</p>
     * @event OOV4.EVENTS#BITRATE_INFO_AVAILABLE
     * @public
     */
    BITRATE_INFO_AVAILABLE: 'bitrateInfoAvailable',

    /**
     * A request to set a specific stream bitrate has occurred.
     * The method is published with an object representing the stream to switch to. This will
     * be one of the stream objects published in BITRATE_INFO_AVAILABLE. Each object includes:
     *   <ul>
     *     <li>bitrate: The bitrate in bits per second. (number|string)</li>
     *     <li>height: The vertical resolution of the stream. (number)</li>
     *     <li>width: The horizontal resolution of the stream. (number)</li>
     *   </ul>
     * <br/><br/>
     *
     * @event OOV4.EVENTS#SET_TARGET_BITRATE
     */
    SET_TARGET_BITRATE: 'setTargetBitrate',

    /**
     * The current playing bitrate has changed. The handler is called with the stream object which includes:
     *   <ul>
     *     <li>bitrate: The bitrate in bits per second. (number|string)</li>
     *     <li>height: The vertical resolution of the stream. (number)</li>
     *     <li>width: The horizontal resolution of the stream. (number)</li>
     *   </ul>
     * If the player is using automatic ABR, it should publish a stream object with the bitrate set to "auto".
     *
     * <p>For more information see
     * <a href="http://support.ooyala.com/developers/documentation/concepts/encodingsettings_videobitrate.html" target="target">Video Bit Rate</a>.</p>
     * @event OOV4.EVENTS#BITRATE_CHANGED
     * @public
     */
    BITRATE_CHANGED: 'bitrateChanged',

    /**
     * Lists the available closed caption information including languages and locale.
     *
     * Provide the following arguments:
     * <ul>
     *   <li>object containing:
     *     <ul>
     *       <li><code>languages</code>: (array) a list of available languages.</li>
     *       <li><code>locale</code>: (object) contains language names by id. For example, <code>{en:"English", fr:"FranÃ§ais", sp:"EspaÃ±ol"}</code>.</li>
     *     </ul>
     *   </li>
     * </ul>
     *
     * @event OOV4.EVENTS#CLOSED_CAPTIONS_INFO_AVAILABLE
     * @public
     */
    CLOSED_CAPTIONS_INFO_AVAILABLE: 'closedCaptionsInfoAvailable',

    /**
     * Sets the closed captions language to use.  To remove captions, specify <code>"none"</code> as the language.
     *
     * Provide the following arguments:
     * <ul>
     *   <li>string specifying the language in which the captions appear.
     *   </li>
     * </ul>
     *
     * @event OOV4.EVENTS#SET_CLOSED_CAPTIONS_LANGUAGE
     * @public
     */
    SET_CLOSED_CAPTIONS_LANGUAGE: 'setClosedCaptionsLanguage',

    /**
     * Sent when the skin has chosen the language for the UI.
     *
     * Provide the following arguments:
     * <ul>
     *   <li>string specifying the language code of the UI.
     *   </li>
     * </ul>
     * @event OOV4.EVENTS#SKIN_UI_LANGUAGE
     * @private
     */
    SKIN_UI_LANGUAGE: 'skinUiLanguage',

    /**
     * Raised when closed caption text is changed at a point in time.
     *
     * Provide the following arguments:
     * <ul>
     *   <li>TBD
     *   </li>
     * </ul>
     *
     * @event OOV4.EVENTS#CLOSED_CAPTION_CUE_CHANGED
     * @private
     */
    CLOSED_CAPTION_CUE_CHANGED: 'closedCaptionCueChanged',

    /**
     * Raised when asset dimensions become available.
     *
     * Provide the following arguments in an object:
     * <ul>
     *   <li>width: the width of the asset (number)
     *   </li>
     *   <li>height: the height of the asset (number)
     *   </li>
     *   <li>videoId: the id of the video (string)
     *   </li>
     * </ul>
     *
     * @event OOV4.EVENTS#ASSET_DIMENSION
     * @public
     */
    ASSET_DIMENSION: 'assetDimension',
    SCRUBBING: 'scrubbing',
    SCRUBBED: 'scrubbed',

    /**
     * A request to perform a seek has occurred. The playhead is requested to move to
     * a specific location, specified in milliseconds. The handler is called with the position to which to seek.<br/><br/>
     *
     *
     * @event OOV4.EVENTS#SEEK
     */
    SEEK: 'seek',

    /**
     * The player has finished seeking the main video to the requested position.
     * The handler is called with the following arguments:
     * <ul>
     *   <li>The current time of the video after seeking.</li>
     * </ul>
     *
     *
     * @event OOV4.EVENTS#SEEKED
     */
    SEEKED: 'seeked',

    /**
     * A playback request has been made. <br/><br/>
     *
     *
     * @event OOV4.EVENTS#PLAY
     */
    PLAY: 'play',
    PLAYING: 'playing',
    PLAY_FAILED: 'playFailed',

    /**
     * A player pause has been requested. <br/><br/>
     *
     *
     * @event OOV4.EVENTS#PAUSE
     */
    PAUSE: 'pause',

    /**
     * The player was paused. <br/><br/>
     *
     *
     * @event OOV4.EVENTS#PAUSED
     */
    PAUSED: 'paused',

    /**
     * The video and asset were played. The handler is called with the arguments that were passed.<br/><br/>
     *
     *
     * @event OOV4.EVENTS#PLAYED
     */
    PLAYED: 'played',
    DISPLAY_CUE_POINTS: 'displayCuePoints',
    INSERT_CUE_POINT: 'insertCuePoint',
    RESET_CUE_POINTS: 'resetCuePoints',

    /**
     * This event is triggered before a change is made to the full screen setting of the player.
     * The handler is called with <code>true</code> if the full screen setting will be enabled,
     * and is called with <code>false</code> if the full screen setting will be disabled.
     *
     *
     * @event OOV4.EVENTS#WILL_CHANGE_FULLSCREEN
     */
    WILL_CHANGE_FULLSCREEN: 'willChangeFullscreen',

    /**
     * The fullscreen state has changed. Depending on the context, the handler is called with:
     * <ul>
     *   <li><code>isFullscreen</code> and <code>paused</code>:</li>
     *     <ul>
     *       <li><code>isFullscreen</code> is set to <code>true</code> or <code>false</code>.</li>
     *       <li><code>isFullscreen</code> and <code>paused</code> are each set to <code>true</code> or <code>false</code>.</li>
     *     </ul>
     *   </li>
     *   <li>The id of the video that has entered fullscreen (as defined by the module that controls it).
     * </ul>
     *
     *
     * @event OOV4.EVENTS#FULLSCREEN_CHANGED
     */
    FULLSCREEN_CHANGED: 'fullscreenChanged',

    /**
     * The screen size has changed. This event can also be triggered by a screen orientation change for handheld devices.
     * Depending on the context, the handler is called with:
     *   <ul>
     *     <li>The width of the player.</li>
     *     <li>The height of the player.</li>
     *   </ul>
     *
     *
     * @event OOV4.EVENTS#SIZE_CHANGED
     */
    SIZE_CHANGED: 'sizeChanged',

    /**
     * A request to change volume has been made.
     * The handler is called with the following arguments:
     * <ul>
     *   <li>The desired volume of the video element.</li>
     *   <li>The id of the video on which to change the volume (as defined by the module that controls it).
     *        If null or undefined, all video elements volume will be changed</li>
     * </ul>
     *
     *
     * @event OOV4.EVENTS#CHANGE_VOLUME
     */
    CHANGE_VOLUME: 'changeVolume',

    /**
     * The volume has changed. The handler is called with the current volume, which has a value between 0 and 1, inclusive.<br/><br/>
     *
     *
     * @event OOV4.EVENTS#VOLUME_CHANGED
     */
    VOLUME_CHANGED: 'volumeChanged',

    /**
     * A request to change the mute state has been made.
     * The handler is called with the following arguments:
     * <ul>
     *   <li>The desired mute state of the video element.</li>
     *   <li>The id of the video on which to mute (as defined by the module that controls it).
     *        If null or undefined, all video elements volume will be changed</li>
     *   <li>Whether or not the request was from a user action. True if it was from a user action,
     *        false otherwise.</li>
     * </ul>
     *
     *
     * @event OOV4.EVENTS#CHANGE_MUTE_STATE
     * @public
     */
    CHANGE_MUTE_STATE: 'changeMuteState',

    /**
     * The mute state has changed.
     * The handler is called with the following arguments:
     * <ul>
     *   <li>The current mute state of the video element.</li>
     *   <li>The id of the video that was muted (as defined by the module that controls it).</li>
     *   <li>Whether or not the mute state was changed for muted autoplay. True if it was
     *        done for muted autoplay, false or undefined otherwise.</li>
     * </ul>
     *
     *
     * @event OOV4.EVENTS#MUTE_STATE_CHANGED
     * @public
     */
    MUTE_STATE_CHANGED: 'muteStateChanged',

    /**
     * Controls are shown.<br/><br/>
     *
     *
     * @event OOV4.EVENTS#CONTROLS_SHOWN
     */
    CONTROLS_SHOWN: 'controlsShown',

    /**
     * Controls are hidden.<br/><br/>
     *
     *
     * @event OOV4.EVENTS#CONTROLS_HIDDEN
     */
    CONTROLS_HIDDEN: 'controlsHidden',
    END_SCREEN_SHOWN: 'endScreenShown',

    /**
     * An error has occurred. The handler is called with a JSON object that always includes an error code field,
     * and may also include other error-specific fields.<br/><br/>
     *
     *
     * @event OOV4.EVENTS#ERROR
     */
    ERROR: 'error',

    /**
     * An api related error has occurred. The handler is called with the following arguments:
     * <ul>
     *   <li>The error code.</li>
     *   <li>The error message.</li>
     *   <li>The url requested.</li>
     * </ul>
     *
     *
     * @event OOV4.EVENTS#API_ERROR
     * @public
     */
    API_ERROR: 'apiError',

    /**
     * Event containing the bitrate used at the start of playback. The handler is called with the following arguments:
     * <ul>
     *   <li>The bitrate in kbps.</li>
     * </ul>
     *
     *
     * @event OOV4.EVENTS#BITRATE_INITIAL
     * @public
     */
    BITRATE_INITIAL: 'bitrateInitial',

    /**
     * Event containing the bitrate used five seconds into playback. The handler is called with the following arguments:
     * <ul>
     *   <li>The bitrate in kbps.</li>
     * </ul>
     *
     *
     * @event OOV4.EVENTS#BITRATE_FIVE_SEC
     * @public
     */
    BITRATE_FIVE_SEC: 'bitrateFiveSec',

    /**
     * Event containing the bitrate used thirty seconds into playback. The handler is called with the following arguments:
     * <ul>
     *   <li>The bitrate in kbps.</li>
     * </ul>
     *
     *
     * @event OOV4.EVENTS#BITRATE_STABLE
     * @public
     */
    BITRATE_STABLE: 'bitrateStable',

    /**
     * A playback error has occurred before the video start. The handler is called with the following arguments:
     * <ul>
     *   <li>The error code.</li>
     *   <li>The error message.</li>
     *   <li>The la url if DRM used.</li>
     * </ul>
     *
     *
     * @event OOV4.EVENTS#PLAYBACK_START_ERROR
     * @public
     */
    PLAYBACK_START_ERROR: 'playbackStartError',

    /**
     * A playback error has occurred midstream. The handler is called with the following arguments:
     * <ul>
     *   <li>The error code.</li>
     *   <li>The error message.</li>
     *   <li>The playhead position.</li>
     * </ul>
     *
     *
     * @event OOV4.EVENTS#PLAYBACK_MIDSTREAM_ERROR
     * @public
     */
    PLAYBACK_MIDSTREAM_ERROR: 'playbackMidstreamError',

    /**
     * A plugin has been loaded successfully. The handler is called with the following arguments:
     * <ul>
     *   <li>The player core version.</li>
     *   <li>The plugin type: ad, video, analytics, playtest, skin.</li>
     *   <li>The plugin name.</li>
     *   <li>The time it took to load the plugin.</li>
     * </ul>
     *
     *
     * @event OOV4.EVENTS#PLAYBACK_MIDSTREAM_ERROR
     * @public
     */
    PLUGIN_LOADED: 'pluginLoaded',

    /**
     * The video plugin has sent an error message. The handler is called with the following arguments:
     * <ul>
     *   <li>The error code.</li>
     *   <li>The error message.</li>
     * </ul>
     *
     *
     * @event OOV4.EVENTS#VC_PLUGIN_ERROR
     * @public
     */
    VC_PLUGIN_ERROR: 'videoPluginError',

    /**
     * Notifies the player that the initial playback of content has started.
     * <ul>
     *   <li>The time since the initial play request was made (number)</li>
     *   <li>Boolean parameter. True if video was autoplayed, false otherwise (boolean)</li>
     *   <li>Boolean parameter. True if the video had an ad play before it started.
     *       This includes midrolls that play before content due to an initial playhead time > 0.
     *       False otherwise  (number)</li>(boolean)</li>
     *   <li>The initial position of the playhead upon playback start. (number)</li>
     *   <li>The video plugin used for playback (string)</li>
     *   <li>The browser technology used - HTML5, Flash, Mixed, or Other (string)</li>
     *   <li>The stream encoding type, i.e. MP4, HLS, Dash, etc. (string)</li>
     *   <li>The URL of the content being played (string)</li>
     *   <li>The DRM being used, none if there is no DRM (string)</li>
     *   <li>Boolean parameter. True if a live stream is playing. False if VOD.(boolean)</li>
     * </ul>
     * @event OOV4.EVENTS#INITIAL_PLAY_STARTING
     * @public
     */
    INITIAL_PLAY_STARTING: 'initialPlayStarting',

    /**
     * Notifies the player that the user has requested to play the previous video.
     * Depending on the plugin being used, this could either be the previous video in
     * a playlist, or the previously played Discovery video recommendation.
     *
     * @event OOV4.EVENTS#REQUEST_PREVIOUS_VIDEO
     * @public
     */
    REQUEST_PREVIOUS_VIDEO: 'requestPreviousVideo',

    /**
     * Notifies the player that the user has requested to play the next video.
     * Depending on the plugin being used, this could either be the next video in
     * a playlist, or the next Discovery video recommendation.
     *
     * @event OOV4.EVENTS#REQUEST_NEXT_VIDEO
     * @public
     */
    REQUEST_NEXT_VIDEO: 'requestNextVideo',

    /**
     * Fired by either the Playlist or Discovery plugins after the position of the
     * current video, relative to its siblings, has been determined. The main purpose
     * of this event is to let the UI know whether or not there are previous or next
     * videos that the user can navigate towards.<br/><br/>
     *
     * The handler is called with the following arguments:
     * <ul>
     *   <li>An object which contains the following properties:
     *     <ul>
     *       <li><code>hasPreviousVideos</code>: (boolean) True if there are videos before the current one, false otherwise</li>
     *       <li><code>hasNextVideos</code>: (boolean) True if there are videos after the current one, false otherwise</li>
     *     </ul>
     *   </li>
     * </ul>
     *
     * @event OOV4.EVENTS#POSITION_IN_PLAYLIST_DETERMINED
     * @private
     */
    POSITION_IN_PLAYLIST_DETERMINED: 'positionInPlaylistDetermined',

    /**
     * The player is currently being destroyed, and anything created by your module must also be deleted.
     * After the destruction is complete, there is nothing left to send an event.
     * Any plugin that creates or has initialized any long-living logic should listen to this event and clean up that logic.
     * <br/><br/>
     *
     *
     * @event OOV4.EVENTS#DESTROY
     */
    DESTROY: 'destroy',
    WILL_PLAY_FROM_BEGINNING: 'willPlayFromBeginning',
    DISABLE_PLAYBACK_CONTROLS: 'disablePlaybackControls',
    ENABLE_PLAYBACK_CONTROLS: 'enablePlaybackControls',
    // Video Controller action events

    /*
     * Denotes that the video controller is ready for playback to be triggered.
     * @event OOV4.EVENTS#VC_READY
     * @public
     */
    VC_READY: 'videoControllerReady',

    /**
     * Commands the video controller to create a video element.
     * It should be given the following arguments:
     * <ul>
     *   <li>videoId (string)
     *   </li>
     *   <li>streams (object) containing:
     *     <ul>
     *       <li>Encoding type (string) as key defined in OOV4.VIDEO.ENCODINGS
     *       </li>
     *       <li>Key-value pair (object) as value containing:
     *         <ul>
     *           <li>url (string): Url of the stream</li>
     *           <li>drm (object): Denoted by type of DRM with data as value object containing:
     *             <ul>
     *               <li>Type of DRM (string) as key (ex. "widevine", "fairplay", "playready")</li>
     *               <li>DRM specific data (object) as value</li>
     *             </ul>
     *           </li>
     *         </ul>
     *       </li>
     *     </ul>
     *   </li>
     *   <li>parentContainer of the element. This is a jquery element. (object)
     *   </li>
     *   <li>optional params object (object) containing:
     *     <ul>
     *       <li>closedCaptions: The possible closed captions available on this video. (object)</li>
     *       <li>crossorigin: The crossorigin attribute value to set on the video. (string)</li>
     *       <li>technology: The core video technology required (string) (ex. OOV4.VIDEO.TECHNOLOGY.HTML5)</li>
     *       <li>features: The video plugin features required (string) (ex. OOV4.VIDEO.FEATURE.CLOSED_CAPTIONS)</li>
     *     </ul>
     *   </li>
     * </ul>
     * @event OOV4.EVENTS#VC_CREATE_VIDEO_ELEMENT
     */
    VC_CREATE_VIDEO_ELEMENT: 'videoControllerCreateVideoElement',

    /**
     * A message to be interpreted by the Video Controller to update the URL of the stream for an element.
     * The handler is called with the following arguments:
     * <ul>
     *   <li>The name of the element who's URL is being altered</li>
     *   <li>The new url to be used</li>
     * </ul>
     * @event OOV4.EVENTS#VC_UPDATE_ELEMENT_STREAM
     * @public
     */
    VC_UPDATE_ELEMENT_STREAM: 'videoControllerUpdateElementStream',

    /**
     * The Video Controller has created the desired video element, as denoted by id (string).
     * The handler is called with the following arguments:
     * <ul>
     *   <li>Object containing:
     *     <ul>
     *       <li>videoId: The id of the video as defined by the module that controls it.</li>
     *       <li>encodings: The encoding types supported by the new video element.</li>
     *       <li>parent: The parent element of the video element.</li>
     *       <li>domId: The DOM id of the video element.</li>
     *       <li>videoElement: The video element or its wrapper as created by the video plugin.</li>
     *     </ul>
     *   </li>
     * </ul>
     * @event OOV4.EVENTS#VC_VIDEO_ELEMENT_CREATED
     */
    VC_VIDEO_ELEMENT_CREATED: 'videoControllerVideoElementCreated',

    /**
     * Commands the Video Controller to bring a video element into the visible range given the video element id (string).
     * The handler is called with the following arguments:
     * <ul>
     *   <li>The id of the video to focus (as defined by the module that controls it).</li>
     * </ul>
     * @event OOV4.EVENTS#VC_FOCUS_VIDEO_ELEMENT
     */
    VC_FOCUS_VIDEO_ELEMENT: 'videoControllerFocusVideoElement',

    /**
     * The Video Controller has moved a video element (string) into focus.
     * The handler is called with the following arguments:
     * <ul>
     *   <li>The id of the video that is in focus (as defined by the module that controls it).</li>
     * </ul>
     * @event OOV4.EVENTS#VC_VIDEO_ELEMENT_IN_FOCUS
     */
    VC_VIDEO_ELEMENT_IN_FOCUS: 'videoControllerVideoElementInFocus',

    /**
     * The Video Controller has removed a video element (string) from focus.
     * The handler is called with the following arguments:
     * <ul>
     *   <li>The id of the video that lost focus (as defined by the module that controls it).</li>
     * </ul>
     * @event OOV4.EVENTS#VC_VIDEO_ELEMENT_LOST_FOCUS
     */
    VC_VIDEO_ELEMENT_LOST_FOCUS: 'videoControllerVideoElementLostFocus',

    /**
     * Commands the Video Controller to dispose a video element given the video element id (string).
     * @event OOV4.EVENTS#VC_DISPOSE_VIDEO_ELEMENT
     */
    VC_DISPOSE_VIDEO_ELEMENT: 'videoControllerDisposeVideoElement',

    /**
     * The Video Controller has disposed the denoted video element (string).
     * The handler is called with the following arguments:
     * <ul>
     *   <li>The id of the video that was disposed (as defined by the module that controls it).</li>
     * </ul>
     * @event OOV4.EVENTS#VC_VIDEO_ELEMENT_DISPOSED
     */
    VC_VIDEO_ELEMENT_DISPOSED: 'videoControllerVideoElementDisposed',

    /**
     * Commands the video controller to set the stream for a video element.
     * It should be given the video element name (string) and an object of streams denoted by encoding type (object).
     * @event OOV4.EVENTS#VC_SET_VIDEO_STREAMS
     */
    VC_SET_VIDEO_STREAMS: 'videoControllerSetVideoStreams',

    /**
     * The Video Controller has encountered an error attempting to configure video elements.
     * The handler is called with the following arguments:
     * <ul>
     *   <li>The id of the video that encountered the error (as defined by the module that controls it).</li>
     *   <li>The error details (object) containing an error code.</li>
     * @event OOV4.EVENTS#VC_ERROR
     */
    VC_ERROR: 'videoControllerError',
    // Video Player action events

    /**
     * Sets the video element's initial playback time.
     * @event OOV4.EVENTS#VC_SET_INITIAL_TIME
     */
    VC_SET_INITIAL_TIME: 'videoSetInitialTime',

    /**
     * Commands the video element to play.
     * The handler is called with the following arguments:
     * <ul>
     *   <li>The id of the video to play (as defined by the module that controls it).</li>
     * </ul>
     * @event OOV4.EVENTS#VC_PLAY
     */
    VC_PLAY: 'videoPlay',

    /**
      * Notifies the video element to play.
      * The handler is called with the following arguments:
      * <ul>
      *   <li>The id of the video to play (as defined by the module that controls it).</li>
      * </ul>
      * @event OOV4.EVENTS#PLAY_VIDEO_ELEMENT
      * @private
      */
    PLAY_VIDEO_ELEMENT: 'playVideoElement',

    /**
     * The video element has detected a command to play and will begin playback.
     * The handler is called with the following arguments:
     * <ul>
     *   <li>The id of the video to seek (as defined by the module that controls it).</li>
     *   <li>The url of the video that will play.</li>
     * </ul>
     * @event OOV4.EVENTS#VC_WILL_PLAY
     */
    VC_WILL_PLAY: 'videoWillPlay',

    /**
     * The video element has detected playback in progress.
     * The handler is called with the following arguments:
     * <ul>
     *   <li>The id of the video that is playing (as defined by the module that controls it).</li>
     * </ul>
     * @event OOV4.EVENTS#VC_PLAYING
     */
    VC_PLAYING: 'videoPlaying',

    /**
     * The video element has detected playback completion.
     * The handler is called with the following arguments:
     * <ul>
     *   <li>The id of the video that has played (as defined by the module that controls it).</li>
     * </ul>
     * @event OOV4.EVENTS#VC_PLAYED
     */
    VC_PLAYED: 'videoPlayed',

    /**
     * The video element has detected playback failure.
     * The handler is called with the following arguments:
     * <ul>
     *   <li>The id of the video that has played (as defined by the module that controls it).</li>
     *   <li>The error code of the failure (string).</li>
     * </ul>
     * @event OOV4.EVENTS#VC_PLAY_FAILED
     */
    VC_PLAY_FAILED: 'videoPlayFailed',

    /**
     * Commands the video element to pause.
     * The handler is called with the following arguments:
     * <ul>
     *   <li>The id of the video to pause (as defined by the module that controls it).</li>
     *   <li>Optional string indicating the reason for the pause.  Supported values include:
     *     <ul>
     *       <li>"transition" indicates that a pause was triggered because a video is going into or out of focus.</li>
     *       <li>null or undefined for all other cases.</li>
     *     </ul>
     *   </li>
     * </ul>
     * @event OOV4.EVENTS#VC_PAUSE
     */
    VC_PAUSE: 'videoPause',

    /**
     * The video element has detected video state change to paused.
     * The handler is called with the following arguments:
     * <ul>
     *   <li>The id of the video that has paused (as defined by the module that controls it).</li>
     * </ul>
     * @event OOV4.EVENTS#VC_PAUSED
     */
    VC_PAUSED: 'videoPaused',

    /**
     * Commands the video element to seek.
     * The handler is called with the following arguments:
     * <ul>
     *   <li>The id of the video to seek (as defined by the module that controls it).</li>
     *   <li>The time position to seek to (in seconds).</li>
     * </ul>
     * @event OOV4.EVENTS#VC_SEEK
     */
    VC_SEEK: 'videoSeek',

    /**
     * The video element has detected seeking.
     * The handler is called with the following arguments:
     * <ul>
     *   <li>The id of the video that is seeking (as defined by the module that controls it).</li>
     * </ul>
     * @event OOV4.EVENTS#VC_SEEKING
     */
    VC_SEEKING: 'videoSeeking',

    /**
     * The video element has detected seeked.
     * The handler is called with the following arguments:
     * <ul>
     *   <li>The id of the video that has seeked (as defined by the module that controls it).</li>
     *   <li>The current time of the video after seeking.</li>
     * </ul>
     * @event OOV4.EVENTS#VC_SEEKED
     */
    VC_SEEKED: 'videoSeeked',

    /**
     * Commands the video element to preload.
     * @event OOV4.EVENTS#VC_PRELOAD
     */
    VC_PRELOAD: 'videoPreload',

    /**
     * Commands the video element to reload.
     * @event OOV4.EVENTS#VC_RELOAD
     */
    VC_RELOAD: 'videoReload',

    /**
     * Commands the video controller to prepare all video elements for playback.  This event should be
     * called on a click event and used to enable api-control on html5-based video elements.
     * @event OOV4.EVENTS#VC_PRIME_VIDEOS
     * @public
     */
    VC_PRIME_VIDEOS: 'videoPrimeVideos',

    /**
     * Notifies the player of tags (such as ID3) encountered during video playback.
     * The handler is called with the following arguments:
     * <ul>
     *   <li>The id of the video that has paused (as defined by the module that controls it). (string)</li>
     *   <li>The type of metadata tag found, such as ID3. (string)</li>
     *   <li>The metadata. (string|object)</li>
     * </ul>
     * @event OOV4.EVENTS#VC_TAG_FOUND
     * @public
     */
    VC_TAG_FOUND: 'videoTagFound',

    /**
     * Notifies the player that the initial playback of content has started.
     * <ul>
     *   <li>The time since the initial play request was made (number)</li>
     *   <li>Boolean parameter. True if video was autoplayed, false otherwise (boolean)</li>
     *   <li>Boolean parameter. True if the video had an ad play before it started.
     *       This includes midrolls that play before content due to an initial playhead time > 0.
     *       False otherwise  (number)</li>(boolean)</li>
     *   <li>The initial position of the playhead upon playback start. (number)</li>
     *   <li>The video plugin used for playback (string)</li>
     *   <li>The browser technology used - HTML5, Flash, Mixed, or Other (string)</li>
     *   <li>The stream encoding type, i.e. MP4, HLS, Dash, etc. (string)</li>
     *   <li>The URL of the content being played (string)</li>
     *   <li>The DRM being used, none if there is no DRM (string)</li>
     *   <li>Boolean parameter. True if a live stream is playing. False if VOD.(boolean)</li>
     * </ul>
     * @event OOV4.EVENTS#INITIAL_PLAY_STARTING
     * @public
     */
    INITIAL_PLAY_STARTING: 'initialPlayStarting',

    /**
     * This event is triggered when an ad sdk has been loaded successfully. The handler is called with:
     * <ul>
     *   <li>The ad plugin loaded.</li>
     * </ul>
     * @event OOV4.EVENTS#AD_SDK_LOADED
     */
    AD_SDK_LOADED: 'adSdkLoaded',

    /**
     * This event is triggered when there is an failure to load the ad sdk.
     * The handler is called with the following arguments:
     * <ul>
     *   <li>The ad plugin that failed to load.</li>
     *   <li>The player core version.</li>
     *   <li>The error message associated with the load failure.</li>
     * </ul>
     * @event OOV4.EVENTS#AD_SDK_LOAD_FAILED
     */
    AD_SDK_LOAD_FAILED: 'adSdkLoadFailed',

    /**
     * This event is triggered whenever an ad is requested.
     * The handler is called with the following arguments:
     * <ul>
     *   <li>The ad plugin.</li>
     *   <li>The time the ad was scheduled to play.</li>
     * </ul>
     * @event OOV4.EVENTS#AD_REQUEST
     */
    AD_REQUEST: 'adRequest',

    /**
     * This event is triggered upon receiving a successful response for an ad request.
     * The handler is called with the following arguments:
     * <ul>
     *   <li>The ad plugin.</li>
     *   <li>The time the ad was scheduled to play.</li>
     *   <li>The ad request response time.</li>
     *   <li>Time from initial play to ad request success</li>
     * </ul>
     * @event OOV4.EVENTS#AD_REQUEST_SUCCESS
     */
    AD_REQUEST_SUCCESS: 'adRequestSuccess',

    /**
     * This event is triggered upon receiving an error for an ad request.
     * The handler is called with the following arguments:
     * <ul>
     *   <li>The ad plugin.</li>
     *   <li>The time the ad was scheduled to play.</li>
     *   <li>The final ad tag after macro substitution</li>
     *   <li>The error code.</li>
     *   <li>The error message.</li>
     *   <li>If there was a request timeout or not.</li>
     * </ul>
     * @event OOV4.EVENTS#AD_REQUEST_ERROR
     */
    AD_REQUEST_ERROR: 'adRequestError',

    /**
     * This event is triggered upon receiving an empty response for an ad request.
     * The handler is called with the following arguments:
     * <ul>
     *   <li>The ad plugin.</li>
     *   <li>The time the ad was scheduled to play.</li>
     *   <li>The final ad tag after macro substitution</li>
     *   <li>The error code.</li>
     *   <li>The error message.</li>
     * </ul>
     * @event OOV4.EVENTS#AD_REQUEST_EMPTY
     */
    AD_REQUEST_EMPTY: 'adRequestEmpty',

    /**
     * This event is triggered upon when an error occurs trying to play an ad.
     * The handler is called with the following arguments:
     * <ul>
     *   <li>The ad plugin.</li>
     *   <li>The time the ad was scheduled to play.</li>
     *   <li>The final ad tag after macro substitution</li>
     *   <li>The list of all video plugins.</li>
     *   <li>The error code.</li>
     *   <li>The error message.</li>
     *   <li>The media file URL.</li>
     * </ul>
     * @event OOV4.EVENTS#AD_PLAYBACK_ERROR
     */
    AD_PLAYBACK_ERROR: 'adPlaybackError',

    /**
     * This event is triggered when the ad plugin sdk records an impression event.
     * The handler is called with the following arguments:
     * <ul>
     *   <li>The ad plugin.</li>
     *   <li>The time the ad was scheduled to play.</li>
     *   <li>The ad load time - time between ad request success and first frame started.</li>
     *   <li>The ad protocol: VAST or VPAID.</li>
     *   <li>The ad type: linearVideo, linearOverlay, nonLinearVideo, nonLinearOverlay.</li>
     * </ul>
     * @event OOV4.EVENTS#AD_SDK_IMPRESSION
     */
    AD_SDK_IMPRESSION: 'adSdkImpression',

    /**
     * This event is triggered when an ad has completed playback.
     * The handler is called with the following arguments:
     * <ul>
     *   <li>The ad plugin.</li>
     *   <li>The time passed since the ad impression.</li>
     *   <li>If the ad was skipped or not.</li>
     * </ul>
     * @event OOV4.EVENTS#AD_COMPLETED
     */
    AD_COMPLETED: 'adCompleted',
    WILL_FETCH_ADS: 'willFetchAds',
    DISABLE_SEEKING: 'disableSeeking',
    ENABLE_SEEKING: 'enableSeeking',

    /**
     * This event is triggered before an ad is played. Depending on the context, the handler is called with:
     *   <ul>
     *     <li>The duration of the ad.</li>
     *     <li>The ID of the ad.</li>
     *   </ul>
     *
     *
     * <h5>Analytics:</h5>
     * <p style="text-indent: 1em;"Triggers an <b>Ad Analytics</b> <code>AD_IMPRESSION</code> event.</p>
     *
     * @event OOV4.EVENTS#WILL_PLAY_ADS
     */
    WILL_PLAY_ADS: 'willPlayAds',
    WILL_PLAY_SINGLE_AD: 'willPlaySingleAd',
    WILL_PAUSE_ADS: 'willPauseAds',
    WILL_RESUME_ADS: 'willResumeAds',

    /**
     * This event is triggered to indicate that a non-linear ad will be played.  The handler is called with:
     *   <ul>
     *     <li>An object representing the ad.  For a definition, see class 'Ad' from the ad manager framework.</li>
     *   </ul>
     *
     * @event OOV4.EVENTS#WILL_PLAY_NONLINEAR_AD
     */
    WILL_PLAY_NONLINEAR_AD: 'willPlayNonlinearAd',

    /**
     * A non-linear ad will play now.  The handler is called with:
     *   <ul>
     *     <li>An object containing the following fields:</li>
     *     <ul>
     *       <li>ad: An object representing the ad.  For a definition, see class 'Ad' from the ad manager framework.</li>
     *       <li>url: [optional] The url of the nonlinear ad.</li>
     *     </ul>
     *   </ul>
     *
     * @event OOV4.EVENTS#PLAY_NONLINEAR_AD
     */
    PLAY_NONLINEAR_AD: 'playNonlinearAd',

    /**
    * A nonlinear ad was loaded in the UI.
    *
    *
    * @event OOV4.EVENTS#NONLINEAR_AD_DISPLAYED
    */
    NONLINEAR_AD_DISPLAYED: 'nonlinearAdDisplayed',

    /**
     * A set of ads have been played. Depending on the context, the handler is called with:
     *   <ul>
     *     <li>The duration of the ad.</li>
     *     <li>The ID of the item to play.</li>
     *   </ul>
     *
     *
     * @event OOV4.EVENTS#ADS_PLAYED
     */
    ADS_PLAYED: 'adsPlayed',
    SINGLE_AD_PLAYED: 'singleAdPlayed',

    /**
     * This event is triggered when an error has occurred with an ad. <br/><br/>
     *
     *
     * @event OOV4.EVENTS#ADS_ERROR
     */
    ADS_ERROR: 'adsError',

    /**
     * This event is triggered when an ad has been clicked. <br/><br/>
     *
     *
     * @event OOV4.EVENTS#ADS_CLICKED
     */
    ADS_CLICKED: 'adsClicked',
    FIRST_AD_FETCHED: "firstAdFetched",
    AD_CONFIG_READY: "adConfigReady",

    /**
     * This event is triggered before the companion ads are shown.
     * Companion ads are displayed on a customer page and are not displayed in the player.
     * This event notifies the page handler to display the specified ad, and is the only means by which companion ads can appear.
     * If the page does not handle this event, companion ads will not appear.
     * Depending on the context, the handler is called with:
     *   <ul>
     *     <li>The ID of all companion ads.</li>
     *     <li>The ID of a single companion ad.</li>
     *   </ul>
     *
     *
     * <h5>Analytics:</h5>
     * <p style="text-indent: 1em;"Triggers an <b>Ad Analytics</b> <code>AD_IMPRESSION</code> event.</p>
     *
     * @event OOV4.EVENTS#WILL_SHOW_COMPANION_ADS
     */
    WILL_SHOW_COMPANION_ADS: "willShowCompanionAds",
    AD_FETCH_FAILED: "adFetchFailed",
    MIDROLL_PLAY_FAILED: "midrollPlayFailed",
    SKIP_AD: "skipAd",
    UPDATE_AD_COUNTDOWN: "updateAdCountdown",
    // this player is part of these experimental variations
    REPORT_EXPERIMENT_VARIATIONS: "reportExperimentVariations",
    FETCH_STYLE: "fetchStyle",
    STYLE_FETCHED: "styleFetched",
    SET_STYLE: "setStyle",
    USE_SERVER_SIDE_HLS_ADS: "useServerSideHlsAds",
    LOAD_ALL_VAST_ADS: "loadAllVastAds",
    ADS_FILTERED: "adsFiltered",
    ADS_MANAGER_HANDLING_ADS: "adsManagerHandlingAds",
    ADS_MANAGER_FINISHED_ADS: "adsManagerFinishedAds",
    // This event contains the information AMC need to know to place the overlay in the correct position.
    OVERLAY_RENDERING: "overlayRendering",

    /**
     * Event for signaling Ad Controls (Scrubber bar and Control bar) rendering:
     *   <ul>
     *     <li>Boolean parameter, 'false' to not show ad controls, 'true' to show ad controls based on skin config</li>
     *   </ul>
     *
     *
     * @event OOV4.EVENTS#SHOW_AD_CONTROLS
     */
    SHOW_AD_CONTROLS: "showAdControls",

    /**
     * Event for signaling Ad Marquee rendering:
     *   <ul>
     *     <li>Boolean parameter, 'false' to not show ad marquee, 'true' to show ad marquee based on skin config</li>
     *   </ul>
     *
     *
     * @event OOV4.EVENTS#SHOW_AD_MARQUEE
     */
    SHOW_AD_MARQUEE: "showAdMarquee",

    /**
     * An ad plugin will publish this event whenever the ad SDK throws an ad event. Typical ad events are
     * impressions, clicks, quartiles, etc. <br/><br/>
     *
     * @event OOV4.EVENTS#SDK_AD_EVENT
     * @private
     */
    SDK_AD_EVENT: "sdkAdEvent",
    // Window published beforeUnload event. It's still user cancellable.

    /**
     * The window, document, and associated resources are being unloaded.
     * The handler is called with <code>true</code> if a page unload has been requested, <code>false</code> otherwise.
     * This event may be required since some browsers perform asynchronous page loading while the current page is still active,
     * meaning that the end user loads a page with the Ooyala player, plays an asset, then redirects the page to a new URL they have specified.
     * Some browsers will start loading the new data while still displaying the player, which will result in an error since the networking has already been reset.
     * To prevent such false errors, listen to this event and ignore any errors raised after such actions have occurred.
     * <br/><br/>
     *
     *
     * @event OOV4.EVENTS#PAGE_UNLOAD_REQUESTED
     */
    PAGE_UNLOAD_REQUESTED: "pageUnloadRequested",
    // Either 1) The page is refreshing (almost certain) or 2) The user tried to refresh
    // the page, the embedding page had an "Are you sure?" prompt, the user clicked
    // on "stay", and a real error was produced due to another reason during the
    // following few seconds. The real error, if any, will be received in some seconds.
    // If we are certain it has unloaded, it's too late to be useful.
    PAGE_PROBABLY_UNLOADING: "pageProbablyUnloading",
    // DiscoveryApi publishes these, OoyalaAnalytics listens for them and propagates to reporter.js
    REPORT_DISCOVERY_IMPRESSION: "reportDiscoveryImpression",
    REPORT_DISCOVERY_CLICK: "reportDiscoveryClick",
    // These discovery events are propagated to the iq plugin
    DISCOVERY_API: {
      /**
       * Represents the discovery display event
       * @event OOV4.EVENTS.DISCOVERY_API#SEND_DISPLAY_EVENT
       * @public
      */
      SEND_DISPLAY_EVENT: "sendDisplayEvent",

      /**
       * Represents the discovery click event
       * @event OOV4.EVENTS.DISCOVERY_API#SEND_CLICK_EVENT
       * @public
      */
      SEND_CLICK_EVENT: "sendClickEvent"
    },

    /**
     * Denotes that the playlist plugin is ready and has configured the playlist Pod(s).
     * @event OOV4.EVENTS#PLAYLISTS_READY
     * @public
     */
    PLAYLISTS_READY: 'playlistReady',

    /**
     * It shows that a type of a video was changed
     * @event OOV4.EVENTS#VIDEO_TYPE_CHANGED
     * @public
     */
    VIDEO_TYPE_CHANGED: "videoTypeChanged",

    /**
     * The UI layer has finished its initial render. The handler is called with an object
     * of the following structure:
     *
     * <ul>
     *   <li>videoWrapperClass: The class name of the element containing the UI layer</li>
     *   <li>pluginsClass: The class name of the element into which the plugins content should be inserted</li>
     * </ul>
     *
     * If the UI layer doesn't require any special handling, the values for these two keys will be null.
     *
     * @event OOV4.EVENTS#UI_READY
     */
    UI_READY: "uiReady",
    __end_marker: true
  };
  /**
  * @description Represents the Ooyala V3 Player Errors. Use message bus events to handle errors by subscribing to or intercepting the <code>OOV4.EVENTS.ERROR</code> event.
  * For more information, see <a href="http://support.ooyala.com/developers/documentation/concepts/errors_overview.html" target="target">Errors and Error Handling Overview</a>.
  * @summary Represents the Ooyala V3 Player Errors.
  * @namespace OOV4.ERROR
  */

  OOV4.ERROR = {
    /**
     * @description Represents the <code>OOV4.ERROR.API</code> Ooyala V3 Player Errors. Use message bus events to handle errors by subscribing to or intercepting the <code>OOV4.EVENTS.ERROR</code> event.
    * For more information, see <a href="http://support.ooyala.com/developers/documentation/concepts/errors_overview.html" target="target">Errors and Error Handling Overview</a>.
    * @summary Represents the <code>OOV4.ERROR.API</code> Ooyala V3 Player Errors.
     * @namespace OOV4.ERROR.API
     */
    API: {
      /**
       * @description <code>OOV4.ERROR.API.NETWORK ('network')</code>: Cannot contact the server.
      * @constant OOV4.ERROR.API.NETWORK
      * @type {string}
      */
      NETWORK: 'network',

      /**
       * @description Represents the <code>OOV4.ERROR.API.SAS</code> Ooyala V3 Player Errors for the Stream Authorization Server.
       * Use message bus events to handle errors by subscribing to or intercepting the <code>OOV4.EVENTS.ERROR</code> event.
      * For more information, see <a href="http://support.ooyala.com/developers/documentation/concepts/errors_overview.html" target="target">Errors and Error Handling Overview</a>.
      * @summary Represents the <code>OOV4.ERROR.API.SAS</code> Ooyala V3 Player Errors.
       * @namespace OOV4.ERROR.API.SAS
       */
      SAS: {
        /**
         * @description <code>OOV4.ERROR.API.SAS.GENERIC ('sas')</code>: Invalid authorization response.
         * @constant OOV4.ERROR.API.SAS.GENERIC
         * @type {string}
         */
        GENERIC: 'sas',

        /**
         * @description <code>OOV4.ERROR.API.SAS.GEO ('geo')</code>: This video is not authorized for your location.
         * @constant OOV4.ERROR.API.SAS.GEO
         * @type {string}
         */
        GEO: 'geo',

        /**
         * @description <code>OOV4.ERROR.API.SAS.DOMAIN ('domain')</code>: This video is not authorized for your domain.
         * @constant OOV4.ERROR.API.SAS.DOMAIN
         * @type {string}
         */
        DOMAIN: 'domain',

        /**
         * @description <code>OOV4.ERROR.API.SAS.FUTURE ('future')</code>: This video will be available soon.
         * @constant OOV4.ERROR.API.SAS.FUTURE
         * @type {string}
         */
        FUTURE: 'future',

        /**
         * @description <code>OOV4.ERROR.API.SAS.PAST ('past')</code>: This video is no longer available.
         * @constant OOV4.ERROR.API.SAS.PAST
         * @type {string}
         */
        PAST: 'past',

        /**
         * @description <code>OOV4.ERROR.API.SAS.DEVICE ('device')</code>: This video is not authorized for playback on this device.
         * @constant OOV4.ERROR.API.SAS.DEVICE
         * @type {string}
         */
        DEVICE: 'device',

        /**
         * @description <code>OOV4.ERROR.API.SAS.PROXY ('proxy')</code>: An anonymous proxy was detected. Please disable the proxy and retry.
         * @constant OOV4.ERROR.API.SAS.PROXY
         * @type {string}
         */
        PROXY: 'proxy',

        /**
         * @description <code>OOV4.ERROR.API.SAS.CONCURRENT_STREAM ('concurrent_streams')S</code>: You have exceeded the maximum number of concurrent streams.
         * @constant OOV4.ERROR.API.SAS.CONCURRENT_STREAMS
         * @type {string}
         */
        CONCURRENT_STREAMS: 'concurrent_streams',

        /**
         * @description <code>OOV4.ERROR.API.SAS.INVALID_HEARTBEAT ('invalid_heartbeat')</code>: Invalid heartbeat response.
         * @constant OOV4.ERROR.API.SAS.INVALID_HEARTBEAT
         * @type {string}
         */
        INVALID_HEARTBEAT: 'invalid_heartbeat',

        /**
         * @description <code>OOV4.ERROR.API.SAS.ERROR_DEVICE_INVALID_AUTH_TOKEN ('device_invalid_auth_token')</code>: Invalid Ooyala Player token.
         * @constant OOV4.ERROR.API.SAS.ERROR_DEVICE_INVALID_AUTH_TOKEN
         * @type {string}
         */
        ERROR_DEVICE_INVALID_AUTH_TOKEN: 'device_invalid_auth_token',

        /**
         * @description <code>OOV4.ERROR.API.SAS.ERROR_DEVICE_LIMIT_REACHED ('device_limit_reached')</code>: The device limit has been reached.
         * The device limit is the maximum number of devices that can be registered with the viewer.
         * When the number of registered devices exceeds the device limit for the account or provider, this error is displayed.
         * @constant OOV4.ERROR.API.SAS.ERROR_DEVICE_LIMIT_REACHED
         * @type {string}
         */
        ERROR_DEVICE_LIMIT_REACHED: 'device_limit_reached',

        /**
         * @description <code>OOV4.ERROR.API.SAS.ERROR_DEVICE_BINDING_FAILED ('device_binding_failed')</code>: Device binding failed.
         * If the number of devices registered is already equal to the number of devices that may be bound for the account,
         * attempting to register a new device will result in this error.
         * @constant OOV4.ERROR.API.SAS.ERROR_DEVICE_BINDING_FAILED
         * @type {string}
         */
        ERROR_DEVICE_BINDING_FAILED: 'device_binding_failed',

        /**
         * @description <code>OOV4.ERROR.API.SAS.ERROR_DEVICE_ID_TOO_LONG ('device_id_too_long')</code>: The device ID is too long.
         * The length limit for the device ID is 1000 characters.
         * @constant OOV4.ERROR.API.SAS.ERROR_DEVICE_ID_TOO_LONG
         * @type {string}
         */
        ERROR_DEVICE_ID_TOO_LONG: 'device_id_too_long',

        /**
         * @description <code>OOV4.ERROR.API.SAS.ERROR_DRM_RIGHTS_SERVER_ERROR ('drm_server_error')</code>: DRM server error.
         * @constant OOV4.ERROR.API.SAS.ERROR_DRM_RIGHTS_SERVER_ERROR
         * @type {string}
         */
        ERROR_DRM_RIGHTS_SERVER_ERROR: 'drm_server_error',

        /**
         * @description <code>OOV4.ERROR.API.SAS.ERROR_DRM_GENERAL_FAILURE ('drm_general_failure')</code>: General error with acquiring license.
         * @constant OOV4.ERROR.API.SAS.ERROR_DRM_GENERAL_FAILURE
         * @type {string}
         */
        ERROR_DRM_GENERAL_FAILURE: 'drm_general_failure',

        /**
         * @description <code>OOV4.ERROR.API.SAS.ERROR_INVALID_ENTITLEMENTS ('invalid_entitlements')</code>: User Entitlement Terminated - Stream No Longer Active for the User.
         * @constant OOV4.ERROR.API.SAS.ERROR_INVALID_ENTITLEMENTS
         * @type {string}
         */
        ERROR_INVALID_ENTITLEMENTS: 'invalid_entitlements'
      },

      /**
       * @description <code>OOV4.ERROR.API.CONTENT_TREE ('content_tree')</code>: Invalid Content.
      * @constant OOV4.ERROR.API.CONTENT_TREE
      * @type {string}
      */
      CONTENT_TREE: 'content_tree',

      /**
       * @description <code>OOV4.ERROR.API.METADATA ('metadata')</code>: Invalid Metadata.
      * @constant OOV4.ERROR.API.METADATA
      * @type {string}
      */
      METADATA: 'metadata'
    },

    /**
     * @description Represents the <code>OOV4.ERROR.PLAYBACK</code> Ooyala V3 Player Errors. Use message bus events to handle errors by subscribing to or intercepting the <code>OOV4.EVENTS.ERROR</code> event.
    * For more information, see <a href="http://support.ooyala.com/developers/documentation/concepts/errors_overview.html" target="target">Errors and Error Handling Overview</a>.
     * @summary Represents the <code>OOV4.ERROR.PLAYBACK</code> Ooyala V3 Player Errors.
     * @namespace OOV4.ERROR.PLAYBACK
     */
    PLAYBACK: {
      /**
       * @description <code>OOV4.ERROR.PLAYBACK.GENERIC ('playback')</code>: Could not play the content.
       * @constant OOV4.ERROR.PLAYBACK.GENERIC
       * @type {string}
       */
      GENERIC: 'playback',

      /**
       * @description <code>OOV4.ERROR.PLAYBACK.STREAM ('stream')</code>: This video is not encoded for your device.
       * @constant OOV4.ERROR.PLAYBACK.STREAM
       * @type {string}
       */
      STREAM: 'stream',

      /**
       * @description <code>OOV4.ERROR.PLAYBACK.LIVESTREAM ('livestream')</code>: Live stream is off air.
       * @constant OOV4.ERROR.PLAYBACK.LIVESTREAM
       * @type {string}
       */
      LIVESTREAM: 'livestream',

      /**
       * @description <code>OOV4.ERROR.PLAYBACK.NETWORK ('network_error')</code>: The network connection was temporarily lost.
       * @constant OOV4.ERROR.PLAYBACK.NETWORK
       * @type {string}
       */
      NETWORK: 'network_error'
    },
    CHROMECAST: {
      MANIFEST: 'chromecast_manifest',
      MEDIAKEYS: 'chromecast_mediakeys',
      NETWORK: 'chromecast_network',
      PLAYBACK: 'chromecast_playback'
    },

    /**
     * @description <code>OOV4.ERROR.UNPLAYABLE_CONTENT ('unplayable_content')</code>: This video is not playable on this player.
     * @constant OOV4.ERROR.UNPLAYABLE_CONTENT
     * @type {string}
     */
    UNPLAYABLE_CONTENT: 'unplayable_content',

    /**
     * @description <code>OOV4.ERROR.INVALID_EXTERNAL_ID ('invalid_external_id')</code>: Invalid External ID.
     * @constant OOV4.ERROR.INVALID_EXTERNAL_ID
     * @type {string}
     */
    INVALID_EXTERNAL_ID: 'invalid_external_id',

    /**
     * @description <code>OOV4.ERROR.EMPTY_CHANNEL ('empty_channel')</code>: This channel is empty.
     * @constant OOV4.ERROR.EMPTY_CHANNEL
     * @type {string}
     */
    EMPTY_CHANNEL: 'empty_channel',

    /**
     * @description <code>OOV4.ERROR.EMPTY_CHANNEL_SET ('empty_channel_set')</code>: This channel set is empty.
     * @constant OOV4.ERROR.EMPTY_CHANNEL_SET
     * @type {string}
     */
    EMPTY_CHANNEL_SET: 'empty_channel_set',

    /**
     * @description <code>OOV4.ERROR.CHANNEL_CONTENT ('channel_content')</code>: This channel is not playable at this time.
     * @constant OOV4.ERROR.CHANNEL_CONTENT
     * @type {string}
     */
    CHANNEL_CONTENT: 'channel_content',

    /**
     * @description Represents the <code>OOV4.ERROR.VC</code> Ooyala V4 Player Errors for the Video Technology stack.
     * Use message bus events to handle errors by subscribing to or intercepting the <code>OOV4.EVENTS.ERROR</code> event.
         * For more information, see <a href="http://support.ooyala.com/developers/documentation/concepts/errors_overview.html" target="target">Errors and Error Handling Overview</a>.
         * @summary Represents the <code>OOV4.ERROR.VC</code> Ooyala V4 Player Errors.
     * @namespace OOV4.ERROR.VC
     */
    VC: {
      /**
      * @description <code>OOV4.ERROR.VC.UNSUPPORTED_ENCODING ('unsupported_encoding')</code>:
      *    This device does not have an available decoder for this stream type.
      * @constant OOV4.ERROR.VC.UNSUPPORTED_ENCODING
      * @type {string}
      */
      UNSUPPORTED_ENCODING: 'unsupported_encoding',

      /**
      * @description <code>OOV4.ERROR.VC.UNABLE_TO_CREATE_VIDEO_ELEMENT ('unable_to_create_video_element')</code>:
      *    A video element to play the given stream could not be created
      * @constant OOV4.ERROR.VC.UNABLE_TO_CREATE_VIDEO_ELEMENT
      * @type {string}
      */
      UNABLE_TO_CREATE_VIDEO_ELEMENT: 'unable_to_create_video_element'
    },

    /**
     * @namespace OOV4.ERROR.MEDIA
     */
    MEDIA: {
      /**
       * @description <code>OOV4.ERROR.MEDIA.MEDIA_ERR_ABORTED ('aborted')</code>:
       * The fetching of the associated resource was aborted by the user's request.
       * @constant OOV4.ERROR.MEDIA.MEDIA_ERR_ABORTED
       * @type {string}
       */
      MEDIA_ERR_ABORTED: "aborted",

      /**
       * @description <code>OOV4.ERROR.MEDIA.MEDIA_ERR_NETWORK ('aborted')</code>:
       * Some kind of network error occurred which prevented the media from being
       * successfully fetched, despite having previously been available.
       * @constant OOV4.ERROR.MEDIA.MEDIA_ERR_NETWORK
       * @type {string}
       */
      MEDIA_ERR_NETWORK: "network_error",

      /**
       * @description <code>OOV4.ERROR.MEDIA.MEDIA_ERR_DECODE ('aborted')</code>:
       * Despite having previously been determined to be usable, an error occurred
       * while trying to decode the media resource, resulting in an error.
       * @constant OOV4.ERROR.MEDIA.MEDIA_ERR_DECODE
       * @type {string}
       */
      MEDIA_ERR_DECODE: "decode_error",

      /**
       * @description <code>OOV4.ERROR.MEDIA.MEDIA_ERR_SRC_NOT_SUPPORTED ('aborted')</code>:
       * The associated resource or media provider object has been found to be unsuitable.
       * @constant OOV4.ERROR.MEDIA.MEDIA_ERR_SRC_NOT_SUPPORTED
       * @type {string}
       */
      MEDIA_ERR_SRC_NOT_SUPPORTED: "unsupported_source"
    }
  }; // All Server-side URLS

  OOV4.URLS = {
    VAST_PROXY: _.template('http://player.ooyala.com/nuplayer/mobile_vast_ads_proxy?callback=<%=cb%>&embed_code=<%=embedCode%>&expires=<%=expires%>&tag_url=<%=tagUrl%>'),
    EXTERNAL_ID: _.template('<%=server%>/player_api/v1/content_tree/external_id/<%=pcode%>/<%=externalId%>'),
    CONTENT_TREE: _.template('<%=server%>/player_api/v1/content_tree/embed_code/<%=pcode%>/<%=embedCode%>'),
    METADATA: _.template('<%=server%>/player_api/v1/metadata/embed_code/<%=playerBrandingId%>/<%=embedCode%>?videoPcode=<%=pcode%>'),
    SAS: _.template('<%=server%>/player_api/v1/authorization/embed_code/<%=pcode%>/<%=embedCode%>'),
    ANALYTICS: _.template('<%=server%>/reporter.js'),
    THUMBNAILS: _.template('<%=server%>/api/v1/thumbnail_images/<%=embedCode%>'),
    __end_marker: true
  };
  /**
   * Defines all the possible tracking levels for analytics.
   * @private
   */

  OOV4.TRACKING_LEVEL = {
    /**
     * Default tracking level. Full tracking enabled.
     * @private
     */
    DEFAULT: 'default',

    /**
     * Anonymous mode. Tracking is enabled but a new GUID is created for each session.
     * GUID not saved in local storage.
     * @private
     */
    ANONYMOUS: 'anonymous',

    /**
     * Tracking completely disabled. IQ, Librato and Analytics plugins are not loaded.
     * GUID not saved in local storage.
     * @private
     */
    DISABLED: 'disabled'
  };
  OOV4.PLUGINS = {
    ADS: "ads",
    VIDEO: "video",
    ANALYTICS: "analytics",
    PLAYLIST: "playlist",
    SKIN: "skin"
  };
  OOV4.VIDEO = {
    MAIN: "main",
    ADS: "ads",

    /**
     * @description Represents the <code>OOV4.VIDEO.ENCODING</code> encoding types. Used to denote video
     *              encoding types associated with a video stream url.
     * @summary Represents the <code>OOV4.VIDEO.ENCODING</code> encoding types.
     * @namespace OOV4.VIDEO.ENCODING
     */
    ENCODING: {
      /**
       * @description Represents DRM support for the encoding types.
       * @summary Represents the <code>OOV4.VIDEO.ENCODING.DRM</code> encoding types.
       * @namespace OOV4.VIDEO.ENCODING.DRM
       */
      DRM: {
        /**
         * @description <code>OOV4.VIDEO.ENCODING.DRM.HLS ('hls_drm')</code>:
         *   An encoding type for drm HLS streams.
         * @constant OOV4.VIDEO.ENCODING.DRM.HLS
         * @type {string}
         */
        HLS: "hls_drm",

        /**
         * @description <code>OOV4.VIDEO.ENCODING.DRM.DASH ('dash_drm')</code>:
         *   An encoding type for drm dash streams.
         * @constant OOV4.VIDEO.ENCODING.DRM.DASH
         * @type {string}
         */
        DASH: "dash_drm"
      },

      /**
       * @description <code>OOV4.VIDEO.ENCODING.AUDIO ('audio')</code>:
       *   An encoding type for non-drm audio streams.
       * @constant OOV4.VIDEO.ENCODING.AUDIO
       * @type {string}
       */
      AUDIO: "audio",

      /**
      * @description <code>OOV4.VIDEO.ENCODING.OGG ('ogg')</code>:
      *   An encoding type for non-drm ogg audio streams.
      * @constant OOV4.VIDEO.ENCODING.OGG
      * @type {string}
      */
      OGG: "ogg",

      /**
       * @description <code>OOV4.VIDEO.ENCODING.M4A ('m4a')</code>:
       *   An encoding type for non-drm m4a audio streams.
       * @constant OOV4.VIDEO.ENCODING.M4A
       * @type {string}
       */
      M4A: "m4a",

      /**
       * @description <code>OOV4.VIDEO.ENCODING.AUDIO_HLS ('audio_hls')</code>:
       *   An encoding type for non-drm audio only HLS streams.
       * @constant OOV4.VIDEO.ENCODING.AUDIO_HLS
       * @type {string}
       */
      AUDIO_HLS: "audio_hls",

      /**
       * @description <code>OOV4.VIDEO.ENCODING.DASH ('dash')</code>:
       *   An encoding type for non-drm dash streams (mpd extension).
       * @constant OOV4.VIDEO.ENCODING.DASH
       * @type {string}
       */
      DASH: "dash",

      /**
       * @description <code>OOV4.VIDEO.ENCODING.HDS ('hds')</code>:
       *   An encoding type for non-drm hds streams (hds extension).
       * @constant OOV4.VIDEO.ENCODING.HDS
       * @type {string}
       */
      HDS: "hds",

      /**
       * @description <code>OOV4.VIDEO.ENCODING.HLS ('hls')</code>:
       *   An encoding type for non-drm HLS streams (m3u8 extension).
       * @constant OOV4.VIDEO.ENCODING.HLS
       * @type {string}
       */
      HLS: "hls",

      /**
       * @description <code>OOV4.VIDEO.ENCODING.IMA ('ima')</code>:
       *   A string that represents a video stream that is controlled and configured directly by IMA.
       * @constant OOV4.VIDEO.ENCODING.IMA
       * @type {string}
       */
      IMA: "ima",

      /**
       * @description <code>OOV4.VIDEO.ENCODING.PULSE ('pulse')</code>:
       *   A string that represents a video stream that is controlled and configured directly by Pulse.
       * @constant OOV4.VIDEO.ENCODING.PULSE
       * @type {string}
       */
      PULSE: "pulse",

      /**
       * @description <code>OOV4.VIDEO.ENCODING.MP4 ('mp4')</code>:
       *   An encoding type for non-drm mp4 streams (mp4 extension).
       * @constant OOV4.VIDEO.ENCODING.MP4
       * @type {string}
       */
      MP4: "mp4",

      /**
       * @description <code>OOV4.VIDEO.ENCODING.YOUTUBE ('youtube')</code>:
       *   An encoding type for non-drm youtube streams.
       * @constant OOV4.VIDEO.ENCODING.YOUTUBE
       * @type {string}
       */
      YOUTUBE: "youtube",

      /**
       * @description <code>OOV4.VIDEO.ENCODING.RTMP ('rtmp')</code>:
       *   An encoding type for non-drm rtmp streams.
       * @constant OOV4.VIDEO.ENCODING.RTMP
       * @type {string}
       */
      RTMP: "rtmp",

      /**
       * @description <code>OOV4.VIDEO.ENCODING.SMOOTH ('smooth')</code>:
       *   An encoding type for non-drm smooth streams.
       * @constant OOV4.VIDEO.ENCODING.SMOOTH
       * @type {string}
       */
      SMOOTH: "smooth",

      /**
       * @description <code>OOV4.VIDEO.ENCODING.WEBM ('webm')</code>:
       *   An encoding type for non-drm webm streams (webm extension).
       * @constant OOV4.VIDEO.ENCODING.WEBM
       * @type {string}
       */
      WEBM: "webm",

      /**
       * @description <code>OOV4.VIDEO.ENCODING.AKAMAI_HD_VOD ('akamai_hd_vod')</code>:
       *   An encoding type for akamai hd vod streams.
       * @constant OOV4.VIDEO.ENCODING.AKAMAI_HD_VOD
       * @type {string}
       */
      AKAMAI_HD_VOD: "akamai_hd_vod",

      /**
       * @description <code>OOV4.VIDEO.ENCODING.AKAMAI_HD2_VOD_HLS ('akamai_hd2_vod_hls')</code>:
       *   An encoding type for akamai hd2 vod hls streams.
       * @constant OOV4.VIDEO.ENCODING.AKAMAI_HD2_VOD_HLS
       * @type {string}
       */
      AKAMAI_HD2_VOD_HLS: "akamai_hd2_vod_hls",

      /**
       * @description <code>OOV4.VIDEO.ENCODING.AKAMAI_HD2_VOD_HDS ('akamai_hd2_vod_hds')</code>:
       *   An encoding type for akamai hd2 vod hds streams.
       * @constant OOV4.VIDEO.ENCODING.AKAMAI_HD2_VOD_HDS
       * @type {string}
       */
      AKAMAI_HD2_VOD_HDS: "akamai_hd2_vod_hds",

      /**
       * @description <code>OOV4.VIDEO.ENCODING.AKAMAI_HD2_HDS ('akamai_hd2_hds')</code>:
       *   An encoding type for akamai hd2 live/remote hds streams.
       * @constant OOV4.VIDEO.ENCODING.AKAMAI_HD2_HDS
       * @type {string}
       */
      AKAMAI_HD2_HDS: "akamai_hd2_hds",

      /**
       * @description <code>OOV4.VIDEO.ENCODING.AKAMAI_HD2_HLS ('akamai_hd2_hls')</code>:
       *   An encoding type for akamai hd2 live hls streams.
       * @constant OOV4.VIDEO.ENCODING.AKAMAI_HD2_HLS
       * @type {string}
       */
      AKAMAI_HD2_HLS: "akamai_hd2_hls",

      /**
       * @description <code>OOV4.VIDEO.ENCODING.FAXS_HLS ('faxs_hls')</code>:
       *   An encoding type for adobe faxs streams.
       * @constant OOV4.VIDEO.ENCODING.FAXS_HLS
       * @type {string}
       */
      FAXS_HLS: "faxs_hls",

      /**
       * @description <code>OOV4.VIDEO.ENCODING.WIDEVINE_HLS ('wv_hls')</code>:
       *   An encoding type for widevine hls streams.
       * @constant OOV4.VIDEO.ENCODING.WIDEVINE_HLS
       * @type {string}
       */
      WIDEVINE_HLS: "wv_hls",

      /**
       * @description <code>OOV4.VIDEO.ENCODING.WIDEVINE_MP4 ('wv_mp4')</code>:
       *   An encoding type for widevine mp4 streams.
       * @constant OOV4.VIDEO.ENCODING.WIDEVINE_MP4
       * @type {string}
       */
      WIDEVINE_MP4: "wv_mp4",

      /**
       * @description <code>OOV4.VIDEO.ENCODING.WIDEVINE_WVM ('wv_wvm')</code>:
       *   An encoding type for widevine wvm streams.
       * @constant OOV4.VIDEO.ENCODING.WIDEVINE_WVM
       * @type {string}
       */
      WIDEVINE_WVM: "wv_wvm",

      /**
       * @description <code>OOV4.VIDEO.ENCODING.UNKNOWN ('unknown')</code>:
       *   An encoding type for unknown streams.
       * @constant OOV4.VIDEO.ENCODING.UNKNOWN
       * @type {string}
       */
      UNKNOWN: "unknown"
    },

    /**
     * @description Represents the <code>OOV4.VIDEO.FEATURE</code> feature list. Used to denote which
     * features are supported by a video player.
     * @summary Represents the <code>OOV4.VIDEO.FEATURE</code> feature list.
     * @namespace OOV4.VIDEO.FEATURE
     */
    FEATURE: {
      /**
       * @description <code>OOV4.VIDEO.FEATURE.CLOSED_CAPTIONS ('closedCaptions')</code>:
       *   Closed captions parsed by the video element and sent to the player.
       * @constant OOV4.VIDEO.FEATURE.CLOSED_CAPTIONS
       * @type {string}
       */
      CLOSED_CAPTIONS: "closedCaptions",

      /**
       * @description <code>OOV4.VIDEO.FEATURE.VIDEO_OBJECT_SHARING_GIVE ('videoObjectSharingGive')</code>:
       *   The video object is accessible and can be found by the player via the DOM element id.  Other
       *   modules can use this video object if required.
       * @constant OOV4.VIDEO.FEATURE.VIDEO_OBJECT_SHARING_GIVE
       * @type {string}
       */
      VIDEO_OBJECT_SHARING_GIVE: "videoObjectSharingGive",

      /**
       * @description <code>OOV4.VIDEO.FEATURE.VIDEO_OBJECT_SHARING_TAKE ('videoObjectSharingTake')</code>:
       *   The video object used can be created external from this video plugin.  This plugin will use the
       *   existing video element as its own.
       * @constant OOV4.VIDEO.FEATURE.VIDEO_OBJECT_SHARING_TAKE
       * @type {string}
       */
      VIDEO_OBJECT_SHARING_TAKE: "videoObjectSharingTake",

      /**
       * @description <code>OOV4.VIDEO.FEATURE.BITRATE_CONTROL ('bitrateControl')</code>:
       *   The video object allows the playing bitrate to be selected via the SET_TARGET_BITRATE event.
       *   The video controller must publish BITRATE_INFO_AVAILABLE with a list of bitrate objects that can be selected.
       *   The video controller must publish BITRATE_CHANGED events with the bitrate object that was switched to.
       *   A bitrate object should at minimum contain height, width, and bitrate properties. Height and width
       *   should be the vertical and horizontal resoluton of the stream and bitrate should be in bits per second.
       * @constant OOV4.VIDEO.FEATURE.BITRATE_CONTROL
       * @type {string}
       */
      BITRATE_CONTROL: "bitrateControl"
    },

    /**
     * @description Represents the <code>OOV4.VIDEO.TECHNOLOGY</code> core video technology.
     * @summary Represents the <code>OOV4.VIDEO.TECHNOLOGY</code> core technology of the video element.
     * @namespace OOV4.VIDEO.TECHNOLOGY
     */
    TECHNOLOGY: {
      /**
       * @description <code>OOV4.VIDEO.TECHNOLOGY.FLASH ('flash')</code>:
       *   The core video technology is based on Adobe Flash.
       * @constant OOV4.VIDEO.TECHNOLOGY.FLASH
       * @type {string}
       */
      FLASH: "flash",

      /**
       * @description <code>OOV4.VIDEO.TECHNOLOGY.HTML5 ('html5')</code>:
       *   The core video technology is based on the native html5 'video' tag.
       * @constant OOV4.VIDEO.TECHNOLOGY.HTML5
       * @type {string}
       */
      HTML5: "html5",

      /**
       * @description <code>OOV4.VIDEO.TECHNOLOGY.MIXED ('mixed')</code>:
       *   The core video technology used may be based on any one of multiple core technologies.
       * @constant OOV4.VIDEO.TECHNOLOGY.MIXED
       * @type {string}
       */
      MIXED: "mixed",

      /**
       * @description <code>OOV4.VIDEO.TECHNOLOGY.OTHER ('other')</code>:
       *   The video is based on a core video technology that doesn't fit into another classification
       *   found in <code>OOV4.VIDEO.TECHNOLOGY</code>.
       * @constant OOV4.VIDEO.TECHNOLOGY.OTHER
       * @type {string}
       */
      OTHER: "other"
    }
  };
  OOV4.CSS = {
    VISIBLE_POSITION: "0px",
    INVISIBLE_POSITION: "-100000px",
    VISIBLE_DISPLAY: "block",
    INVISIBLE_DISPLAY: "none",
    VIDEO_Z_INDEX: 10000,
    SUPER_Z_INDEX: 20000,
    ALICE_SKIN_Z_INDEX: 11000,
    OVERLAY_Z_INDEX: 10500,
    TRANSPARENT_COLOR: "rgba(255, 255, 255, 0)",
    __end_marker: true
  };
  OOV4.TEMPLATES = {
    RANDOM_PLACE_HOLDER: ['[place_random_number_here]', '<now>', '[timestamp]', '<rand-num>', '[cache_buster]', '[random]'],
    REFERAK_PLACE_HOLDER: ['[referrer_url]', '[LR_URL]', '[description_url]'],
    EMBED_CODE_PLACE_HOLDER: ['[oo_embedcode]'],
    MESSAGE: '\
                  <table width="100%" height="100%" bgcolor="black" style="padding-left:55px; padding-right:55px; \
                  background-color:black; color: white;">\
                  <tbody>\
                  <tr valign="middle">\
                  <td align="right"><span style="font-family:Arial; font-size:20px">\
                  <%= message %>\
                  </span></td></tr></tbody></table>\
                  ',
    __end_marker: true
  };
  OOV4.CONSTANTS = {
    // Ad frequency constants
    AD_PLAY_COUNT_KEY: "oo_ad_play_count",
    AD_ID_TO_PLAY_COUNT_DIVIDER: ":",
    AD_PLAY_COUNT_DIVIDER: "|",
    MAX_AD_PLAY_COUNT_HISTORY_LENGTH: 20,
    CONTROLS_BOTTOM_PADDING: 10,
    SEEK_TO_END_LIMIT: 4,

    /**
     * @description <code>OOV4.CONSTANTS.PLAYER_TYPE</code>:
     *   An object containing the possible modes in which the player can operate.
     * @constant OOV4.CONSTANTS.PLAYER_TYPE
     * @type {object}
     */
    PLAYER_TYPE: {
      /**
       * @description <code>OOV4.CONSTANTS.PLAYER_TYPE.VIDEO ('video')</code>:
       *   The default player type (video player).
       * @constant OOV4.CONSTANTS.PLAYER_TYPE.VIDEO
       * @type {string}
       */
      VIDEO: 'video',

      /**
       * @description <code>OOV4.CONSTANTS.PLAYER_TYPE.AUDIO ('audio')</code>:
       *   The audio-only player type.
       * @constant OOV4.CONSTANTS.PLAYER_TYPE.AUDIO
       * @type {string}
       */
      AUDIO: 'audio'
    },
    HEVC_CODEC: {
      HEV1: "hev1",
      HVC1: "hvc1"
    },

    /**
     * @description <code>OOV4.CONSTANTS.CLOSED_CAPTIONS</code>:
     *   An object containing the possible modes for the closed caption text tracks.
     * @constant OOV4.CONSTANTS.CLOSED_CAPTIONS
     * @type {object}
     */
    CLOSED_CAPTIONS: {
      /**
       * @description <code>OOV4.CONSTANTS.CLOSED_CAPTIONS.SHOWING ('showing')</code>:
       *   Closed caption text track mode for showing closed captions.
       * @constant OOV4.CONSTANTS.CLOSED_CAPTIONS.SHOWING
       * @type {string}
       */
      SHOWING: "showing",

      /**
       * @description <code>OOV4.CONSTANTS.CLOSED_CAPTIONS.HIDDEN ('hidden')</code>:
       *   Closed caption text track mode for hiding closed captions.
       * @constant OOV4.CONSTANTS.CLOSED_CAPTIONS.HIDDEN
       * @type {string}
       */
      HIDDEN: "hidden",

      /**
       * @description <code>OOV4.CONSTANTS.CLOSED_CAPTIONS.DISABLED ('disabled')</code>:
       *   Closed caption text track mode for disabling closed captions.
       * @constant OOV4.CONSTANTS.CLOSED_CAPTIONS.DISABLED
       * @type {string}
       */
      DISABLED: "disabled"
    },
    OOYALA_PLAYER_SETTINGS_KEY: 'ooyala_player_settings',
    PLAYBACK_SPEED: {
      /**
       * The minimum allowed speed multiplier for a video playback.
       * @constant OOV4.CONSTANTS.PLAYBACK_SPEED.MIN
       * @type {Number}
       */
      MIN: 0.5,

      /**
       * @description The maximum allowed speed multiplier for a video playback.
       * @constant OOV4.CONSTANTS.PLAYBACK_SPEED.MAX
       * @type {Number}
       */
      MAX: 2.0
    },
    __end_marker: true
  };
})(OOV4, OOV4._);

},{}],5:[function(require,module,exports){
(function (OOV4, _, HM) {
  // Ensure playerParams exists
  OOV4.playerParams = HM.safeObject('environment.playerParams', OOV4.playerParams, {}); // Init publisher's OOV4.playerParams via player parameter object

  OOV4.configurePublisher = function (parameters) {
    OOV4.playerParams.pcode = parameters.pcode || OOV4.playerParams.pcode || '';
    OOV4.playerParams.playerBrandingId = parameters.playerBrandingId || OOV4.playerParams.playerBrandingId || '';
    OOV4.playerParams.playerType = parameters.playerType || OOV4.playerParams.playerType || OOV4.CONSTANTS.PLAYER_TYPE.VIDEO;
    OOV4.playerParams.debug = parameters.debug || OOV4.playerParams.debug || '';
  };

  OOV4.isPublisherConfigured = function () {
    return !!(OOV4.playerParams.pcode && OOV4.playerParams.playerBrandingId);
  }; // Set API end point environment


  OOV4.setServerHost = function (parameters) {
    OOV4.playerParams.api_ssl_server = parameters.api_ssl_server || OOV4.playerParams.api_ssl_server || null;
    OOV4.playerParams.api_server = parameters.api_server || OOV4.playerParams.api_server || null;
    OOV4.playerParams.auth_ssl_server = parameters.auth_ssl_server || OOV4.playerParams.auth_ssl_server || null;
    OOV4.playerParams.auth_server = parameters.auth_server || OOV4.playerParams.auth_server || null;
    OOV4.playerParams.analytics_ssl_server = parameters.analytics_ssl_server || OOV4.playerParams.analytics_ssl_server || null;
    OOV4.playerParams.analytics_server = parameters.analytics_server || OOV4.playerParams.analytics_server || null;
    updateServerHost();
  };

  var updateServerHost = function () {
    OOV4.SERVER = {
      API: OOV4.isSSL ? OOV4.playerParams.api_ssl_server || "https://player.ooyala.com" : OOV4.playerParams.api_server || "http://player.ooyala.com",
      AUTH: OOV4.isSSL ? OOV4.playerParams.auth_ssl_server || "https://player.ooyala.com/sas" : OOV4.playerParams.auth_server || "http://player.ooyala.com/sas",
      ANALYTICS: OOV4.isSSL ? OOV4.playerParams.analytics_ssl_server || "https://player.ooyala.com" : OOV4.playerParams.analytics_server || "http://player.ooyala.com"
    };
  }; // process tweaks
  // tweaks is optional. Hazmat takes care of this but throws an undesirable warning.


  OOV4.playerParams.tweaks = OOV4.playerParams.tweaks || '';
  OOV4.playerParams.tweaks = HM.safeString('environment.playerParams.tweaks', OOV4.playerParams.tweaks, '');
  OOV4.playerParams.tweaks = OOV4.playerParams.tweaks.split(','); // explicit list of supported tweaks

  OOV4.tweaks = {};
  OOV4.tweaks["android-enable-hls"] = _.contains(OOV4.playerParams.tweaks, 'android-enable-hls');
  OOV4.tweaks["html5-force-mp4"] = _.contains(OOV4.playerParams.tweaks, 'html5-force-mp4'); // Max timeout for fetching ads metadata, default to 3 seconds.

  OOV4.playerParams.maxAdsTimeout = OOV4.playerParams.maxAdsTimeout || 5; // max wrapper ads depth we look, we will only look up to 3 level until we get vast inline ads

  OOV4.playerParams.maxVastWrapperDepth = OOV4.playerParams.maxVastWrapperDepth || 3;
  OOV4.playerParams.minLiveSeekWindow = OOV4.playerParams.minLiveSeekWindow || 10; // Ripped from: http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript

  OOV4.guid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0,
        v = c == 'x' ? r : r & 0x3 | 0x8;
    return v.toString(16);
  });
  OOV4.playerCount = 0; // Check environment to see if this is prod

  OOV4.isProd = !!(OOV4.playerParams.environment && OOV4.playerParams.environment.match(/^prod/i)); // Environment invariant.

  OOV4.platform = window.navigator.platform;
  OOV4.os = window.navigator.appVersion;
  OOV4.supportsVideo = !!document.createElement('video').canPlayType;

  OOV4.browserSupportsCors = function () {
    try {
      return _.has(new XMLHttpRequest(), "withCredentials") || _.has(XMLHttpRequest.prototype, "withCredentials");
    } catch (e) {
      return false;
    }
  }();

  OOV4.isWindows = function () {
    return !!OOV4.platform.match(/Win/);
  }();

  OOV4.isIos = function () {
    return !!OOV4.platform.match(/iPhone|iPad|iPod/);
  }();

  OOV4.isIphone = function () {
    return !!OOV4.platform.match(/iPhone|iPod/);
  }();

  OOV4.isIpad = function () {
    return !!OOV4.platform.match(/iPad/);
  }();

  OOV4.iosMajorVersion = function () {
    try {
      if (OOV4.isIos) {
        return parseInt(window.navigator.userAgent.match(/OS (\d+)/)[1], 10);
      } else {
        return null;
      }
    } catch (err) {
      return null;
    }
  }();

  OOV4.isAndroid = function () {
    return !!(OOV4.os.match(/Android/) && !OOV4.os.match(/Windows Phone/));
  }();

  OOV4.isAndroid4Plus = function () {
    var version = OOV4.os.match(/Android [\d\.]*;/);

    if (version && version.length > 0) {
      version = parseInt(version[0].substring(version[0].indexOf(' ') + 1, version[0].search('[\.\;]')));
    }

    return OOV4.isAndroid && version >= 4;
  }();
  /**
   * Check if Android version > 4.3
   * @returns {boolean} true if OS is not Android or Android version > 4.3 otherwise false
   */


  OOV4.isAndroid4_4Plus = function () {
    var isAndroid4_4Plus = false;

    if (OOV4.isAndroid) {
      var userAgent = OOV4.os.match(/Android [\d\.]*;/);

      if (userAgent && userAgent.length) {
        var userAgentLowerCase = userAgent[0].toLowerCase();
        var version = userAgentLowerCase.match(/android\s([0-9\.]*)/)[1];
        var android4_3 = 4.3;
        isAndroid4_4Plus = parseFloat(version) > android4_3;
      }
    }

    return isAndroid4_4Plus;
  }();

  OOV4.isRimDevice = function () {
    return !!(OOV4.os.match(/BlackBerry/) || OOV4.os.match(/PlayBook/));
  }();

  OOV4.isFirefox = function () {
    return !!window.navigator.userAgent.match(/Firefox/);
  }();

  OOV4.isChrome = function () {
    return !!window.navigator.userAgent.match(/Chrome/) && !window.navigator.userAgent.match(/Edge/);
  }();

  OOV4.isSafari = function () {
    return !!window.navigator.userAgent.match(/AppleWebKit/) && !window.navigator.userAgent.match(/Chrome/) && !window.navigator.userAgent.match(/like iPhone/);
  }();

  OOV4.chromeMajorVersion = function () {
    try {
      return parseInt(window.navigator.userAgent.match(/Chrome.([0-9]*)/)[1], 10);
    } catch (err) {
      return null;
    }
  }();

  OOV4.isIE = function () {
    return !!window.navigator.userAgent.match(/MSIE/) || !!window.navigator.userAgent.match(/Trident/);
  }();

  OOV4.isEdge = function () {
    return !!window.navigator.userAgent.match(/Edge/);
  }();

  OOV4.isIE11Plus = function () {
    // check if IE
    if (!window.navigator.userAgent.match(/Trident/)) {
      return false;
    } // extract version number


    var ieVersionMatch = window.navigator.userAgent.match(/rv:(\d*)/);
    var ieVersion = ieVersionMatch && ieVersionMatch[1];
    return ieVersion >= 11;
  }();

  OOV4.isWinPhone = function () {
    return !!OOV4.os.match(/Windows Phone/) || !!OOV4.os.match(/ZuneWP/) || !!OOV4.os.match(/XBLWP/);
  }();

  OOV4.isSmartTV = function () {
    return !!window.navigator.userAgent.match(/SmartTV/) || !!window.navigator.userAgent.match(/NetCast/);
  }();

  OOV4.isMacOs = function () {
    return !OOV4.isIos && !!OOV4.os.match(/Mac/) && !window.navigator.userAgent.match(/like iPhone/);
  }();

  OOV4.isMacOsLionOrLater = function () {
    // TODO: revisit for Firefox when possible/necessary
    var macOs = OOV4.os.match(/Mac OS X ([0-9]+)_([0-9]+)/);

    if (macOs == null || macOs.length < 3) {
      return false;
    }

    return parseInt(macOs[1], 10) >= 10 && parseInt(macOs[2], 10) >= 7;
  }();

  OOV4.macOsSafariVersion = function () {
    try {
      if (OOV4.isMacOs && OOV4.isSafari) {
        return parseInt(window.navigator.userAgent.match(/Version\/(\d+)/)[1], 10);
      } else {
        return null;
      }
    } catch (err) {
      return null;
    }
  }();

  OOV4.isKindleHD = function () {
    return !!OOV4.os.match(/Silk\/2/);
  }();

  OOV4.supportMSE = function () {
    return 'MediaSource' in window || 'WebKitMediaSource' in window || 'mozMediaSource' in window || 'msMediaSource' in window;
  }();

  OOV4.supportAds = function () {
    // We are disabling ads for Android 2/3 device, the reason is that main video is not resuming after
    // ads finish. Util we can figure out a work around, we will keep ads disabled.
    return !OOV4.isWinPhone && !OOV4.os.match(/Android [23]/);
  }();

  OOV4.allowGesture = function () {
    return OOV4.isIos;
  }();

  OOV4.allowAutoPlay = function () {
    return !OOV4.isIos && !OOV4.isAndroid;
  }();

  OOV4.supportTouch = function () {
    // IE8- doesn't support JS functions on DOM elements
    if (document.documentElement.hasOwnProperty && document.documentElement.hasOwnProperty("ontouchstart")) {
      return true;
    }

    return false;
  }();

  OOV4.docDomain = function () {
    var domain = null;

    try {
      domain = document.domain;
    } catch (e) {}

    if (!OOV4._.isEmpty(domain)) {
      return domain;
    }

    if (OOV4.isSmartTV) {
      return 'SmartTV';
    }

    return 'unknown';
  }();

  OOV4.uiParadigm = function () {
    var paradigm = 'tablet'; // The below code attempts to decide whether or not we are running in 'mobile' mode
    // Meaning that no controls are displayed, chrome is minimized and only fullscreen playback is allowed
    // Unfortunately there is no clean way to figure out whether the device is tablet or phone
    // or even to properly detect device screen size http://tripleodeon.com/2011/12/first-understand-your-screen/
    // So there is a bunch of heuristics for doing just that
    // Anything that is not explicitly detected as mobile defaults to desktop
    // so worst case they get ugly chrome instead of unworking player

    if (OOV4.isAndroid4Plus && OOV4.tweaks["android-enable-hls"]) {
      // special case for Android 4+ running HLS
      paradigm = 'tablet';
    } else if (OOV4.isIphone) {
      paradigm = 'mobile-native';
    } else if (OOV4.os.match(/BlackBerry/)) {
      paradigm = 'mobile-native';
    } else if (OOV4.os.match(/iPad/)) {
      paradigm = 'tablet';
    } else if (OOV4.isKindleHD) {
      // Kindle Fire HD
      paradigm = 'mobile-native';
    } else if (OOV4.os.match(/Silk/)) {
      // Kindle Fire
      paradigm = 'mobile';
    } else if (OOV4.os.match(/Android 2/)) {
      // On Android 2+ only window.outerWidth is reliable, so we are using that and window.orientation
      if (window.orientation % 180 == 0 && window.outerWidth / window.devicePixelRatio <= 480) {
        // portrait mode
        paradigm = 'mobile';
      } else if (window.outerWidth / window.devicePixelRatio <= 560) {
        // landscape mode
        paradigm = 'mobile';
      }
    } else if (OOV4.os.match(/Android/)) {
      paradigm = 'tablet';
    } else if (OOV4.isWinPhone) {
      // Windows Phone is mobile only for now, tablets not yet released
      paradigm = 'mobile';
    } else if (!!OOV4.platform.match(/Mac/) // Macs
    || !!OOV4.platform.match(/Win/) // Winboxes
    || !!OOV4.platform.match(/Linux/)) {
      // Linux
      paradigm = 'desktop';
    }

    return paradigm;
  }();
  /**
   * Determines if a single video element should be used.<br/>
   * <ul><li>Use single video element on iOS, all versions</li>
   *     <li>Use single video element on Android, all versions</li></ul>
   * 01/11/17 Previous JSDoc for Android - to be removed once fix is confirmed and there is no regression:<br />
   * <ul><li>Use single video element on Android < v4.0</li>
   *     <li>Use single video element on Android with Chrome < v40<br/>
   *       (note, it might work on earlier versions but don't know which ones! Does not work on v18)</li></ul>
   *
   * @private
   * @returns {boolean} True if a single video element is required
   */


  OOV4.requiresSingleVideoElement = function () {
    return OOV4.isIos || OOV4.isAndroid; // 01/11/17 - commenting out, but not removing three lines below pending QA, we may need to restore this logic
    //var iosRequireSingleElement = OOV4.isIos;
    //var androidRequireSingleElement = OOV4.isAndroid && (!OOV4.isAndroid4Plus || OOV4.chromeMajorVersion < 40);
    // return iosRequireSingleElement || androidRequireSingleElement;
  }(); // TODO(jj): need to make this more comprehensive
  // Note(jj): only applies to mp4 videos for now


  OOV4.supportedVideoProfiles = function () {
    // iOS only supports baseline profile
    if (OOV4.isIos || OOV4.isAndroid) {
      return "baseline";
    }

    return null;
  }(); // TODO(bz): add flash for device when we decide to use stream data from sas
  // TODO(jj): add AppleTV and other devices as necessary


  OOV4.device = function () {
    var device = 'html5';

    if (OOV4.isIphone) {
      device = 'iphone-html5';
    } else if (OOV4.isIpad) {
      device = 'ipad-html5';
    } else if (OOV4.isAndroid) {
      device = 'android-html5';
    } else if (OOV4.isRimDevice) {
      device = 'rim-html5';
    } else if (OOV4.isWinPhone) {
      device = 'winphone-html5';
    } else if (OOV4.isSmartTV) {
      device = 'smarttv-html5';
    }

    return device;
  }(); // list of environment-specific modules needed by the environment or empty to include all
  // Note: should never be empty because of html5


  OOV4.environmentRequiredFeatures = function () {
    var features = [];

    if (OOV4.os.match(/Android 2/)) {
      // safari android
      features.push('html5-playback');
    } else {
      // normal html5
      features.push('html5-playback');

      if (OOV4.supportAds) {
        features.push('ads');
      }
    }

    return _.reduce(features, function (memo, feature) {
      return memo + feature + ' ';
    }, '');
  }();

  OOV4.supportMidRollAds = function () {
    return OOV4.uiParadigm === "desktop" && !OOV4.isIos && !OOV4.isRimDevice;
  }();

  OOV4.supportCookies = function () {
    document.cookie = "ooyala_cookie_test=true";
    var cookiesSupported = document.cookie.indexOf("ooyala_cookie_test=true") >= 0;
    document.cookie = "ooyala_cookie_test=; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    return cookiesSupported;
  }();

  OOV4.isSSL = document.location.protocol == "https:";
  updateServerHost(); // returns true iff environment-specific feature is required to run in current environment

  OOV4.requiredInEnvironment = OOV4.featureEnabled = function (feature) {
    return !!OOV4.environmentRequiredFeatures.match(new RegExp(feature));
  }; // Detect Chrome Extension. We will recieve an acknowledgement from the content script, which will prompt us to start sending logs


  OOV4.chromeExtensionEnabled = document.getElementById('ooyala-extension-installed') ? true : false; // Locale Getter and Setter

  OOV4.locale = "";

  OOV4.setLocale = function (locale) {
    OOV4.locale = locale.toUpperCase();
  };

  OOV4.getLocale = function () {
    return (OOV4.locale || document.documentElement.lang || navigator.language || navigator.userLanguage || "en").substr(0, 2).toUpperCase();
  };
})(OOV4, OOV4._, OOV4.HM);

},{}],6:[function(require,module,exports){
(function (OOV4, _, $) {
  OOV4.getRandomString = function () {
    return Math.random().toString(36).substring(7);
  };

  OOV4.safeClone = function (source) {
    if (_.isNumber(source) || _.isString(source) || _.isBoolean(source) || _.isFunction(source) || _.isNull(source) || _.isUndefined(source)) {
      return source;
    }

    var result = source instanceof Array ? [] : {};

    try {
      $.extend(true, result, source);
    } catch (e) {
      OOV4.log("deep clone error", e);
    }

    return result;
  };

  OOV4.d = function () {
    if (OOV4.isDebug) {
      OOV4.log.apply(OOV4, arguments);
    }

    OOV4.$("#OOYALA_DEBUG_CONSOLE").append(JSON.stringify(OOV4.safeClone(arguments)) + '<br>');
  }; // Note: This inherit only for simple inheritance simulation, the Parennt class still has a this binding
  // to the parent class. so any variable initiated in the Parent Constructor, will not be available to the
  // Child Class, you need to copy paste constructor to Child Class to make it work.
  // coffeescript is doing a better job here by binding the this context to child in the constructor.
  // Until we switch to CoffeeScript, we need to be careful using this simplified inherit lib.


  OOV4.inherit = function (ParentClass, myConstructor) {
    if (typeof ParentClass !== "function") {
      OOV4.log("invalid inherit, ParentClass need to be a class", ParentClass);
      return null;
    }

    var SubClass = function () {
      ParentClass.apply(this, arguments);

      if (typeof myConstructor === "function") {
        myConstructor.apply(this, arguments);
      }
    };

    var parentClass = new ParentClass();

    OOV4._.extend(SubClass.prototype, parentClass);

    SubClass.prototype.parentClass = parentClass;
    return SubClass;
  };

  var styles = {}; // keep track of all styles added so we can remove them later if destroy is called

  OOV4.attachStyle = function (styleContent, playerId) {
    var s = $('<style type="text/css">' + styleContent + '</style>').appendTo("head");
    styles[playerId] = styles[playerId] || [];
    styles[playerId].push(s);
  };

  OOV4.removeStyles = function (playerId) {
    OOV4._.each(styles[playerId], function (style) {
      style.remove();
    });
  }; // object: object to get the inner property for, ex. {"mod":{"fw":{"data":{"key":"val"}}}}
  // keylist: list of keys to find, ex. ["mod", "fw", "data"]
  // example output: {"key":"val"}


  OOV4.getInnerProperty = function (object, keylist) {
    var innerObject = object;
    var list = keylist;

    while (list.length > 0) {
      var key = list.shift(); // Note that function and arrays are objects

      if (_.isNull(innerObject) || !_.isObject(innerObject) || _.isFunction(innerObject) || _.isArray(innerObject)) return null;
      innerObject = innerObject[key];
    }

    return innerObject;
  };

  OOV4.formatSeconds = function (timeInSeconds) {
    var seconds = parseInt(timeInSeconds, 10) % 60;
    var hours = parseInt(timeInSeconds / 3600, 10);
    var minutes = parseInt((timeInSeconds - hours * 3600) / 60, 10);

    if (hours < 10) {
      hours = '0' + hours;
    }

    if (minutes < 10) {
      minutes = '0' + minutes;
    }

    if (seconds < 10) {
      seconds = '0' + seconds;
    }

    return parseInt(hours, 10) > 0 ? hours + ":" + minutes + ":" + seconds : minutes + ":" + seconds;
  };

  OOV4.timeStringToSeconds = function (timeString) {
    var timeArray = (timeString || '').split(":");
    return _.reduce(timeArray, function (m, s) {
      return m * 60 + parseInt(s, 10);
    }, 0);
  };

  OOV4.leftPadding = function (num, totalChars) {
    var pad = '0';
    var numString = num ? num.toString() : '';

    while (numString.length < totalChars) {
      numString = pad + numString;
    }

    return numString;
  };

  OOV4.getColorString = function (color) {
    return '#' + OOV4.leftPadding(color.toString(16), 6).toUpperCase();
  };

  OOV4.hexToRgb = function (hex) {
    var r = (hex & 0xFF0000) >> 16;
    var g = (hex & 0xFF00) >> 8;
    var b = hex & 0xFF;
    return [r, g, b];
  };

  OOV4.changeColor = function (color, ratio, darker) {
    var minmax = darker ? Math.max : Math.min;
    var boundary = darker ? 0 : 255;
    var difference = Math.round(ratio * 255) * (darker ? -1 : 1);
    var rgb = OOV4.hexToRgb(color);
    return [OOV4.leftPadding(minmax(rgb[0] + difference, boundary).toString(16), 2), OOV4.leftPadding(minmax(rgb[1] + difference, boundary).toString(16), 2), OOV4.leftPadding(minmax(rgb[2] + difference, boundary).toString(16), 2)].join('');
  };

  OOV4.decode64 = function (s) {
    s = s.replace(/\n/g, "");
    var results = "";
    var j,
        i = 0;
    var enc = [];
    var b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="; //shortcut for browsers with atob

    if (window.atob) {
      return atob(s);
    }

    do {
      for (j = 0; j < 4; j++) {
        enc[j] = b64.indexOf(s.charAt(i++));
      }

      results += String.fromCharCode(enc[0] << 2 | enc[1] >> 4, enc[2] == 64 ? 0 : (enc[1] & 15) << 4 | enc[2] >> 2, enc[3] == 64 ? 0 : (enc[2] & 3) << 6 | enc[3]);
    } while (i < s.length); //trim tailing null characters


    return results.replace(/\0/g, "");
  };

  OOV4.pixelPing = function (url) {
    var img = new Image();

    img.onerror = img.onabort = function () {
      OOV4.d("onerror:", url);
    };

    img.src = OOV4.getNormalizedTagUrl(url);
  }; // ping array of urls.


  OOV4.pixelPings = function (urls) {
    if (_.isEmpty(urls)) {
      return;
    }

    _.each(urls, function (url) {
      OOV4.pixelPing(url);
    }, this);
  }; // helper function to convert types to boolean
  // the (!!) trick only works to verify if a string isn't the empty string
  // therefore, we must use a special case for that


  OOV4.stringToBoolean = function (value) {
    if (typeof value === 'string') return value.toLowerCase().indexOf("true") > -1 || value.toLowerCase().indexOf("yes") > -1;
    return !!value;
  };

  OOV4.regexEscape = function (value) {
    var specials = /[<>()\[\]{}]/g;
    return value.replace(specials, "\\$&");
  };

  OOV4.getNormalizedTagUrl = function (url, embedCode) {
    var ts = new Date().getTime();
    var pageUrl = escape(document.URL);

    var placeHolderReplace = function (template, replaceValue) {
      _.each(template, function (placeHolder) {
        var regexSearchVal = new RegExp("(" + OOV4.regexEscape(placeHolder) + ")", 'gi');
        url = url.replace(regexSearchVal, replaceValue);
      }, this);
    }; // replace the timestamp and referrer_url placeholders


    placeHolderReplace(OOV4.TEMPLATES.RANDOM_PLACE_HOLDER, ts);
    placeHolderReplace(OOV4.TEMPLATES.REFERAK_PLACE_HOLDER, pageUrl); // first make sure that the embedCode exists, then replace the
    // oo_embedcode placeholder

    if (embedCode) {
      placeHolderReplace(OOV4.TEMPLATES.EMBED_CODE_PLACE_HOLDER, embedCode);
    }

    return url;
  };

  OOV4.safeSeekRange = function (seekRange) {
    return {
      start: seekRange.length > 0 ? seekRange.start(0) : 0,
      end: seekRange.length > 0 ? seekRange.end(0) : 0
    };
  };

  OOV4.loadedJS = OOV4.loadedJS || {};
  OOV4.jsOnSuccessList = OOV4.jsOnSuccessList || {};

  OOV4.safeFuncCall = function (fn) {
    if (typeof fn !== "function") {
      return;
    }

    try {
      fn.apply();
    } catch (e) {
      OOV4.log("Can not invoke function!", e);
    }
  };

  OOV4.loadScriptOnce = function (jsSrc, successCallBack, errorCallBack, timeoutInMillis) {
    OOV4.jsOnSuccessList[jsSrc] = OOV4.jsOnSuccessList[jsSrc] || [];

    if (OOV4.loadedJS[jsSrc]) {
      // invoke call back directly if loaded.
      if (OOV4.loadedJS[jsSrc] === "loaded") {
        OOV4.safeFuncCall(successCallBack);
      } else if (OOV4.loadedJS[jsSrc] === "loading") {
        OOV4.jsOnSuccessList[jsSrc].unshift(successCallBack);
      }

      return false;
    }

    OOV4.loadedJS[jsSrc] = "loading";
    $.ajax({
      url: jsSrc,
      type: 'GET',
      cache: true,
      dataType: 'script',
      timeout: timeoutInMillis || 15000,
      success: function () {
        OOV4.loadedJS[jsSrc] = "loaded";
        OOV4.jsOnSuccessList[jsSrc].unshift(successCallBack);

        OOV4._.each(OOV4.jsOnSuccessList[jsSrc], function (fn) {
          OOV4.safeFuncCall(fn);
        }, this);

        OOV4.jsOnSuccessList[jsSrc] = [];
      },
      error: function () {
        OOV4.safeFuncCall(errorCallBack);
      }
    });
    return true;
  };

  try {
    OOV4.localStorage = window.localStorage;
  } catch (err) {
    OOV4.log(err);
  }

  if (!OOV4.localStorage) {
    OOV4.localStorage = {
      getItem: function (sKey) {
        if (!sKey || !this.hasOwnProperty(sKey)) {
          return null;
        }

        return unescape(document.cookie.replace(new RegExp("(?:^|.*;\\s*)" + escape(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*((?:[^;](?!;))*[^;]?).*"), "$1"));
      },
      key: function (nKeyId) {
        return unescape(document.cookie.replace(/\s*\=(?:.(?!;))*$/, "").split(/\s*\=(?:[^;](?!;))*[^;]?;\s*/)[nKeyId]);
      },
      setItem: function (sKey, sValue) {
        if (!sKey) {
          return;
        }

        document.cookie = escape(sKey) + "=" + escape(sValue) + "; expires=Tue, 19 Jan 2038 03:14:07 GMT; path=/";
        this.length = document.cookie.match(/\=/g).length;
      },
      length: 0,
      removeItem: function (sKey) {
        if (!sKey || !this.hasOwnProperty(sKey)) {
          return;
        }

        document.cookie = escape(sKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
        this.length--;
      },
      hasOwnProperty: function (sKey) {
        return new RegExp("(?:^|;\\s*)" + escape(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=").test(document.cookie);
      }
    };
    OOV4.localStorage.length = (document.cookie.match(/\=/g) || OOV4.localStorage).length;
  } // A container to properly request OOV4.localStorage.setItem


  OOV4.setItem = function (sKey, sValue) {
    try {
      OOV4.localStorage.setItem(sKey, sValue);
    } catch (err) {
      OOV4.log(err);
    }
  };
  /**
   * Converts a value to a number or returns null if it can't be converted or is not a finite value.
   * @public
   * @method OOV4#ensureNumber
   * @param {*} value The value to convert.
   * @param {*} defaultValue A default value to return when the input is not a valid number.
   * @return {Number} The Number equivalent of value if it can be converted and is finite.
   * When value doesn't meet the criteria the function will return either defaultValue (if provided) or null.
   */


  OOV4.ensureNumber = function (value, defaultValue) {
    var number;

    if (value === null || _.isArray(value)) {
      value = NaN;
    }

    if (_.isNumber(value)) {
      number = value;
    } else {
      number = Number(value);
    }

    if (!isFinite(number)) {
      return typeof defaultValue === 'undefined' ? null : defaultValue;
    }

    return number;
  };

  OOV4.JSON = window.JSON;
})(OOV4, OOV4._, OOV4.$);

},{}],7:[function(require,module,exports){
// Actual Hazmat Code
var HazmatBuilder = function(_,root) {

  // top level module
  var Hazmat  = function(config) {
    this.config = config || {};
    if(!_.isObject(this.config)) {
      throw new Error('Hazmat is not initialized properly');
    }
    this.fail = _.isFunction(this.config.fail) ? this.config.fail : Hazmat.fail;
    this.warn = _.isFunction(this.config.warn) ? this.config.warn : Hazmat.warn;
    this.log = _.isFunction(this.config.log) ? this.config.log : Hazmat.log;
  };

  _.extend(Hazmat, {

    // constants
    ID_REGEX : /^[\_A-Za-z0-9]+$/,

    // factory
    create : function(config) {
      return new Hazmat(config);
    },

    // noConflict
    noConflict : function() {
      root.Hazmat = Hazmat.original;
      return Hazmat;
    },

    // default log function
    log : function() {
      if(console && _.isFunction(console.log)) {
        console.log.apply(console, arguments);
      }
    },

    // default fail function
    fail : function(_reason, _data) {
      var reason = _reason || "", data = _data || {};
      Hazmat.log('Hazmat Failure::', reason, data);
      throw new Error('Hazmat Failure '+reason.toString());
    },

    // default warn function
    warn : function(_reason, _data) {
      var reason = _reason || "", data = _data || {};
      Hazmat.log('Hazmat Warning::', reason, data);
    },

    // global fixers
    fixDomId : function(_value) {
      if(_.isString(_value) && _value.length > 0) {
        return _value.replace(/[^A-Za-z0-9\_]/g,'');
      } else {
        return null;
      }
    },

    // global testers
    isDomId : function(value) {
      return _.isString(value) && value.match(Hazmat.ID_REGEX);
    },


    __placeholder : true
  });

  _.extend(Hazmat.prototype, {
    _safeValue : function(name, value, fallback, type) {
      // make fallback safe and eat exceptions
      var _fallback = fallback;
      if(_.isFunction(fallback)) {
        fallback = _.once(function() {
          try {
            return _fallback.apply(this, arguments);
          } catch(e) {
          }
        });
      }

      if(type.checker(value)) {
        return value;
      } else if(type.evalFallback && _.isFunction(fallback) && type.checker(fallback(value))){
        this.warn('Expected valid '+type.name+' for '+name+' but was able to sanitize it:', [value, fallback(value)]);
        return fallback(value);
      } else if(type.checker(_fallback)){
        this.warn('Expected valid '+type.name+' for '+name+' but was able to fallback to default value:', [value, _fallback]);
        return _fallback;
      } else {
        this.fail('Expected valid '+type.name+' for '+name+' but received:', value);
      }
    },

    safeString : function(name, value, fallback) {
      return this._safeValue(name, value, fallback, {name: 'String', checker: _.isString, evalFallback:true});
    },

    safeStringOrNull : function(name, value, fallback) {
      if(value == null) {
        return value;
      } else {
        return this._safeValue(name, value, fallback, {name: 'String', checker: _.isString, evalFallback:true});
      }
    },

    safeDomId : function(name, value, fallback) {
      return this._safeValue(name, value, fallback, {name: 'DOM ID', checker: Hazmat.isDomId, evalFallback:true});
    },

    safeFunction : function(name, value, fallback) {
      return this._safeValue(name, value, fallback, {name: 'Function', checker: _.isFunction, evalFallback:false});
    },

    safeFunctionOrNull : function(name, value, fallback) {
      if(value == null) {
        return value;
      } else {
        return this._safeValue(name, value, fallback, {name: 'Function', checker: _.isFunction, evalFallback:false});
      }
    },

    safeObject : function(name, value, fallback) {
      return this._safeValue(name, value, fallback, {name: 'Object', checker: _.isObject, evalFallback:false});
    },

    safeObjectOrNull : function(name, value, fallback) {
      if(value == null) {
        return value;
      } else {
        return this._safeValue(name, value, fallback, {name: 'Object', checker: _.isObject, evalFallback:false});
      }
    },

    safeArray : function(name, value, fallback) {
      return this._safeValue(name, value, fallback, {name: 'Array', checker: _.isArray, evalFallback:false});
    },

    safeArrayOfElements : function(name, value, elementValidator, fallback) {
      var safeArray = this._safeValue(name, value, fallback, {name: 'Array', checker: _.isArray, evalFallback:false});
      return _.map(safeArray, elementValidator);
    },

    __placeholder:true
  });

  return Hazmat;
};

// Integration with Node.js/Browser
if(typeof window !== 'undefined' && typeof window._ !== 'undefined') {
  var hazmat = HazmatBuilder(window._, window);
  hazmat.original = window.Hazmat;
  window.Hazmat = hazmat;
} else {
  var _ = require('underscore');
  var hazmat = HazmatBuilder(_);
  _.extend(exports,hazmat);
}

},{"underscore":8}],8:[function(require,module,exports){
(function (global){
//     Underscore.js 1.9.1
//     http://underscorejs.org
//     (c) 2009-2018 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Underscore may be freely distributed under the MIT license.

(function() {

  // Baseline setup
  // --------------

  // Establish the root object, `window` (`self`) in the browser, `global`
  // on the server, or `this` in some virtual machines. We use `self`
  // instead of `window` for `WebWorker` support.
  var root = typeof self == 'object' && self.self === self && self ||
            typeof global == 'object' && global.global === global && global ||
            this ||
            {};

  // Save the previous value of the `_` variable.
  var previousUnderscore = root._;

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype;
  var SymbolProto = typeof Symbol !== 'undefined' ? Symbol.prototype : null;

  // Create quick reference variables for speed access to core prototypes.
  var push = ArrayProto.push,
      slice = ArrayProto.slice,
      toString = ObjProto.toString,
      hasOwnProperty = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var nativeIsArray = Array.isArray,
      nativeKeys = Object.keys,
      nativeCreate = Object.create;

  // Naked function reference for surrogate-prototype-swapping.
  var Ctor = function(){};

  // Create a safe reference to the Underscore object for use below.
  var _ = function(obj) {
    if (obj instanceof _) return obj;
    if (!(this instanceof _)) return new _(obj);
    this._wrapped = obj;
  };

  // Export the Underscore object for **Node.js**, with
  // backwards-compatibility for their old module API. If we're in
  // the browser, add `_` as a global object.
  // (`nodeType` is checked to ensure that `module`
  // and `exports` are not HTML elements.)
  if (typeof exports != 'undefined' && !exports.nodeType) {
    if (typeof module != 'undefined' && !module.nodeType && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else {
    root._ = _;
  }

  // Current version.
  _.VERSION = '1.9.1';

  // Internal function that returns an efficient (for current engines) version
  // of the passed-in callback, to be repeatedly applied in other Underscore
  // functions.
  var optimizeCb = function(func, context, argCount) {
    if (context === void 0) return func;
    switch (argCount == null ? 3 : argCount) {
      case 1: return function(value) {
        return func.call(context, value);
      };
      // The 2-argument case is omitted because weâ€™re not using it.
      case 3: return function(value, index, collection) {
        return func.call(context, value, index, collection);
      };
      case 4: return function(accumulator, value, index, collection) {
        return func.call(context, accumulator, value, index, collection);
      };
    }
    return function() {
      return func.apply(context, arguments);
    };
  };

  var builtinIteratee;

  // An internal function to generate callbacks that can be applied to each
  // element in a collection, returning the desired result â€” either `identity`,
  // an arbitrary callback, a property matcher, or a property accessor.
  var cb = function(value, context, argCount) {
    if (_.iteratee !== builtinIteratee) return _.iteratee(value, context);
    if (value == null) return _.identity;
    if (_.isFunction(value)) return optimizeCb(value, context, argCount);
    if (_.isObject(value) && !_.isArray(value)) return _.matcher(value);
    return _.property(value);
  };

  // External wrapper for our callback generator. Users may customize
  // `_.iteratee` if they want additional predicate/iteratee shorthand styles.
  // This abstraction hides the internal-only argCount argument.
  _.iteratee = builtinIteratee = function(value, context) {
    return cb(value, context, Infinity);
  };

  // Some functions take a variable number of arguments, or a few expected
  // arguments at the beginning and then a variable number of values to operate
  // on. This helper accumulates all remaining arguments past the functionâ€™s
  // argument length (or an explicit `startIndex`), into an array that becomes
  // the last argument. Similar to ES6â€™s "rest parameter".
  var restArguments = function(func, startIndex) {
    startIndex = startIndex == null ? func.length - 1 : +startIndex;
    return function() {
      var length = Math.max(arguments.length - startIndex, 0),
          rest = Array(length),
          index = 0;
      for (; index < length; index++) {
        rest[index] = arguments[index + startIndex];
      }
      switch (startIndex) {
        case 0: return func.call(this, rest);
        case 1: return func.call(this, arguments[0], rest);
        case 2: return func.call(this, arguments[0], arguments[1], rest);
      }
      var args = Array(startIndex + 1);
      for (index = 0; index < startIndex; index++) {
        args[index] = arguments[index];
      }
      args[startIndex] = rest;
      return func.apply(this, args);
    };
  };

  // An internal function for creating a new object that inherits from another.
  var baseCreate = function(prototype) {
    if (!_.isObject(prototype)) return {};
    if (nativeCreate) return nativeCreate(prototype);
    Ctor.prototype = prototype;
    var result = new Ctor;
    Ctor.prototype = null;
    return result;
  };

  var shallowProperty = function(key) {
    return function(obj) {
      return obj == null ? void 0 : obj[key];
    };
  };

  var has = function(obj, path) {
    return obj != null && hasOwnProperty.call(obj, path);
  }

  var deepGet = function(obj, path) {
    var length = path.length;
    for (var i = 0; i < length; i++) {
      if (obj == null) return void 0;
      obj = obj[path[i]];
    }
    return length ? obj : void 0;
  };

  // Helper for collection methods to determine whether a collection
  // should be iterated as an array or as an object.
  // Related: http://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength
  // Avoids a very nasty iOS 8 JIT bug on ARM-64. #2094
  var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;
  var getLength = shallowProperty('length');
  var isArrayLike = function(collection) {
    var length = getLength(collection);
    return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;
  };

  // Collection Functions
  // --------------------

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles raw objects in addition to array-likes. Treats all
  // sparse array-likes as if they were dense.
  _.each = _.forEach = function(obj, iteratee, context) {
    iteratee = optimizeCb(iteratee, context);
    var i, length;
    if (isArrayLike(obj)) {
      for (i = 0, length = obj.length; i < length; i++) {
        iteratee(obj[i], i, obj);
      }
    } else {
      var keys = _.keys(obj);
      for (i = 0, length = keys.length; i < length; i++) {
        iteratee(obj[keys[i]], keys[i], obj);
      }
    }
    return obj;
  };

  // Return the results of applying the iteratee to each element.
  _.map = _.collect = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length,
        results = Array(length);
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      results[index] = iteratee(obj[currentKey], currentKey, obj);
    }
    return results;
  };

  // Create a reducing function iterating left or right.
  var createReduce = function(dir) {
    // Wrap code that reassigns argument variables in a separate function than
    // the one that accesses `arguments.length` to avoid a perf hit. (#1991)
    var reducer = function(obj, iteratee, memo, initial) {
      var keys = !isArrayLike(obj) && _.keys(obj),
          length = (keys || obj).length,
          index = dir > 0 ? 0 : length - 1;
      if (!initial) {
        memo = obj[keys ? keys[index] : index];
        index += dir;
      }
      for (; index >= 0 && index < length; index += dir) {
        var currentKey = keys ? keys[index] : index;
        memo = iteratee(memo, obj[currentKey], currentKey, obj);
      }
      return memo;
    };

    return function(obj, iteratee, memo, context) {
      var initial = arguments.length >= 3;
      return reducer(obj, optimizeCb(iteratee, context, 4), memo, initial);
    };
  };

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`.
  _.reduce = _.foldl = _.inject = createReduce(1);

  // The right-associative version of reduce, also known as `foldr`.
  _.reduceRight = _.foldr = createReduce(-1);

  // Return the first value which passes a truth test. Aliased as `detect`.
  _.find = _.detect = function(obj, predicate, context) {
    var keyFinder = isArrayLike(obj) ? _.findIndex : _.findKey;
    var key = keyFinder(obj, predicate, context);
    if (key !== void 0 && key !== -1) return obj[key];
  };

  // Return all the elements that pass a truth test.
  // Aliased as `select`.
  _.filter = _.select = function(obj, predicate, context) {
    var results = [];
    predicate = cb(predicate, context);
    _.each(obj, function(value, index, list) {
      if (predicate(value, index, list)) results.push(value);
    });
    return results;
  };

  // Return all the elements for which a truth test fails.
  _.reject = function(obj, predicate, context) {
    return _.filter(obj, _.negate(cb(predicate)), context);
  };

  // Determine whether all of the elements match a truth test.
  // Aliased as `all`.
  _.every = _.all = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length;
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      if (!predicate(obj[currentKey], currentKey, obj)) return false;
    }
    return true;
  };

  // Determine if at least one element in the object matches a truth test.
  // Aliased as `any`.
  _.some = _.any = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length;
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      if (predicate(obj[currentKey], currentKey, obj)) return true;
    }
    return false;
  };

  // Determine if the array or object contains a given item (using `===`).
  // Aliased as `includes` and `include`.
  _.contains = _.includes = _.include = function(obj, item, fromIndex, guard) {
    if (!isArrayLike(obj)) obj = _.values(obj);
    if (typeof fromIndex != 'number' || guard) fromIndex = 0;
    return _.indexOf(obj, item, fromIndex) >= 0;
  };

  // Invoke a method (with arguments) on every item in a collection.
  _.invoke = restArguments(function(obj, path, args) {
    var contextPath, func;
    if (_.isFunction(path)) {
      func = path;
    } else if (_.isArray(path)) {
      contextPath = path.slice(0, -1);
      path = path[path.length - 1];
    }
    return _.map(obj, function(context) {
      var method = func;
      if (!method) {
        if (contextPath && contextPath.length) {
          context = deepGet(context, contextPath);
        }
        if (context == null) return void 0;
        method = context[path];
      }
      return method == null ? method : method.apply(context, args);
    });
  });

  // Convenience version of a common use case of `map`: fetching a property.
  _.pluck = function(obj, key) {
    return _.map(obj, _.property(key));
  };

  // Convenience version of a common use case of `filter`: selecting only objects
  // containing specific `key:value` pairs.
  _.where = function(obj, attrs) {
    return _.filter(obj, _.matcher(attrs));
  };

  // Convenience version of a common use case of `find`: getting the first object
  // containing specific `key:value` pairs.
  _.findWhere = function(obj, attrs) {
    return _.find(obj, _.matcher(attrs));
  };

  // Return the maximum element (or element-based computation).
  _.max = function(obj, iteratee, context) {
    var result = -Infinity, lastComputed = -Infinity,
        value, computed;
    if (iteratee == null || typeof iteratee == 'number' && typeof obj[0] != 'object' && obj != null) {
      obj = isArrayLike(obj) ? obj : _.values(obj);
      for (var i = 0, length = obj.length; i < length; i++) {
        value = obj[i];
        if (value != null && value > result) {
          result = value;
        }
      }
    } else {
      iteratee = cb(iteratee, context);
      _.each(obj, function(v, index, list) {
        computed = iteratee(v, index, list);
        if (computed > lastComputed || computed === -Infinity && result === -Infinity) {
          result = v;
          lastComputed = computed;
        }
      });
    }
    return result;
  };

  // Return the minimum element (or element-based computation).
  _.min = function(obj, iteratee, context) {
    var result = Infinity, lastComputed = Infinity,
        value, computed;
    if (iteratee == null || typeof iteratee == 'number' && typeof obj[0] != 'object' && obj != null) {
      obj = isArrayLike(obj) ? obj : _.values(obj);
      for (var i = 0, length = obj.length; i < length; i++) {
        value = obj[i];
        if (value != null && value < result) {
          result = value;
        }
      }
    } else {
      iteratee = cb(iteratee, context);
      _.each(obj, function(v, index, list) {
        computed = iteratee(v, index, list);
        if (computed < lastComputed || computed === Infinity && result === Infinity) {
          result = v;
          lastComputed = computed;
        }
      });
    }
    return result;
  };

  // Shuffle a collection.
  _.shuffle = function(obj) {
    return _.sample(obj, Infinity);
  };

  // Sample **n** random values from a collection using the modern version of the
  // [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisherâ€“Yates_shuffle).
  // If **n** is not specified, returns a single random element.
  // The internal `guard` argument allows it to work with `map`.
  _.sample = function(obj, n, guard) {
    if (n == null || guard) {
      if (!isArrayLike(obj)) obj = _.values(obj);
      return obj[_.random(obj.length - 1)];
    }
    var sample = isArrayLike(obj) ? _.clone(obj) : _.values(obj);
    var length = getLength(sample);
    n = Math.max(Math.min(n, length), 0);
    var last = length - 1;
    for (var index = 0; index < n; index++) {
      var rand = _.random(index, last);
      var temp = sample[index];
      sample[index] = sample[rand];
      sample[rand] = temp;
    }
    return sample.slice(0, n);
  };

  // Sort the object's values by a criterion produced by an iteratee.
  _.sortBy = function(obj, iteratee, context) {
    var index = 0;
    iteratee = cb(iteratee, context);
    return _.pluck(_.map(obj, function(value, key, list) {
      return {
        value: value,
        index: index++,
        criteria: iteratee(value, key, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria;
      var b = right.criteria;
      if (a !== b) {
        if (a > b || a === void 0) return 1;
        if (a < b || b === void 0) return -1;
      }
      return left.index - right.index;
    }), 'value');
  };

  // An internal function used for aggregate "group by" operations.
  var group = function(behavior, partition) {
    return function(obj, iteratee, context) {
      var result = partition ? [[], []] : {};
      iteratee = cb(iteratee, context);
      _.each(obj, function(value, index) {
        var key = iteratee(value, index, obj);
        behavior(result, value, key);
      });
      return result;
    };
  };

  // Groups the object's values by a criterion. Pass either a string attribute
  // to group by, or a function that returns the criterion.
  _.groupBy = group(function(result, value, key) {
    if (has(result, key)) result[key].push(value); else result[key] = [value];
  });

  // Indexes the object's values by a criterion, similar to `groupBy`, but for
  // when you know that your index values will be unique.
  _.indexBy = group(function(result, value, key) {
    result[key] = value;
  });

  // Counts instances of an object that group by a certain criterion. Pass
  // either a string attribute to count by, or a function that returns the
  // criterion.
  _.countBy = group(function(result, value, key) {
    if (has(result, key)) result[key]++; else result[key] = 1;
  });

  var reStrSymbol = /[^\ud800-\udfff]|[\ud800-\udbff][\udc00-\udfff]|[\ud800-\udfff]/g;
  // Safely create a real, live array from anything iterable.
  _.toArray = function(obj) {
    if (!obj) return [];
    if (_.isArray(obj)) return slice.call(obj);
    if (_.isString(obj)) {
      // Keep surrogate pair characters together
      return obj.match(reStrSymbol);
    }
    if (isArrayLike(obj)) return _.map(obj, _.identity);
    return _.values(obj);
  };

  // Return the number of elements in an object.
  _.size = function(obj) {
    if (obj == null) return 0;
    return isArrayLike(obj) ? obj.length : _.keys(obj).length;
  };

  // Split a collection into two arrays: one whose elements all satisfy the given
  // predicate, and one whose elements all do not satisfy the predicate.
  _.partition = group(function(result, value, pass) {
    result[pass ? 0 : 1].push(value);
  }, true);

  // Array Functions
  // ---------------

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head` and `take`. The **guard** check
  // allows it to work with `_.map`.
  _.first = _.head = _.take = function(array, n, guard) {
    if (array == null || array.length < 1) return n == null ? void 0 : [];
    if (n == null || guard) return array[0];
    return _.initial(array, array.length - n);
  };

  // Returns everything but the last entry of the array. Especially useful on
  // the arguments object. Passing **n** will return all the values in
  // the array, excluding the last N.
  _.initial = function(array, n, guard) {
    return slice.call(array, 0, Math.max(0, array.length - (n == null || guard ? 1 : n)));
  };

  // Get the last element of an array. Passing **n** will return the last N
  // values in the array.
  _.last = function(array, n, guard) {
    if (array == null || array.length < 1) return n == null ? void 0 : [];
    if (n == null || guard) return array[array.length - 1];
    return _.rest(array, Math.max(0, array.length - n));
  };

  // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
  // Especially useful on the arguments object. Passing an **n** will return
  // the rest N values in the array.
  _.rest = _.tail = _.drop = function(array, n, guard) {
    return slice.call(array, n == null || guard ? 1 : n);
  };

  // Trim out all falsy values from an array.
  _.compact = function(array) {
    return _.filter(array, Boolean);
  };

  // Internal implementation of a recursive `flatten` function.
  var flatten = function(input, shallow, strict, output) {
    output = output || [];
    var idx = output.length;
    for (var i = 0, length = getLength(input); i < length; i++) {
      var value = input[i];
      if (isArrayLike(value) && (_.isArray(value) || _.isArguments(value))) {
        // Flatten current level of array or arguments object.
        if (shallow) {
          var j = 0, len = value.length;
          while (j < len) output[idx++] = value[j++];
        } else {
          flatten(value, shallow, strict, output);
          idx = output.length;
        }
      } else if (!strict) {
        output[idx++] = value;
      }
    }
    return output;
  };

  // Flatten out an array, either recursively (by default), or just one level.
  _.flatten = function(array, shallow) {
    return flatten(array, shallow, false);
  };

  // Return a version of the array that does not contain the specified value(s).
  _.without = restArguments(function(array, otherArrays) {
    return _.difference(array, otherArrays);
  });

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // The faster algorithm will not work with an iteratee if the iteratee
  // is not a one-to-one function, so providing an iteratee will disable
  // the faster algorithm.
  // Aliased as `unique`.
  _.uniq = _.unique = function(array, isSorted, iteratee, context) {
    if (!_.isBoolean(isSorted)) {
      context = iteratee;
      iteratee = isSorted;
      isSorted = false;
    }
    if (iteratee != null) iteratee = cb(iteratee, context);
    var result = [];
    var seen = [];
    for (var i = 0, length = getLength(array); i < length; i++) {
      var value = array[i],
          computed = iteratee ? iteratee(value, i, array) : value;
      if (isSorted && !iteratee) {
        if (!i || seen !== computed) result.push(value);
        seen = computed;
      } else if (iteratee) {
        if (!_.contains(seen, computed)) {
          seen.push(computed);
          result.push(value);
        }
      } else if (!_.contains(result, value)) {
        result.push(value);
      }
    }
    return result;
  };

  // Produce an array that contains the union: each distinct element from all of
  // the passed-in arrays.
  _.union = restArguments(function(arrays) {
    return _.uniq(flatten(arrays, true, true));
  });

  // Produce an array that contains every item shared between all the
  // passed-in arrays.
  _.intersection = function(array) {
    var result = [];
    var argsLength = arguments.length;
    for (var i = 0, length = getLength(array); i < length; i++) {
      var item = array[i];
      if (_.contains(result, item)) continue;
      var j;
      for (j = 1; j < argsLength; j++) {
        if (!_.contains(arguments[j], item)) break;
      }
      if (j === argsLength) result.push(item);
    }
    return result;
  };

  // Take the difference between one array and a number of other arrays.
  // Only the elements present in just the first array will remain.
  _.difference = restArguments(function(array, rest) {
    rest = flatten(rest, true, true);
    return _.filter(array, function(value){
      return !_.contains(rest, value);
    });
  });

  // Complement of _.zip. Unzip accepts an array of arrays and groups
  // each array's elements on shared indices.
  _.unzip = function(array) {
    var length = array && _.max(array, getLength).length || 0;
    var result = Array(length);

    for (var index = 0; index < length; index++) {
      result[index] = _.pluck(array, index);
    }
    return result;
  };

  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  _.zip = restArguments(_.unzip);

  // Converts lists into objects. Pass either a single array of `[key, value]`
  // pairs, or two parallel arrays of the same length -- one of keys, and one of
  // the corresponding values. Passing by pairs is the reverse of _.pairs.
  _.object = function(list, values) {
    var result = {};
    for (var i = 0, length = getLength(list); i < length; i++) {
      if (values) {
        result[list[i]] = values[i];
      } else {
        result[list[i][0]] = list[i][1];
      }
    }
    return result;
  };

  // Generator function to create the findIndex and findLastIndex functions.
  var createPredicateIndexFinder = function(dir) {
    return function(array, predicate, context) {
      predicate = cb(predicate, context);
      var length = getLength(array);
      var index = dir > 0 ? 0 : length - 1;
      for (; index >= 0 && index < length; index += dir) {
        if (predicate(array[index], index, array)) return index;
      }
      return -1;
    };
  };

  // Returns the first index on an array-like that passes a predicate test.
  _.findIndex = createPredicateIndexFinder(1);
  _.findLastIndex = createPredicateIndexFinder(-1);

  // Use a comparator function to figure out the smallest index at which
  // an object should be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function(array, obj, iteratee, context) {
    iteratee = cb(iteratee, context, 1);
    var value = iteratee(obj);
    var low = 0, high = getLength(array);
    while (low < high) {
      var mid = Math.floor((low + high) / 2);
      if (iteratee(array[mid]) < value) low = mid + 1; else high = mid;
    }
    return low;
  };

  // Generator function to create the indexOf and lastIndexOf functions.
  var createIndexFinder = function(dir, predicateFind, sortedIndex) {
    return function(array, item, idx) {
      var i = 0, length = getLength(array);
      if (typeof idx == 'number') {
        if (dir > 0) {
          i = idx >= 0 ? idx : Math.max(idx + length, i);
        } else {
          length = idx >= 0 ? Math.min(idx + 1, length) : idx + length + 1;
        }
      } else if (sortedIndex && idx && length) {
        idx = sortedIndex(array, item);
        return array[idx] === item ? idx : -1;
      }
      if (item !== item) {
        idx = predicateFind(slice.call(array, i, length), _.isNaN);
        return idx >= 0 ? idx + i : -1;
      }
      for (idx = dir > 0 ? i : length - 1; idx >= 0 && idx < length; idx += dir) {
        if (array[idx] === item) return idx;
      }
      return -1;
    };
  };

  // Return the position of the first occurrence of an item in an array,
  // or -1 if the item is not included in the array.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.
  _.indexOf = createIndexFinder(1, _.findIndex, _.sortedIndex);
  _.lastIndexOf = createIndexFinder(-1, _.findLastIndex);

  // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python `range()` function. See
  // [the Python documentation](http://docs.python.org/library/functions.html#range).
  _.range = function(start, stop, step) {
    if (stop == null) {
      stop = start || 0;
      start = 0;
    }
    if (!step) {
      step = stop < start ? -1 : 1;
    }

    var length = Math.max(Math.ceil((stop - start) / step), 0);
    var range = Array(length);

    for (var idx = 0; idx < length; idx++, start += step) {
      range[idx] = start;
    }

    return range;
  };

  // Chunk a single array into multiple arrays, each containing `count` or fewer
  // items.
  _.chunk = function(array, count) {
    if (count == null || count < 1) return [];
    var result = [];
    var i = 0, length = array.length;
    while (i < length) {
      result.push(slice.call(array, i, i += count));
    }
    return result;
  };

  // Function (ahem) Functions
  // ------------------

  // Determines whether to execute a function as a constructor
  // or a normal function with the provided arguments.
  var executeBound = function(sourceFunc, boundFunc, context, callingContext, args) {
    if (!(callingContext instanceof boundFunc)) return sourceFunc.apply(context, args);
    var self = baseCreate(sourceFunc.prototype);
    var result = sourceFunc.apply(self, args);
    if (_.isObject(result)) return result;
    return self;
  };

  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
  // available.
  _.bind = restArguments(function(func, context, args) {
    if (!_.isFunction(func)) throw new TypeError('Bind must be called on a function');
    var bound = restArguments(function(callArgs) {
      return executeBound(func, bound, context, this, args.concat(callArgs));
    });
    return bound;
  });

  // Partially apply a function by creating a version that has had some of its
  // arguments pre-filled, without changing its dynamic `this` context. _ acts
  // as a placeholder by default, allowing any combination of arguments to be
  // pre-filled. Set `_.partial.placeholder` for a custom placeholder argument.
  _.partial = restArguments(function(func, boundArgs) {
    var placeholder = _.partial.placeholder;
    var bound = function() {
      var position = 0, length = boundArgs.length;
      var args = Array(length);
      for (var i = 0; i < length; i++) {
        args[i] = boundArgs[i] === placeholder ? arguments[position++] : boundArgs[i];
      }
      while (position < arguments.length) args.push(arguments[position++]);
      return executeBound(func, bound, this, this, args);
    };
    return bound;
  });

  _.partial.placeholder = _;

  // Bind a number of an object's methods to that object. Remaining arguments
  // are the method names to be bound. Useful for ensuring that all callbacks
  // defined on an object belong to it.
  _.bindAll = restArguments(function(obj, keys) {
    keys = flatten(keys, false, false);
    var index = keys.length;
    if (index < 1) throw new Error('bindAll must be passed function names');
    while (index--) {
      var key = keys[index];
      obj[key] = _.bind(obj[key], obj);
    }
  });

  // Memoize an expensive function by storing its results.
  _.memoize = function(func, hasher) {
    var memoize = function(key) {
      var cache = memoize.cache;
      var address = '' + (hasher ? hasher.apply(this, arguments) : key);
      if (!has(cache, address)) cache[address] = func.apply(this, arguments);
      return cache[address];
    };
    memoize.cache = {};
    return memoize;
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  _.delay = restArguments(function(func, wait, args) {
    return setTimeout(function() {
      return func.apply(null, args);
    }, wait);
  });

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  _.defer = _.partial(_.delay, _, 1);

  // Returns a function, that, when invoked, will only be triggered at most once
  // during a given window of time. Normally, the throttled function will run
  // as much as it can, without ever going more than once per `wait` duration;
  // but if you'd like to disable the execution on the leading edge, pass
  // `{leading: false}`. To disable execution on the trailing edge, ditto.
  _.throttle = function(func, wait, options) {
    var timeout, context, args, result;
    var previous = 0;
    if (!options) options = {};

    var later = function() {
      previous = options.leading === false ? 0 : _.now();
      timeout = null;
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    };

    var throttled = function() {
      var now = _.now();
      if (!previous && options.leading === false) previous = now;
      var remaining = wait - (now - previous);
      context = this;
      args = arguments;
      if (remaining <= 0 || remaining > wait) {
        if (timeout) {
          clearTimeout(timeout);
          timeout = null;
        }
        previous = now;
        result = func.apply(context, args);
        if (!timeout) context = args = null;
      } else if (!timeout && options.trailing !== false) {
        timeout = setTimeout(later, remaining);
      }
      return result;
    };

    throttled.cancel = function() {
      clearTimeout(timeout);
      previous = 0;
      timeout = context = args = null;
    };

    return throttled;
  };

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  _.debounce = function(func, wait, immediate) {
    var timeout, result;

    var later = function(context, args) {
      timeout = null;
      if (args) result = func.apply(context, args);
    };

    var debounced = restArguments(function(args) {
      if (timeout) clearTimeout(timeout);
      if (immediate) {
        var callNow = !timeout;
        timeout = setTimeout(later, wait);
        if (callNow) result = func.apply(this, args);
      } else {
        timeout = _.delay(later, wait, this, args);
      }

      return result;
    });

    debounced.cancel = function() {
      clearTimeout(timeout);
      timeout = null;
    };

    return debounced;
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _.wrap = function(func, wrapper) {
    return _.partial(wrapper, func);
  };

  // Returns a negated version of the passed-in predicate.
  _.negate = function(predicate) {
    return function() {
      return !predicate.apply(this, arguments);
    };
  };

  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  _.compose = function() {
    var args = arguments;
    var start = args.length - 1;
    return function() {
      var i = start;
      var result = args[start].apply(this, arguments);
      while (i--) result = args[i].call(this, result);
      return result;
    };
  };

  // Returns a function that will only be executed on and after the Nth call.
  _.after = function(times, func) {
    return function() {
      if (--times < 1) {
        return func.apply(this, arguments);
      }
    };
  };

  // Returns a function that will only be executed up to (but not including) the Nth call.
  _.before = function(times, func) {
    var memo;
    return function() {
      if (--times > 0) {
        memo = func.apply(this, arguments);
      }
      if (times <= 1) func = null;
      return memo;
    };
  };

  // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.
  _.once = _.partial(_.before, 2);

  _.restArguments = restArguments;

  // Object Functions
  // ----------------

  // Keys in IE < 9 that won't be iterated by `for key in ...` and thus missed.
  var hasEnumBug = !{toString: null}.propertyIsEnumerable('toString');
  var nonEnumerableProps = ['valueOf', 'isPrototypeOf', 'toString',
    'propertyIsEnumerable', 'hasOwnProperty', 'toLocaleString'];

  var collectNonEnumProps = function(obj, keys) {
    var nonEnumIdx = nonEnumerableProps.length;
    var constructor = obj.constructor;
    var proto = _.isFunction(constructor) && constructor.prototype || ObjProto;

    // Constructor is a special case.
    var prop = 'constructor';
    if (has(obj, prop) && !_.contains(keys, prop)) keys.push(prop);

    while (nonEnumIdx--) {
      prop = nonEnumerableProps[nonEnumIdx];
      if (prop in obj && obj[prop] !== proto[prop] && !_.contains(keys, prop)) {
        keys.push(prop);
      }
    }
  };

  // Retrieve the names of an object's own properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`.
  _.keys = function(obj) {
    if (!_.isObject(obj)) return [];
    if (nativeKeys) return nativeKeys(obj);
    var keys = [];
    for (var key in obj) if (has(obj, key)) keys.push(key);
    // Ahem, IE < 9.
    if (hasEnumBug) collectNonEnumProps(obj, keys);
    return keys;
  };

  // Retrieve all the property names of an object.
  _.allKeys = function(obj) {
    if (!_.isObject(obj)) return [];
    var keys = [];
    for (var key in obj) keys.push(key);
    // Ahem, IE < 9.
    if (hasEnumBug) collectNonEnumProps(obj, keys);
    return keys;
  };

  // Retrieve the values of an object's properties.
  _.values = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var values = Array(length);
    for (var i = 0; i < length; i++) {
      values[i] = obj[keys[i]];
    }
    return values;
  };

  // Returns the results of applying the iteratee to each element of the object.
  // In contrast to _.map it returns an object.
  _.mapObject = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    var keys = _.keys(obj),
        length = keys.length,
        results = {};
    for (var index = 0; index < length; index++) {
      var currentKey = keys[index];
      results[currentKey] = iteratee(obj[currentKey], currentKey, obj);
    }
    return results;
  };

  // Convert an object into a list of `[key, value]` pairs.
  // The opposite of _.object.
  _.pairs = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var pairs = Array(length);
    for (var i = 0; i < length; i++) {
      pairs[i] = [keys[i], obj[keys[i]]];
    }
    return pairs;
  };

  // Invert the keys and values of an object. The values must be serializable.
  _.invert = function(obj) {
    var result = {};
    var keys = _.keys(obj);
    for (var i = 0, length = keys.length; i < length; i++) {
      result[obj[keys[i]]] = keys[i];
    }
    return result;
  };

  // Return a sorted list of the function names available on the object.
  // Aliased as `methods`.
  _.functions = _.methods = function(obj) {
    var names = [];
    for (var key in obj) {
      if (_.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  };

  // An internal function for creating assigner functions.
  var createAssigner = function(keysFunc, defaults) {
    return function(obj) {
      var length = arguments.length;
      if (defaults) obj = Object(obj);
      if (length < 2 || obj == null) return obj;
      for (var index = 1; index < length; index++) {
        var source = arguments[index],
            keys = keysFunc(source),
            l = keys.length;
        for (var i = 0; i < l; i++) {
          var key = keys[i];
          if (!defaults || obj[key] === void 0) obj[key] = source[key];
        }
      }
      return obj;
    };
  };

  // Extend a given object with all the properties in passed-in object(s).
  _.extend = createAssigner(_.allKeys);

  // Assigns a given object with all the own properties in the passed-in object(s).
  // (https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object/assign)
  _.extendOwn = _.assign = createAssigner(_.keys);

  // Returns the first key on an object that passes a predicate test.
  _.findKey = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = _.keys(obj), key;
    for (var i = 0, length = keys.length; i < length; i++) {
      key = keys[i];
      if (predicate(obj[key], key, obj)) return key;
    }
  };

  // Internal pick helper function to determine if `obj` has key `key`.
  var keyInObj = function(value, key, obj) {
    return key in obj;
  };

  // Return a copy of the object only containing the whitelisted properties.
  _.pick = restArguments(function(obj, keys) {
    var result = {}, iteratee = keys[0];
    if (obj == null) return result;
    if (_.isFunction(iteratee)) {
      if (keys.length > 1) iteratee = optimizeCb(iteratee, keys[1]);
      keys = _.allKeys(obj);
    } else {
      iteratee = keyInObj;
      keys = flatten(keys, false, false);
      obj = Object(obj);
    }
    for (var i = 0, length = keys.length; i < length; i++) {
      var key = keys[i];
      var value = obj[key];
      if (iteratee(value, key, obj)) result[key] = value;
    }
    return result;
  });

  // Return a copy of the object without the blacklisted properties.
  _.omit = restArguments(function(obj, keys) {
    var iteratee = keys[0], context;
    if (_.isFunction(iteratee)) {
      iteratee = _.negate(iteratee);
      if (keys.length > 1) context = keys[1];
    } else {
      keys = _.map(flatten(keys, false, false), String);
      iteratee = function(value, key) {
        return !_.contains(keys, key);
      };
    }
    return _.pick(obj, iteratee, context);
  });

  // Fill in a given object with default properties.
  _.defaults = createAssigner(_.allKeys, true);

  // Creates an object that inherits from the given prototype object.
  // If additional properties are provided then they will be added to the
  // created object.
  _.create = function(prototype, props) {
    var result = baseCreate(prototype);
    if (props) _.extendOwn(result, props);
    return result;
  };

  // Create a (shallow-cloned) duplicate of an object.
  _.clone = function(obj) {
    if (!_.isObject(obj)) return obj;
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };

  // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.
  _.tap = function(obj, interceptor) {
    interceptor(obj);
    return obj;
  };

  // Returns whether an object has a given set of `key:value` pairs.
  _.isMatch = function(object, attrs) {
    var keys = _.keys(attrs), length = keys.length;
    if (object == null) return !length;
    var obj = Object(object);
    for (var i = 0; i < length; i++) {
      var key = keys[i];
      if (attrs[key] !== obj[key] || !(key in obj)) return false;
    }
    return true;
  };


  // Internal recursive comparison function for `isEqual`.
  var eq, deepEq;
  eq = function(a, b, aStack, bStack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
    if (a === b) return a !== 0 || 1 / a === 1 / b;
    // `null` or `undefined` only equal to itself (strict comparison).
    if (a == null || b == null) return false;
    // `NaN`s are equivalent, but non-reflexive.
    if (a !== a) return b !== b;
    // Exhaust primitive checks
    var type = typeof a;
    if (type !== 'function' && type !== 'object' && typeof b != 'object') return false;
    return deepEq(a, b, aStack, bStack);
  };

  // Internal recursive comparison function for `isEqual`.
  deepEq = function(a, b, aStack, bStack) {
    // Unwrap any wrapped objects.
    if (a instanceof _) a = a._wrapped;
    if (b instanceof _) b = b._wrapped;
    // Compare `[[Class]]` names.
    var className = toString.call(a);
    if (className !== toString.call(b)) return false;
    switch (className) {
      // Strings, numbers, regular expressions, dates, and booleans are compared by value.
      case '[object RegExp]':
      // RegExps are coerced to strings for comparison (Note: '' + /a/i === '/a/i')
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return '' + a === '' + b;
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive.
        // Object(NaN) is equivalent to NaN.
        if (+a !== +a) return +b !== +b;
        // An `egal` comparison is performed for other numeric values.
        return +a === 0 ? 1 / +a === 1 / b : +a === +b;
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a === +b;
      case '[object Symbol]':
        return SymbolProto.valueOf.call(a) === SymbolProto.valueOf.call(b);
    }

    var areArrays = className === '[object Array]';
    if (!areArrays) {
      if (typeof a != 'object' || typeof b != 'object') return false;

      // Objects with different constructors are not equivalent, but `Object`s or `Array`s
      // from different frames are.
      var aCtor = a.constructor, bCtor = b.constructor;
      if (aCtor !== bCtor && !(_.isFunction(aCtor) && aCtor instanceof aCtor &&
                               _.isFunction(bCtor) && bCtor instanceof bCtor)
                          && ('constructor' in a && 'constructor' in b)) {
        return false;
      }
    }
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.

    // Initializing stack of traversed objects.
    // It's done here since we only need them for objects and arrays comparison.
    aStack = aStack || [];
    bStack = bStack || [];
    var length = aStack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (aStack[length] === a) return bStack[length] === b;
    }

    // Add the first object to the stack of traversed objects.
    aStack.push(a);
    bStack.push(b);

    // Recursively compare objects and arrays.
    if (areArrays) {
      // Compare array lengths to determine if a deep comparison is necessary.
      length = a.length;
      if (length !== b.length) return false;
      // Deep compare the contents, ignoring non-numeric properties.
      while (length--) {
        if (!eq(a[length], b[length], aStack, bStack)) return false;
      }
    } else {
      // Deep compare objects.
      var keys = _.keys(a), key;
      length = keys.length;
      // Ensure that both objects contain the same number of properties before comparing deep equality.
      if (_.keys(b).length !== length) return false;
      while (length--) {
        // Deep compare each member
        key = keys[length];
        if (!(has(b, key) && eq(a[key], b[key], aStack, bStack))) return false;
      }
    }
    // Remove the first object from the stack of traversed objects.
    aStack.pop();
    bStack.pop();
    return true;
  };

  // Perform a deep comparison to check if two objects are equal.
  _.isEqual = function(a, b) {
    return eq(a, b);
  };

  // Is a given array, string, or object empty?
  // An "empty" object has no enumerable own-properties.
  _.isEmpty = function(obj) {
    if (obj == null) return true;
    if (isArrayLike(obj) && (_.isArray(obj) || _.isString(obj) || _.isArguments(obj))) return obj.length === 0;
    return _.keys(obj).length === 0;
  };

  // Is a given value a DOM element?
  _.isElement = function(obj) {
    return !!(obj && obj.nodeType === 1);
  };

  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  _.isArray = nativeIsArray || function(obj) {
    return toString.call(obj) === '[object Array]';
  };

  // Is a given variable an object?
  _.isObject = function(obj) {
    var type = typeof obj;
    return type === 'function' || type === 'object' && !!obj;
  };

  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp, isError, isMap, isWeakMap, isSet, isWeakSet.
  _.each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp', 'Error', 'Symbol', 'Map', 'WeakMap', 'Set', 'WeakSet'], function(name) {
    _['is' + name] = function(obj) {
      return toString.call(obj) === '[object ' + name + ']';
    };
  });

  // Define a fallback version of the method in browsers (ahem, IE < 9), where
  // there isn't any inspectable "Arguments" type.
  if (!_.isArguments(arguments)) {
    _.isArguments = function(obj) {
      return has(obj, 'callee');
    };
  }

  // Optimize `isFunction` if appropriate. Work around some typeof bugs in old v8,
  // IE 11 (#1621), Safari 8 (#1929), and PhantomJS (#2236).
  var nodelist = root.document && root.document.childNodes;
  if (typeof /./ != 'function' && typeof Int8Array != 'object' && typeof nodelist != 'function') {
    _.isFunction = function(obj) {
      return typeof obj == 'function' || false;
    };
  }

  // Is a given object a finite number?
  _.isFinite = function(obj) {
    return !_.isSymbol(obj) && isFinite(obj) && !isNaN(parseFloat(obj));
  };

  // Is the given value `NaN`?
  _.isNaN = function(obj) {
    return _.isNumber(obj) && isNaN(obj);
  };

  // Is a given value a boolean?
  _.isBoolean = function(obj) {
    return obj === true || obj === false || toString.call(obj) === '[object Boolean]';
  };

  // Is a given value equal to null?
  _.isNull = function(obj) {
    return obj === null;
  };

  // Is a given variable undefined?
  _.isUndefined = function(obj) {
    return obj === void 0;
  };

  // Shortcut function for checking if an object has a given property directly
  // on itself (in other words, not on a prototype).
  _.has = function(obj, path) {
    if (!_.isArray(path)) {
      return has(obj, path);
    }
    var length = path.length;
    for (var i = 0; i < length; i++) {
      var key = path[i];
      if (obj == null || !hasOwnProperty.call(obj, key)) {
        return false;
      }
      obj = obj[key];
    }
    return !!length;
  };

  // Utility Functions
  // -----------------

  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };

  // Keep the identity function around for default iteratees.
  _.identity = function(value) {
    return value;
  };

  // Predicate-generating functions. Often useful outside of Underscore.
  _.constant = function(value) {
    return function() {
      return value;
    };
  };

  _.noop = function(){};

  // Creates a function that, when passed an object, will traverse that objectâ€™s
  // properties down the given `path`, specified as an array of keys or indexes.
  _.property = function(path) {
    if (!_.isArray(path)) {
      return shallowProperty(path);
    }
    return function(obj) {
      return deepGet(obj, path);
    };
  };

  // Generates a function for a given object that returns a given property.
  _.propertyOf = function(obj) {
    if (obj == null) {
      return function(){};
    }
    return function(path) {
      return !_.isArray(path) ? obj[path] : deepGet(obj, path);
    };
  };

  // Returns a predicate for checking whether an object has a given set of
  // `key:value` pairs.
  _.matcher = _.matches = function(attrs) {
    attrs = _.extendOwn({}, attrs);
    return function(obj) {
      return _.isMatch(obj, attrs);
    };
  };

  // Run a function **n** times.
  _.times = function(n, iteratee, context) {
    var accum = Array(Math.max(0, n));
    iteratee = optimizeCb(iteratee, context, 1);
    for (var i = 0; i < n; i++) accum[i] = iteratee(i);
    return accum;
  };

  // Return a random integer between min and max (inclusive).
  _.random = function(min, max) {
    if (max == null) {
      max = min;
      min = 0;
    }
    return min + Math.floor(Math.random() * (max - min + 1));
  };

  // A (possibly faster) way to get the current timestamp as an integer.
  _.now = Date.now || function() {
    return new Date().getTime();
  };

  // List of HTML entities for escaping.
  var escapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '`': '&#x60;'
  };
  var unescapeMap = _.invert(escapeMap);

  // Functions for escaping and unescaping strings to/from HTML interpolation.
  var createEscaper = function(map) {
    var escaper = function(match) {
      return map[match];
    };
    // Regexes for identifying a key that needs to be escaped.
    var source = '(?:' + _.keys(map).join('|') + ')';
    var testRegexp = RegExp(source);
    var replaceRegexp = RegExp(source, 'g');
    return function(string) {
      string = string == null ? '' : '' + string;
      return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
    };
  };
  _.escape = createEscaper(escapeMap);
  _.unescape = createEscaper(unescapeMap);

  // Traverses the children of `obj` along `path`. If a child is a function, it
  // is invoked with its parent as context. Returns the value of the final
  // child, or `fallback` if any child is undefined.
  _.result = function(obj, path, fallback) {
    if (!_.isArray(path)) path = [path];
    var length = path.length;
    if (!length) {
      return _.isFunction(fallback) ? fallback.call(obj) : fallback;
    }
    for (var i = 0; i < length; i++) {
      var prop = obj == null ? void 0 : obj[path[i]];
      if (prop === void 0) {
        prop = fallback;
        i = length; // Ensure we don't continue iterating.
      }
      obj = _.isFunction(prop) ? prop.call(obj) : prop;
    }
    return obj;
  };

  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  var idCounter = 0;
  _.uniqueId = function(prefix) {
    var id = ++idCounter + '';
    return prefix ? prefix + id : id;
  };

  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _.templateSettings = {
    evaluate: /<%([\s\S]+?)%>/g,
    interpolate: /<%=([\s\S]+?)%>/g,
    escape: /<%-([\s\S]+?)%>/g
  };

  // When customizing `templateSettings`, if you don't want to define an
  // interpolation, evaluation or escaping regex, we need one that is
  // guaranteed not to match.
  var noMatch = /(.)^/;

  // Certain characters need to be escaped so that they can be put into a
  // string literal.
  var escapes = {
    "'": "'",
    '\\': '\\',
    '\r': 'r',
    '\n': 'n',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };

  var escapeRegExp = /\\|'|\r|\n|\u2028|\u2029/g;

  var escapeChar = function(match) {
    return '\\' + escapes[match];
  };

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  // NB: `oldSettings` only exists for backwards compatibility.
  _.template = function(text, settings, oldSettings) {
    if (!settings && oldSettings) settings = oldSettings;
    settings = _.defaults({}, settings, _.templateSettings);

    // Combine delimiters into one regular expression via alternation.
    var matcher = RegExp([
      (settings.escape || noMatch).source,
      (settings.interpolate || noMatch).source,
      (settings.evaluate || noMatch).source
    ].join('|') + '|$', 'g');

    // Compile the template source, escaping string literals appropriately.
    var index = 0;
    var source = "__p+='";
    text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
      source += text.slice(index, offset).replace(escapeRegExp, escapeChar);
      index = offset + match.length;

      if (escape) {
        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
      } else if (interpolate) {
        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
      } else if (evaluate) {
        source += "';\n" + evaluate + "\n__p+='";
      }

      // Adobe VMs need the match returned to produce the correct offset.
      return match;
    });
    source += "';\n";

    // If a variable is not specified, place data values in local scope.
    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

    source = "var __t,__p='',__j=Array.prototype.join," +
      "print=function(){__p+=__j.call(arguments,'');};\n" +
      source + 'return __p;\n';

    var render;
    try {
      render = new Function(settings.variable || 'obj', '_', source);
    } catch (e) {
      e.source = source;
      throw e;
    }

    var template = function(data) {
      return render.call(this, data, _);
    };

    // Provide the compiled source as a convenience for precompilation.
    var argument = settings.variable || 'obj';
    template.source = 'function(' + argument + '){\n' + source + '}';

    return template;
  };

  // Add a "chain" function. Start chaining a wrapped Underscore object.
  _.chain = function(obj) {
    var instance = _(obj);
    instance._chain = true;
    return instance;
  };

  // OOP
  // ---------------
  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OOV4-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.

  // Helper function to continue chaining intermediate results.
  var chainResult = function(instance, obj) {
    return instance._chain ? _(obj).chain() : obj;
  };

  // Add your own custom functions to the Underscore object.
  _.mixin = function(obj) {
    _.each(_.functions(obj), function(name) {
      var func = _[name] = obj[name];
      _.prototype[name] = function() {
        var args = [this._wrapped];
        push.apply(args, arguments);
        return chainResult(this, func.apply(_, args));
      };
    });
    return _;
  };

  // Add all of the Underscore functions to the wrapper object.
  _.mixin(_);

  // Add all mutator Array functions to the wrapper.
  _.each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      var obj = this._wrapped;
      method.apply(obj, arguments);
      if ((name === 'shift' || name === 'splice') && obj.length === 0) delete obj[0];
      return chainResult(this, obj);
    };
  });

  // Add all accessor Array functions to the wrapper.
  _.each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      return chainResult(this, method.apply(this._wrapped, arguments));
    };
  });

  // Extracts the result from a wrapped and chained object.
  _.prototype.value = function() {
    return this._wrapped;
  };

  // Provide unwrapping proxy for some methods used in engine operations
  // such as arithmetic and JSON stringification.
  _.prototype.valueOf = _.prototype.toJSON = _.prototype.value;

  _.prototype.toString = function() {
    return String(this._wrapped);
  };

  // AMD registration happens at the end for compatibility with AMD loaders
  // that may not enforce next-turn semantics on modules. Even though general
  // practice for AMD registration is to be anonymous, underscore registers
  // as a named module because, like jQuery, it is a base library that is
  // popular enough to be bundled in a third party lib, but not be part of
  // an AMD load request. Those cases could generate an error when an
  // anonymous define() is called outside of a loader request.
  if (typeof define == 'function' && define.amd) {
    define('underscore', [], function() {
      return _;
    });
  }
}());

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],9:[function(require,module,exports){
module.exports = function (it) {
  if (typeof it != 'function') throw TypeError(it + ' is not a function!');
  return it;
};

},{}],10:[function(require,module,exports){
// 22.1.3.31 Array.prototype[@@unscopables]
var UNSCOPABLES = require('./_wks')('unscopables');
var ArrayProto = Array.prototype;
if (ArrayProto[UNSCOPABLES] == undefined) require('./_hide')(ArrayProto, UNSCOPABLES, {});
module.exports = function (key) {
  ArrayProto[UNSCOPABLES][key] = true;
};

},{"./_hide":30,"./_wks":73}],11:[function(require,module,exports){
var isObject = require('./_is-object');
module.exports = function (it) {
  if (!isObject(it)) throw TypeError(it + ' is not an object!');
  return it;
};

},{"./_is-object":36}],12:[function(require,module,exports){
// false -> Array#indexOf
// true  -> Array#includes
var toIObject = require('./_to-iobject');
var toLength = require('./_to-length');
var toAbsoluteIndex = require('./_to-absolute-index');
module.exports = function (IS_INCLUDES) {
  return function ($this, el, fromIndex) {
    var O = toIObject($this);
    var length = toLength(O.length);
    var index = toAbsoluteIndex(fromIndex, length);
    var value;
    // Array#includes uses SameValueZero equality algorithm
    // eslint-disable-next-line no-self-compare
    if (IS_INCLUDES && el != el) while (length > index) {
      value = O[index++];
      // eslint-disable-next-line no-self-compare
      if (value != value) return true;
    // Array#indexOf ignores holes, Array#includes - not
    } else for (;length > index; index++) if (IS_INCLUDES || index in O) {
      if (O[index] === el) return IS_INCLUDES || index || 0;
    } return !IS_INCLUDES && -1;
  };
};

},{"./_to-absolute-index":64,"./_to-iobject":66,"./_to-length":67}],13:[function(require,module,exports){
// 0 -> Array#forEach
// 1 -> Array#map
// 2 -> Array#filter
// 3 -> Array#some
// 4 -> Array#every
// 5 -> Array#find
// 6 -> Array#findIndex
var ctx = require('./_ctx');
var IObject = require('./_iobject');
var toObject = require('./_to-object');
var toLength = require('./_to-length');
var asc = require('./_array-species-create');
module.exports = function (TYPE, $create) {
  var IS_MAP = TYPE == 1;
  var IS_FILTER = TYPE == 2;
  var IS_SOME = TYPE == 3;
  var IS_EVERY = TYPE == 4;
  var IS_FIND_INDEX = TYPE == 6;
  var NO_HOLES = TYPE == 5 || IS_FIND_INDEX;
  var create = $create || asc;
  return function ($this, callbackfn, that) {
    var O = toObject($this);
    var self = IObject(O);
    var f = ctx(callbackfn, that, 3);
    var length = toLength(self.length);
    var index = 0;
    var result = IS_MAP ? create($this, length) : IS_FILTER ? create($this, 0) : undefined;
    var val, res;
    for (;length > index; index++) if (NO_HOLES || index in self) {
      val = self[index];
      res = f(val, index, O);
      if (TYPE) {
        if (IS_MAP) result[index] = res;   // map
        else if (res) switch (TYPE) {
          case 3: return true;             // some
          case 5: return val;              // find
          case 6: return index;            // findIndex
          case 2: result.push(val);        // filter
        } else if (IS_EVERY) return false; // every
      }
    }
    return IS_FIND_INDEX ? -1 : IS_SOME || IS_EVERY ? IS_EVERY : result;
  };
};

},{"./_array-species-create":15,"./_ctx":18,"./_iobject":34,"./_to-length":67,"./_to-object":68}],14:[function(require,module,exports){
var isObject = require('./_is-object');
var isArray = require('./_is-array');
var SPECIES = require('./_wks')('species');

module.exports = function (original) {
  var C;
  if (isArray(original)) {
    C = original.constructor;
    // cross-realm fallback
    if (typeof C == 'function' && (C === Array || isArray(C.prototype))) C = undefined;
    if (isObject(C)) {
      C = C[SPECIES];
      if (C === null) C = undefined;
    }
  } return C === undefined ? Array : C;
};

},{"./_is-array":35,"./_is-object":36,"./_wks":73}],15:[function(require,module,exports){
// 9.4.2.3 ArraySpeciesCreate(originalArray, length)
var speciesConstructor = require('./_array-species-constructor');

module.exports = function (original, length) {
  return new (speciesConstructor(original))(length);
};

},{"./_array-species-constructor":14}],16:[function(require,module,exports){
var toString = {}.toString;

module.exports = function (it) {
  return toString.call(it).slice(8, -1);
};

},{}],17:[function(require,module,exports){
var core = module.exports = { version: '2.5.7' };
if (typeof __e == 'number') __e = core; // eslint-disable-line no-undef

},{}],18:[function(require,module,exports){
// optional / simple context binding
var aFunction = require('./_a-function');
module.exports = function (fn, that, length) {
  aFunction(fn);
  if (that === undefined) return fn;
  switch (length) {
    case 1: return function (a) {
      return fn.call(that, a);
    };
    case 2: return function (a, b) {
      return fn.call(that, a, b);
    };
    case 3: return function (a, b, c) {
      return fn.call(that, a, b, c);
    };
  }
  return function (/* ...args */) {
    return fn.apply(that, arguments);
  };
};

},{"./_a-function":9}],19:[function(require,module,exports){
// 7.2.1 RequireObjectCoercible(argument)
module.exports = function (it) {
  if (it == undefined) throw TypeError("Can't call method on  " + it);
  return it;
};

},{}],20:[function(require,module,exports){
// Thank's IE8 for his funny defineProperty
module.exports = !require('./_fails')(function () {
  return Object.defineProperty({}, 'a', { get: function () { return 7; } }).a != 7;
});

},{"./_fails":25}],21:[function(require,module,exports){
var isObject = require('./_is-object');
var document = require('./_global').document;
// typeof document.createElement is 'object' in old IE
var is = isObject(document) && isObject(document.createElement);
module.exports = function (it) {
  return is ? document.createElement(it) : {};
};

},{"./_global":28,"./_is-object":36}],22:[function(require,module,exports){
// IE 8- don't enum bug keys
module.exports = (
  'constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf'
).split(',');

},{}],23:[function(require,module,exports){
// all enumerable object keys, includes symbols
var getKeys = require('./_object-keys');
var gOPS = require('./_object-gops');
var pIE = require('./_object-pie');
module.exports = function (it) {
  var result = getKeys(it);
  var getSymbols = gOPS.f;
  if (getSymbols) {
    var symbols = getSymbols(it);
    var isEnum = pIE.f;
    var i = 0;
    var key;
    while (symbols.length > i) if (isEnum.call(it, key = symbols[i++])) result.push(key);
  } return result;
};

},{"./_object-gops":50,"./_object-keys":53,"./_object-pie":54}],24:[function(require,module,exports){
var global = require('./_global');
var core = require('./_core');
var hide = require('./_hide');
var redefine = require('./_redefine');
var ctx = require('./_ctx');
var PROTOTYPE = 'prototype';

var $export = function (type, name, source) {
  var IS_FORCED = type & $export.F;
  var IS_GLOBAL = type & $export.G;
  var IS_STATIC = type & $export.S;
  var IS_PROTO = type & $export.P;
  var IS_BIND = type & $export.B;
  var target = IS_GLOBAL ? global : IS_STATIC ? global[name] || (global[name] = {}) : (global[name] || {})[PROTOTYPE];
  var exports = IS_GLOBAL ? core : core[name] || (core[name] = {});
  var expProto = exports[PROTOTYPE] || (exports[PROTOTYPE] = {});
  var key, own, out, exp;
  if (IS_GLOBAL) source = name;
  for (key in source) {
    // contains in native
    own = !IS_FORCED && target && target[key] !== undefined;
    // export native or passed
    out = (own ? target : source)[key];
    // bind timers to global for call from export context
    exp = IS_BIND && own ? ctx(out, global) : IS_PROTO && typeof out == 'function' ? ctx(Function.call, out) : out;
    // extend global
    if (target) redefine(target, key, out, type & $export.U);
    // export
    if (exports[key] != out) hide(exports, key, exp);
    if (IS_PROTO && expProto[key] != out) expProto[key] = out;
  }
};
global.core = core;
// type bitmap
$export.F = 1;   // forced
$export.G = 2;   // global
$export.S = 4;   // static
$export.P = 8;   // proto
$export.B = 16;  // bind
$export.W = 32;  // wrap
$export.U = 64;  // safe
$export.R = 128; // real proto method for `library`
module.exports = $export;

},{"./_core":17,"./_ctx":18,"./_global":28,"./_hide":30,"./_redefine":57}],25:[function(require,module,exports){
module.exports = function (exec) {
  try {
    return !!exec();
  } catch (e) {
    return true;
  }
};

},{}],26:[function(require,module,exports){
'use strict';
var hide = require('./_hide');
var redefine = require('./_redefine');
var fails = require('./_fails');
var defined = require('./_defined');
var wks = require('./_wks');

module.exports = function (KEY, length, exec) {
  var SYMBOL = wks(KEY);
  var fns = exec(defined, SYMBOL, ''[KEY]);
  var strfn = fns[0];
  var rxfn = fns[1];
  if (fails(function () {
    var O = {};
    O[SYMBOL] = function () { return 7; };
    return ''[KEY](O) != 7;
  })) {
    redefine(String.prototype, KEY, strfn);
    hide(RegExp.prototype, SYMBOL, length == 2
      // 21.2.5.8 RegExp.prototype[@@replace](string, replaceValue)
      // 21.2.5.11 RegExp.prototype[@@split](string, limit)
      ? function (string, arg) { return rxfn.call(string, this, arg); }
      // 21.2.5.6 RegExp.prototype[@@match](string)
      // 21.2.5.9 RegExp.prototype[@@search](string)
      : function (string) { return rxfn.call(string, this); }
    );
  }
};

},{"./_defined":19,"./_fails":25,"./_hide":30,"./_redefine":57,"./_wks":73}],27:[function(require,module,exports){
'use strict';
// 21.2.5.3 get RegExp.prototype.flags
var anObject = require('./_an-object');
module.exports = function () {
  var that = anObject(this);
  var result = '';
  if (that.global) result += 'g';
  if (that.ignoreCase) result += 'i';
  if (that.multiline) result += 'm';
  if (that.unicode) result += 'u';
  if (that.sticky) result += 'y';
  return result;
};

},{"./_an-object":11}],28:[function(require,module,exports){
// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
var global = module.exports = typeof window != 'undefined' && window.Math == Math
  ? window : typeof self != 'undefined' && self.Math == Math ? self
  // eslint-disable-next-line no-new-func
  : Function('return this')();
if (typeof __g == 'number') __g = global; // eslint-disable-line no-undef

},{}],29:[function(require,module,exports){
var hasOwnProperty = {}.hasOwnProperty;
module.exports = function (it, key) {
  return hasOwnProperty.call(it, key);
};

},{}],30:[function(require,module,exports){
var dP = require('./_object-dp');
var createDesc = require('./_property-desc');
module.exports = require('./_descriptors') ? function (object, key, value) {
  return dP.f(object, key, createDesc(1, value));
} : function (object, key, value) {
  object[key] = value;
  return object;
};

},{"./_descriptors":20,"./_object-dp":45,"./_property-desc":56}],31:[function(require,module,exports){
var document = require('./_global').document;
module.exports = document && document.documentElement;

},{"./_global":28}],32:[function(require,module,exports){
module.exports = !require('./_descriptors') && !require('./_fails')(function () {
  return Object.defineProperty(require('./_dom-create')('div'), 'a', { get: function () { return 7; } }).a != 7;
});

},{"./_descriptors":20,"./_dom-create":21,"./_fails":25}],33:[function(require,module,exports){
var isObject = require('./_is-object');
var setPrototypeOf = require('./_set-proto').set;
module.exports = function (that, target, C) {
  var S = target.constructor;
  var P;
  if (S !== C && typeof S == 'function' && (P = S.prototype) !== C.prototype && isObject(P) && setPrototypeOf) {
    setPrototypeOf(that, P);
  } return that;
};

},{"./_is-object":36,"./_set-proto":58}],34:[function(require,module,exports){
// fallback for non-array-like ES3 and non-enumerable old V8 strings
var cof = require('./_cof');
// eslint-disable-next-line no-prototype-builtins
module.exports = Object('z').propertyIsEnumerable(0) ? Object : function (it) {
  return cof(it) == 'String' ? it.split('') : Object(it);
};

},{"./_cof":16}],35:[function(require,module,exports){
// 7.2.2 IsArray(argument)
var cof = require('./_cof');
module.exports = Array.isArray || function isArray(arg) {
  return cof(arg) == 'Array';
};

},{"./_cof":16}],36:[function(require,module,exports){
module.exports = function (it) {
  return typeof it === 'object' ? it !== null : typeof it === 'function';
};

},{}],37:[function(require,module,exports){
'use strict';
var create = require('./_object-create');
var descriptor = require('./_property-desc');
var setToStringTag = require('./_set-to-string-tag');
var IteratorPrototype = {};

// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
require('./_hide')(IteratorPrototype, require('./_wks')('iterator'), function () { return this; });

module.exports = function (Constructor, NAME, next) {
  Constructor.prototype = create(IteratorPrototype, { next: descriptor(1, next) });
  setToStringTag(Constructor, NAME + ' Iterator');
};

},{"./_hide":30,"./_object-create":44,"./_property-desc":56,"./_set-to-string-tag":59,"./_wks":73}],38:[function(require,module,exports){
'use strict';
var LIBRARY = require('./_library');
var $export = require('./_export');
var redefine = require('./_redefine');
var hide = require('./_hide');
var Iterators = require('./_iterators');
var $iterCreate = require('./_iter-create');
var setToStringTag = require('./_set-to-string-tag');
var getPrototypeOf = require('./_object-gpo');
var ITERATOR = require('./_wks')('iterator');
var BUGGY = !([].keys && 'next' in [].keys()); // Safari has buggy iterators w/o `next`
var FF_ITERATOR = '@@iterator';
var KEYS = 'keys';
var VALUES = 'values';

var returnThis = function () { return this; };

module.exports = function (Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCED) {
  $iterCreate(Constructor, NAME, next);
  var getMethod = function (kind) {
    if (!BUGGY && kind in proto) return proto[kind];
    switch (kind) {
      case KEYS: return function keys() { return new Constructor(this, kind); };
      case VALUES: return function values() { return new Constructor(this, kind); };
    } return function entries() { return new Constructor(this, kind); };
  };
  var TAG = NAME + ' Iterator';
  var DEF_VALUES = DEFAULT == VALUES;
  var VALUES_BUG = false;
  var proto = Base.prototype;
  var $native = proto[ITERATOR] || proto[FF_ITERATOR] || DEFAULT && proto[DEFAULT];
  var $default = $native || getMethod(DEFAULT);
  var $entries = DEFAULT ? !DEF_VALUES ? $default : getMethod('entries') : undefined;
  var $anyNative = NAME == 'Array' ? proto.entries || $native : $native;
  var methods, key, IteratorPrototype;
  // Fix native
  if ($anyNative) {
    IteratorPrototype = getPrototypeOf($anyNative.call(new Base()));
    if (IteratorPrototype !== Object.prototype && IteratorPrototype.next) {
      // Set @@toStringTag to native iterators
      setToStringTag(IteratorPrototype, TAG, true);
      // fix for some old engines
      if (!LIBRARY && typeof IteratorPrototype[ITERATOR] != 'function') hide(IteratorPrototype, ITERATOR, returnThis);
    }
  }
  // fix Array#{values, @@iterator}.name in V8 / FF
  if (DEF_VALUES && $native && $native.name !== VALUES) {
    VALUES_BUG = true;
    $default = function values() { return $native.call(this); };
  }
  // Define iterator
  if ((!LIBRARY || FORCED) && (BUGGY || VALUES_BUG || !proto[ITERATOR])) {
    hide(proto, ITERATOR, $default);
  }
  // Plug for library
  Iterators[NAME] = $default;
  Iterators[TAG] = returnThis;
  if (DEFAULT) {
    methods = {
      values: DEF_VALUES ? $default : getMethod(VALUES),
      keys: IS_SET ? $default : getMethod(KEYS),
      entries: $entries
    };
    if (FORCED) for (key in methods) {
      if (!(key in proto)) redefine(proto, key, methods[key]);
    } else $export($export.P + $export.F * (BUGGY || VALUES_BUG), NAME, methods);
  }
  return methods;
};

},{"./_export":24,"./_hide":30,"./_iter-create":37,"./_iterators":40,"./_library":41,"./_object-gpo":51,"./_redefine":57,"./_set-to-string-tag":59,"./_wks":73}],39:[function(require,module,exports){
module.exports = function (done, value) {
  return { value: value, done: !!done };
};

},{}],40:[function(require,module,exports){
module.exports = {};

},{}],41:[function(require,module,exports){
module.exports = false;

},{}],42:[function(require,module,exports){
var META = require('./_uid')('meta');
var isObject = require('./_is-object');
var has = require('./_has');
var setDesc = require('./_object-dp').f;
var id = 0;
var isExtensible = Object.isExtensible || function () {
  return true;
};
var FREEZE = !require('./_fails')(function () {
  return isExtensible(Object.preventExtensions({}));
});
var setMeta = function (it) {
  setDesc(it, META, { value: {
    i: 'O' + ++id, // object ID
    w: {}          // weak collections IDs
  } });
};
var fastKey = function (it, create) {
  // return primitive with prefix
  if (!isObject(it)) return typeof it == 'symbol' ? it : (typeof it == 'string' ? 'S' : 'P') + it;
  if (!has(it, META)) {
    // can't set metadata to uncaught frozen object
    if (!isExtensible(it)) return 'F';
    // not necessary to add metadata
    if (!create) return 'E';
    // add missing metadata
    setMeta(it);
  // return object ID
  } return it[META].i;
};
var getWeak = function (it, create) {
  if (!has(it, META)) {
    // can't set metadata to uncaught frozen object
    if (!isExtensible(it)) return true;
    // not necessary to add metadata
    if (!create) return false;
    // add missing metadata
    setMeta(it);
  // return hash weak collections IDs
  } return it[META].w;
};
// add metadata on freeze-family methods calling
var onFreeze = function (it) {
  if (FREEZE && meta.NEED && isExtensible(it) && !has(it, META)) setMeta(it);
  return it;
};
var meta = module.exports = {
  KEY: META,
  NEED: false,
  fastKey: fastKey,
  getWeak: getWeak,
  onFreeze: onFreeze
};

},{"./_fails":25,"./_has":29,"./_is-object":36,"./_object-dp":45,"./_uid":70}],43:[function(require,module,exports){
'use strict';
// 19.1.2.1 Object.assign(target, source, ...)
var getKeys = require('./_object-keys');
var gOPS = require('./_object-gops');
var pIE = require('./_object-pie');
var toObject = require('./_to-object');
var IObject = require('./_iobject');
var $assign = Object.assign;

// should work with symbols and should have deterministic property order (V8 bug)
module.exports = !$assign || require('./_fails')(function () {
  var A = {};
  var B = {};
  // eslint-disable-next-line no-undef
  var S = Symbol();
  var K = 'abcdefghijklmnopqrst';
  A[S] = 7;
  K.split('').forEach(function (k) { B[k] = k; });
  return $assign({}, A)[S] != 7 || Object.keys($assign({}, B)).join('') != K;
}) ? function assign(target, source) { // eslint-disable-line no-unused-vars
  var T = toObject(target);
  var aLen = arguments.length;
  var index = 1;
  var getSymbols = gOPS.f;
  var isEnum = pIE.f;
  while (aLen > index) {
    var S = IObject(arguments[index++]);
    var keys = getSymbols ? getKeys(S).concat(getSymbols(S)) : getKeys(S);
    var length = keys.length;
    var j = 0;
    var key;
    while (length > j) if (isEnum.call(S, key = keys[j++])) T[key] = S[key];
  } return T;
} : $assign;

},{"./_fails":25,"./_iobject":34,"./_object-gops":50,"./_object-keys":53,"./_object-pie":54,"./_to-object":68}],44:[function(require,module,exports){
// 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
var anObject = require('./_an-object');
var dPs = require('./_object-dps');
var enumBugKeys = require('./_enum-bug-keys');
var IE_PROTO = require('./_shared-key')('IE_PROTO');
var Empty = function () { /* empty */ };
var PROTOTYPE = 'prototype';

// Create object with fake `null` prototype: use iframe Object with cleared prototype
var createDict = function () {
  // Thrash, waste and sodomy: IE GC bug
  var iframe = require('./_dom-create')('iframe');
  var i = enumBugKeys.length;
  var lt = '<';
  var gt = '>';
  var iframeDocument;
  iframe.style.display = 'none';
  require('./_html').appendChild(iframe);
  iframe.src = 'javascript:'; // eslint-disable-line no-script-url
  // createDict = iframe.contentWindow.Object;
  // html.removeChild(iframe);
  iframeDocument = iframe.contentWindow.document;
  iframeDocument.open();
  iframeDocument.write(lt + 'script' + gt + 'document.F=Object' + lt + '/script' + gt);
  iframeDocument.close();
  createDict = iframeDocument.F;
  while (i--) delete createDict[PROTOTYPE][enumBugKeys[i]];
  return createDict();
};

module.exports = Object.create || function create(O, Properties) {
  var result;
  if (O !== null) {
    Empty[PROTOTYPE] = anObject(O);
    result = new Empty();
    Empty[PROTOTYPE] = null;
    // add "__proto__" for Object.getPrototypeOf polyfill
    result[IE_PROTO] = O;
  } else result = createDict();
  return Properties === undefined ? result : dPs(result, Properties);
};

},{"./_an-object":11,"./_dom-create":21,"./_enum-bug-keys":22,"./_html":31,"./_object-dps":46,"./_shared-key":60}],45:[function(require,module,exports){
var anObject = require('./_an-object');
var IE8_DOM_DEFINE = require('./_ie8-dom-define');
var toPrimitive = require('./_to-primitive');
var dP = Object.defineProperty;

exports.f = require('./_descriptors') ? Object.defineProperty : function defineProperty(O, P, Attributes) {
  anObject(O);
  P = toPrimitive(P, true);
  anObject(Attributes);
  if (IE8_DOM_DEFINE) try {
    return dP(O, P, Attributes);
  } catch (e) { /* empty */ }
  if ('get' in Attributes || 'set' in Attributes) throw TypeError('Accessors not supported!');
  if ('value' in Attributes) O[P] = Attributes.value;
  return O;
};

},{"./_an-object":11,"./_descriptors":20,"./_ie8-dom-define":32,"./_to-primitive":69}],46:[function(require,module,exports){
var dP = require('./_object-dp');
var anObject = require('./_an-object');
var getKeys = require('./_object-keys');

module.exports = require('./_descriptors') ? Object.defineProperties : function defineProperties(O, Properties) {
  anObject(O);
  var keys = getKeys(Properties);
  var length = keys.length;
  var i = 0;
  var P;
  while (length > i) dP.f(O, P = keys[i++], Properties[P]);
  return O;
};

},{"./_an-object":11,"./_descriptors":20,"./_object-dp":45,"./_object-keys":53}],47:[function(require,module,exports){
var pIE = require('./_object-pie');
var createDesc = require('./_property-desc');
var toIObject = require('./_to-iobject');
var toPrimitive = require('./_to-primitive');
var has = require('./_has');
var IE8_DOM_DEFINE = require('./_ie8-dom-define');
var gOPD = Object.getOwnPropertyDescriptor;

exports.f = require('./_descriptors') ? gOPD : function getOwnPropertyDescriptor(O, P) {
  O = toIObject(O);
  P = toPrimitive(P, true);
  if (IE8_DOM_DEFINE) try {
    return gOPD(O, P);
  } catch (e) { /* empty */ }
  if (has(O, P)) return createDesc(!pIE.f.call(O, P), O[P]);
};

},{"./_descriptors":20,"./_has":29,"./_ie8-dom-define":32,"./_object-pie":54,"./_property-desc":56,"./_to-iobject":66,"./_to-primitive":69}],48:[function(require,module,exports){
// fallback for IE11 buggy Object.getOwnPropertyNames with iframe and window
var toIObject = require('./_to-iobject');
var gOPN = require('./_object-gopn').f;
var toString = {}.toString;

var windowNames = typeof window == 'object' && window && Object.getOwnPropertyNames
  ? Object.getOwnPropertyNames(window) : [];

var getWindowNames = function (it) {
  try {
    return gOPN(it);
  } catch (e) {
    return windowNames.slice();
  }
};

module.exports.f = function getOwnPropertyNames(it) {
  return windowNames && toString.call(it) == '[object Window]' ? getWindowNames(it) : gOPN(toIObject(it));
};

},{"./_object-gopn":49,"./_to-iobject":66}],49:[function(require,module,exports){
// 19.1.2.7 / 15.2.3.4 Object.getOwnPropertyNames(O)
var $keys = require('./_object-keys-internal');
var hiddenKeys = require('./_enum-bug-keys').concat('length', 'prototype');

exports.f = Object.getOwnPropertyNames || function getOwnPropertyNames(O) {
  return $keys(O, hiddenKeys);
};

},{"./_enum-bug-keys":22,"./_object-keys-internal":52}],50:[function(require,module,exports){
exports.f = Object.getOwnPropertySymbols;

},{}],51:[function(require,module,exports){
// 19.1.2.9 / 15.2.3.2 Object.getPrototypeOf(O)
var has = require('./_has');
var toObject = require('./_to-object');
var IE_PROTO = require('./_shared-key')('IE_PROTO');
var ObjectProto = Object.prototype;

module.exports = Object.getPrototypeOf || function (O) {
  O = toObject(O);
  if (has(O, IE_PROTO)) return O[IE_PROTO];
  if (typeof O.constructor == 'function' && O instanceof O.constructor) {
    return O.constructor.prototype;
  } return O instanceof Object ? ObjectProto : null;
};

},{"./_has":29,"./_shared-key":60,"./_to-object":68}],52:[function(require,module,exports){
var has = require('./_has');
var toIObject = require('./_to-iobject');
var arrayIndexOf = require('./_array-includes')(false);
var IE_PROTO = require('./_shared-key')('IE_PROTO');

module.exports = function (object, names) {
  var O = toIObject(object);
  var i = 0;
  var result = [];
  var key;
  for (key in O) if (key != IE_PROTO) has(O, key) && result.push(key);
  // Don't enum bug & hidden keys
  while (names.length > i) if (has(O, key = names[i++])) {
    ~arrayIndexOf(result, key) || result.push(key);
  }
  return result;
};

},{"./_array-includes":12,"./_has":29,"./_shared-key":60,"./_to-iobject":66}],53:[function(require,module,exports){
// 19.1.2.14 / 15.2.3.14 Object.keys(O)
var $keys = require('./_object-keys-internal');
var enumBugKeys = require('./_enum-bug-keys');

module.exports = Object.keys || function keys(O) {
  return $keys(O, enumBugKeys);
};

},{"./_enum-bug-keys":22,"./_object-keys-internal":52}],54:[function(require,module,exports){
exports.f = {}.propertyIsEnumerable;

},{}],55:[function(require,module,exports){
// most Object methods by ES6 should accept primitives
var $export = require('./_export');
var core = require('./_core');
var fails = require('./_fails');
module.exports = function (KEY, exec) {
  var fn = (core.Object || {})[KEY] || Object[KEY];
  var exp = {};
  exp[KEY] = exec(fn);
  $export($export.S + $export.F * fails(function () { fn(1); }), 'Object', exp);
};

},{"./_core":17,"./_export":24,"./_fails":25}],56:[function(require,module,exports){
module.exports = function (bitmap, value) {
  return {
    enumerable: !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable: !(bitmap & 4),
    value: value
  };
};

},{}],57:[function(require,module,exports){
var global = require('./_global');
var hide = require('./_hide');
var has = require('./_has');
var SRC = require('./_uid')('src');
var TO_STRING = 'toString';
var $toString = Function[TO_STRING];
var TPL = ('' + $toString).split(TO_STRING);

require('./_core').inspectSource = function (it) {
  return $toString.call(it);
};

(module.exports = function (O, key, val, safe) {
  var isFunction = typeof val == 'function';
  if (isFunction) has(val, 'name') || hide(val, 'name', key);
  if (O[key] === val) return;
  if (isFunction) has(val, SRC) || hide(val, SRC, O[key] ? '' + O[key] : TPL.join(String(key)));
  if (O === global) {
    O[key] = val;
  } else if (!safe) {
    delete O[key];
    hide(O, key, val);
  } else if (O[key]) {
    O[key] = val;
  } else {
    hide(O, key, val);
  }
// add fake Function#toString for correct work wrapped methods / constructors with methods like LoDash isNative
})(Function.prototype, TO_STRING, function toString() {
  return typeof this == 'function' && this[SRC] || $toString.call(this);
});

},{"./_core":17,"./_global":28,"./_has":29,"./_hide":30,"./_uid":70}],58:[function(require,module,exports){
// Works with __proto__ only. Old v8 can't work with null proto objects.
/* eslint-disable no-proto */
var isObject = require('./_is-object');
var anObject = require('./_an-object');
var check = function (O, proto) {
  anObject(O);
  if (!isObject(proto) && proto !== null) throw TypeError(proto + ": can't set as prototype!");
};
module.exports = {
  set: Object.setPrototypeOf || ('__proto__' in {} ? // eslint-disable-line
    function (test, buggy, set) {
      try {
        set = require('./_ctx')(Function.call, require('./_object-gopd').f(Object.prototype, '__proto__').set, 2);
        set(test, []);
        buggy = !(test instanceof Array);
      } catch (e) { buggy = true; }
      return function setPrototypeOf(O, proto) {
        check(O, proto);
        if (buggy) O.__proto__ = proto;
        else set(O, proto);
        return O;
      };
    }({}, false) : undefined),
  check: check
};

},{"./_an-object":11,"./_ctx":18,"./_is-object":36,"./_object-gopd":47}],59:[function(require,module,exports){
var def = require('./_object-dp').f;
var has = require('./_has');
var TAG = require('./_wks')('toStringTag');

module.exports = function (it, tag, stat) {
  if (it && !has(it = stat ? it : it.prototype, TAG)) def(it, TAG, { configurable: true, value: tag });
};

},{"./_has":29,"./_object-dp":45,"./_wks":73}],60:[function(require,module,exports){
var shared = require('./_shared')('keys');
var uid = require('./_uid');
module.exports = function (key) {
  return shared[key] || (shared[key] = uid(key));
};

},{"./_shared":61,"./_uid":70}],61:[function(require,module,exports){
var core = require('./_core');
var global = require('./_global');
var SHARED = '__core-js_shared__';
var store = global[SHARED] || (global[SHARED] = {});

(module.exports = function (key, value) {
  return store[key] || (store[key] = value !== undefined ? value : {});
})('versions', []).push({
  version: core.version,
  mode: require('./_library') ? 'pure' : 'global',
  copyright: 'Â© 2018 Denis Pushkarev (zloirock.ru)'
});

},{"./_core":17,"./_global":28,"./_library":41}],62:[function(require,module,exports){
var $export = require('./_export');
var defined = require('./_defined');
var fails = require('./_fails');
var spaces = require('./_string-ws');
var space = '[' + spaces + ']';
var non = '\u200b\u0085';
var ltrim = RegExp('^' + space + space + '*');
var rtrim = RegExp(space + space + '*$');

var exporter = function (KEY, exec, ALIAS) {
  var exp = {};
  var FORCE = fails(function () {
    return !!spaces[KEY]() || non[KEY]() != non;
  });
  var fn = exp[KEY] = FORCE ? exec(trim) : spaces[KEY];
  if (ALIAS) exp[ALIAS] = fn;
  $export($export.P + $export.F * FORCE, 'String', exp);
};

// 1 -> String#trimLeft
// 2 -> String#trimRight
// 3 -> String#trim
var trim = exporter.trim = function (string, TYPE) {
  string = String(defined(string));
  if (TYPE & 1) string = string.replace(ltrim, '');
  if (TYPE & 2) string = string.replace(rtrim, '');
  return string;
};

module.exports = exporter;

},{"./_defined":19,"./_export":24,"./_fails":25,"./_string-ws":63}],63:[function(require,module,exports){
module.exports = '\x09\x0A\x0B\x0C\x0D\x20\xA0\u1680\u180E\u2000\u2001\u2002\u2003' +
  '\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF';

},{}],64:[function(require,module,exports){
var toInteger = require('./_to-integer');
var max = Math.max;
var min = Math.min;
module.exports = function (index, length) {
  index = toInteger(index);
  return index < 0 ? max(index + length, 0) : min(index, length);
};

},{"./_to-integer":65}],65:[function(require,module,exports){
// 7.1.4 ToInteger
var ceil = Math.ceil;
var floor = Math.floor;
module.exports = function (it) {
  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
};

},{}],66:[function(require,module,exports){
// to indexed object, toObject with fallback for non-array-like ES3 strings
var IObject = require('./_iobject');
var defined = require('./_defined');
module.exports = function (it) {
  return IObject(defined(it));
};

},{"./_defined":19,"./_iobject":34}],67:[function(require,module,exports){
// 7.1.15 ToLength
var toInteger = require('./_to-integer');
var min = Math.min;
module.exports = function (it) {
  return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
};

},{"./_to-integer":65}],68:[function(require,module,exports){
// 7.1.13 ToObject(argument)
var defined = require('./_defined');
module.exports = function (it) {
  return Object(defined(it));
};

},{"./_defined":19}],69:[function(require,module,exports){
// 7.1.1 ToPrimitive(input [, PreferredType])
var isObject = require('./_is-object');
// instead of the ES6 spec version, we didn't implement @@toPrimitive case
// and the second argument - flag - preferred type is a string
module.exports = function (it, S) {
  if (!isObject(it)) return it;
  var fn, val;
  if (S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it))) return val;
  if (typeof (fn = it.valueOf) == 'function' && !isObject(val = fn.call(it))) return val;
  if (!S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it))) return val;
  throw TypeError("Can't convert object to primitive value");
};

},{"./_is-object":36}],70:[function(require,module,exports){
var id = 0;
var px = Math.random();
module.exports = function (key) {
  return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
};

},{}],71:[function(require,module,exports){
var global = require('./_global');
var core = require('./_core');
var LIBRARY = require('./_library');
var wksExt = require('./_wks-ext');
var defineProperty = require('./_object-dp').f;
module.exports = function (name) {
  var $Symbol = core.Symbol || (core.Symbol = LIBRARY ? {} : global.Symbol || {});
  if (name.charAt(0) != '_' && !(name in $Symbol)) defineProperty($Symbol, name, { value: wksExt.f(name) });
};

},{"./_core":17,"./_global":28,"./_library":41,"./_object-dp":45,"./_wks-ext":72}],72:[function(require,module,exports){
exports.f = require('./_wks');

},{"./_wks":73}],73:[function(require,module,exports){
var store = require('./_shared')('wks');
var uid = require('./_uid');
var Symbol = require('./_global').Symbol;
var USE_SYMBOL = typeof Symbol == 'function';

var $exports = module.exports = function (name) {
  return store[name] || (store[name] =
    USE_SYMBOL && Symbol[name] || (USE_SYMBOL ? Symbol : uid)('Symbol.' + name));
};

$exports.store = store;

},{"./_global":28,"./_shared":61,"./_uid":70}],74:[function(require,module,exports){
'use strict';
// 22.1.3.8 Array.prototype.find(predicate, thisArg = undefined)
var $export = require('./_export');
var $find = require('./_array-methods')(5);
var KEY = 'find';
var forced = true;
// Shouldn't skip holes
if (KEY in []) Array(1)[KEY](function () { forced = false; });
$export($export.P + $export.F * forced, 'Array', {
  find: function find(callbackfn /* , that = undefined */) {
    return $find(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
  }
});
require('./_add-to-unscopables')(KEY);

},{"./_add-to-unscopables":10,"./_array-methods":13,"./_export":24}],75:[function(require,module,exports){
'use strict';
var addToUnscopables = require('./_add-to-unscopables');
var step = require('./_iter-step');
var Iterators = require('./_iterators');
var toIObject = require('./_to-iobject');

// 22.1.3.4 Array.prototype.entries()
// 22.1.3.13 Array.prototype.keys()
// 22.1.3.29 Array.prototype.values()
// 22.1.3.30 Array.prototype[@@iterator]()
module.exports = require('./_iter-define')(Array, 'Array', function (iterated, kind) {
  this._t = toIObject(iterated); // target
  this._i = 0;                   // next index
  this._k = kind;                // kind
// 22.1.5.2.1 %ArrayIteratorPrototype%.next()
}, function () {
  var O = this._t;
  var kind = this._k;
  var index = this._i++;
  if (!O || index >= O.length) {
    this._t = undefined;
    return step(1);
  }
  if (kind == 'keys') return step(0, index);
  if (kind == 'values') return step(0, O[index]);
  return step(0, [index, O[index]]);
}, 'values');

// argumentsList[@@iterator] is %ArrayProto_values% (9.4.4.6, 9.4.4.7)
Iterators.Arguments = Iterators.Array;

addToUnscopables('keys');
addToUnscopables('values');
addToUnscopables('entries');

},{"./_add-to-unscopables":10,"./_iter-define":38,"./_iter-step":39,"./_iterators":40,"./_to-iobject":66}],76:[function(require,module,exports){
var dP = require('./_object-dp').f;
var FProto = Function.prototype;
var nameRE = /^\s*function ([^ (]*)/;
var NAME = 'name';

// 19.2.4.2 name
NAME in FProto || require('./_descriptors') && dP(FProto, NAME, {
  configurable: true,
  get: function () {
    try {
      return ('' + this).match(nameRE)[1];
    } catch (e) {
      return '';
    }
  }
});

},{"./_descriptors":20,"./_object-dp":45}],77:[function(require,module,exports){
'use strict';
var global = require('./_global');
var has = require('./_has');
var cof = require('./_cof');
var inheritIfRequired = require('./_inherit-if-required');
var toPrimitive = require('./_to-primitive');
var fails = require('./_fails');
var gOPN = require('./_object-gopn').f;
var gOPD = require('./_object-gopd').f;
var dP = require('./_object-dp').f;
var $trim = require('./_string-trim').trim;
var NUMBER = 'Number';
var $Number = global[NUMBER];
var Base = $Number;
var proto = $Number.prototype;
// Opera ~12 has broken Object#toString
var BROKEN_COF = cof(require('./_object-create')(proto)) == NUMBER;
var TRIM = 'trim' in String.prototype;

// 7.1.3 ToNumber(argument)
var toNumber = function (argument) {
  var it = toPrimitive(argument, false);
  if (typeof it == 'string' && it.length > 2) {
    it = TRIM ? it.trim() : $trim(it, 3);
    var first = it.charCodeAt(0);
    var third, radix, maxCode;
    if (first === 43 || first === 45) {
      third = it.charCodeAt(2);
      if (third === 88 || third === 120) return NaN; // Number('+0x1') should be NaN, old V8 fix
    } else if (first === 48) {
      switch (it.charCodeAt(1)) {
        case 66: case 98: radix = 2; maxCode = 49; break; // fast equal /^0b[01]+$/i
        case 79: case 111: radix = 8; maxCode = 55; break; // fast equal /^0o[0-7]+$/i
        default: return +it;
      }
      for (var digits = it.slice(2), i = 0, l = digits.length, code; i < l; i++) {
        code = digits.charCodeAt(i);
        // parseInt parses a string to a first unavailable symbol
        // but ToNumber should return NaN if a string contains unavailable symbols
        if (code < 48 || code > maxCode) return NaN;
      } return parseInt(digits, radix);
    }
  } return +it;
};

if (!$Number(' 0o1') || !$Number('0b1') || $Number('+0x1')) {
  $Number = function Number(value) {
    var it = arguments.length < 1 ? 0 : value;
    var that = this;
    return that instanceof $Number
      // check on 1..constructor(foo) case
      && (BROKEN_COF ? fails(function () { proto.valueOf.call(that); }) : cof(that) != NUMBER)
        ? inheritIfRequired(new Base(toNumber(it)), that, $Number) : toNumber(it);
  };
  for (var keys = require('./_descriptors') ? gOPN(Base) : (
    // ES3:
    'MAX_VALUE,MIN_VALUE,NaN,NEGATIVE_INFINITY,POSITIVE_INFINITY,' +
    // ES6 (in case, if modules with ES6 Number statics required before):
    'EPSILON,isFinite,isInteger,isNaN,isSafeInteger,MAX_SAFE_INTEGER,' +
    'MIN_SAFE_INTEGER,parseFloat,parseInt,isInteger'
  ).split(','), j = 0, key; keys.length > j; j++) {
    if (has(Base, key = keys[j]) && !has($Number, key)) {
      dP($Number, key, gOPD(Base, key));
    }
  }
  $Number.prototype = proto;
  proto.constructor = $Number;
  require('./_redefine')(global, NUMBER, $Number);
}

},{"./_cof":16,"./_descriptors":20,"./_fails":25,"./_global":28,"./_has":29,"./_inherit-if-required":33,"./_object-create":44,"./_object-dp":45,"./_object-gopd":47,"./_object-gopn":49,"./_redefine":57,"./_string-trim":62,"./_to-primitive":69}],78:[function(require,module,exports){
// 19.1.3.1 Object.assign(target, source)
var $export = require('./_export');

$export($export.S + $export.F, 'Object', { assign: require('./_object-assign') });

},{"./_export":24,"./_object-assign":43}],79:[function(require,module,exports){
// 19.1.2.14 Object.keys(O)
var toObject = require('./_to-object');
var $keys = require('./_object-keys');

require('./_object-sap')('keys', function () {
  return function keys(it) {
    return $keys(toObject(it));
  };
});

},{"./_object-keys":53,"./_object-sap":55,"./_to-object":68}],80:[function(require,module,exports){
// 21.2.5.3 get RegExp.prototype.flags()
if (require('./_descriptors') && /./g.flags != 'g') require('./_object-dp').f(RegExp.prototype, 'flags', {
  configurable: true,
  get: require('./_flags')
});

},{"./_descriptors":20,"./_flags":27,"./_object-dp":45}],81:[function(require,module,exports){
// @@match logic
require('./_fix-re-wks')('match', 1, function (defined, MATCH, $match) {
  // 21.1.3.11 String.prototype.match(regexp)
  return [function match(regexp) {
    'use strict';
    var O = defined(this);
    var fn = regexp == undefined ? undefined : regexp[MATCH];
    return fn !== undefined ? fn.call(regexp, O) : new RegExp(regexp)[MATCH](String(O));
  }, $match];
});

},{"./_fix-re-wks":26}],82:[function(require,module,exports){
// @@replace logic
require('./_fix-re-wks')('replace', 2, function (defined, REPLACE, $replace) {
  // 21.1.3.14 String.prototype.replace(searchValue, replaceValue)
  return [function replace(searchValue, replaceValue) {
    'use strict';
    var O = defined(this);
    var fn = searchValue == undefined ? undefined : searchValue[REPLACE];
    return fn !== undefined
      ? fn.call(searchValue, O, replaceValue)
      : $replace.call(String(O), searchValue, replaceValue);
  }, $replace];
});

},{"./_fix-re-wks":26}],83:[function(require,module,exports){
'use strict';
require('./es6.regexp.flags');
var anObject = require('./_an-object');
var $flags = require('./_flags');
var DESCRIPTORS = require('./_descriptors');
var TO_STRING = 'toString';
var $toString = /./[TO_STRING];

var define = function (fn) {
  require('./_redefine')(RegExp.prototype, TO_STRING, fn, true);
};

// 21.2.5.14 RegExp.prototype.toString()
if (require('./_fails')(function () { return $toString.call({ source: 'a', flags: 'b' }) != '/a/b'; })) {
  define(function toString() {
    var R = anObject(this);
    return '/'.concat(R.source, '/',
      'flags' in R ? R.flags : !DESCRIPTORS && R instanceof RegExp ? $flags.call(R) : undefined);
  });
// FF44- RegExp#toString has a wrong name
} else if ($toString.name != TO_STRING) {
  define(function toString() {
    return $toString.call(this);
  });
}

},{"./_an-object":11,"./_descriptors":20,"./_fails":25,"./_flags":27,"./_redefine":57,"./es6.regexp.flags":80}],84:[function(require,module,exports){
'use strict';
// ECMAScript 6 symbols shim
var global = require('./_global');
var has = require('./_has');
var DESCRIPTORS = require('./_descriptors');
var $export = require('./_export');
var redefine = require('./_redefine');
var META = require('./_meta').KEY;
var $fails = require('./_fails');
var shared = require('./_shared');
var setToStringTag = require('./_set-to-string-tag');
var uid = require('./_uid');
var wks = require('./_wks');
var wksExt = require('./_wks-ext');
var wksDefine = require('./_wks-define');
var enumKeys = require('./_enum-keys');
var isArray = require('./_is-array');
var anObject = require('./_an-object');
var isObject = require('./_is-object');
var toIObject = require('./_to-iobject');
var toPrimitive = require('./_to-primitive');
var createDesc = require('./_property-desc');
var _create = require('./_object-create');
var gOPNExt = require('./_object-gopn-ext');
var $GOPD = require('./_object-gopd');
var $DP = require('./_object-dp');
var $keys = require('./_object-keys');
var gOPD = $GOPD.f;
var dP = $DP.f;
var gOPN = gOPNExt.f;
var $Symbol = global.Symbol;
var $JSON = global.JSON;
var _stringify = $JSON && $JSON.stringify;
var PROTOTYPE = 'prototype';
var HIDDEN = wks('_hidden');
var TO_PRIMITIVE = wks('toPrimitive');
var isEnum = {}.propertyIsEnumerable;
var SymbolRegistry = shared('symbol-registry');
var AllSymbols = shared('symbols');
var OPSymbols = shared('op-symbols');
var ObjectProto = Object[PROTOTYPE];
var USE_NATIVE = typeof $Symbol == 'function';
var QObject = global.QObject;
// Don't use setters in Qt Script, https://github.com/zloirock/core-js/issues/173
var setter = !QObject || !QObject[PROTOTYPE] || !QObject[PROTOTYPE].findChild;

// fallback for old Android, https://code.google.com/p/v8/issues/detail?id=687
var setSymbolDesc = DESCRIPTORS && $fails(function () {
  return _create(dP({}, 'a', {
    get: function () { return dP(this, 'a', { value: 7 }).a; }
  })).a != 7;
}) ? function (it, key, D) {
  var protoDesc = gOPD(ObjectProto, key);
  if (protoDesc) delete ObjectProto[key];
  dP(it, key, D);
  if (protoDesc && it !== ObjectProto) dP(ObjectProto, key, protoDesc);
} : dP;

var wrap = function (tag) {
  var sym = AllSymbols[tag] = _create($Symbol[PROTOTYPE]);
  sym._k = tag;
  return sym;
};

var isSymbol = USE_NATIVE && typeof $Symbol.iterator == 'symbol' ? function (it) {
  return typeof it == 'symbol';
} : function (it) {
  return it instanceof $Symbol;
};

var $defineProperty = function defineProperty(it, key, D) {
  if (it === ObjectProto) $defineProperty(OPSymbols, key, D);
  anObject(it);
  key = toPrimitive(key, true);
  anObject(D);
  if (has(AllSymbols, key)) {
    if (!D.enumerable) {
      if (!has(it, HIDDEN)) dP(it, HIDDEN, createDesc(1, {}));
      it[HIDDEN][key] = true;
    } else {
      if (has(it, HIDDEN) && it[HIDDEN][key]) it[HIDDEN][key] = false;
      D = _create(D, { enumerable: createDesc(0, false) });
    } return setSymbolDesc(it, key, D);
  } return dP(it, key, D);
};
var $defineProperties = function defineProperties(it, P) {
  anObject(it);
  var keys = enumKeys(P = toIObject(P));
  var i = 0;
  var l = keys.length;
  var key;
  while (l > i) $defineProperty(it, key = keys[i++], P[key]);
  return it;
};
var $create = function create(it, P) {
  return P === undefined ? _create(it) : $defineProperties(_create(it), P);
};
var $propertyIsEnumerable = function propertyIsEnumerable(key) {
  var E = isEnum.call(this, key = toPrimitive(key, true));
  if (this === ObjectProto && has(AllSymbols, key) && !has(OPSymbols, key)) return false;
  return E || !has(this, key) || !has(AllSymbols, key) || has(this, HIDDEN) && this[HIDDEN][key] ? E : true;
};
var $getOwnPropertyDescriptor = function getOwnPropertyDescriptor(it, key) {
  it = toIObject(it);
  key = toPrimitive(key, true);
  if (it === ObjectProto && has(AllSymbols, key) && !has(OPSymbols, key)) return;
  var D = gOPD(it, key);
  if (D && has(AllSymbols, key) && !(has(it, HIDDEN) && it[HIDDEN][key])) D.enumerable = true;
  return D;
};
var $getOwnPropertyNames = function getOwnPropertyNames(it) {
  var names = gOPN(toIObject(it));
  var result = [];
  var i = 0;
  var key;
  while (names.length > i) {
    if (!has(AllSymbols, key = names[i++]) && key != HIDDEN && key != META) result.push(key);
  } return result;
};
var $getOwnPropertySymbols = function getOwnPropertySymbols(it) {
  var IS_OP = it === ObjectProto;
  var names = gOPN(IS_OP ? OPSymbols : toIObject(it));
  var result = [];
  var i = 0;
  var key;
  while (names.length > i) {
    if (has(AllSymbols, key = names[i++]) && (IS_OP ? has(ObjectProto, key) : true)) result.push(AllSymbols[key]);
  } return result;
};

// 19.4.1.1 Symbol([description])
if (!USE_NATIVE) {
  $Symbol = function Symbol() {
    if (this instanceof $Symbol) throw TypeError('Symbol is not a constructor!');
    var tag = uid(arguments.length > 0 ? arguments[0] : undefined);
    var $set = function (value) {
      if (this === ObjectProto) $set.call(OPSymbols, value);
      if (has(this, HIDDEN) && has(this[HIDDEN], tag)) this[HIDDEN][tag] = false;
      setSymbolDesc(this, tag, createDesc(1, value));
    };
    if (DESCRIPTORS && setter) setSymbolDesc(ObjectProto, tag, { configurable: true, set: $set });
    return wrap(tag);
  };
  redefine($Symbol[PROTOTYPE], 'toString', function toString() {
    return this._k;
  });

  $GOPD.f = $getOwnPropertyDescriptor;
  $DP.f = $defineProperty;
  require('./_object-gopn').f = gOPNExt.f = $getOwnPropertyNames;
  require('./_object-pie').f = $propertyIsEnumerable;
  require('./_object-gops').f = $getOwnPropertySymbols;

  if (DESCRIPTORS && !require('./_library')) {
    redefine(ObjectProto, 'propertyIsEnumerable', $propertyIsEnumerable, true);
  }

  wksExt.f = function (name) {
    return wrap(wks(name));
  };
}

$export($export.G + $export.W + $export.F * !USE_NATIVE, { Symbol: $Symbol });

for (var es6Symbols = (
  // 19.4.2.2, 19.4.2.3, 19.4.2.4, 19.4.2.6, 19.4.2.8, 19.4.2.9, 19.4.2.10, 19.4.2.11, 19.4.2.12, 19.4.2.13, 19.4.2.14
  'hasInstance,isConcatSpreadable,iterator,match,replace,search,species,split,toPrimitive,toStringTag,unscopables'
).split(','), j = 0; es6Symbols.length > j;)wks(es6Symbols[j++]);

for (var wellKnownSymbols = $keys(wks.store), k = 0; wellKnownSymbols.length > k;) wksDefine(wellKnownSymbols[k++]);

$export($export.S + $export.F * !USE_NATIVE, 'Symbol', {
  // 19.4.2.1 Symbol.for(key)
  'for': function (key) {
    return has(SymbolRegistry, key += '')
      ? SymbolRegistry[key]
      : SymbolRegistry[key] = $Symbol(key);
  },
  // 19.4.2.5 Symbol.keyFor(sym)
  keyFor: function keyFor(sym) {
    if (!isSymbol(sym)) throw TypeError(sym + ' is not a symbol!');
    for (var key in SymbolRegistry) if (SymbolRegistry[key] === sym) return key;
  },
  useSetter: function () { setter = true; },
  useSimple: function () { setter = false; }
});

$export($export.S + $export.F * !USE_NATIVE, 'Object', {
  // 19.1.2.2 Object.create(O [, Properties])
  create: $create,
  // 19.1.2.4 Object.defineProperty(O, P, Attributes)
  defineProperty: $defineProperty,
  // 19.1.2.3 Object.defineProperties(O, Properties)
  defineProperties: $defineProperties,
  // 19.1.2.6 Object.getOwnPropertyDescriptor(O, P)
  getOwnPropertyDescriptor: $getOwnPropertyDescriptor,
  // 19.1.2.7 Object.getOwnPropertyNames(O)
  getOwnPropertyNames: $getOwnPropertyNames,
  // 19.1.2.8 Object.getOwnPropertySymbols(O)
  getOwnPropertySymbols: $getOwnPropertySymbols
});

// 24.3.2 JSON.stringify(value [, replacer [, space]])
$JSON && $export($export.S + $export.F * (!USE_NATIVE || $fails(function () {
  var S = $Symbol();
  // MS Edge converts symbol values to JSON as {}
  // WebKit converts symbol values to JSON as null
  // V8 throws on boxed symbols
  return _stringify([S]) != '[null]' || _stringify({ a: S }) != '{}' || _stringify(Object(S)) != '{}';
})), 'JSON', {
  stringify: function stringify(it) {
    var args = [it];
    var i = 1;
    var replacer, $replacer;
    while (arguments.length > i) args.push(arguments[i++]);
    $replacer = replacer = args[1];
    if (!isObject(replacer) && it === undefined || isSymbol(it)) return; // IE8 returns string on undefined
    if (!isArray(replacer)) replacer = function (key, value) {
      if (typeof $replacer == 'function') value = $replacer.call(this, key, value);
      if (!isSymbol(value)) return value;
    };
    args[1] = replacer;
    return _stringify.apply($JSON, args);
  }
});

// 19.4.3.4 Symbol.prototype[@@toPrimitive](hint)
$Symbol[PROTOTYPE][TO_PRIMITIVE] || require('./_hide')($Symbol[PROTOTYPE], TO_PRIMITIVE, $Symbol[PROTOTYPE].valueOf);
// 19.4.3.5 Symbol.prototype[@@toStringTag]
setToStringTag($Symbol, 'Symbol');
// 20.2.1.9 Math[@@toStringTag]
setToStringTag(Math, 'Math', true);
// 24.3.3 JSON[@@toStringTag]
setToStringTag(global.JSON, 'JSON', true);

},{"./_an-object":11,"./_descriptors":20,"./_enum-keys":23,"./_export":24,"./_fails":25,"./_global":28,"./_has":29,"./_hide":30,"./_is-array":35,"./_is-object":36,"./_library":41,"./_meta":42,"./_object-create":44,"./_object-dp":45,"./_object-gopd":47,"./_object-gopn":49,"./_object-gopn-ext":48,"./_object-gops":50,"./_object-keys":53,"./_object-pie":54,"./_property-desc":56,"./_redefine":57,"./_set-to-string-tag":59,"./_shared":61,"./_to-iobject":66,"./_to-primitive":69,"./_uid":70,"./_wks":73,"./_wks-define":71,"./_wks-ext":72}],85:[function(require,module,exports){
require('./_wks-define')('asyncIterator');

},{"./_wks-define":71}],86:[function(require,module,exports){
var $iterators = require('./es6.array.iterator');
var getKeys = require('./_object-keys');
var redefine = require('./_redefine');
var global = require('./_global');
var hide = require('./_hide');
var Iterators = require('./_iterators');
var wks = require('./_wks');
var ITERATOR = wks('iterator');
var TO_STRING_TAG = wks('toStringTag');
var ArrayValues = Iterators.Array;

var DOMIterables = {
  CSSRuleList: true, // TODO: Not spec compliant, should be false.
  CSSStyleDeclaration: false,
  CSSValueList: false,
  ClientRectList: false,
  DOMRectList: false,
  DOMStringList: false,
  DOMTokenList: true,
  DataTransferItemList: false,
  FileList: false,
  HTMLAllCollection: false,
  HTMLCollection: false,
  HTMLFormElement: false,
  HTMLSelectElement: false,
  MediaList: true, // TODO: Not spec compliant, should be false.
  MimeTypeArray: false,
  NamedNodeMap: false,
  NodeList: true,
  PaintRequestList: false,
  Plugin: false,
  PluginArray: false,
  SVGLengthList: false,
  SVGNumberList: false,
  SVGPathSegList: false,
  SVGPointList: false,
  SVGStringList: false,
  SVGTransformList: false,
  SourceBufferList: false,
  StyleSheetList: true, // TODO: Not spec compliant, should be false.
  TextTrackCueList: false,
  TextTrackList: false,
  TouchList: false
};

for (var collections = getKeys(DOMIterables), i = 0; i < collections.length; i++) {
  var NAME = collections[i];
  var explicit = DOMIterables[NAME];
  var Collection = global[NAME];
  var proto = Collection && Collection.prototype;
  var key;
  if (proto) {
    if (!proto[ITERATOR]) hide(proto, ITERATOR, ArrayValues);
    if (!proto[TO_STRING_TAG]) hide(proto, TO_STRING_TAG, NAME);
    Iterators[NAME] = ArrayValues;
    if (explicit) for (key in $iterators) if (!proto[key]) redefine(proto, key, $iterators[key], true);
  }
}

},{"./_global":28,"./_hide":30,"./_iterators":40,"./_object-keys":53,"./_redefine":57,"./_wks":73,"./es6.array.iterator":75}],87:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var CONSTANTS = {
  ID_PREFIX: {
    INTERNAL: 'CC',
    EXTERNAL: 'VTT'
  },
  TEXT_TRACK: {
    KIND: {
      SUBTITLES: 'subtitles',
      CAPTIONS: 'captions',
      DESCRIPTIONS: 'descriptions',
      CHAPTERS: 'chapters',
      METADATA: 'metadata'
    }
  }
};
var _default = CONSTANTS;
exports.default = _default;

},{}],88:[function(require,module,exports){
"use strict";

require("core-js/modules/es6.regexp.to-string");

require("core-js/modules/es6.number.constructor");

require("core-js/modules/es6.object.assign");

require("core-js/modules/es7.symbol.async-iterator");

require("core-js/modules/es6.symbol");

require("core-js/modules/es6.array.find");

require("core-js/modules/web.dom.iterable");

require("core-js/modules/es6.array.iterator");

require("core-js/modules/es6.object.keys");

require("core-js/modules/es6.function.name");

require("core-js/modules/es6.regexp.replace");

require("core-js/modules/es6.regexp.match");

var _text_track_map = _interopRequireDefault(require("./text_track/text_track_map"));

var _text_track_helper = _interopRequireDefault(require("./text_track/text_track_helper"));

var _constants = _interopRequireDefault(require("./constants/constants"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*
 * Simple HTML5 video tag plugin for mp4 and hls
 * version: 0.1
 */
require("../../../html5-common/js/utils/InitModules/InitOO.js");

require("../../../html5-common/js/utils/InitModules/InitOOUnderscore.js");

require("../../../html5-common/js/utils/InitModules/InitOOHazmat.js");

require("../../../html5-common/js/utils/constants.js");

require("../../../html5-common/js/utils/utils.js");

require("../../../html5-common/js/utils/environment.js");

(function (_, $) {
  var pluginName = "ooyalaHtml5VideoTech";
  var currentInstances = {};
  /**
   * @class OoyalaVideoFactory
   * @classdesc Factory for creating video player objects that use HTML5 video tags
   * @property {string} name The name of the plugin
   * @property {object} encodings An array of supported encoding types (ex. OOV4.VIDEO.ENCODING.MP4)
   * @property {object} features An array of supported features (ex. OOV4.VIDEO.FEATURE.CLOSED_CAPTIONS)
   * @property {string} technology The core video technology (ex. OOV4.VIDEO.TECHNOLOGY.HTML5)
   */

  var OoyalaVideoFactory = function OoyalaVideoFactory() {
    this.name = pluginName;
    this.features = [OOV4.VIDEO.FEATURE.CLOSED_CAPTIONS, OOV4.VIDEO.FEATURE.VIDEO_OBJECT_SHARING_GIVE];
    this.technology = OOV4.VIDEO.TECHNOLOGY.HTML5; // Determine supported encodings

    var getSupportedEncodings = function getSupportedEncodings() {
      var list = [];
      var videoElement = document.createElement("video");

      if (typeof videoElement.canPlayType === "function") {
        if (!!videoElement.canPlayType("video/mp4")) {
          list.push(OOV4.VIDEO.ENCODING.MP4);
        }

        if (!!videoElement.canPlayType("audio/ogg")) {
          list.push(OOV4.VIDEO.ENCODING.OGG);
        }

        if (!!videoElement.canPlayType("audio/x-m4a")) {
          list.push(OOV4.VIDEO.ENCODING.M4A);
        }

        if (!!videoElement.canPlayType("video/webm")) {
          list.push(OOV4.VIDEO.ENCODING.WEBM);
        }

        if ((!!videoElement.canPlayType("application/vnd.apple.mpegurl") || !!videoElement.canPlayType("application/x-mpegURL")) && !OOV4.isSmartTV && !OOV4.isRimDevice && (!OOV4.isMacOs || OOV4.isMacOsLionOrLater)) {
          // 2012 models of Samsung and LG smart TV's do not support HLS even if reported
          // Mac OS must be lion or later
          list.push(OOV4.VIDEO.ENCODING.HLS);
          list.push(OOV4.VIDEO.ENCODING.AKAMAI_HD2_VOD_HLS);
          list.push(OOV4.VIDEO.ENCODING.AKAMAI_HD2_HLS);
          list.push(OOV4.VIDEO.ENCODING.AUDIO_HLS);
        } // Sony OperaTV supports HLS but doesn't properly report it so we are forcing it here


        if (window.navigator.userAgent.match(/SonyCEBrowser/)) {
          list.push(OOV4.VIDEO.ENCODING.HLS);
          list.push(OOV4.VIDEO.ENCODING.AKAMAI_HD2_VOD_HLS);
          list.push(OOV4.VIDEO.ENCODING.AKAMAI_HD2_HLS);
          list.push(OOV4.VIDEO.ENCODING.AUDIO_HLS);
        }
      }

      return list;
    };

    this.encodings = getSupportedEncodings();
    /**
     * Creates a video player instance using OoyalaVideoWrapper
     * @public
     * @method OoyalaVideoFactory#create
     * @param {object} parentContainer The jquery div that should act as the parent for the video element
     * @param {string} domId The dom id of the video player instance to create
     * @param {object} controller A reference to the video controller in the Ooyala player
     * @param {object} css The css to apply to the video element
     * @param {string} playerId An id that represents the player instance
     * @param {object} pluginParams An object containing all of the options set for this plugin
     * @returns {object} A reference to the wrapper for the newly created element
     */

    this.create = function (parentContainer, domId, controller, css, playerId, pluginParams) {
      // If the current player has reached max supported elements, do not create a new one
      if (this.maxSupportedElements > 0 && playerId && currentInstances[playerId] >= this.maxSupportedElements) {
        return;
      }

      var video = $("<video>");
      video.attr("class", "video");
      video.attr("id", domId); // [PBW-5470] On Safari, when preload is set to 'none' and the user switches to a
      // different tab while the video is about to auto play, the browser stops playback but
      // doesn't fire a 'pause' event, which causes the player to get stuck in 'buffering' state.
      // Setting preload to 'metadata' (or 'auto') allows Safari to auto resume when the tab is refocused.

      if (OOV4.isSafari && !OOV4.isIos) {
        video.attr("preload", "metadata");
      } else {
        video.attr("preload", "none");
      }

      video.css(css);

      if (OOV4.isIos) {
        // enable airplay for iOS
        // http://developer.apple.com/library/safari/#documentation/AudioVideo/Conceptual/AirPlayGuide/OptingInorOutofAirPlay/OptingInorOutofAirPlay.html
        //
        video.attr("x-webkit-airplay", "allow"); //enable inline playback for mobile

        if (pluginParams["iosPlayMode"] === "inline") {
          if (OOV4.iosMajorVersion >= 10) {
            video.attr('playsinline', '');
          }
        }
      }

      if (!playerId) {
        playerId = getRandomString();
      }

      var element = new OoyalaVideoWrapper(domId, video[0], playerId);

      if (currentInstances[playerId] && currentInstances[playerId] >= 0) {
        currentInstances[playerId]++;
      } else {
        currentInstances[playerId] = 1;
      }

      element.controller = controller;
      controller.notify(controller.EVENTS.CAN_PLAY); // TODO: Wait for loadstart before calling this?

      element.subscribeAllEvents();
      parentContainer.append(video);
      return element;
    };
    /**
     * Destroys the video technology factory
     * @public
     * @method OoyalaVideoFactory#destroy
     */


    this.destroy = function () {
      this.encodings = [];

      this.create = function () {};
    };
    /**
     * Represents the max number of support instances of video elements that can be supported on the
     * current platform. -1 implies no limit.
     * @public
     * @property OoyalaVideoFactory#maxSupportedElements
     */


    this.maxSupportedElements = function () {
      var iosRequireSingleElement = OOV4.isIos;
      var androidRequireSingleElement = OOV4.isAndroid && (!OOV4.isAndroid4Plus || OOV4.chromeMajorVersion < 40);
      return iosRequireSingleElement || androidRequireSingleElement ? 1 : -1;
    }();
  };
  /**
   * @class OoyalaVideoWrapper
   * @classdesc Player object that wraps HTML5 video tags
   * @param {string} domId The dom id of the video player element
   * @param {object} video The core video object to wrap
   * @property {object} controller A reference to the Ooyala Video Tech Controller
   * @property {boolean} disableNativeSeek When true, the plugin should supress or undo seeks that come from
   *                                       native video controls
   * @property {string} playerId An id representing the unique player instance
   */


  var OoyalaVideoWrapper = function OoyalaVideoWrapper(domId, video, playerId) {
    var _this = this;

    this.controller = {};
    this.disableNativeSeek = false;
    this.audioTracks = [];
    var _video = video;
    var _playerId = playerId;
    var _currentUrl = '';
    var videoEnded = false;
    var listeners = {};
    var loaded = false;
    var canPlay = false;
    var hasPlayed = false;
    var queuedSeekTime = null;
    var playQueued = false;
    var hasStartedPlaying = false;
    var pauseOnPlaying = false;
    var ignoreFirstPlayingEvent = false;
    var isSeeking = false;
    var isWrapperSeeking = false;
    var wasPausedBeforePlaying = false; // "playing" here refers to the "playing" event

    var handleFailover = false;
    var failoverPlayheadTime = 0;
    var currentTime = 0;
    var currentTimeShift = 0;
    var currentVolumeSet = 0;
    var isM3u8 = false;
    var firstPlay = true;
    var videoDimension = {
      height: 0,
      width: 0
    };
    var initialTime = {
      value: 0,
      reached: true
    };
    var canSeek = true;
    var isPriming = false;
    var isLive = false;
    var lastCueText = null;
    var originalPreloadValue = $(_video).attr("preload") || "none";
    var currentPlaybackSpeed = 1.0;
    var currentCCKey = '';
    var setClosedCaptionsQueue = [];
    var externalCaptionsLanguages = {};
    var textTrackMap = new _text_track_map.default();
    var textTrackHelper = new _text_track_helper.default(_video); // Watch for underflow on Chrome

    var underflowWatcherTimer = null;
    var waitingEventRaised = false;
    var watcherTime = -1; // [PBW-4000] On Android, if the chrome browser loses focus, then the stream cannot be seeked before it
    // is played again.  Detect visibility changes and delay seeks when focus is lost.

    if (OOV4.isAndroid && OOV4.isChrome) {
      var watchHidden = _.bind(function (evt) {
        if (document.hidden) {
          canSeek = false;
        }
      }, this);

      document.addEventListener("visibilitychange", watchHidden);
    }
    /************************************************************************************/
    // External Methods that Video Controller or Factory call

    /************************************************************************************/

    /**
     * Hands control of the video element off to another plugin by unsubscribing from all events.
     * @public
     * @method OoyalaVideoWrapper#sharedElementGive
     */


    this.sharedElementGive = function () {
      unsubscribeAllEvents();
      _currentUrl = "";
    };
    /**
     * Takes control of the video element from another plugin by subscribing to all events.
     * @public
     * @method OoyalaVideoWrapper#sharedElementTake
     */


    this.sharedElementTake = function () {
      this.subscribeAllEvents();
    };
    /**
     * Subscribes to all events raised by the video element.
     * This is called by the Factory during creation.
     * @public
     * @method OoyalaVideoWrapper#subscribeAllEvents
     */


    this.subscribeAllEvents = function () {
      listeners = {
        "loadstart": onLoadStart,
        "loadedmetadata": onLoadedMetadata,
        "progress": raiseProgress,
        "error": raiseErrorEvent,
        "stalled": raiseStalledEvent,
        "canplay": raiseCanPlay,
        "canplaythrough": raiseCanPlayThrough,
        "playing": raisePlayingEvent,
        "waiting": raiseWaitingEvent,
        "seeking": raiseSeekingEvent,
        "seeked": raiseSeekedEvent,
        "ended": raiseEndedEvent,
        "durationchange": raiseDurationChange,
        "timeupdate": raiseTimeUpdate,
        "play": raisePlayEvent,
        "pause": raisePauseEvent,
        "ratechange": raiseRatechangeEvent,
        // ios webkit browser fullscreen events
        "webkitbeginfullscreen": raiseFullScreenBegin,
        "webkitendfullscreen": raiseFullScreenEnd
      }; // events not used:
      // suspend, abort, emptied, loadeddata, resize, change, addtrack, removetrack

      _.each(listeners, function (v, i) {
        $(_video).on(i, v);
      }, this); // The volumechange event does not seem to fire for mute state changes when using jQuery
      // to add the event listener. It does work using the below line. We need this event to fire properly
      // or else other SDKs (such as the Freewheel ad SDK) that make use of this video element may have
      // issues with the mute state


      _video.addEventListener('volumechange', raiseVolumeEvent);
    };
    /**
     * Unsubscribes all events from the video element.
     * This is called by the destroy function.
     * @private
     * @method OoyalaVideoWrapper#unsubscribeAllEvents
     */


    var unsubscribeAllEvents = function unsubscribeAllEvents() {
      _.each(listeners, function (v, i) {
        $(_video).off(i, v);
      }, this);

      _video.removeEventListener('volumechange', raiseVolumeEvent);
    };
    /**
     * Sets the url of the video.
     * @public
     * @method OoyalaVideoWrapper#setVideoUrl
     * @param {string} url The new url to insert into the video element's src attribute
     * @param {string} encoding The encoding of video stream, possible values are found in OOV4.VIDEO.ENCODING
     * @param {boolean} live True if it is a live asset, false otherwise
     * @returns {boolean} True or false indicating success
     */
    // Allow for the video src to be changed without loading the video


    this.setVideoUrl = function (url, encoding, live) {
      // check if we actually need to change the URL on video tag
      // compare URLs but make sure to strip out the trailing cache buster
      var urlChanged = false;

      if (_currentUrl.replace(/[\?&]_=[^&]+$/, '') != url) {
        _currentUrl = url || "";
        isM3u8 = encoding == OOV4.VIDEO.ENCODING.HLS || encoding == OOV4.VIDEO.ENCODING.AKAMAI_HD2_VOD_HLS || encoding == OOV4.VIDEO.ENCODING.AKAMAI_HD2_HLS || encoding == OOV4.VIDEO.ENCODING.AUDIO_HLS;
        isLive = live;
        urlChanged = true;
        resetStreamData();

        if (_currentUrl === "") {
          //Workaround of an issue where iOS attempts to set the src to <RELATIVE_PATH>/null
          //when setting source to null
          if (OOV4.isIos) {
            delete _video.src;
          } else {
            _video.src = null;
          }
        } else {
          _video.src = _currentUrl;
        }
      } //setup the playback speed for the next video.


      this.setPlaybackSpeed(currentPlaybackSpeed);
      return urlChanged;
    };

    var resetStreamData = _.bind(function () {
      this.audioTracks = [];
      playQueued = false;
      canPlay = false;
      hasPlayed = false;
      queuedSeekTime = null;
      loaded = false;
      hasStartedPlaying = false;
      pauseOnPlaying = false;
      isSeeking = false;
      isWrapperSeeking = false;
      firstPlay = true;
      wasPausedBeforePlaying = false;
      handleFailover = false;
      failoverPlayheadTime = 0;
      currentTime = 0;
      currentTimeShift = 0;
      videoEnded = false;
      videoDimension = {
        height: 0,
        width: 0
      };
      initialTime = {
        value: 0,
        reached: true
      };
      canSeek = true;
      isPriming = false;
      stopUnderflowWatcher();
      lastCueText = null;
      currentCCKey = '';
      setClosedCaptionsQueue = [];
      externalCaptionsLanguages = {};
      textTrackHelper.removeExternalTracks(textTrackMap);
      textTrackMap.clear(); // Restore the preload attribute to the value it had when the video
      // element was created

      $(_video).attr("preload", originalPreloadValue);
      ignoreFirstPlayingEvent = false;
    }, this);
    /**
     * Callback to handle notifications that ad finished playing
     * @private
     * @method OoyalaVideoWrapper#onAdsPlayed
     */


    this.onAdsPlayed = function () {};
    /**
     * Loads the current stream url in the video element; the element should be left paused.
     * @public
     * @method OoyalaVideoWrapper#load
     * @param {boolean} rewind True if the stream should be set to time 0
     */


    this.load = function (rewind) {
      if (loaded && !rewind) return;

      if (!!rewind) {
        if (OOV4.isEdge) {
          // PBW-4555: Edge browser will always go back to time 0 on load.  Setting time to 0 here would
          // cause the raw video element to enter seeking state.  Additionally, if we call load while seeking
          // on Edge, then seeking no longer works until the video stream url is changed.  Protect against
          // seeking issues using loaded.  Lastly edge always preloads.
          currentTime = 0;
        } else {
          try {
            if (OOV4.isIos && OOV4.iosMajorVersion == 8) {
              // On iOS, wait for durationChange before setting currenttime
              $(_video).on("durationchange", _.bind(function () {
                _video.currentTime = 0;
                currentTime = 0;
              }, this));
            } else {
              _video.currentTime = 0;
              currentTime = 0;
            }

            _video.pause();
          } catch (ex) {
            // error because currentTime does not exist because stream hasn't been retrieved yet
            OOV4.log('VTC_OO: Failed to rewind video, probably ok; continuing');
          }
        }
      }

      canPlay = false; // The load() method might still be affected by the value of the preload attribute in
      // some browsers (i.e. it might determine how much data is actually loaded). We set preload to auto
      // before loading in case that this.load() was called by VC_PRELOAD. If load() is called prior to
      // starting playback this will be redundant, but it shouldn't cause any issues

      $(_video).attr("preload", "auto");

      _video.load();

      loaded = true;
    };
    /**
     * Sets the initial time of the video playback.  For this plugin that is simply a seek which will be
     * triggered upon 'loadedmetadata' event.
     * @public
     * @method OoyalaVideoWrapper#setInitialTime
     * @param {number} time The initial time of the video (seconds)
     */


    this.setInitialTime = function (time) {
      //Ignore any initial times set to 0 if the content has not started playing. The content will start at time 0
      //by default
      if (typeof time !== "number" || !hasStartedPlaying && time === 0) {
        return;
      } // [PBW-5539] On Safari (iOS and Desktop), when triggering replay after the current browser tab looses focus, the
      // current time seems to fall a few milliseconds behind the video duration, which
      // makes the video play for a fraction of a second and then stop again at the end.
      // In this case we allow setting the initial time back to 0 as a workaround for this


      var queuedSeekRequired = OOV4.isSafari && videoEnded && time === 0;
      initialTime.value = time;
      initialTime.reached = false; // [PBW-3866] Some Android devices (mostly Nexus) cannot be seeked too early or the seeked event is
      // never raised, even if the seekable property returns an endtime greater than the seek time.
      // To avoid this, save seeking information for use later.
      // [PBW-5539] Same issue with desktop Safari when setting initialTime after video ends
      // [PBW-7473] Same issue with IE11.

      if (OOV4.isAndroid || OOV4.isIE11Plus || queuedSeekRequired && !OOV4.isIos) {
        queueSeek(initialTime.value);
      } else {
        this.seek(initialTime.value);
      }
    };
    /**
     * Notifies wrapper that failover has occurred in the Ooyala Player
     * @public
     * @method OoyalaVideoWrapper#handleFailover
     * @param {number} failoverPlayhead The playhead time before failover (seconds)
     */


    this.handleFailover = function (failoverPlayhead) {
      handleFailover = true;
      failoverPlayheadTime = failoverPlayhead;
    };
    /**
     * Since there are no standards for error codes or names for play promises,
     * we'll compile a list of errors that represent a user interaction required error.
     * @private
     * @method OoyalaVideoWrapper#userInteractionRequired
     * @param {string} error The error object given by the play promise when it fails
     * @returns {boolean} True if this error represents a user interaction required error, false otherwise
     */


    var userInteractionRequired = function userInteractionRequired(error) {
      var userInteractionRequired = false;

      if (error) {
        var chromeError = error.name === "NotAllowedError"; //Safari throws the error "AbortError" for all play promise failures
        //so we'll have to treat all of them the same

        if (!OOV4.isChrome || chromeError) {
          //There is no requirement for muted autoplay on Firefox,
          //so we'll ignore any Firefox play promise errors
          userInteractionRequired = !OOV4.isFirefox;
        }
      }

      return userInteractionRequired;
    };
    /**
     * Triggers playback on the video element.
     * @public
     * @method OoyalaVideoWrapper#play
     */


    this.play = function () {
      pauseOnPlaying = false; // enqueue play command if in the process of seeking

      if (_video.seeking) {
        playQueued = true;
      } else {
        var playPromise = executePlay(false);
        var originalUrl = _video.src;

        if (playPromise) {
          ignoreFirstPlayingEvent = true; //TODO: Handle MUTED/UNMUTED_PLAYBACK_SUCCEEDED/FAILED in environments that do not support play promises.
          //Right now this is not needed because environments that do not support play promises do not have
          //autoplay restrictions.

          if (typeof playPromise.catch === 'function') {
            playPromise.catch(_.bind(function (error) {
              ignoreFirstPlayingEvent = false;

              if (error) {
                OOV4.log("Play Promise Failure", error, error.name); //PLAYER-3601: Workaround of an issue where play promises sometimes fail on iOS with Freewheel ads.
                //We can ignore these as the Freewheel ad plugin will take care of these if they are indeed errors

                if (OOV4.isIos && _video._fw_videoAdPlaying) {
                  return;
                } //Changing the source while attempting to play will cause a play promise error to be thrown.
                //We don't want to publish an UNMUTED/MUTED playback failed notification in these situations.


                if (_video.src !== originalUrl) {
                  OOV4.log("Url has changed, ignoring play promise failure");
                  return;
                }

                if (userInteractionRequired(error)) {
                  if (!_video.muted) {
                    this.controller.notify(this.controller.EVENTS.UNMUTED_PLAYBACK_FAILED, {
                      error: error
                    });
                  } else {
                    // [PBW-6990]
                    // There seems to be an issue on random Android devices that prevents muted
                    // autoplay from working at all under certain (currently unknown) conditions.
                    this.controller.notify(this.controller.EVENTS.MUTED_PLAYBACK_FAILED, {
                      error: error
                    });
                  }
                }
              }
            }, this));
          }

          if (typeof playPromise.then === 'function') {
            playPromise.then(_.bind(function () {
              if (handleFailover) {
                this.seek(failoverPlayheadTime);
                handleFailover = false;
              } //playback succeeded


              if (!_video.muted) {
                this.controller.notify(this.controller.EVENTS.UNMUTED_PLAYBACK_SUCCEEDED);
              } else {
                this.controller.notify(this.controller.EVENTS.MUTED_PLAYBACK_SUCCEEDED);
              }

              if (!pauseOnPlaying) {
                this.controller.notify(this.controller.EVENTS.PLAYING);
              }
            }, this));
          }
        }
      }
    };
    /**
     * Triggers a pause on the video element.
     * @public
     * @method OoyalaVideoWrapper#pause
     */


    this.pause = function () {
      playQueued = false;

      if (hasStartedPlaying) {
        _video.pause();
      } else {
        pauseOnPlaying = true;
      }
    };
    /**
     * Triggers a seek on the video element.
     * @public
     * @method OoyalaVideoWrapper#seek
     * @param {number} time The time to seek the video to (in seconds)
     * @return {boolean} True if the seek was performed, false otherwise
     */


    this.seek = function (time) {
      if (time === Math.round(_video.currentTime)) {
        return false;
      }

      var safeSeekTime = null;

      if (isLive) {
        //Live videos without DVR can't be seeked
        if (!isDvrAvailable()) {
          //Re-queue the initial time seek if initial time has not been reached yet. This usually means
          //the seek ranges are not available yet.
          if (!initialTime.reached && time === initialTime.value) {
            queueSeek(time);
          }

          return false;
        } else {
          safeSeekTime = getSafeDvrSeekTime(_video, time); // We update the shift time now in order to make sure that the value
          // doesn't change after seeking, which would cause the playhead to jump.
          // This approach is less accurate but it's more user-friendly.

          currentTimeShift = getTimeShift(safeSeekTime);
        }
      } else {
        safeSeekTime = getSafeSeekTimeIfPossible(_video, time);
      }

      if (safeSeekTime !== null) {
        _video.currentTime = safeSeekTime;
        isSeeking = true;
        isWrapperSeeking = true;
        return true;
      }

      queueSeek(time);
      return false;
    };
    /**
     * Triggers a mute on the video element.
     * @public
     * @method OoyalaVideoWrapper#mute
     */


    this.mute = function () {
      _video.muted = true;
    };
    /**
     * Triggers an unmute on the video element.
     * @public
     * @method OoyalaVideoWrapper#unmute
     */


    this.unmute = function () {
      _video.muted = false; //workaround of an issue where some external SDKs (such those used in ad/video plugins)
      //are setting the volume to 0 when muting
      //Set the volume to our last known setVolume setting.
      //Since we're unmuting, we don't want to set volume to 0

      if (currentVolumeSet > 0) {
        this.setVolume(currentVolumeSet);
      }
    };
    /**
     * Checks to see if the video element is muted.
     * @public
     * @method OoyalaVideoWrapper#isMuted
     * @returns {boolean} True if the video element is muted, false otherwise
     */


    this.isMuted = function () {
      return _video.muted;
    };
    /**
     * Triggers a volume change on the video element.
     * @public
     * @method OoyalaVideoWrapper#setVolume
     * @param {number} volume A number between 0 and 1 indicating the desired volume percentage
     */


    this.setVolume = function (volume) {
      var resolvedVolume = volume;

      if (resolvedVolume < 0) {
        resolvedVolume = 0;
      } else if (resolvedVolume > 1) {
        resolvedVolume = 1;
      }

      currentVolumeSet = resolvedVolume; //  TODO check if we need to capture any exception here. ios device will not allow volume set.

      _video.volume = resolvedVolume; // If no video is assigned yet, the volumeChange event is not raised although it takes effect

      if (_video.currentSrc === "" || _video.currentSrc === null) {
        raiseVolumeEvent({
          target: {
            volume: resolvedVolume
          }
        });
      }
    };
    /**
     * Gets the current time position of the video.
     * @public
     * @method OoyalaVideoWrapper#getCurrentTime
     * @returns {number} The current time position of the video (seconds)
     */


    this.getCurrentTime = function () {
      return _video.currentTime;
    };
    /**
     * Prepares a video element to be played via API.  This is called on a user click event, and is used in
     * preparing HTML5-based video elements on devices.  To prepare the element for playback, call play and
     * pause.  Do not raise playback events during this time.
     * @public
     * @method OoyalaVideoWrapper#primeVideoElement
     */


    this.primeVideoElement = function () {
      // We need to "activate" the video on a click so we can control it with JS later on mobile
      var playPromise = executePlay(true); // PLAYER-1323
      // Safar iOS seems to freeze when pausing right after playing when using preloading.
      // On this platform we wait for the play promise to be resolved before pausing.

      if (OOV4.isIos && playPromise && typeof playPromise.then === 'function') {
        ignoreFirstPlayingEvent = true;
        playPromise.then(function () {
          // There is no point in pausing anymore if actual playback has already been requested
          // by the time the promise is resolved
          if (!hasPlayed) {
            _video.pause();
          }
        });

        if (typeof playPromise.catch === 'function') {
          playPromise.catch(function () {
            ignoreFirstPlayingEvent = false;
          });
        }
      } else {
        _video.pause();
      }
    };
    /**
     * Applies the given css to the video element.
     * @public
     * @method OoyalaVideoWrapper#applyCss
     * @param {object} css The css to apply in key value pairs
     */


    this.applyCss = function (css) {
      $(_video).css(css);
    };
    /**
     * Destroys the individual video element.
     * @public
     * @method OoyalaVideoWrapper#destroy
     */


    this.destroy = function () {
      _video.pause();

      stopUnderflowWatcher(); //On IE and Edge, setting the video source to an empty string has the unwanted effect
      //of a network request to the base url

      if (!OOV4.isIE && !OOV4.isEdge) {
        _video.src = '';
      }

      unsubscribeAllEvents();
      $(_video).remove();

      if (_playerId && currentInstances[_playerId] && currentInstances[_playerId] > 0) {
        currentInstances[_playerId]--;
      }

      if (watchHidden) {
        document.removeEventListener("visibilitychange", watchHidden);
      }
    };
    /**
     * Creates text tracks for any external VTT sources provided and sets the
     * mode of the track that matches the specified language to the specified mode.
     * In a general sense this method is used for enabling the captions of a
     * particular language.
     * @public
     * @method OoyalaVideoWrapper#setClosedCaptions
     * @param {String} language The key of the text track that we want to enable/change.
     * Usually a language code, but can also be the track id in the case of in-manifest
     * or in-stream text tracks.
     * @param {Object} closedCaptions An object containing a list of external VTT captions
     * that the player should display to the end user.
     * @param {Object} params An object containing additional parameters:
     *  - mode: (String) The mode to set on the track that matches the language parameter
     */


    this.setClosedCaptions = _.bind(function (language) {
      var closedCaptions = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var params = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      OOV4.log("MainHtml5: setClosedCaptions called", language, closedCaptions, params);
      var vttClosedCaptions = closedCaptions.closed_captions_vtt || {};
      var externalCaptionsProvided = !!Object.keys(vttClosedCaptions).length; // Most browsers will require crossorigin=anonymous in order to be able to
      // load VTT files from a different domain. This needs to happen before any
      // tracks are added and, on Firefox, it also needs to be as early as possible
      // (hence why don't queue this part of the operation). Note that we only do this
      // if we're actually adding external tracks

      if (externalCaptionsProvided) {
        this.setCrossorigin('anonymous');

        for (var _language in vttClosedCaptions) {
          externalCaptionsLanguages[_language] = true;
        }
      } // Browsers tend to glitch when text tracks are added before metadata is
      // loaded and in some cases fail to trigger the first cue if a track is
      // added before canplay event is fired


      if (canPlay) {
        dequeueSetClosedCaptions();
        executeSetClosedCaptions.apply(this, arguments);
      } else {
        OOV4.log('MainHtml5: setClosedCaptions called before load, queing operation.');
        setClosedCaptionsQueue.push(arguments);
      }
    }, this);
    /**
     * The actual logic of setClosedCaptions() above. This is separated in order to
     * allow us to queue any calls to setClosedCaptions() that happen before metadata
     * is loaded.
     * @private
     * @method OoyalaVideoWrapper#executeSetClosedCaptions
     * @param {String} language The key of the text track that we want to enable/change.
     * Usually a language code, but can also be the track id in the case of in-manifest
     * or in-stream text tracks.
     * @param {Object} closedCaptions An object containing a list of external VTT captions
     * that the player should display to the end user.
     * @param {Object} params An object containing additional parameters:
     *  - mode: (String) The mode to set on the track that matches the language parameter
     */

    var executeSetClosedCaptions = function executeSetClosedCaptions(language) {
      var closedCaptions = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var params = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      var vttClosedCaptions = closedCaptions.closed_captions_vtt || {};
      var targetMode = params.mode || OOV4.CONSTANTS.CLOSED_CAPTIONS.SHOWING;
      var targetTrack = textTrackHelper.findTrackByKey(language, textTrackMap); // Clear current CC cue if track is about to change

      if (currentCCKey !== language) {
        raiseClosedCaptionCueChanged('');
      }

      currentCCKey = language; // Start by disabling all tracks, except for the one whose mode we want to set

      disableTextTracksExcept(targetTrack); // Create tracks for all VTT captions from content tree that we haven't
      // added before. If the track with the specified language is added, it
      // will be created with the desired mode automatically

      var wasTargetTrackAdded = addExternalVttCaptions(vttClosedCaptions, language, targetMode); // If the desired track is not one of the newly added tracks then we set
      // the target mode on the pre-existing track that matches the target language

      if (!wasTargetTrackAdded) {
        setTextTrackMode(targetTrack, targetMode);
      }
    };
    /**
     * Sets the given text track mode for ALL existing tracks.
     * @public
     * @method OoyalaVideoWrapper#setClosedCaptionsMode
     * @param {string} mode The mode to set on the text tracks.
     * One of (OOV4.CONSTANTS.CLOSED_CAPTIONS.DISABLED, OOV4.CONSTANTS.CLOSED_CAPTIONS.HIDDEN, OOV4.CONSTANTS.CLOSED_CAPTIONS.SHOWING).
     */


    this.setClosedCaptionsMode = function (mode) {
      textTrackHelper.forEach(function (textTrack) {
        return setTextTrackMode(textTrack, mode);
      });

      if (mode === OOV4.CONSTANTS.CLOSED_CAPTIONS.DISABLED) {
        raiseClosedCaptionCueChanged('');
      }
    };
    /**
     * Sets the crossorigin attribute on the video element.
     * @public
     * @method OoyalaVideoWrapper#setCrossorigin
     * @param {string} crossorigin The value to set the crossorigin attribute. Will remove crossorigin attribute if null.
     */


    this.setCrossorigin = function (crossorigin) {
      if (crossorigin) {
        // [PBW-6882]
        // There's a strange bug in Safari on iOS11 that causes CORS errors to be
        // incorrectly thrown when setting the crossorigin attribute after a video has
        // played without it. This usually happens when a video with CC's is played
        // after a preroll that's not using crossorigin.
        // At the time of writing iOS Safari doesn't seem to enforce same origin policy
        // for either HLS manifests/segments or VTT files. We avoid setting crossorigin
        // as a workaround for iOS 11 since it currently appears to not be needed.
        var isIos11 = OOV4.isIos && OOV4.iosMajorVersion === 11;

        if (!isIos11) {
          $(_video).attr("crossorigin", crossorigin);
        }
      } else {
        $(_video).removeAttr("crossorigin");
      }
    };
    /**
     * For multi audio we can get a list of available audio tracks
     * @public
     * @method OoyalaVideoWrapper#getAvailableAudio
     * @returns {Array} - an array of all available audio tracks.
     */


    this.getAvailableAudio = function () {
      var audioTracks = _video.audioTracks;
      var audioTrackList = [];

      if (audioTracks !== undefined && audioTracks.length) {
        audioTracks = _.filter(audioTracks, function (track) {
          return track;
        });
        audioTrackList = _.map(audioTracks, function (track) {
          return {
            id: track.id,
            label: track.label,
            lang: track.language,
            enabled: track.enabled
          };
        }, this);
      }

      return audioTrackList;
    };
    /**
     * Sets the audio track to the ID specified by trackID
     * @public
     * @method OoyalaVideoWrapper#setAudio
     * @param {String} trackId - the ID of the audio track to activate
     * @callback OoyalaVideoFactory#raiseAudioChange
     */


    this.setAudio = function (trackId) {
      var audioTracks = _video.audioTracks;

      if (audioTracks && audioTracks.length) {
        // if audioTracks exist
        var currentAudio = _.find(audioTracks, function (track) {
          return track.enabled;
        });

        var currentAudioId = null;

        if (currentAudio && currentAudio.id) {
          currentAudioId = currentAudio.id;

          if (currentAudioId !== trackId) {
            var newAudioTrack = audioTracks.getTrackById(trackId);

            if (newAudioTrack) {
              // if trackId is correct and the audio exists
              var prevAudioTrack = audioTracks.getTrackById(currentAudioId);

              if (prevAudioTrack) {
                // if currentAudioId is correct and the audio exists
                prevAudioTrack.enabled = false; // the audio is not active anymore
              }

              newAudioTrack.enabled = true; // the audio is active
            }
          }
        }
      } // audioTracks right now is Array-like, not actually an array
      // so we need to make it so


      var newTracks = this.getAvailableAudio();
      raiseAudioChange(newTracks);
    };
    /**
     * Set the playback speed of the video element
     * @public
     * @method OoyalaVideoWrapper#setPlaybackSpeed
     * @param  {number} speed The desired speed multiplier
     */


    this.setPlaybackSpeed = function (speed) {
      if (typeof speed !== 'number' || isNaN(speed)) {
        return;
      } //if we are playing a live asset, set the playback speed back to 1. This is
      //just in case we have somehow missed reseting the speed somewhere else.


      if (isLive) {
        currentPlaybackSpeed = 1.0;
      } else {
        currentPlaybackSpeed = speed;
      }

      if (_video) {
        _video.playbackRate = currentPlaybackSpeed;
      }
    };
    /**
     * Get the current speed multiplier for video elements.
     * @public
     * @method OoyalaVideoWrapper#getPlaybackSpeed
     * @return {number} Current playback speed multiplier
     */


    this.getPlaybackSpeed = function () {
      return currentPlaybackSpeed;
    }; // **********************************************************************************/
    // Event callback methods
    // **********************************************************************************/

    /**
     * Stores the url of the video when load is started.
     * @private
     * @method OoyalaVideoWrapper#onLoadStart
     */


    var onLoadStart = _.bind(function () {
      stopUnderflowWatcher();
      _currentUrl = _video.src;
      firstPlay = true;
      videoEnded = false;
      isSeeking = false;
    }, this);
    /**
     * When metadata is done loading, trigger any seeks that were queued up.
     * @private
     * @method OoyalaVideoWrapper#onLoadedMetadata
     */


    var onLoadedMetadata = _.bind(function () {
      if (_video.textTracks) {
        _video.textTracks.onaddtrack = onTextTracksAddTrack;
        _video.textTracks.onchange = onTextTracksChange;
      }

      if (_video.audioTracks) {
        _video.audioTracks.onchange = _onAudioChange;
      }

      dequeueSeek();
      isLive = isLive || _video.currentTime === Infinity; // Just in case backend and video metadata disagree about this

      if (isLive) {
        this.setPlaybackSpeed(1.0);
      }

      loaded = true;
    }, this);
    /**
     * Fired when there's a change on audioTracks
     * @private
     * @method OoyalaVideoFactory#onAudioChange
     * @callback OoyalaVideoFactory#raiseAudioChange
     */


    var _onAudioChange = _.bind(function (event) {
      var audioTracks = this.getAvailableAudio();
      raiseAudioChange(audioTracks);
    }, this);
    /**
     * Raised notification to VideoController
     * @private
     * @method OoyalaVideoFactory#onAudioChange
     * @fires VideoController#EVENTS.MULTI_AUDIO_CHANGE
     */


    var raiseAudioChange = _.bind(function (audioTracks) {
      // the problem here is that onchange gets triggered twice so
      // we compare old this.audioTracks with new audioTracks
      // to get updated tracks just once
      if (!_.isEqual(this.audioTracks, audioTracks)) {
        this.audioTracks = audioTracks;
        this.controller.notify(this.controller.EVENTS.MULTI_AUDIO_CHANGED, audioTracks);
      }
    }, this);
    /**
     * Fired by the browser when new text tracks are added.
     * @method OoyalaVideoWrapper#onTextTracksAddTrack
     * @private
     */


    var onTextTracksAddTrack = function onTextTracksAddTrack() {
      // Update our internal map of available text tracks
      tryMapTextTracks(); // Notify core about closed captions available after the change

      checkForAvailableClosedCaptions();
    };
    /**
     * Fired by the browser when there is a change on a text track. We use this
     * handler in order to compare text track modes against our own records in
     * order to determine whether changes have been made by the native UI (mostly
     * for iOS fullscreen mode).
     * @private
     * @method OoyalaVideoWrapper#onTextTracksChange
     */


    var onTextTracksChange = function onTextTracksChange() {
      var newLanguage;
      var changedTracks = textTrackHelper.filterChangedTracks(textTrackMap); // Changed tracks are any whose mode is different from the one we last
      // recorded on our text track map (i.e. the ones changed by the native UI)

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = changedTracks[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var changedTrack = _step.value;
          var trackMetadata = textTrackMap.findEntry({
            textTrack: changedTrack
          }); // We assume that any changes that occur prior to playback are browser
          // defaults since the native UI couldn't have been displayed yet

          if (!canPlay) {
            OOV4.log('MainHtml5: Native CC changes detected before playback, ignoring.');
            changedTrack.mode = trackMetadata.mode;
            continue;
          } // Changed tracks will come in pairs (one disabled, one enabled), except when
          // captions are turned off, in which case there should be a single disabled track


          if (changedTrack.mode === OOV4.CONSTANTS.CLOSED_CAPTIONS.DISABLED) {
            // This will be none when all changed tracks are disabled
            newLanguage = newLanguage || 'none'; // A single enabled track (without a corresponding disabled track) indicates
            // that the browser is forcing its default language. The exception to this is
            // when all tracks were previously disabled, which means that captions were
            // enabled by the user via the native UI
          } else if (!textTrackMap.areAllDisabled() && changedTracks.length === 1) {
            OOV4.log('MainHtml5: Default browser CC language detected, ignoring in favor of plugin default');
          } else {
            var useLanguageAsKey = !!(trackMetadata.isExternal || externalCaptionsLanguages[trackMetadata.language]); // We give priority to external VTT captions but Safari might pick an
            // in-stream/in-manifest track when a CC language is chosen using the
            // native UI. We make sure to enable the equivalent external track
            // whenever both internal and external tracks exist for the same language

            newLanguage = useLanguageAsKey ? trackMetadata.language : trackMetadata.id;
          } // Whether we're ignoring or propagating the changes we revert the track to
          // it's last known mode. If there's a need for a language change it will
          // happen as a result of the notification below


          changedTrack.mode = trackMetadata.mode;
        } // Native text track change detected, update our own UI

      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return != null) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      if (newLanguage) {
        _this.controller.notify(_this.controller.EVENTS.CAPTIONS_LANGUAGE_CHANGE, {
          language: newLanguage
        });

        OOV4.log("MainHtml5: CC track has been changed to \"".concat(newLanguage, "\" by the native UI"));
      }
    };
    /**
     * Callback for when a closed caption track cue has changed.
     * @private
     * @method OoyalaVideoWrapper#onClosedCaptionCueChange
     * @param {object} event The event from the cue change
     */


    var onClosedCaptionCueChange = _.bind(function (event) {
      var cueText = "";

      if (event && event.currentTarget && event.currentTarget.activeCues) {
        for (var i = 0; i < event.currentTarget.activeCues.length; i++) {
          if (event.currentTarget.activeCues[i].text) {
            cueText += event.currentTarget.activeCues[i].text + "\n";
          }
        }
      }

      raiseClosedCaptionCueChanged(cueText);
    }, this);
    /**
     * Notify the controller with new closed caption cue text.
     * @private
     * @method OoyalaVideoWrapper#raiseClosedCaptionCueChanged
     * @param {string} cueText The text of the new closed caption cue. Empty string signifies no active cue.
     */


    var raiseClosedCaptionCueChanged = _.bind(function (cueText) {
      cueText = cueText.trim();

      if (cueText != lastCueText) {
        lastCueText = cueText;
        this.controller.notify(this.controller.EVENTS.CLOSED_CAPTION_CUE_CHANGED, cueText);
      }
    }, this);
    /**
     * Notifies the controller that a progress event was raised.
     * @private
     * @method OoyalaVideoWrapper#raiseProgress
     * @param {object} event The event from the video
     */


    var raiseProgress = _.bind(function (event) {
      var buffer = 0;

      if (event.target.buffered && event.target.buffered.length > 0) {
        buffer = event.target.buffered.end(0); // in sec;
      } //Progress updates mean seekable ranges could be available so let's attempt to dequeue the seek


      if (isLive) {
        dequeueSeek();
      }

      if (!handleFailover) {
        this.controller.notify(this.controller.EVENTS.PROGRESS, {
          "currentTime": event.target.currentTime,
          "duration": resolveDuration(event.target.duration),
          "buffer": buffer,
          "seekRange": getSafeSeekRange(event.target.seekable)
        });
      }
    }, this);
    /**
     * Notifies the controller that an error event was raised.
     * @private
     * @method OoyalaVideoWrapper#raiseErrorEvent
     * @param {object} event The event from the video
     */


    var raiseErrorEvent = _.bind(function (event) {
      stopUnderflowWatcher();
      var code = event.target.error ? event.target.error.code : -1; // Suppress error code 4 when raised by a video element with a null or empty src

      if (!(code === 4 && ($(event.target).attr("src") === "null" || $(event.target).attr("src") === ""))) {
        this.controller.notify(this.controller.EVENTS.ERROR, {
          errorcode: code
        });
      }
    }, this);
    /**
     * Notifies the controller that a stalled event was raised.  Pauses the video on iPad if the currentTime is 0.
     * @private
     * @method OoyalaVideoWrapper#raiseStalledEvent
     * @param {object} event The event from the video
     */


    var raiseStalledEvent = _.bind(function (event) {
      // Fix multiple video tag error in iPad
      if (OOV4.isIpad && event.target.currentTime === 0) {
        _video.pause();
      }

      this.controller.notify(this.controller.EVENTS.STALLED, {
        "url": _video.currentSrc
      });
    }, this);
    /**
     * HTML5 video browser can start playing the media. Sets canPlay flag to TRUE
     * @private
     * @method OoyalaVideoWrapper#raiseCanPlay
     */


    var raiseCanPlay = _.bind(function () {
      // On firefox and iOS, at the end of an underflow the video raises 'canplay' instead of
      // 'canplaythrough'.  If that happens, raise canPlayThrough.
      if ((OOV4.isFirefox || OOV4.isIos) && waitingEventRaised) {
        raiseCanPlayThrough();
      }

      canPlay = true; //Notify controller of video width and height.

      if (firstPlay) {
        // Dequeue any calls to setClosedCaptions() that occurred before
        // the video was loaded
        dequeueSetClosedCaptions();
        this.controller.notify(this.controller.EVENTS.ASSET_DIMENSION, {
          width: _video.videoWidth,
          height: _video.videoHeight
        });
        var availableAudio = this.getAvailableAudio();

        if (availableAudio && availableAudio.length > 1) {
          this.audioTracks = availableAudio;
          this.controller.notify(this.controller.EVENTS.MULTI_AUDIO_AVAILABLE, availableAudio);
        }
      }
    }, this);
    /**
     * Notifies the controller that a buffered event was raised.
     * @private
     * @method OoyalaVideoWrapper#raiseCanPlayThrough
     */


    var raiseCanPlayThrough = _.bind(function () {
      waitingEventRaised = false;
      this.controller.notify(this.controller.EVENTS.BUFFERED, {
        "url": _video.currentSrc
      });
    }, this);
    /**
     * Notifies the controller that a playing event was raised.
     * @private
     * @method OoyalaVideoWrapper#raisePlayingEvent
     */


    var raisePlayingEvent = _.bind(function () {
      // Do not raise playback events if the video is priming
      if (isPriming) {
        return;
      }

      if (_video && pauseOnPlaying) {
        _video.pause();

        return;
      } // Update time shift in case the video was paused and then resumed,
      // which means that we were falling behind the live playhead while the video
      // wasn't playing. Note that Safari will sometimes keep loading the live content
      // in the background and will resume with the latest content. Time shift should
      // resolve to the same value in those cases.


      if (!firstPlay && wasPausedBeforePlaying && isDvrAvailable()) {
        currentTimeShift = getTimeShift(_video.currentTime);
      }

      hasStartedPlaying = true; //We want the initial PLAYING event to be from the play promise if play promises
      //are supported. This is to help with the muted autoplay workflow.
      //We want to ignore any playing events thrown by plays started with play promises

      if (!ignoreFirstPlayingEvent) {
        this.controller.notify(this.controller.EVENTS.PLAYING);
      }

      startUnderflowWatcher();
      ignoreFirstPlayingEvent = false;
      firstPlay = false;
      canSeek = true;
      isSeeking = false;
      wasPausedBeforePlaying = false;
    }, this);
    /**
     * Notifies the controller that a waiting event was raised.
     * @private
     * @method OoyalaVideoWrapper#raiseWaitingEvent
     */


    var raiseWaitingEvent = _.bind(function () {
      // WAITING event is not raised if no video is assigned yet
      if (_.isEmpty(_video.currentSrc)) {
        return;
      }

      waitingEventRaised = true;
      this.controller.notify(this.controller.EVENTS.WAITING, {
        "url": _video.currentSrc
      });
    }, this);
    /**
     * Notifies the controller that a seeking event was raised.
     * @private
     * @method OoyalaVideoWrapper#raiseSeekingEvent
     */


    var raiseSeekingEvent = _.bind(function () {
      isSeeking = true; // Do not raise playback events if the video is priming
      // If the stream is seekable, supress seeks that come before or at the time initialTime is been reached
      // or that come while seeking.

      if (!isPriming && initialTime.reached) {
        this.controller.notify(this.controller.EVENTS.SEEKING);
      }
    }, this);
    /**
     * Notifies the controller that a seeked event was raised.
     * @private
     * @method OoyalaVideoWrapper#raiseSeekedEvent
     */


    var raiseSeekedEvent = _.bind(function (event) {
      // Firefox known issue: lack of global event.
      isSeeking = false; // After done seeking, see if any play events were received and execute them now
      // This fixes an issue on iPad where playing while seeking causes issues with end of stream eventing.

      dequeuePlay(); // PBI-718 - If seeking is disabled and a native seek was received, seek back to the previous position.
      // This is required for platforms with native controls that cannot be disabled, such as iOS

      if (this.disableNativeSeek) {
        var fixedSeekedTime = Math.floor(_video.currentTime);
        var fixedCurrentTime = Math.floor(currentTime);

        if (fixedSeekedTime !== fixedCurrentTime) {
          _video.currentTime = currentTime;
        }
      } // Code below is mostly for fullscreen mode on iOS, where the video can be seeked
      // using the native player controls. We haven't updated currentTimeShift in this case,
      // so we do it at this point in order to show the correct shift in our inline controls
      // when the user exits fullscreen mode.


      if (isDvrAvailable() && !isWrapperSeeking) {
        // Seeking wasn't initiated by the wrapper, which means this is a native seek
        currentTimeShift = getTimeShift(_video.currentTime);
      }

      isWrapperSeeking = false; // If the stream is seekable, suppress seeks that come before or at the time initialTime is been reached
      // or that come while seeking.

      if (!initialTime.reached) {
        checkInitialTimeReached();
      } else {
        this.controller.notify(this.controller.EVENTS.SEEKED);
        raisePlayhead(this.controller.EVENTS.TIME_UPDATE, event); // Firefox and Safari seek from paused state.
      }
    }, this);
    /**
     * Notifies the controller that a ended event was raised.
     * @private
     * @method OoyalaVideoWrapper#raiseEndedEvent
     */


    var raiseEndedEvent = _.bind(function (event) {
      stopUnderflowWatcher();

      if (!_video.ended && OOV4.isSafari) {
        // iOS raises ended events sometimes when a new stream is played in the same video element
        // Prevent this faulty event from making it to the player message bus
        return;
      }

      if (videoEnded) {
        return;
      } // no double firing ended event.


      videoEnded = true;
      initialTime.value = 0;
      this.controller.notify(this.controller.EVENTS.ENDED);
    }, this);
    /**
     * Notifies the controller that the duration has changed.
     * @private
     * @method OoyalaVideoWrapper#raiseDurationChange
     * @param {object} event The event from the video
     */


    var raiseDurationChange = _.bind(function (event) {
      if (!handleFailover) {
        raisePlayhead(this.controller.EVENTS.DURATION_CHANGE, event);
      }
    }, this);
    /**
     * Checks to see if the initial time has been reached. Will update related states if initial
     * time has been reached.
     * @private
     * @method OoyalaVideoWrapper#checkInitialTimeReached
     */


    var checkInitialTimeReached = function checkInitialTimeReached() {
      var currentTime = _video.currentTime;

      if (!initialTime.reached && initialTime.value >= 0 && currentTime >= initialTime.value) {
        initialTime.reached = true;
        initialTime.value = 0;
      }
    };
    /**
     * Notifies the controller that the time position has changed.  Handles seeks if seeks were enqueued and
     * the stream has become seekable.  Triggers end of stream for m3u8 if the stream won't raise it itself.
     * @private
     * @method OoyalaVideoWrapper#raiseTimeUpdate
     * @param {object} event The event from the video
     */


    var raiseTimeUpdate = _.bind(function (event) {
      if (!isSeeking) {
        currentTime = _video.currentTime;
      }

      checkInitialTimeReached();
      raisePlayhead(this.controller.EVENTS.TIME_UPDATE, event); // iOS has issues seeking so if we queue a seek handle it here

      dequeueSeek();
      forceEndOnTimeupdateIfRequired(event);
    }, this);
    /**
     * Notifies the controller that the play event was raised.
     * @private
     * @method OoyalaVideoWrapper#raisePlayEvent
     * @param {object} event The event from the video
     */


    var raisePlayEvent = _.bind(function (event) {
      // Do not raise playback events if the video is priming
      if (isPriming) {
        return;
      }

      this.controller.notify(this.controller.EVENTS.PLAY, {
        url: event.target.src
      });
    }, this);
    /**
     * Notifies the controller that the pause event was raised.
     * @private
     * @method OoyalaVideoWrapper#raisePauseEvent
     */


    var raisePauseEvent = _.bind(function () {
      // Do not raise playback events if the video is priming
      if (isPriming) {
        return;
      }

      wasPausedBeforePlaying = true;

      if (!(OOV4.isIpad && _video.currentTime === 0)) {
        this.controller.notify(this.controller.EVENTS.PAUSED);
      }

      forceEndOnPausedIfRequired();
    }, this);
    /**
     * IOS native player adds attribute "controls" to video tag.
     * This function removes the attribute on IOS if it is necessary
     * @private
     * @method OoyalaVideoWrapper#removeControlsAttr
     */


    var removeControlsAttr = _.bind(function () {
      if (OOV4.isIos && _video.hasAttribute('controls')) {
        _video.removeAttribute('controls');
      }
    });
    /**
     * Notifies the controller that the ratechange event was raised.
     * @private
     * @method OoyalaVideoWrapper#raiseRatechangeEvent
     */


    var raiseRatechangeEvent = _.bind(function () {
      var playbackRate = _video ? _video.playbackRate : null;
      this.controller.notify(this.controller.EVENTS.PLAYBACK_RATE_CHANGE, {
        playbackRate: playbackRate
      });
    }, this);
    /**
     * Notifies the controller that the volume event was raised.
     * @private
     * @method OoyalaVideoWrapper#raiseVolumeEvent
     * @param {object} event The event raised by the video.
     */


    var raiseVolumeEvent = _.bind(function (event) {
      this.controller.notify(this.controller.EVENTS.VOLUME_CHANGE, {
        volume: event.target.volume
      });
      this.controller.notify(this.controller.EVENTS.MUTE_STATE_CHANGE, {
        muted: _video.muted
      });
    }, this);
    /**
     * Notifies the controller that the fullscreenBegin event was raised.
     * @private
     * @method OoyalaVideoWrapper#raiseFullScreenBegin
     * @param {object} event The event raised by the video.
     */


    var raiseFullScreenBegin = _.bind(function (event) {
      this.controller.notify(this.controller.EVENTS.FULLSCREEN_CHANGED, {
        isFullScreen: true,
        paused: event.target.paused
      });
    }, this);
    /**
     * Notifies the controller that the fullscreenEnd event was raised.
     * @private
     * @method OoyalaVideoWrapper#raiseFullScreenEnd
     * @param {object} event The event raised by the video.
     */


    var raiseFullScreenEnd = _.bind(function (event) {
      this.controller.notify(this.controller.EVENTS.FULLSCREEN_CHANGED, {
        "isFullScreen": false,
        "paused": event.target.paused
      });
      removeControlsAttr();
    }, this);
    /************************************************************************************/
    // Helper methods

    /************************************************************************************/

    /**
     * Sequentially executes all the setClosedCaptions() calls that have
     * been queued. The queue is cleared as a result of this operation.
     * @private
     * @method OoyalaVideoWrapper#dequeueSetClosedCaptions
     */


    var dequeueSetClosedCaptions = _.bind(function () {
      var queuedArguments;

      while (queuedArguments = setClosedCaptionsQueue.shift()) {
        executeSetClosedCaptions.apply(this, queuedArguments);
      }
    }, this);
    /**
     * Sets the mode of all text tracks to 'disabled' except for targetTrack.
     * @private
     * @method OoyalaVideoWrapper#disableTextTracksExcept
     * @param {TextTrack} The text track which we want to exclude from the disable operation.
     */


    var disableTextTracksExcept = function disableTextTracksExcept(targetTrack) {
      // Start by disabling all tracks, except for the one whose mode we want to set
      textTrackHelper.forEach(function (textTrack) {
        // Note: Edge will get stuck on 'disabled' mode if you disable a track right
        // before setting another mode on it, so we avoid disabling the target track
        if (textTrack !== targetTrack) {
          setTextTrackMode(textTrack, OOV4.CONSTANTS.CLOSED_CAPTIONS.DISABLED);
        }
      });
    };
    /**
     * Creates text tracks for all of the given external VTT captions. If any of
     * the newly added tracks matches the targetLanguage then its mode will be set
     * to targetMode. Note that the mode can't be set at creation time, so this
     * happens when the addtrack event is fired.
     * @private
     * @method OoyalaVideoWrapper#addExternalVttCaptions
     * @param {Object} vttClosedCaptions A metadata object that containing a list of external VTT captions
     * that the player should display to the end user.
     * @param {String} targetLanguage The language or key of the track that should be set to targetMode
     * (usually the language that should be active).
     * @param {String} targetMode The mode that should be set on the track that matches targetLanguage.
     * @return {Boolean} True if a track that matches targetLanguage was added as a result of this call, false otherwise.
     */


    var addExternalVttCaptions = function addExternalVttCaptions() {
      var vttClosedCaptions = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var targetLanguage = arguments.length > 1 ? arguments[1] : undefined;
      var targetMode = arguments.length > 2 ? arguments[2] : undefined;
      var wasTargetTrackAdded = false;

      for (var language in vttClosedCaptions) {
        var trackData = Object.assign({
          language: language
        }, vttClosedCaptions[language]);
        var existsTrack = textTrackMap.existsEntry({
          src: trackData.url
        }); // Only add tracks whose source url hasn't been added before

        if (!existsTrack) {
          addExternalCaptionsTrack(trackData, targetLanguage, targetMode);

          if (language === targetLanguage) {
            wasTargetTrackAdded = true;
          }
        }
      }

      return wasTargetTrackAdded;
    };
    /**
     * Creates a single TextTrack object using the values provided in trackData.
     * The new track's mode will be set to targetMode after creation if the track
     * matches targetLanguage. Tracks that don't match targetLanguage will have a
     * 'disabled' mode by default.
     * @private
     * @method OoyalaVideoWrapper#addExternalCaptionsTrack
     * @param {Object} trackData An object with the following properties:
     *  - url: {String} The url of a source VTT file
     *  - name: {String} The label to display for this track
     *  - language: {String} The language code of the closed captions
     * @param {String} targetLanguage The language or key of the track that should be set to targetMode
     * (usually the language that should be active).
     * @param {String} targetMode The mode that should be set on the track that matches targetLanguage.
     */


    var addExternalCaptionsTrack = function addExternalCaptionsTrack() {
      var trackData = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var targetLanguage = arguments.length > 1 ? arguments[1] : undefined;
      var targetMode = arguments.length > 2 ? arguments[2] : undefined;
      var trackMode; // Disable new tracks by default unless their language matches the language
      // that is meant to be active

      if (trackData.language === targetLanguage) {
        trackMode = targetMode;
      } else {
        trackMode = OOV4.CONSTANTS.CLOSED_CAPTIONS.DISABLED;
      } // Keep a record of all the tracks that we add


      var trackId = textTrackMap.addEntry({
        src: trackData.url,
        label: trackData.name,
        language: trackData.language,
        mode: trackMode
      }, true); // Create the actual TextTrack object

      textTrackHelper.addTrack({
        id: trackId,
        kind: _constants.default.TEXT_TRACK.KIND.SUBTITLES,
        // IMPORTANT:
        // We initially set the label to trackId since it's the only
        // cross-browser way to indentify the track after it's created
        label: trackId,
        srclang: trackData.language,
        src: trackData.url
      }); // MS Edge doesn't fire the addtrack event for manually added tracks

      if (OOV4.isEdge) {
        onTextTracksAddTrack();
      }
    };
    /**
     * Registers unknown text tracks in our text track map and ensures that
     * any tracks that we add have the track mode that corresponds to them.
     * This method is called when there are text track changes such as when the
     * addtrack or removetrack events are fired.
     * @private
     * @method OoyalaVideoWrapper#tryMapTextTracks
     */


    var tryMapTextTracks = function tryMapTextTracks() {
      textTrackHelper.forEach(function (textTrack) {
        // Any tracks that have a track id as a label are known to be external
        // VTT tracks that we recently added. We rely on the label as the only
        // cross-browser way to identify a TextTrack object after its creation
        var trackMetadata = textTrackMap.findEntry({
          id: textTrack.label
        });

        if (trackMetadata) {
          OOV4.log("MainHtml5: Registering newly added text track:", trackMetadata.id); // Store a reference to the track on our track map in order to link
          // related metadata

          textTrackMap.tryUpdateEntry({
            id: trackMetadata.id
          }, {
            textTrack: textTrack
          }); // Now that we've linked the TextTrack object to our map, we no longer
          // need the label in order to identify the track. We can set the actual
          // label on the track at this point

          textTrackHelper.updateTrackLabel(trackMetadata.id, trackMetadata.label); // Tracks are added as 'disabled' by default so we make sure to set
          // the mode that we had previously stored for the newly added track.
          // Note that track mode can't be set during creation that's why we
          // need to wait until the browser reports the track addition.

          setTextTrackMode(textTrack, trackMetadata.mode);
        } // Add in-manifest/in-stream tracks to our text track map. All external
        // tracks are already known to us, so any unrecognized tracks are assumed
        // to be in-manifest/in-stream


        mapTextTrackIfUnknown(textTrack);
      });
    };
    /**
     * Adds in-manifest/in-stream tracks to our text track map in order to allow
     * us to keep track of their state and identify them by ids that we assign to them.
     * @private
     * @method OoyalaVideoWrapper#mapTextTrackIfUnknown
     * @param {TextTrack} textTrack The TextTrack object which we want to try to map.
     */


    var mapTextTrackIfUnknown = function mapTextTrackIfUnknown(textTrack) {
      // Any unkown track is assumed to be an in-manifest/in-stream track since
      // we map external tracks when they are added
      var isKnownTrack = textTrackMap.existsEntry({
        textTrack: textTrack
      }); // Avoid mapping metadata and other non-subtitle track kinds

      var isTextTrack = textTrack.kind === _constants.default.TEXT_TRACK.KIND.CAPTIONS || textTrack.kind === _constants.default.TEXT_TRACK.KIND.SUBTITLES; // Add an entry to our text track map in order to be able to keep track of
      // the in-manifest/in-stream track's mode

      if (!isKnownTrack && isTextTrack) {
        OOV4.log("MainHtml5: Registering internal text track:", textTrack);
        textTrackMap.addEntry({
          label: textTrack.label,
          language: textTrack.language,
          mode: textTrack.mode,
          textTrack: textTrack
        }, false);
      }
    };
    /**
     * Translates the tracks from the text track map into the format that the core
     * uses in order to determine available closed captions languages (or tracks).
     * Calling this function results in CAPTIONS_FOUND_ON_PLAYING being notified
     * with the current state of our text track map.
     * @method OoyalaVideoWrapper#checkForAvailableClosedCaptions
     * @private
     */


    var checkForAvailableClosedCaptions = function checkForAvailableClosedCaptions() {
      var closedCaptionInfo = {
        languages: [],
        locale: {}
      };
      var externalEntries = textTrackMap.getExternalEntries();
      var internalEntries = textTrackMap.getInternalEntries(); // External tracks will override in-manifest/in-stream captions when languages
      // collide, so we add their info first

      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = externalEntries[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var externalEntry = _step2.value;
          closedCaptionInfo.languages.push(externalEntry.language);
          closedCaptionInfo.locale[externalEntry.language] = externalEntry.label;
        } // In-manifest/in-stream captions are reported with an id such as CC1 instead
        // of language in order to avoid conflicts with external VTTs

      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return != null) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }

      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = internalEntries[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var internalEntry = _step3.value;
          // Either the language was already added to the info above or it is one
          // of the external captions that will be added after the video loads
          var isLanguageDefined = !!closedCaptionInfo.locale[internalEntry.language] || !!externalCaptionsLanguages[internalEntry.language]; // We do not report an in-manifest/in-stream track when its language is
          // already in use by external VTT captions

          if (!isLanguageDefined) {
            var key = internalEntry.id;
            var label = internalEntry.label || internalEntry.language || "Captions (".concat(key, ")"); // For in-manifest/in-stream we use id instead of language in order to
            // account for cases in which language metadata is unavailable and also
            // to avoid conflicts with external VTT captions

            closedCaptionInfo.languages.push(key);
            closedCaptionInfo.locale[key] = label;
          }
        }
      } catch (err) {
        _didIteratorError3 = true;
        _iteratorError3 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion3 && _iterator3.return != null) {
            _iterator3.return();
          }
        } finally {
          if (_didIteratorError3) {
            throw _iteratorError3;
          }
        }
      }

      _this.controller.notify(_this.controller.EVENTS.CAPTIONS_FOUND_ON_PLAYING, closedCaptionInfo);
    };
    /**
     * Sets the given track mode on the given text track. The new mode is also
     * updated in the relevant text track map entry in order for us to be able to
     * detect native changes.
     * @private
     * @method OoyalaVideoWrapper#setTextTrackMode
     * @param {TextTrack} textTrack The TextTrack object whose mode we want to set.
     * @param {String} mode The mode that we want to set on the text track.
     */


    var setTextTrackMode = function setTextTrackMode(textTrack, mode) {
      if (textTrack && textTrack.mode !== mode) {
        textTrack.mode = mode; // Keep track of the latest mode that was set in order to be able to
        // detect any changes triggered by the native UI

        textTrackMap.tryUpdateEntry({
          textTrack: textTrack
        }, {
          mode: mode
        }); // Make sure to listen to cue changes on active tracks

        if (mode === OOV4.CONSTANTS.CLOSED_CAPTIONS.DISABLED) {
          textTrack.oncuechange = null;
        } else {
          textTrack.oncuechange = onClosedCaptionCueChange;
        }

        OOV4.log('MainHtml5: Text track mode set:', textTrack.language, mode);
      }
    };
    /**
     * If any plays are queued up, execute them.
     * @private
     * @method OoyalaVideoWrapper#dequeuePlay
     */


    var dequeuePlay = _.bind(function () {
      if (playQueued) {
        playQueued = false;
        this.play();
      }
    }, this);
    /**
     * Loads (if required) and plays the current stream.
     * @private
     * @method OoyalaVideoWrapper#executePlay
     * @param {boolean} priming True if the element is preparing for device playback
     */


    var executePlay = _.bind(function (priming) {
      isPriming = priming; // TODO: Check if no src url is configured?

      if (!loaded) {
        this.load(true);
      }

      var playPromise = _video.play();

      if (!isPriming) {
        hasPlayed = true;
        videoEnded = false;
      }

      return playPromise;
    }, this);
    /**
     * Gets the range of video that can be safely seeked to.
     * @private
     * @method OoyalaVideoWrapper#getSafeSeekRange
     * @param {object} seekRange The seek range object from the video element.  It contains a length, a start
     *                           function, and an end function.
     * @returns {object} The safe seek range object containing { "start": number, "end": number}
     */


    var getSafeSeekRange = function getSafeSeekRange(seekRange) {
      if (!seekRange || !seekRange.length || !(typeof seekRange.start == "function") || !(typeof seekRange.end == "function")) {
        return {
          "start": 0,
          "end": 0
        };
      }

      return {
        "start": seekRange.length > 0 ? seekRange.start(0) : 0,
        "end": seekRange.length > 0 ? seekRange.end(0) : 0
      };
    };
    /**
     * Gets the seekable object in a way that is safe for all browsers.  This fixes an issue where Safari
     * HLS videos become unseekable if 'seekable' is queried before the stream has raised 'canPlay'.
     * @private
     * @method OoyalaVideoWrapper#getSafeSeekableObject
     * @returns {object?} Either the video seekable object or null
     */


    var getSafeSeekableObject = function getSafeSeekableObject() {
      if (OOV4.isSafari && !canPlay) {
        // Safety against accessing seekable before SAFARI browser canPlay media
        return null;
      } else {
        return _video.seekable;
      }
    };
    /**
     * Converts the desired seek time to a safe seek time based on the duration and platform.  If seeking
     * within OOV4.CONSTANTS.SEEK_TO_END_LIMIT of the end of the stream, seeks to the end of the stream.
     * @private
     * @method OoyalaVideoWrapper#convertToSafeSeekTime
     * @param {number} time The desired seek-to position
     * @param {number} duration The video's duration
     * @returns {number} The safe seek-to position
     */


    var convertToSafeSeekTime = function convertToSafeSeekTime(time, duration) {
      // If seeking within some threshold of the end of the stream, seek to end of stream directly
      if (duration - time < OOV4.CONSTANTS.SEEK_TO_END_LIMIT) {
        time = duration;
      }

      var safeTime = time >= duration ? duration - 0.01 : time < 0 ? 0 : time; // iPad with 6.1 has an interesting bug that causes the video to break if seeking exactly to zero

      if (OOV4.isIpad && safeTime < 0.1) {
        safeTime = 0.1;
      }

      return safeTime;
    };
    /**
     * Returns the safe seek time if seeking is possible.  Null if seeking is not possible.
     * @private
     * @method OoyalaVideoWrapper#getSafeSeekTimeIfPossible
     * @param {object} _video The video element
     * @param {number} time The desired seek-to position
     * @returns {?number} The seek-to position, or null if seeking is not possible
     */


    var getSafeSeekTimeIfPossible = function getSafeSeekTimeIfPossible(_video, time) {
      if (typeof time !== "number" || !canSeek) {
        return null;
      }

      var range = getSafeSeekRange(getSafeSeekableObject());

      if (range.start === 0 && range.end === 0) {
        return null;
      }

      var safeTime = convertToSafeSeekTime(time, _video.duration);

      if (range.start <= safeTime && range.end >= safeTime) {
        return safeTime;
      }

      return null;
    };
    /**
     * Returns the actual playhead time that we need to seek to in order to shift to a time in
     * the DVR window represented by a number from 0 to DVR Window Length. The values returned
     * are always constrained to the size of the DVR window.
     * @private
     * @method OoyalaVideoWrapper#getSafeDvrSeekTime
     * @param {HTMLVideoElement} video The video element on which the DVR-enabled stream is loaded.
     * @param {Number} seekTime The time from 0 to DVR Window Length to which we want to shift.
     * @return {Number} The playhead time that corresponds to the given DVR window position (seekTime).
     * The return value will be constrained to valid values within the DVR window. The current playhead
     * will be returned when seekTime is not a valid, finite or positive number.
     */


    var getSafeDvrSeekTime = function getSafeDvrSeekTime(video, seekTime) {
      // Note that we set seekTime to an invalid negative value if not a number
      seekTime = ensureNumber(seekTime, -1); // When seekTime is negative or not a valid number, return the current time
      // in order to avoid seeking

      if (seekTime < 0) {
        return (video || {}).currentTime || 0;
      }

      var seekRange = getSafeSeekRange(getSafeSeekableObject());
      var safeSeekTime = seekRange.start + seekTime; // Make sure seek time isn't larger than maximum seekable value, if it is,
      // seek to maximum value instead

      safeSeekTime = Math.min(safeSeekTime, seekRange.end);
      return safeSeekTime;
    };
    /**
     * Adds the desired seek time to a queue so as to be used later.
     * @private
     * @method OoyalaVideoWrapper#queueSeek
     * @param {number} time The desired seek-to position
     */


    var queueSeek = function queueSeek(time) {
      queuedSeekTime = time;
    };
    /**
     * If a seek was previously queued, triggers a seek to the queued seek time.
     * @private
     * @method OoyalaVideoWrapper#dequeueSeek
     */


    var dequeueSeek = _.bind(function () {
      if (queuedSeekTime === null) {
        return;
      }

      var seekTime = queuedSeekTime;
      queuedSeekTime = null;
      this.seek(seekTime);
    }, this);
    /**
     * Determines whether or not the current stream has DVR currently enabled.
     * @private
     * @method OoyalaVideoWrapper#isDvrAvailable
     * @return {Boolean} True if DVR is available, false otherwise.
     */


    var isDvrAvailable = function isDvrAvailable() {
      var maxTimeShift = getMaxTimeShift();
      var result = maxTimeShift !== 0;
      return result;
    };
    /**
     * Returns the current time shift offset to the live edge in seconds for DVR-enabled streams.
     * @private
     * @method OoyalaVideoWrapper#getTimeShift
     * @return {Number} The negative value of the current time shift offset, in seconds. Returns 0
     * if currently at the live edge.
     */


    var getTimeShift = function getTimeShift(currentTime) {
      if (!isLive) {
        return 0;
      }

      var timeShift = 0;
      var seekRange = getSafeSeekRange(getSafeSeekableObject()); // If not a valid number set to seekRange.end so that timeShift equals zero

      currentTime = ensureNumber(currentTime, seekRange.end);
      timeShift = currentTime - seekRange.end; // Discard positive time shifts

      timeShift = Math.min(timeShift, 0); // Shouldn't be greater than max time shift

      timeShift = Math.max(timeShift, getMaxTimeShift());
      return timeShift;
    };
    /**
     * Returns the max amount of time that the video can be seeked back for DVR-enabled
     * live streams. The value of maxTimeShift is represented as a negative number.
     * @private
     * @method OoyalaVideoWrapper#getMaxTimeShift
     * @return {Number} The maximum amount of seconds that the current video can be seeked back
     * represented as a negative number, or zero, if DVR is not available.
     */


    var getMaxTimeShift = function getMaxTimeShift(event) {
      if (!isLive) {
        return 0;
      }

      var maxShift = 0;
      var seekRange = getSafeSeekRange(getSafeSeekableObject());
      maxShift = seekRange.end - seekRange.start;
      maxShift = ensureNumber(maxShift, 0) > 0 ? -maxShift : 0;
      return maxShift;
    };
    /**
     * Notifies the controller of events that provide playhead information.
     * @private
     * @method OoyalaVideoWrapper#raisePlayhead
     */


    var raisePlayhead = _.bind(function (eventname, event) {
      // Do not raise playback events if the video is priming
      if (isPriming) {
        return;
      } // If the stream is seekable, supress playheads that come before the initialTime has been reached
      // or that come while seeking.
      // TODO: Check _video.seeking?


      if (isSeeking || initialTime.value > 0) {
        return;
      }

      var buffer = 0;
      var newCurrentTime = null;
      var currentLiveTime = 0;
      var duration = resolveDuration(event.target.duration); // Live videos without DVR (i.e. maxTimeShift === 0) are treated as regular
      // videos for playhead update purposes

      if (isDvrAvailable()) {
        var maxTimeShift = getMaxTimeShift();
        newCurrentTime = currentTimeShift - maxTimeShift;
        duration = -maxTimeShift;
        buffer = duration; // [PBW-5863] The skin displays current time a bit differently when dealing
        // with live video, but we still need to keep track of the actual playhead for analytics purposes

        currentLiveTime = _video.currentTime;
      } else {
        if (_video.buffered && _video.buffered.length > 0) {
          buffer = _video.buffered.end(0); // in seconds
        } // Just a precaution for older browsers, this should already be a number


        newCurrentTime = ensureNumber(_video.currentTime, null);
      }

      var seekable = getSafeSeekRange(getSafeSeekableObject());
      this.controller.notify(eventname, {
        currentTime: newCurrentTime,
        currentLiveTime: currentLiveTime,
        duration: duration,
        buffer: buffer,
        seekRange: seekable
      });
    }, this);
    /**
     * Converts a value to a number or returns null if it can't be converted or is not a finite value.
     * @private
     * @method OoyalaVideoWrapper#ensureNumber
     * @param {*} value The value to convert.
     * @param {*} defaultValue A default value to return when the input is not a valid number.
     * @return {Number} The Number equivalent of value if it can be converted and is finite.
     * When value doesn't meet the criteria the function will return either defaultValue (if provided) or null.
     */


    var ensureNumber = function ensureNumber(value, defaultValue) {
      var number;

      if (value === null || _.isArray(value)) {
        value = NaN;
      }

      if (_.isNumber(value)) {
        number = value;
      } else {
        number = Number(value);
      }

      if (!isFinite(number)) {
        return typeof defaultValue === 'undefined' ? null : defaultValue;
      }

      return number;
    };
    /**
     * Resolves the duration of the video to a valid value.
     * @private
     * @method OoyalaVideoWrapper#resolveDuration
     * @param {number} duration The reported duration of the video in seconds
     * @returns {number} The resolved duration of the video in seconds
     */


    var resolveDuration = function resolveDuration(duration) {
      if (duration === Infinity || isNaN(duration)) {
        return 0;
      }

      return duration;
    };
    /**
     * Safari desktop sometimes doesn't raise the ended event until the next time the video is played.
     * Force the event to come through by calling play if _video.ended to prevent it for coming up on the
     * next stream.
     * @private
     * @method OoyalaVideoWrapper#forceEndOnPausedIfRequired
     */


    var forceEndOnPausedIfRequired = _.bind(function () {
      if (OOV4.isSafari && !OOV4.isIos) {
        if (_video.ended) {
          console.log("VTC_OO: Force through the end of stream for Safari", _video.currentSrc, _video.duration, _video.currentTime);
          raiseEndedEvent();
        }
      }
    }, this);
    /**
     * Currently, iOS has a bug that if the m3u8 EXTINF indicates a different duration, the ended event never
     * gets dispatched.  Manually trigger an ended event on all m3u8 streams where duration is a non-whole
     * number.
     * @private
     * @method OoyalaVideoWrapper#forceEndOnTimeupdateIfRequired
     */


    var forceEndOnTimeupdateIfRequired = _.bind(function (event) {
      if (isM3u8) {
        var durationResolved = resolveDuration(event.target.duration);
        var durationInt = Math.floor(durationResolved);

        if (_video.currentTime == durationResolved && durationResolved > durationInt) {
          console.log("VTC_OO: manually triggering end of stream for m3u8", _currentUrl, durationResolved, _video.currentTime);

          _.defer(raiseEndedEvent);
        } else if (OOV4.isSafari && !OOV4.isIos && isSeeking === true && !_video.ended && Math.round(_video.currentTime) === Math.round(_video.duration)) {
          this.controller.notify(this.controller.EVENTS.SEEKED);
          videoEnded = true;
          initialTime.value = 0;
          this.controller.notify(this.controller.EVENTS.ENDED);
        }
      }
    }, this);
    /**
     * Chrome does not raise a waiting event when the buffer experiences an underflow and the stream stops
     * playing.  To compensate, start a watcher that periodically checks the currentTime.  If the stream is
     * not advancing but is not paused, raise the waiting event once.
     * If the watcher has already been started, do nothing.
     * @private
     * @method OoyalaVideoWrapper#startUnderflowWatcher
     */


    var startUnderflowWatcher = _.bind(function () {
      if ((OOV4.isChrome || OOV4.isIos || OOV4.isIE11Plus || OOV4.isEdge) && !underflowWatcherTimer) {
        var watchInterval = 300;
        underflowWatcherTimer = setInterval(underflowWatcher, watchInterval);
      }
    }, this);
    /**
     * Periodically checks the currentTime.  If the stream is not advancing but is not paused, raise the
     * waiting event once.
     * @private
     * @method OoyalaVideoWrapper#underflowWatcher
     */


    var underflowWatcher = _.bind(function () {
      if (!hasPlayed) {
        return;
      }

      if (_video.ended) {
        return stopUnderflowWatcher();
      }

      if (!_video.paused && _video.currentTime == watcherTime) {
        if (!waitingEventRaised) {
          raiseWaitingEvent();
        }
      } else {
        // should be able to do this even when paused
        watcherTime = _video.currentTime;

        if (waitingEventRaised) {
          raiseCanPlayThrough();
        }
      }
    }, this);
    /**
     * Stops the interval the watches for underflow.
     * @private
     * @method OoyalaVideoWrapper#stopUnderflowWatcher
     */


    var stopUnderflowWatcher = _.bind(function () {
      clearInterval(underflowWatcherTimer);
      underflowWatcherTimer = null;
      waitingEventRaised = false;
      watcherTime = -1;
    }, this);
  };
  /**
   * Generates a random string.
   * @private
   * @method getRandomString
   * @returns {string} A random string
   */


  var getRandomString = function getRandomString() {
    return Math.random().toString(36).substring(7);
  };

  OOV4.Video.plugin(new OoyalaVideoFactory());
})(OOV4._, OOV4.$);

},{"../../../html5-common/js/utils/InitModules/InitOO.js":1,"../../../html5-common/js/utils/InitModules/InitOOHazmat.js":2,"../../../html5-common/js/utils/InitModules/InitOOUnderscore.js":3,"../../../html5-common/js/utils/constants.js":4,"../../../html5-common/js/utils/environment.js":5,"../../../html5-common/js/utils/utils.js":6,"./constants/constants":87,"./text_track/text_track_helper":89,"./text_track/text_track_map":90,"core-js/modules/es6.array.find":74,"core-js/modules/es6.array.iterator":75,"core-js/modules/es6.function.name":76,"core-js/modules/es6.number.constructor":77,"core-js/modules/es6.object.assign":78,"core-js/modules/es6.object.keys":79,"core-js/modules/es6.regexp.match":81,"core-js/modules/es6.regexp.replace":82,"core-js/modules/es6.regexp.to-string":83,"core-js/modules/es6.symbol":84,"core-js/modules/es7.symbol.async-iterator":85,"core-js/modules/web.dom.iterable":86}],89:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/es7.symbol.async-iterator");

require("core-js/modules/es6.symbol");

require("core-js/modules/es6.array.find");

require("core-js/modules/web.dom.iterable");

var _text_track_map = _interopRequireDefault(require("./text_track_map"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/**
 * Extends the functionality of the TextTrackList object in order to simplify
 * adding, searching, updating and removing text tracks.
 */
var TextTrackHelper =
/*#__PURE__*/
function () {
  function TextTrackHelper(video) {
    _classCallCheck(this, TextTrackHelper);

    this.video = video;
  }
  /**
   * Creates a new TextTrack object by appending Track element to the video element.
   * @public
   * @param {Object} trackData An object with the relevant properties to set on the text track object.
   */


  _createClass(TextTrackHelper, [{
    key: "addTrack",
    value: function addTrack() {
      var trackData = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      if (!this.video) {
        return;
      }

      var track = document.createElement('track');
      track.id = trackData.id;
      track.kind = trackData.kind;
      track.label = trackData.label;
      track.srclang = trackData.srclang;
      track.src = trackData.src;
      this.video.appendChild(track);
    }
    /**
     * Finds a text track by id and sets its label to the given value. This operation
     * is only possible for tracks that were manually added by the plugin.
     * @public
     * @param {String} trackId The dom id of the text track to update
     * @param {String} label The new label to be set on the text track
     */

  }, {
    key: "updateTrackLabel",
    value: function updateTrackLabel(trackId) {
      var label = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

      if (this.video && trackId) {
        var trackElement = this.video.querySelector("#".concat(trackId));

        if (trackElement) {
          trackElement.setAttribute('label', label);
        }
      }
    }
    /**
     * Allows executing Array.prototype.forEach on the video's TextTrackList.
     * @public
     * @param {Function} callback A function to execute for existing text track.
     */

  }, {
    key: "forEach",
    value: function forEach(callback) {
      if (!this.video || !this.video.textTracks) {
        return;
      }

      Array.prototype.forEach.call(this.video.textTracks, callback);
    }
    /**
     * Allows executing Array.prototype.filter on the video's TextTrackList.
     * @public
     * @param {Function} callback A predicate function to test each element of the array.
     * @return {Array} An array with all the TextTrack objects that match the filter criteria.
     */

  }, {
    key: "filter",
    value: function filter(callback) {
      if (!this.video || !this.video.textTracks) {
        return [];
      }

      return Array.prototype.filter.call(this.video.textTracks, callback);
    }
    /**
     * Allows executing Array.prototype.find on the video's TextTrackList.
     * @public
     * @param {Function} callback A function to execute on each value in the array.
     * @return {TextTrack} The first TextTrack object that matches the search criteria or undefined if there are no matches.
     */

  }, {
    key: "find",
    value: function find(callback) {
      if (!this.video || !this.video.textTracks) {
        return;
      }

      var track = Array.prototype.find.call(this.video.textTracks, callback);
      return track;
    }
    /**
     * Finds the TextTrack object that matches a key, which can be either the language
     * code of the track or a track id associated with the track on a TextTrackMap.
     * Important:
     * It is assumed that internal tracks are matched by id and external tracks are
     * matched by language. This function will not return internal tracks that match
     * a language key, for example. This limitation is imposed by the fact that the
     * core uses language as key for closed captions. Ideally all tracks should be
     * matched by id.
     * @public
     * @param {String} languageOrId The language or track id of the track we want to find. Note that
     * language matches only internal tracks and track id only external tracks.
     * @param {TextTrackMap} textTrackMap A TextTrackMap that contains metadata for all of the video's TextTrack objects.
     * @return {TextTrack} The first TextTrack object that matches the given key or undefined if there are no matches.
     */

  }, {
    key: "findTrackByKey",
    value: function findTrackByKey(languageOrId) {
      var textTrackMap = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : new _text_track_map.default();
      var track = this.find(function (currentTrack) {
        var trackMetadata = textTrackMap.findEntry({
          textTrack: currentTrack
        }); // Note: We don't match tracks that are unknown to us

        var matchesTrackId = !!trackMetadata && !trackMetadata.isExternal && // We use track id as key for internal tracks
        trackMetadata.id === languageOrId;
        var matchesLanguage = !!trackMetadata && trackMetadata.isExternal && // We use language as key for external tracks
        currentTrack.language === languageOrId;
        var keyMatchesTrack = matchesTrackId || matchesLanguage;
        return keyMatchesTrack;
      });
      return track;
    }
    /**
     * Returns a list with all of the TextTrack objects whose track mode is different
     * from the value stored in the given TextTrackMap.
     * @public
     * @param {TextTrackMap} textTrackMap A TextTrackMap that contains metadata for all of the video's TextTrack objects.
     * @return {Array} An array with all of the TextTrack objects that match the search
     * criteria or an empty array if there are no matches.
     */

  }, {
    key: "filterChangedTracks",
    value: function filterChangedTracks() {
      var textTrackMap = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : new _text_track_map.default();
      var changedTracks = this.filter(function (currentTrack) {
        var trackMetadata = textTrackMap.findEntry({
          textTrack: currentTrack
        });
        var hasTrackChanged = trackMetadata && currentTrack.mode !== trackMetadata.mode;
        return hasTrackChanged;
      });
      return changedTracks;
    }
    /**
     * Finds and removes any TextTracks that marked as external on the given
     * TextTrackMap.
     * @public
     * @param {TextTrackMap} textTrackMap A TextTrackMap that contains metadata for all of the video's TextTrack objects.
     */

  }, {
    key: "removeExternalTracks",
    value: function removeExternalTracks() {
      var textTrackMap = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : (0, _text_track_map.default)();

      if (!this.video) {
        return;
      }

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = textTrackMap.getExternalEntries()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var trackMetadata = _step.value;
          var trackElement = this.video.querySelector("#".concat(trackMetadata.id));

          if (trackElement) {
            trackElement.remove();
          }
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return != null) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
    }
  }]);

  return TextTrackHelper;
}();

exports.default = TextTrackHelper;

},{"./text_track_map":90,"core-js/modules/es6.array.find":74,"core-js/modules/es6.symbol":84,"core-js/modules/es7.symbol.async-iterator":85,"core-js/modules/web.dom.iterable":86}],90:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/es6.array.find");

require("core-js/modules/es6.object.assign");

var _constants = _interopRequireDefault(require("../constants/constants"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/**
 * Allows us to store and associate metadata with a TextTrack object since we
 * can't store any data on the object itself. Automatically generates an id for
 * registered tracks which can be used identify the object later.
 */
var TextTrackMap =
/*#__PURE__*/
function () {
  function TextTrackMap() {
    _classCallCheck(this, TextTrackMap);

    this.textTracks = [];
  }
  /**
   * Creates an entry in the TextTrackMap which represents a TextTrack object that
   * has been added to or found in the video element. Automatically generates an id
   * that can be used to identify the TextTrack later on.
   * @public
   * @param {Object} metadata An object with metadata related to a TextTrack
   * @param {Boolean} isExternal Determines whether or not the TextTrack was added by the plugin (i.e. is external)
   * @return {String} The auto-generated id assigned to the newly registered track
   */


  _createClass(TextTrackMap, [{
    key: "addEntry",
    value: function addEntry() {
      var metadata = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var isExternal = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      var idPrefix, trackCount;

      if (isExternal) {
        idPrefix = _constants.default.ID_PREFIX.EXTERNAL;
        trackCount = this.getExternalEntries().length;
      } else {
        idPrefix = _constants.default.ID_PREFIX.INTERNAL;
        trackCount = this.getInternalEntries().length;
      } // Generate new id based on the track count for the given track type
      // (i.e. internal vs external)


      var newTextTrack = Object.assign({}, metadata, {
        id: "".concat(idPrefix).concat(trackCount + 1),
        isExternal: !!isExternal
      });
      this.textTracks.push(newTextTrack);
      return newTextTrack.id;
    }
    /**
     * Finds the metadata that matches the given search options.
     * @public
     * @param {Object} searchOptions An object whose key value pairs will be matched against
     * the existing entries. All existing properties in searchOptions need to match in order
     * for a given entry to be matched.
     * @return {Object} The metadata object that matches the given search options or undefined if there are no matches.
     */

  }, {
    key: "findEntry",
    value: function findEntry() {
      var searchOptions = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var textTrack = this.textTracks.find(function (currentTrack) {
        var isFound = true;

        for (var property in searchOptions) {
          if (searchOptions.hasOwnProperty(property) && searchOptions[property] !== currentTrack[property]) {
            isFound = false;
            break;
          }
        }

        return isFound;
      });
      return textTrack;
    }
  }, {
    key: "existsEntry",

    /**
     * Determines whether or not there exists an entry that matches the given search options.
     * @public
     * @param {Object} searchOptions An object whose key value pairs will be matched against
     * the existing entries. All existing properties in searchOptions need to match in order
     * for a given entry to be matched.
     * @return {Boolean} True if the entry exists, false otherwise
     */
    value: function existsEntry(searchOptions) {
      var exists = !!this.findEntry(searchOptions);
      return exists;
    }
    /**
     * Finds an entry with the given search options and merges the provided metadata
     * with the existing object/
     * @public
     * @param {Object} searchOptions An object whose key value pairs will be matched against
     * the existing entries. All existing properties in searchOptions need to match in order
     * for a given entry to be matched.
     * @param {Object} metadata An object containing the properties to be merged with the existing object
     * @return {Object} The updated metadata entry or undefined if there were no matches
     */

  }, {
    key: "tryUpdateEntry",
    value: function tryUpdateEntry(searchOptions) {
      var metadata = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var entry = this.findEntry(searchOptions);

      if (entry) {
        entry = Object.assign(entry, metadata);
      }

      return entry;
    }
    /**
     * Gets all of the entries associated with internal in-manifest/in-stream text tracks.
     * @public
     * @return {Array} An array with all the internal TextTrack objects.
     */

  }, {
    key: "getInternalEntries",
    value: function getInternalEntries() {
      var internalEntries = this.textTracks.filter(function (trackMetadata) {
        return !trackMetadata.isExternal;
      });
      return internalEntries;
    }
    /**
     * Gets all of the entries associated with external, manually added text tracks.
     * @public
     * @return {Array} An array with all the external TextTrack objects.
     */

  }, {
    key: "getExternalEntries",
    value: function getExternalEntries() {
      var externalEntries = this.textTracks.filter(function (trackMetadata) {
        return trackMetadata.isExternal;
      });
      return externalEntries;
    }
    /**
     * Determines whether or not all of the track entries are currently in 'disabled' mode.
     * @public
     * @return {Boolean} True if all tracks have 'disabled' mode, false otherwise
     */

  }, {
    key: "areAllDisabled",
    value: function areAllDisabled() {
      var allDisabled = this.textTracks.reduce(function (result, trackMetadata) {
        return result && trackMetadata.mode === OOV4.CONSTANTS.CLOSED_CAPTIONS.DISABLED;
      }, true);
      return allDisabled;
    }
    /**
     * Clears all the text track metadata and resets id generation.
     * @public
     */

  }, {
    key: "clear",
    value: function clear() {
      this.textTracks = [];
    }
  }]);

  return TextTrackMap;
}();

exports.default = TextTrackMap;

},{"../constants/constants":87,"core-js/modules/es6.array.find":74,"core-js/modules/es6.object.assign":78}]},{},[88]);
