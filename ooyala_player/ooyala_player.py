# -*- coding: utf-8 -*-
#

# Imports ###########################################################

import logging
import textwrap
from urllib2 import urlopen

from lxml import etree
from StringIO import StringIO

from xblock.core import XBlock
from xblock.fields import Scope, String, Integer, Boolean
from xblock.fragment import Fragment

from .utils import render_template
from .tokens import generate_player_token
from .overlay import OoyalaOverlay

# Globals ###########################################################

log = logging.getLogger(__name__)


# Classes ###########################################################

class OoyalaPlayerBlock(XBlock):
    """
    XBlock providing a video player for videos hosted on Brightcove
    """
    display_name = String(
        display_name="Display Name",
        help="This name appears in the horizontal navigation at the top of the page.",
        scope=Scope.settings,
        default="Ooyala Player"
    )

    content_id = String(
        display_name="Content Id",
        help="Identifier for the Content Id.",
        scope=Scope.content,
        default='Q1eXg5NzpKqUUzBm5WTIb6bXuiWHrRMi'
    )

    transcript_file_id = String(
        display_name="3Play Transcript Id",
        help="Identifier for the 3Play Transcript File",
        scope=Scope.content,
        default=''
    )

    enable_player_token = Boolean(
        display_name="Enable Player Token",
        help='Set to True if a player token is required.',
        scope=Scope.content,
        default=False
    )

    partner_code = String(
        display_name="Partner Code",
        help='Needed to generate a player token.',
        scope=Scope.content,
        default=''
    )

    api_key = String(
        display_name="Api Key",
        help='Needed to generate a player token.',
        scope=Scope.content,
        default=''
    )

    api_secret_key = String(
        display_name="Api SecRet Key",
        help='Needed to generate a player token.',
        scope=Scope.content,
        default=''
    )

    player_width = String(
        display_name="Player Width",
        help='The width of the player in pixels.',
        scope=Scope.content,
        default="740px"
    )

    player_height = String(
        display_name="Player Height",
        help='The height of the player in pixels.',
        scope=Scope.content,
        default="416px"
    )

    expiration_time = Integer(
        display_name="Expiration Time",
        help='Expiration time in seconds. Needed to generate a player token.',
        scope=Scope.content,
        default=600
    )

    xml_config = String(help="XML Configuration", default='<ooyala>\n</ooyala>',
                        scope=Scope.content)

    player_id = '8582dca2417b4e13bed27a4f0647c139'

    @property
    def player_token(self):
        if not self.enable_player_token:
            return ''

        return generate_player_token(self.partner_code, self.api_key, self.api_secret_key,
                                     self.content_id, self.expiration_time)

    @property
    def overlays(self):
        """
        Parse the xml config and return the overlays
        """

        overlays = []
        node = etree.parse(StringIO(self.xml_config)).getroot()
        overlays_node = node.find('overlays')
        video_id = 'ooyala-' + self._get_unique_id()
        if overlays_node is not None:
            for child_id, xml_child in enumerate(overlays_node.findall('overlay')):
                overlay = OoyalaOverlay.init_overlay_from_node(xml_child, video_id)
                overlays.append(overlay)

        return overlays

    def _retrieve_transcript(self):
        url = "http://static.3playmedia.com/files/{}/transcript.txt?apikey={}&pre=1".format(
                self.transcript_file_id,
                self.api_key
            )
        try:
            conn = urlopen(url)
            transcript = conn.read()
        except URLError as e:
            return e
        finally:
            conn.close()

        return transcript

    def student_view(self, context):
        """
        Player view, displayed to the student
        """

        dom_id = 'ooyala-' + self._get_unique_id()

        overlay_fragments = ""
        for overlay in self.overlays:
            overlay_fragments += overlay.render()

        context = {
            'title': self.display_name,
            'content_id': self.content_id,
            'transcript_file_id': self.transcript_file_id,
            'player_id': self.player_id,
            'player_token': self.player_token,
            'dom_id': dom_id,
            'overlay_fragments': overlay_fragments,
            'player_width': self.player_width,
            'player_height': self.player_height,
            'transcript_content': self._retrieve_transcript(),
        }

        fragment = Fragment()
        fragment.add_content(render_template('/templates/html/ooyala_player.html', context))
        fragment.add_css_url(self.runtime.local_resource_url(self, 'public/css/ooyala_player.css'))
        fragment.add_css_url(self.runtime.local_resource_url(self, 'public/css/vendor/jquery-ui.css'))

        # custom plugins styles
        fragment.add_css_url(self.runtime.local_resource_url(self, 'public/css/speedplugin.css'))

        fragment.add_javascript_url(self.runtime.local_resource_url(self, 'public/js/vendor/jquery-ui.js'))

        player_url = '//player.ooyala.com/v3/{0}?platform=html5-priority'.format(self.player_id)

        fragment.add_javascript_url(player_url)
        fragment.add_javascript_url(self.runtime.local_resource_url(self, 'public/js/vendor/speed_plugin.js'))
        fragment.add_javascript_url(self.runtime.local_resource_url(self, 'public/js/vendor/popcorn.js'))
        fragment.add_javascript_url(self.runtime.local_resource_url(self, 'public/js/vendor/underscore.js'))

        fragment.add_javascript(render_template('public/js/ooyala_player.js', {
            'self': self,
            'overlay_fragments': overlay_fragments,
            'dom_id': dom_id
        }))

        fragment.initialize_js('OoyalaPlayerBlock')

        return fragment

    def _get_unique_id(self):
        try:
            unique_id = self.location.name
        except AttributeError:
            # workaround for xblock workbench
            unique_id = self.parent.replace('.',  '-') + '-' + self.content_id
        return unique_id

    def studio_view(self, context):
        """
        Editing view in Studio
        """
        fragment = Fragment()
        fragment.add_content(render_template('/templates/html/ooyala_player_edit.html', {
            'self': self,
        }))
        fragment.add_javascript_url(self.runtime.local_resource_url(self, 'public/js/ooyala_player_edit.js'))

        fragment.initialize_js('OoyalaPlayerEditBlock')

        return fragment

    @XBlock.json_handler
    def studio_submit(self, submissions, suffix=''):

        xml_config = submissions['xml_config']
        try:
            etree.parse(StringIO(xml_config))
        except etree.XMLSyntaxError as e:
            response = {
                'result': 'error',
                'message': e.message
            }
        else:
            response = {
                'result': 'success',
            }

            self.xml_config = xml_config
            self.display_name = submissions['display_name']
            self.content_id = submissions['content_id'].strip()
            self.transcript_file_id = submissions['transcript_file_id'].strip()
            self.enable_player_token = submissions['enable_player_token']
            self.partner_code = submissions['partner_code']
            self.api_key = submissions['api_key']
            self.api_secret_key = submissions['api_secret_key']
            self.expiration_time = submissions['expiration_time']
            self.player_width = submissions['player_width']
            self.player_height = submissions['player_height']

        return response

    @staticmethod
    def workbench_scenarios():
        """A canned scenario for display in the workbench."""
        return [("Ooyala scenario", "<vertical_demo><ooyala-player/></vertical_demo>")]
