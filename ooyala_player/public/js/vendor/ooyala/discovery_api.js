(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

OOV4.plugin("DiscoveryApi", function (OOV4, _, $, W) {
  var MAX_VIDEOS = 20;
  OOV4.EVENTS.DISCOVERY_API = {
    RELATED_VIDEOS_FETCHED: "relatedVideosFetched",
    SEND_DISPLAY_EVENT: "sendDisplayEvent",
    DISPLAY_EVENT_SUCCESS: "displayEventSuccess",
    SEND_CLICK_EVENT: "sendClickEvent",
    CLICK_EVENT_SUCCESS: "clickEventSuccess",
    // If sending a display or click event results in an error, an error event will be published to the
    // message bus. The event will have a DISPLAY_EVENT_ERROR or CLICK_EVENT_ERROR type and a data object
    // with 3 keys: xhr, status, error.
    // The values for these keys are the 3 parameters that are given to the error callback by
    // $.ajax(...) in case of a failure.
    DISPLAY_EVENT_ERROR: "displayEventError",
    CLICK_EVENT_ERROR: "clickEventError"
  };
  var recentEmbedCodes = [];
  OOV4.exposeStaticApi('EVENTS', OOV4.EVENTS);

  var DiscoveryApi = function DiscoveryApi(mb, id) {
    if (!OOV4.requiredInEnvironment('html5-playback')) {
      return;
    }

    this.id = id;
    this.mb = mb;
    this.error = false;
    this.wasContentChangedByApi = false;
    this.currentContentId = null;
    this.playerParams = {};
    this.relatedVideos = [];
    this.relatedVideosCache = [];
    this.backHistory = [];
    this.forwardHistory = [];
    this.guid = "";
    this.apiHost = OOV4.playerParams.backlot_api_write_server || 'api.ooyala.com';
    OOV4.StateMachine.create({
      initial: 'Init',
      messageBus: this.mb,
      moduleName: 'DiscoveryApi',
      target: this,
      events: [{
        name: OOV4.EVENTS.SET_EMBED_CODE,
        from: '*'
      }, {
        name: OOV4.EVENTS.SET_ASSET,
        from: '*'
      }, {
        name: OOV4.EVENTS.EMBED_CODE_CHANGED,
        from: '*'
      }, {
        name: OOV4.EVENTS.EMBED_CODE_CHANGED_AFTER_OOYALA_AD,
        from: '*'
      }, {
        name: OOV4.EVENTS.ASSET_CHANGED,
        from: '*'
      }, {
        name: OOV4.EVENTS.ASSET_UPDATED,
        from: '*'
      }, {
        name: OOV4.EVENTS.DISCOVERY_API.SEND_DISPLAY_EVENT,
        from: '*'
      }, {
        name: OOV4.EVENTS.DISCOVERY_API.SEND_CLICK_EVENT,
        from: '*'
      }, {
        name: OOV4.EVENTS.REQUEST_PREVIOUS_VIDEO,
        from: '*'
      }, {
        name: OOV4.EVENTS.REQUEST_NEXT_VIDEO,
        from: '*'
      }, {
        name: OOV4.EVENTS.GUID_SET,
        from: '*'
      }]
    });
  };

  _.extend(DiscoveryApi.prototype, {
    /**
     * Pushes content to the "back" history whenever a new Discovery video is
     * set externally, either by a manual click or as a result of the "Up Next"
     * video being shown. This allows us to go back to these videos using the
     * "Previos Video" button.
     * @private
     */
    _tryUpdateHistoryOnContentChange: function _tryUpdateHistoryOnContentChange() {
      if (this.currentContentId && !this.wasContentChangedByApi) {
        this.backHistory.push(this.currentContentId);
      }

      this.wasContentChangedByApi = false;
    },

    /**
     * SET_EMBED_CODE event handler.
     * @param eventName The name of the message bus event that triggered this handler
     * @param embedCode The id of the content to be set
     * @param playerParams The player parameters of the content to be set
     * @private
     */
    onSetEmbedCode: function onSetEmbedCode(eventName, embedCode, playerParams) {
      if (playerParams && playerParams.ooyalaAds) {
        return;
      }

      this._tryUpdateHistoryOnContentChange();
    },

    /**
     * SET_ASSET event handler.
     * @private
     */
    onSetAsset: function onSetAsset() {
      this._tryUpdateHistoryOnContentChange();
    },
    onEmbedCodeChanged: function onEmbedCodeChanged(event, embedCode, playerParams) {
      this._handleEmbedCodeChanged(embedCode, playerParams);
    },
    onEmbedCodeChangedAfterOoyalaAd: function onEmbedCodeChangedAfterOoyalaAd(eventName, embedCode, playerParams) {
      this._handleEmbedCodeChanged(embedCode, playerParams);
    },

    /**
     * Handles both the EMBED_CODE_CHANGED and EMBED_CODE_CHANGED_AFTER_OOYALA_AD events.
     * @param embedCode The id of the content that was set
     * @param playerParams The player parameters of the content that was set
     * @private
     */
    _handleEmbedCodeChanged: function _handleEmbedCodeChanged(embedCode, playerParams) {
      if (playerParams && playerParams.ooyalaAds) {
        return;
      } // The first video isn't always returned by the related videos request,
      // so we need to make sure to add this embed code to the cache


      if (!this.currentContentId) {
        this.relatedVideosCache.push({
          embed_code: embedCode
        });
      }

      this.currentContentId = embedCode;
      this.playerParams = playerParams; //Keep the order of the most recently viewed embed codes so we can reorder the related videos

      recentEmbedCodes = _.filter(recentEmbedCodes, function (recentEmbedCode) {
        return recentEmbedCode != embedCode;
      });
      recentEmbedCodes.push(embedCode); //No need to keep a list of recent embeds greater than the list of possible related videos

      if (recentEmbedCodes.length >= MAX_VIDEOS) {
        recentEmbedCodes.shift();
      }

      if (this.guid === "") {
        // wait a little bit before calling fetch related videos to give a little bit of time for the guid
        // to be set. Its possible that even after 500 milliseconds, it won't be set but such is life.
        var fetchRelatedDelayed = _.bind(function () {
          this._fetchRelatedVideos(embedCode);
        }, this);

        setTimeout(fetchRelatedDelayed, 500);
      } else {
        this._fetchRelatedVideos(embedCode);
      }
    },
    onAssetUpdated: function onAssetUpdated(event, asset) {
      this._setRelatedMedia(asset);
    },
    onAssetChanged: function onAssetChanged(event, asset) {
      // The first video isn't always returned by the related videos request,
      // so we need to make sure to add this asset to the cache
      if (!this.currentContentId) {
        this.relatedVideosCache.push({
          asset: asset
        });
      }

      this.currentContentId = asset.id;

      this._setRelatedMedia(asset);
    },

    /**
     * REQUEST_PREVIOUS_VIDEO event handler. Attempts to switch to the previous video.
     * @private
     */
    onRequestPreviousVideo: function onRequestPreviousVideo() {
      this._switchVideo(true);
    },

    /**
     * REQUEST_NEXT_VIDEO event handler. Attempts to switch to the next video.
     * @private
     */
    onRequestNextVideo: function onRequestNextVideo() {
      this._switchVideo(false);
    },

    /**
     * Move to either the previous or next Discovery video, depending on the direction
     * that was specified. The logic for this switch is as follows:
     * - If there is history in the direction that we're moving, use video from history.
     * - If there is no history in the direction that we're moving, we choose the next video in
     * the same manner that we choose the "Up Next" video (first video in relate videos queue)
     * when moving forward, or we block movement if moving backward
     * - Any movement in one direction generates history in the opposite direction.
     * - Videos chosen manually by the user or shown as "Up Next" videos by the skin are added
     * to the "forward" history.
     * @private
     * @param {boolean} backward If true, switches to the previous video. If false, switches to the next video.
     */
    _switchVideo: function _switchVideo(backward) {
      var videoToSwitchTo;
      var isNewVideo = false;
      var currentDirectionHistory = backward ? this.backHistory : this.forwardHistory;
      var oppositeDirectionHistory = backward ? this.forwardHistory : this.backHistory;
      var previousContentId = currentDirectionHistory.pop();

      if (previousContentId) {
        // Video has been set previously, find it in cache
        videoToSwitchTo = this._findVideoInCache(previousContentId);
      } else if (!backward) {
        // If there's no history then the next video is always the next related
        // video in queue, but only when moving forward
        videoToSwitchTo = this.relatedVideos[0];
        isNewVideo = true;
      }

      if (videoToSwitchTo && (videoToSwitchTo.embed_code || videoToSwitchTo.asset)) {
        // Movement in one direction will generate history in the opposite direction
        oppositeDirectionHistory.push(this.currentContentId);
        this.wasContentChangedByApi = true; // Choose right event to publish depending on the type of asset

        if (videoToSwitchTo.embed_code) {
          this.mb.publish(OOV4.EVENTS.SET_EMBED_CODE, videoToSwitchTo.embed_code, this.playerParams);
        } else if (videoToSwitchTo.asset) {
          this.mb.publish(OOV4.EVENTS.SET_ASSET, videoToSwitchTo.asset);
        } // Report video change to analytics if we switched to a new video (i.e.
        // a video that was not retrieved from history)


        if (isNewVideo) {
          this.mb.publish(OOV4.EVENTS.DISCOVERY_API.SEND_CLICK_EVENT, {
            clickedVideo: videoToSwitchTo,
            custom: {
              source: 'endScreen',
              autoplay: false,
              countdown: 0
            }
          });
        }
      } else {
        OOV4.log('Discovery: Video switch failed for content id:', previousContentId);
      }
    },
    _setRelatedMedia: function _setRelatedMedia(asset) {
      if (asset.relatedVideos) {
        this.relatedVideos = asset.relatedVideos;
        this.mb.publish(OOV4.EVENTS.DISCOVERY_API.RELATED_VIDEOS_FETCHED, {
          videos: this.relatedVideos
        });
      }
    },
    onGuidSet: function onGuidSet(event, guid) {
      this.guid = guid;
    },

    /**
      * Sends an impression feedback event to the backend discovery APIs. An impression is when
      * recommendations are shown to the user.
      *
      * Params:
      * event - is always OOV4.EVENTS.DISCOVERY_API.SEND_DISPLAY_EVENT.
      * eventData - should have the fields "bucket_info" and "custom".
      * eventData.bucket_info - should be the discovery bucket info object that was returned as part of
      *    the response to fetch recommendations.
      * eventData.custom.source - should be one of "endScreen" or "pauseScreen".
      */
    onSendDisplayEvent: function onSendDisplayEvent(event, eventData) {
      if (!eventData) {
        return;
      }

      var relatedVideos = eventData.relatedVideos;

      if (!relatedVideos || !_.isArray(relatedVideos) || _.size(relatedVideos) < 1) {
        return;
      }

      var bucketInfo = relatedVideos[0].bucket_info;

      if (!bucketInfo) {
        return;
      }

      if (bucketInfo.charAt(0) == "2") {
        // Version 2 bucket info can be handled by reporter.js
        this.mb.publish(OOV4.EVENTS.REPORT_DISCOVERY_IMPRESSION, eventData);
        return;
      } // Version 1 bucket info can't be handled by reporter.js (no zlib to decompress the encoded string)
      // and must go through the discovery feedback APIs.


      eventData = {
        "bucket_info": bucketInfo,
        "custom": eventData.custom
      };
      var url = "http://" + this.apiHost + "/v2/discover/feedback/impression";
      eventData["device_id"] = this.guid;
      eventData["discovery_profile_id"] = OOV4.playerParams.playerBrandingId; // Note: "system" must be set to "OOYALA" for all feedback originating from Ooyala players.

      eventData["system"] = "OOYALA";
      $.ajax({
        url: url,
        data: JSON.stringify(eventData),
        type: 'POST',
        dataType: 'json',
        crossDomain: true,
        cache: true,
        success: _.bind(this._displayEventSuccess, this),
        error: _.bind(this._displayEventError, this)
      });
    },
    _displayEventSuccess: function _displayEventSuccess() {
      this.mb.publish(OOV4.EVENTS.DISCOVERY_API.DISPLAY_EVENT_SUCCESS);
    },
    _displayEventError: function _displayEventError(xhr, status, error) {
      this.mb.publish(OOV4.EVENTS.DISCOVERY_API.DISPLAY_EVENT_ERROR, {
        xhr: xhr,
        status: status,
        error: error
      });
    },

    /**
      * Sends an click feedback event to the backend discovery APIs. A click is when a displayed
      * recommendations is clicked by the user. If the countdown timer expires and the first recommendation
      * plays automatically, this event should still be sent, but the value of the countdown timer
      * should be set to 0.
      *
      * Params:
      * event - is always OOV4.EVENTS.DISCOVERY_API.SEND_CLICK_EVENT.
      * eventData - should have the fields "bucket_info" and "custom".
      * eventData.bucket_info - should be the discovery bucket info object that was returned as part of
      *     the response to fetch recommendations.
      * eventData.custom.source - should be one of "endScreen" or "pauseScreen".
      * eventData.custom.countdown - should have the remaining value of the countdown timer, in seconds
      *     ('endScreen' source only).
      * eventData.custom.autoplay - should be true if the video played automatically because the countdown
      *     timer expired ('endScreen' source only).
      */
    onSendClickEvent: function onSendClickEvent(event, eventData) {
      if (!eventData) {
        return;
      }

      var clickedVideo = eventData.clickedVideo;

      if (!clickedVideo) {
        return;
      }

      var bucketInfo = clickedVideo.bucket_info;

      if (!bucketInfo) {
        return;
      }

      if (bucketInfo.charAt(0) == "2") {
        // Version 2 bucket info can be handled by reporter.js
        this.mb.publish(OOV4.EVENTS.REPORT_DISCOVERY_CLICK, eventData);
        return;
      } // Version 1 bucket info can't be handled by reporter.js (no zlib to decompress the encoded string)
      // and must go through the discovery feedback APIs.


      eventData = {
        "bucket_info": bucketInfo,
        "custom": eventData.custom
      };
      var url = "http://" + this.apiHost + "/v2/discover/feedback/play";
      eventData["device_id"] = this.guid;
      eventData["discovery_profile_id"] = OOV4.playerParams.playerBrandingId; // Note: "system" must be set to "OOYALA" for all feedback originating from Ooyala players.

      eventData["system"] = "OOYALA";
      $.ajax({
        url: url,
        data: JSON.stringify(eventData),
        type: 'POST',
        dataType: 'json',
        crossDomain: true,
        cache: true,
        success: _.bind(this._clickEventSuccess, this),
        error: _.bind(this._clickEventError, this)
      });
    },
    _clickEventSuccess: function _clickEventSuccess() {
      this.mb.publish(OOV4.EVENTS.DISCOVERY_API.CLICK_EVENT_SUCCESS);
    },
    _clickEventError: function _clickEventError(xhr, status, error) {
      this.mb.publish(OOV4.EVENTS.DISCOVERY_API.CLICK_EVENT_ERROR, {
        xhr: xhr,
        status: status,
        error: error
      });
    },
    _fetchRelatedVideos: function _fetchRelatedVideos(embedCode) {
      this.error = false;
      this.relatedVideos = [];
      var params = {
        sign_version: 'player',
        pcode: OOV4.playerParams.pcode,
        discovery_profile_id: OOV4.playerParams.playerBrandingId,
        video_pcode: OOV4.playerParams.pcode,
        limit: MAX_VIDEOS,
        device_id: this.guid,
        expected_bucket_info_version: 2,
        expires: Math.floor(new Date().getTime() / 1000 + 3600)
      };
      var signature = encodeURIComponent(this._generateSignature(params)); // Note(manish) nov-14, 2012: encode the device_id which may have special characters (+,?) etc that
      // may need to be uri-encoded. its important that this is done *after* the signature is calculated.

      params.device_id = encodeURIComponent(params.device_id);

      var url = "//" + this.apiHost + "/v2/discover/similar/assets/" + embedCode + "?" + this._generateParamString(params, signature);

      $.ajax({
        url: url,
        type: 'GET',
        dataType: 'json',
        crossDomain: true,
        cache: true,
        success: _.bind(this._onRelatedVideosFetched, this),
        error: _.bind(this._onApiError, this)
      });
    },
    _onRelatedVideosFetched: function _onRelatedVideosFetched(response) {
      var safe_response = OOV4.HM.safeObject("discovery.relatedVideos", response, {});

      if (safe_response.errors === undefined || safe_response.errors && safe_response.errors.code === 0) {
        this.relatedVideos = safe_response.results || [];
        this.variationIds = safe_response.variation_ids;
      } else {
        this.relatedVideos = [];
        this.variationIds = [];
      } //Reorder the related videos so that the user gets recommended videos that haven't been recently played


      this._reorderRelatedVideos(); // Update or cache with the latest videos that were fetched


      this._updateRelatedVideosCache(); // If there's "forward" history then the next video should be the one from
      // that history. Passing this property to the event will prevent the skin
      // from choosing its own "Up Next" video.


      var upNextVideo = this._getUpNextVideoFromHistory();

      this.mb.publish(OOV4.EVENTS.REPORT_EXPERIMENT_VARIATIONS, {
        variationIds: this.variationIds
      });
      this.mb.publish(OOV4.EVENTS.DISCOVERY_API.RELATED_VIDEOS_FETCHED, {
        videos: this.relatedVideos,
        upNextVideo: upNextVideo
      }); // Controls whether Previous/Next video buttons are enabled depending on
      // the position of the current video within the Discovery "playlist"

      var positionInPlaylist = this._determinePositionInPlaylist();

      this.mb.publish(OOV4.EVENTS.POSITION_IN_PLAYLIST_DETERMINED, positionInPlaylist);
    },
    _onApiError: function _onApiError(xhr, status, error) {
      this.error = true;
      this.mb.publish(OOV4.EVENTS.DISCOVERY_API.RELATED_VIDEOS_FETCHED, {
        error: true
      });
    },

    /**
     * Determines whether or not it is possible to navigate to videos that are
     * before or after the current content.
     * @private
     * @return {Object} An object with the following properties:
     * - hasPreviousVideos: (Boolean) true if it's possible for the user to navigate to a previous video
     * - hasNextVideos: (Boolean) true if it's possible for the user to navigate to the next video
     */
    _determinePositionInPlaylist: function _determinePositionInPlaylist() {
      var positionInPlaylist = {
        hasPreviousVideos: !!this.backHistory.length,
        hasNextVideos: !!(this.forwardHistory.length || this.relatedVideos.length)
      };
      return positionInPlaylist;
    },

    /**
     * When there is "forward" history the next video to be shown is the
     * one on top of the history stack. This function returns the next video
     * from history.
     * @private
     * @return {object} The next video from history or null if there is no history.
     */
    _getUpNextVideoFromHistory: function _getUpNextVideoFromHistory() {
      var upNextVideo = null;
      var upNextContentId = null;

      if (this.forwardHistory.length) {
        upNextContentId = this.forwardHistory[this.forwardHistory.length - 1];
      }

      if (upNextContentId) {
        upNextVideo = this._findVideoInCache(upNextContentId);
      }

      return upNextVideo;
    },

    /**
     * Updates the related videos cache with newly fetched videos from the Discovery
     * endpoint. Pre-existing videos are replaced with most recent data from backend.
     * @private
     */
    _updateRelatedVideosCache: function _updateRelatedVideosCache() {
      this.relatedVideos.forEach(function (relatedVideo) {
        var contentId; // Determine content id depending on video type

        if (relatedVideo.embed_code) {
          contentId = relatedVideo.embed_code;
        } else if (relatedVideo.asset) {
          contentId = relatedVideo.asset.id;
        } // Search for index in cache


        var cachedVideoIndex = this._findVideoIndexInCache(contentId); // Push video to cache if not already there, otherwise replace the
        // cached video with the newly fetched version


        if (cachedVideoIndex < 0) {
          this.relatedVideosCache.push(relatedVideo);
        } else {
          this.relatedVideosCache[cachedVideoIndex] = relatedVideo;
        }
      }, this);
    },

    /**
     * Finds a video object from the related videos cache by content id. This
     * can match either regular videos (embed code) or standalone player videos (asset.id).
     * @private
     * @param {string} contentId Either the embed code or asset id of the content to find
     * @return {object} The video object that matches the content id, or undefined if no video is found
     */
    _findVideoInCache: function _findVideoInCache(contentId) {
      var cachedVideo = _.find(this.relatedVideosCache, function (relatedVideo) {
        if (relatedVideo.embed_code) {
          return relatedVideo.embed_code === contentId;
        }

        if (relatedVideo.asset) {
          return relatedVideo.asset.id === contentId;
        }

        return false;
      });

      return cachedVideo;
    },

    /**
     * Finds and returns the index of the video with the specified content id
     * within the related videos cache.
     * @private
     * @param {string} contentId Either the embed code or the asset id of the content to find
     * @return {number} The index of the content within the cache or -1 if it wasn't found
     */
    _findVideoIndexInCache: function _findVideoIndexInCache(contentId) {
      var relatedVideo;

      for (var index = 0; index < this.relatedVideosCache.length; index++) {
        relatedVideo = this.relatedVideosCache[index]; // Match content id depending on video type

        if (relatedVideo.embed_code === contentId || relatedVideo.asset && relatedVideo.asset.id === contentId) {
          return index;
        }
      }

      return -1;
    },
    _generateSignature: function _generateSignature(params) {
      // signature format:
      // pcodeparamName=paramValue...
      var pcode = params.pcode;

      var shaParams = _.reject(_.keys(params), function (key) {
        return key === 'pcode';
      });

      var sha = new jsSHA(pcode + this._hashToString(params, '', shaParams), 'ASCII');
      return sha.getHash('SHA-256', 'B64').substring(0, 43);
    },
    _hashToString: function _hashToString(hash, delimiter, keys) {
      var string = "";

      var myKeys = keys || _.keys(hash);

      _.each(_.sortBy(myKeys, function (val) {
        return val;
      }), function (key) {
        string += delimiter + key + "=" + hash[key];
      });

      return string;
    },
    _generateParamString: function _generateParamString(params, signature) {
      var string = "signature=" + signature + this._hashToString(params, '&');

      return string;
    },
    _reorderRelatedVideos: function _reorderRelatedVideos() {
      for (var i = 0; i < recentEmbedCodes.length; i++) {
        var asset = _.find(this.relatedVideos, function (relatedVideo) {
          return relatedVideo.embed_code == recentEmbedCodes[i];
        });

        if (asset) {
          this.relatedVideos = _.filter(this.relatedVideos, function (relatedVideo) {
            return relatedVideo.embed_code != recentEmbedCodes[i];
          });
          this.relatedVideos.push(asset);
        }
      }
    }
  }); // Return class definition


  return DiscoveryApi;
});

},{}]},{},[1]);
