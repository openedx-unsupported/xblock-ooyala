""" Xblock Mixin to play Brightcove videos """

import json
import logging
import urllib.error
import urllib.parse
import urllib.request

import pkg_resources
from xblock.fragment import Fragment

from .utils import render_template

PLAYBACK_API_ENDPOINT = 'https://edge.api.brightcove.com/playback/v1/accounts/{account_id}/videos/{video_id}'

logger = logging.getLogger(__name__)


class BrightcovePlayerMixin:
    def resource_string(self, path):
        """Handy helper for getting resources from our kit."""
        data = pkg_resources.resource_string(__name__, path)
        return data.decode("utf-8")

    def bcov_student_view(self, context=None):
        """
        The primary view of the BrightcovePlayerXblock, shown to students
        when viewing courses.
        """
        html = render_template("templates/html/brightcove_player.html", context=context)
        frag = Fragment(html)
        frag.add_css(self.resource_string("public/css/brightcove_player.css"))
        frag.add_javascript(self.resource_string("public/js/brightcove_player.js"))
        frag.add_javascript_url(url='//players.brightcove.net/{}/default_default/index.min.js'
                                .format(self.get_attribute_or_default('brightcove_account')))
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


def get_brightcove_video_detail(bcove_id, bcove_policy, bcove_account):
    """
    Fetches details of a Brightcove video
    """
    api_endpoint = PLAYBACK_API_ENDPOINT.format(
        account_id=bcove_account,
        video_id=bcove_id
    )
    video_data = {}

    request = urllib.request.Request(api_endpoint, headers={"BCOV-Policy": bcove_policy})

    try:
        response = urllib.request.urlopen(request).read()
        video_data = json.loads(response.decode('utf-8'))
    except Exception as e:
        logger.warning('Brightcove video details retrieval failed for video ID: `{}` with exception {}'
                       .format(bcove_id, e))
    else:
        logger.info('Successfully retrieval of Brightcove video details for video ID: `{}`'.format(bcove_id))

    return video_data
