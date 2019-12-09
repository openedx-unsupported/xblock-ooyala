""" Xblock Mixin to play Brightcove videos """

import urllib2
import json
import logging

import pkg_resources

from xblock.fragment import Fragment

from .utils import render_template


PLAYBACK_API_ENDPOINT = 'https://edge.api.brightcove.com/playback/v1/accounts/{account_id}/videos/{video_id}'
BRIGHTCOVE_ACCOUNT_ID = '6057949416001'

logger = logging.getLogger(__name__)


class BrightcovePlayerMixin(object):
    bc_account_id = BRIGHTCOVE_ACCOUNT_ID

    def resource_string(self, path):
        """Handy helper for getting resources from our kit."""
        data = pkg_resources.resource_string(__name__, path)
        return data.decode("utf8")

    def bcov_student_view(self, context=None):
        """
        The primary view of the BrightcovePlayerXblock, shown to students
        when viewing courses.
        """
        html = render_template("templates/html/brightcove_player.html", context=context)
        frag = Fragment(html)
        frag.add_css(self.resource_string("public/css/brightcove_player.css"))
        frag.add_javascript(self.resource_string("public/js/brightcove_player.js"))
        frag.add_javascript_url(url="//p3.3playmedia.com/p3sdk.current.js")

        frag.add_javascript_url(url='//players.brightcove.net/{}/default_default/index.min.js'
                                .format(BRIGHTCOVE_ACCOUNT_ID))
        frag.initialize_js('BrightcovePlayerXblock')
        return frag

    @property
    def is_brightcove_video(self):
        """
        Checks if video_id belongs to Brightcove
        Brightcove IDs are all numeric
        """
        try:
            int(self.content_id)
        except (ValueError, TypeError):
            return False
        else:
            return True

    @property
    def brightcove_playback_enabled(self):
        try:
            import waffle
        except ImportError:
            return False
        else:
            return waffle.switch_is_active("bcove-playback")

    def get_brightcove_video_id(self, bcove_policy):
        """
        Get a Brightcove video id against reference id
        using Brightcove Playback API
        """
        bc_video_id = None
        api_endpoint = PLAYBACK_API_ENDPOINT.format(
            account_id=self.bc_account_id,
            video_id='ref:{reference_id}'.format(reference_id=self.content_id)
        )

        request = urllib2.Request(api_endpoint, headers={"BCOV-Policy": bcove_policy})

        try:
            response = urllib2.urlopen(request).read()
            video_data = json.loads(response)
        except Exception as e:
            logger.warning('Brightcove ID retrieval failed against reference ID: `{}`.'
                           'Falling back to Ooyala Player'.format(self.content_id))
        else:
            logger.info('Successfully retrieval of Brightcove ID against reference ID: `{}`'
                           .format(self.content_id))
            bc_video_id = video_data.get('id')

        return bc_video_id


def get_brightcove_video_detail(bcove_id, bcove_policy):
    """
    Fetches details of a Brightcove video
    """
    api_endpoint = PLAYBACK_API_ENDPOINT.format(
        account_id=BRIGHTCOVE_ACCOUNT_ID,
        video_id=bcove_id
    )
    video_data = {}

    request = urllib2.Request(api_endpoint, headers={"BCOV-Policy": bcove_policy})

    try:
        response = urllib2.urlopen(request).read()
        video_data = json.loads(response)
    except Exception as e:
        logger.warning('Brightcove video details retrieval failed for video ID: `{}` with exception {}'
                       .format(bcove_id, e))
    else:
        logger.info('Successfully retrieval of Brightcove video details for video ID: `{}`'.format(bcove_id))

    return video_data
