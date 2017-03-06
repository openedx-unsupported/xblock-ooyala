# -*- coding: utf-8 -*-
#

# Imports ###########################################################

import logging
import json
from urllib2 import urlopen, URLError

from uuid import uuid4

from lxml import etree
from StringIO import StringIO

from django.conf import settings
from django.core.urlresolvers import reverse

from xblock.core import XBlock
from xblock.fields import Scope, String, Integer, Boolean
from xblock.fragment import Fragment

from mentoring.light_children import (
    LightChild,
    Scope as LCScope,
    String as LCString,
    Integer as LCInteger,
    Boolean as LCBoolean
)

from .utils import render_template
from .tokens import generate_player_token
from .overlay import OoyalaOverlay
from .transcript import Transcript

# Globals ###########################################################

log = logging.getLogger(__name__)

# Classes ###########################################################


class OoyalaPlayerMixin(object):
    """
    Base functionality for the ooyala player.
    """

    player_id = '8582dca2417b4e13bed27a4f0647c139'
    pcode = '5zdHcxOlM7fQJOMrCdwnnu16WP-d'

    @property
    def course_id(self):
        """Move to xblock-utils"""
        return self.runtime.course_id

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

    @property
    def transcript(self):
        return Transcript(
            threeplay_api_key=self.api_key_3play_with_default_setting,
            content_id=self.content_id,
            user_lang=self.cc_language_preference,
            cc_disabled=self.disable_cc_and_translations
        )

    def student_view(self, context):
        """
        Player view, displayed to the student
        """

        dom_id = 'ooyala-' + self._get_unique_id()

        overlay_fragments = ""
        for overlay in self.overlays:
            overlay_fragments += overlay.render()

        transcript = self.transcript.render()

        context = {
            'title': self.display_name,
            'cc_lang': self.cc_language_preference,
            'cc_disabled': self.disable_cc_and_translations,
            'pcode': self.pcode,
            'content_id': self.content_id,
            'player_id': self.player_id,
            'player_token': self.player_token,
            'dom_id': dom_id,
            'overlay_fragments': overlay_fragments,
            'transcript': transcript,
            'width': self.width,
            'height': self.height,
            'autoplay': self.autoplay,
            'config_url': self.local_resource_url(self, 'public/skin/ooyala-skin.js')
        }

        JS_URLS = [
            self.local_resource_url(self, 'public/build/player_all.min.js'),
            '//p3.3playmedia.com/p3sdk.current.js',
            self.local_resource_url(self, 'public/js/ooyala_player.js'),
            self.local_resource_url(self, 'public/skin/ooyala-skin.js'),
        ]
        CSS_URLS = [
            self.local_resource_url(self, 'public/build/player_all.min.css'),
            self.local_resource_url(self, 'public/css/ooyala_player.css'),
        ]

        fragment = Fragment()
        fragment.add_content(render_template('/templates/html/ooyala_player.html', context))

        for url in JS_URLS:
            fragment.add_javascript_url(url)

        for url in CSS_URLS:
            fragment.add_css_url(url)

        fragment.initialize_js('OoyalaPlayerBlock')

        if self.fire_progress_event_on_student_view:
            # In certain cases we want to know when a student has visited a video player
            # as an indication that they are progressing through a course
            # Progress *does not* mean progress over viewing a video (i.e. elapsed time)
            self.runtime.publish(self, 'progress', {})

        return fragment

    def xblock_view(self):
        """
        Returns the JSON that represents the xblock for jquery.xblock.
        """

        try:
            course_id = self.course_id.to_deprecated_string()
            usage_id = self.course_id.make_usage_key(self.scope_ids.block_type, self.location.name)
            usage_id = usage_id.to_deprecated_string().replace('/', ';_')
        except AttributeError:
            # workaround for workbench
            course_id = None
            usage_id = None
        return {
            'courseId': course_id,
            'usageId': usage_id,
        }


@XBlock.wants("settings")
class OoyalaPlayerBlock(OoyalaPlayerMixin, XBlock):
    """
    XBlock providing a video player for videos hosted on Ooyala
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
        default='RpOGxhMTE6p6DkTB8MBGtKN6v0_A_BdQ'
    )

    transcript_file_id = String(
        display_name="3Play Transcript Id",
        help="Identifier for the 3Play Transcript File",
        scope=Scope.content,
        default=''
    )

    cc_language_preference = String(
        display_name="Closed Captions Language",
        help="User's preference for closed captions language",
        scope=Scope.user_info,
        default='en'
    )

    disable_cc_and_translations = Boolean(
        display_name="Turn Off Closed Captions and Translated transcripts",
        help="Hides the CC button and transcript languages selection for this video",
        scope=Scope.settings,
        default=False
    )

    autoplay = Boolean(
        display_name="Enable Player Autoplay",
        help='Set to True if you the player to automatically play.',
        scope=Scope.content,
        default=True
    )

    enable_player_token = Boolean(
        display_name="Enable Player Token",
        help='Set to True if a player token is required.',
        scope=Scope.content,
        default=False
    )

    partner_code = String(
        display_name="Partner Code",
        help='Required for V4 Player. Also needed to generate a player token.',
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

    api_key_3play = String(
        display_name="3play Api Key",
        help='3play Api Key for transcript.',
        scope=Scope.content,
        default=''
    )

    width = String(
        display_name="Player Width",
        help='The width of the player in pixels.',
        scope=Scope.content,
        default="100%"
    )

    height = String(
        display_name="Player Height",
        help='The height of the player in pixels.',
        scope=Scope.content,
        default="100%"
    )

    expiration_time = Integer(
        display_name="Expiration Time",
        help='Expiration time in seconds. Needed to generate a player token.',
        scope=Scope.content,
        default=600
    )

    fire_progress_event_on_student_view = Boolean(
        display_name="Fire Progress Event on Student View",
        help='Set to True if you would like to get a progress event in the event stream when the user views this xBlock.',
        scope=Scope.content,
        default=True
    )

    xml_config = String(help="XML Configuration", default='<ooyala>\n</ooyala>',
                        scope=Scope.content)

    @property
    def api_key_3play_with_default_setting(self):
        if self.api_key_3play:
            return self.api_key_3play

        settings_service = self.runtime.service(self, 'settings')
        if settings_service:
            return settings_service.get_settings_bucket(self).get('3PLAY_API_KEY')
        return None

    def local_resource_url(self, block, uri):
        # TODO move to xblock-utils
        return self.runtime.local_resource_url(block, uri)

    def _get_unique_id(self):
        try:
            unique_id = self.location.name
        except AttributeError:
            # workaround for xblock workbench
            unique_id = self.parent.replace('.',  '-') + '-' + self.content_id
        return unique_id

    @XBlock.json_handler
    def publish_event(self, data, suffix=''):
        try:
            event_type = data.pop('event_type')
        except KeyError as e:
            return {'result': 'error', 'message': 'Missing event_type in JSON data'}

        data['content_id'] = self.content_id
        data['user_id'] = self.scope_ids.user_id

        self.runtime.publish(self, event_type, data)
        return {'result':'success'}

    def studio_view(self, context):
        """
        Editing view in Studio
        """
        fragment = Fragment()
        fragment.add_content(render_template('/templates/html/ooyala_player_edit.html', {
            'self': self,
        }))
        fragment.add_javascript_url(self.local_resource_url(self, 'public/js/ooyala_player_edit.js'))

        fragment.initialize_js('OoyalaPlayerEditBlock')

        return fragment

    @XBlock.json_handler
    def store_language_preference(self, data, suffix=''):
        """
        Store user's cc language selection
        """
        lang = data.get('lang')
        if lang:
            self.cc_language_preference = lang

        return {'result': 'success'}

    @XBlock.json_handler
    def load_transcript(self, data, suffix=''):
        """
        Store user's cc language selection
        """
        threeplay_id = data.get('threeplay_id')
        content = ''

        if threeplay_id:
            content = Transcript.get_transcript_by_threeplay_id(
                api_key=self.api_key_3play_with_default_setting,
                threeplay_id=threeplay_id
            )

        return {'content': content}

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
            self.api_key_3play = submissions['api_key_3play']
            self.expiration_time = submissions['expiration_time']
            self.width = submissions['width']
            self.height = submissions['height']
            self.disable_cc_and_translations = submissions['cc_disable']

        return response

    @staticmethod
    def workbench_scenarios():
        """A canned scenario for display in the workbench."""
        return [("Ooyala scenario", "<vertical_demo><ooyala-player/></vertical_demo>")]


class OoyalaPlayerLightChildBlock(OoyalaPlayerMixin, LightChild):
    """
    LightChild XBlock providing a video player for videos hosted on Brightcove.

    TODO: refactor to not duplicated all field definitions.
    """

    lightchild_block_type = 'ooyala-player' # used by LightChild.local_resource_url

    display_name = LCString(
        display_name="Display Name",
        help="This name appears in the horizontal navigation at the top of the page.",
        scope=LCScope.content,
        default="Ooyala Player"
    )

    content_id = LCString(
        display_name="Content Id",
        help="Identifier for the Content Id.",
        scope=LCScope.content,
        default='RpOGxhMTE6p6DkTB8MBGtKN6v0_A_BdQ'
    )

    transcript_file_id = LCString(
        display_name="3Play Transcript Id",
        help="Identifier for the 3Play Transcript File",
        scope=LCScope.content,
        default=''
    )

    cc_language_preference = LCString(
        display_name="Closed Captions Language",
        help="User's preference for closed captions language",
        scope=LCScope.user_state,
        default='en'
    )

    disable_cc_and_translations = LCBoolean(
        display_name="Turn Off Closed Captions and Translated transcripts",
        help="Hides the CC button and transcript languages selection for this video",
        scope=LCScope.content,
        default=False
    )

    autoplay = LCBoolean(
        display_name="Enable Player Autoplay",
        help='Set to True if you the player to automatically play.',
        scope=LCScope.content,
        default=False
    )

    enable_player_token = LCBoolean(
        display_name="Enable Player Token",
        help='Set to True if a player token is required.',
        scope=LCScope.content,
        default=False
    )

    partner_code = LCString(
        display_name="Partner Code",
        help='Needed to generate a player token.',
        scope=LCScope.content,
        default=''
    )

    api_key = LCString(
        display_name="Api Key",
        help='Needed to generate a player token.',
        scope=LCScope.content,
        default=''
    )

    api_secret_key = LCString(
        display_name="Api SecRet Key",
        help='Needed to generate a player token.',
        scope=LCScope.content,
        default=''
    )

    api_key_3play = LCString(
        display_name="3play Api Key",
        help='3play Api Key for transcript.',
        scope=LCScope.content,
        default=''
    )

    width = LCString(
        display_name="Player Width",
        help='The width of the player in pixels.',
        scope=LCScope.content,
        default="100%"
    )

    height = LCString(
        display_name="Player Height",
        help='The height of the player in pixels.',
        scope=LCScope.content,
        default="428px"
    )

    expiration_time = Integer(
        display_name="Expiration Time",
        help='Expiration time in seconds. Needed to generate a player token.',
        scope=LCScope.content,
        default=600
    )

    fire_progress_event_on_student_view = LCBoolean(
        display_name="Fire Progress Event on Student View",
        help='Set to True if you would like to get a progress event in the event stream when the user views this xBlock.',
        scope=LCScope.content,
        default=True
    )

    xml_config = LCString(help="XML Configuration", default='<ooyala>\n</ooyala>',
                        scope=LCScope.content)

    @classmethod
    def init_block_from_node(cls, block, node, attr):
        # hack, we remove all children from node. This is ooyala specific xml config
        xml_config = u"<ooyala>\n"
        for child in node:
            xml_config += unicode(etree.tostring(child))
            node.remove(child)
        xml_config += u"</ooyala>"

        block = super(OoyalaPlayerLightChildBlock, cls).init_block_from_node(block, node, attr)

        block.xml_config = xml_config

        return block

    # TODO move to xblock-utils
    def local_resource_url(self, block, uri):
        """
        local_resource_url for xblocks, with lightchild support.
        """
        path = reverse('xblock_resource_url', kwargs={
            'block_type': block.lightchild_block_type or block.scope_ids.block_type,
            'uri': uri,
        })
        return '//{}{}'.format(settings.SITE_NAME, path)

    @property
    def api_key_3play_with_default_setting(self):
        """LightChild cannot use service"""
        return self.api_key_3play

    def _get_unique_id(self):
        # We can have mulitple lightchild in the same block
        unique_id = self.location.name
        unique_id += "-{0}".format(uuid4().hex)
        return unique_id
