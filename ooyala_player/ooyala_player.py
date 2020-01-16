# -*- coding: utf-8 -*-
#

# Imports ###########################################################

import logging
from uuid import uuid4

from lxml import etree
from StringIO import StringIO

from django.conf import settings
from django.core.urlresolvers import reverse, NoReverseMatch

from xblock.core import XBlock
from xblock.fields import Scope, String, Integer, Boolean
from xblock.fragment import Fragment
from xblock.exceptions import JsonHandlerError

from mentoring.light_children import (
    LightChild,
    Scope as LCScope,
    String as LCString,
    Boolean as LCBoolean
)

from .overlay import OoyalaOverlay
from .tokens import generate_player_token
from .transcript import Transcript
from .brightcove_player import BrightcovePlayerMixin
from .utils import (
    render_template,
    _, I18NService
)

# Globals ###########################################################

log = logging.getLogger(__name__)
BIT_MOVIN_PLAYER_PATH = 'public/js/vendor/ooyala/bitmovinplayer.swf'
SKIN_FILE_PATH = 'public/skin/skin.js'
COMPLETION_VIDEO_COMPLETE_PERCENTAGE = getattr(settings, 'COMPLETION_VIDEO_COMPLETE_PERCENTAGE', 1.0)

# Classes ###########################################################


class VideoType:
    """
    Enum to hold video types
    """
    OOYALA = 'ooyala'
    BRIGHTCOVE = 'bcove'


class OoyalaPlayerMixin(I18NService, BrightcovePlayerMixin):
    """
    Base functionality for the ooyala player.
    """
    # TODO: Replace these with CompletableXBlockMixin once it's available in the solutions fork
    has_custom_completion = True
    completion_method = "completable"

    DEFAULT_ATTRIBUTE_SETTINGS = {
        'api_key_3play': '3PLAY_API_KEY',
        'enable_player_token': 'ENABLE_PLAYER_TOKEN',
        'partner_code': 'PARTNER_CODE',
        'api_key': 'API_KEY',
        'api_secret_key': 'API_SECRET_KEY',
        'brightcove_policy': 'BCOVE_POLICY',
        'brightcove_account': 'BCOVE_ACCOUNT_ID',
    }

    player_id = '8582dca2417b4e13bed27a4f0647c139'
    pcode = '5zdHcxOlM7fQJOMrCdwnnu16WP-d'

    @property
    def course_id(self):
        """Move to xblock-utils"""
        return self.runtime.course_id

    def get_attribute_or_default(self, attribute_name):
        """
        If the given attribute is set on the instance, return it immediately.
        Otherwise check if it has a default in the settings service.
        If neither are available, return None
        """
        try:
            available_attr = getattr(self, attribute_name)
        except AttributeError:
            available_attr = None

        if available_attr:
            return available_attr

        if getattr(self.runtime, 'service') and hasattr(self, 'service_declaration'):
            settings_service = self.runtime.service(self, 'settings')
            if settings_service:
                setting_name = self.DEFAULT_ATTRIBUTE_SETTINGS[attribute_name]
                return settings_service.get_settings_bucket(self).get(setting_name)
        return available_attr  # Ensures that the field's default type is preserved

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
            threeplay_api_key=self.get_attribute_or_default('api_key_3play'),
            content_id=self.content_id,
            user_lang=self.cc_language_preference,
            cc_disabled=self.disable_cc_and_translations,
            bcove_policy=self.get_attribute_or_default('brightcove_policy'),
            bcove_account=self.get_attribute_or_default('brightcove_account'),
            video_type=VideoType.BRIGHTCOVE if self.is_brightcove_video else VideoType.OOYALA,
        )

    def player_token(self):
        """
        Return a player token URL and its expiry datetime.

        Returns:
            If the player token is enabled, returns e.g.:

                {
                  "player_token": "http://player.ooyala.com/sas/embed_token/53YWsyOszKOsfS1...",
                  "player_token_expires: 1501812713,
                }

            If the player token is disabled, returns:

                {
                  "player_token": "",
                  "player_token_expires: None,
                }
        """
        if self.get_attribute_or_default('enable_player_token'):
            player_token, expiry = generate_player_token(
                self.get_attribute_or_default('partner_code'),
                self.get_attribute_or_default('api_key'),
                self.get_attribute_or_default('api_secret_key'),
                self.content_id,
                self.expiration_time,
            )
        else:
            player_token = ''
            expiry = None

        return {
            'player_token': player_token,
            'player_token_expires': expiry,
        }

    def student_view(self, context):
        """
        Player view, displayed to the student
        """
        transcript = self.transcript.render(i18n_service=self.i18n_service)

        context = {
            'dom_id': 'bcove-' + self._get_unique_id(),
            'content_id': self.content_id,
            'complete_percentage': COMPLETION_VIDEO_COMPLETE_PERCENTAGE,
            'transcript': transcript,
            'autoplay': self.autoplay,
            'cc_lang': self.cc_language_preference,
        }

        if self.is_brightcove_video:
            return self.bcov_student_view(context=context)
        elif self.brightcove_playback_enabled:  # Fire up bcove player only if flag is on
            # try getting Brightcove id using content_id
            bc_video_id = self.get_brightcove_video_id()

            if bc_video_id:
                context.update({'content_id': bc_video_id})
                return self.bcov_student_view(context=context)

        # Skin file path according to block type
        if hasattr(self, 'lightchild_block_type'):
            json_config_url = self.resource_url(OoyalaPlayerLightChildBlock.lightchild_block_type, SKIN_FILE_PATH)
            bit_movin_player_url = self.resource_url(OoyalaPlayerLightChildBlock.lightchild_block_type,
                                                BIT_MOVIN_PLAYER_PATH)
        else:
            json_config_url = self.resource_url(self.scope_ids.block_type, SKIN_FILE_PATH)
            bit_movin_player_url = self.resource_url(self.scope_ids.block_type, BIT_MOVIN_PLAYER_PATH)

        dom_id = 'ooyala-' + self._get_unique_id()

        overlay_fragments = ""
        for overlay in self.overlays:
            overlay_fragments += overlay.render()

        context = self.player_token()
        context.update({
            'title': self.display_name,
            'cc_lang': self.cc_language_preference,
            'cc_disabled': self.disable_cc_and_translations,
            'pcode': self.pcode,
            'content_id': self.content_id,
            'player_id': self.player_id,
            'dom_id': dom_id,
            'overlay_fragments': overlay_fragments,
            'transcript': transcript,
            'width': self.width,
            'height': self.height,
            'autoplay': self.autoplay,
            'config_url': json_config_url,
            'complete_percentage': COMPLETION_VIDEO_COMPLETE_PERCENTAGE,
            'bit_movin_player': bit_movin_player_url,
        })

        JS_URLS = [
            self.local_resource_url(self, 'public/build/player_all.min.js'),
            '//p3.3playmedia.com/p3sdk.current.js',
        ]
        CSS_URLS = [
            self.local_resource_url(self, 'public/build/player_all.min.css'),
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
            self.runtime.publish(self, 'completion', {"completion": 1.0})

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

    def student_view_data(self, context=None):
        """
        Returns a dict containing the settings for the student view.

        Returns:
            E.g.,
                {
                  "player_token": "http://player.ooyala.com/sas/embed_token/53YWsyOszKOsfS1...",
                  "player_token_expires": 1501812713,
                  "partner_code: "53YWsyOszKOsfS1IvcQoKn8YhWYk",
                  "content_id": "5sMHA1YzE6KHI-dFSKgDz-pcMOx37_f9",
                  "player_type": "bcove",
                  "bcove_id": "6068615189001"
                }

            See player_token() for more information on the player_token_* fields.
        """
        data = self.player_token()
        data.update({
            'partner_code': self.get_attribute_or_default('partner_code'),
            'content_id': self.reference_id or self.content_id,
            'player_type': VideoType.BRIGHTCOVE if self.is_brightcove_video else VideoType.OOYALA,
            'bcove_id': self.content_id if self.is_brightcove_video else None,
            'bcove_account_id': self.get_attribute_or_default('brightcove_account'),
            'bcove_policy': self.get_attribute_or_default('brightcove_policy'),
        })

        return data

    @XBlock.json_handler
    def publish_completion(self, data, dispatch):  # pylint: disable=unused-argument
        """
        Entry point for completion for student_view.

        Parameters:
            data: JSON dict:
                key: "completion"
                value: float in range [0.0, 1.0]

            dispatch: Ignored.
        Return value: If an error occurs, JSON response (200 on success,
        400 for malformed data) or {"result": 200} for success.
        """
        value = data.get('completion', None)
        if not 0.0 <= value <= 1.0:
            message = u"Invalid completion value {}. Must be in range [0.0, 1.0]"
            raise JsonHandlerError(400, message.format(value))
        if value >= COMPLETION_VIDEO_COMPLETE_PERCENTAGE:
            value = 1.0
        self.runtime.publish(self, "completion", {"completion": value})
        return {"result": "success"}

    def resource_url(self, block_type, uri):
        try:
            return reverse('xblock_resource_url', kwargs={
                'block_type': block_type,
                'uri': uri,
            })
        except NoReverseMatch:
            return self.local_resource_url(self, uri)

    def local_resource_url(self, block, uri):
        # TODO move to xblock-utils
        return self.runtime.local_resource_url(block, uri)


@XBlock.needs("i18n")
@XBlock.wants("settings")
class OoyalaPlayerBlock(OoyalaPlayerMixin, XBlock):
    """
    XBlock providing a video player for videos hosted on Ooyala
    """

    display_name = String(
        display_name=_("Display Name"),
        help=_("This name appears in the horizontal navigation at the top of the page."),
        scope=Scope.settings,
        default=_("Brightcove Player")
    )

    content_id = String(
        display_name=_("Content Id"),
        help=_("Identifier for the Content Id."),
        scope=Scope.content,
        default='6068614205001'
    )


    reference_id = String(
        display_name=_("Reference Id"),
        help=_("Reference ID for the Content Id."),
        scope=Scope.content,
        default=''
    )

    transcript_file_id = String(
        display_name=_("3Play Transcript Id"),
        help=_("Identifier for the 3Play Transcript File"),
        scope=Scope.content,
        default=''
    )

    cc_language_preference = String(
        display_name=_("Closed Captions Language"),
        help=_("User's preference for closed captions language"),
        scope=Scope.user_info,
        default='en'
    )

    disable_cc_and_translations = Boolean(
        display_name=_("Turn Off Closed Captions and Translated transcripts"),
        help=_("Hides the CC button and transcript languages selection for this video"),
        scope=Scope.settings,
        default=False
    )

    autoplay = Boolean(
        display_name=_("Enable Player Autoplay"),
        help=_("Set to True if you the player to automatically play."),
        scope=Scope.content,
        default=True
    )

    enable_player_token = Boolean(
        display_name=_("Enable Player Token"),
        help=_("Set to True if a player token is required, e.g. if streaming videos to the mobile app."),
        scope=Scope.content,
        default=False
    )

    partner_code = String(
        display_name=_("Partner Code"),
        help=_("Required for V4 Player. Also needed to generate a player token."),
        scope=Scope.content,
        default=''
    )

    api_key = String(
        display_name="Api Key",
        help=_("Needed to generate a player token."),
        scope=Scope.content,
        default=''
    )

    api_secret_key = String(
        display_name=_("Api SecRet Key"),
        help=_("Needed to generate a player token."),
        scope=Scope.content,
        default=''
    )

    api_key_3play = String(
        display_name=_("3play Api Key"),
        help=_("3play Api Key for transcript."),
        scope=Scope.content,
        default=''
    )

    width = String(
        display_name=_("Player Width"),
        help=_("The width of the player in pixels."),
        scope=Scope.content,
        default="100%"
    )

    height = String(
        display_name=_("Player Height"),
        help=_('The height of the player in pixels.'),
        scope=Scope.content,
        default="100%"
    )

    expiration_time = Integer(
        display_name=_("Expiration Time"),
        help=_('Expiration time in seconds. Needed to generate a player token.'),
        scope=Scope.content,
        default=600
    )

    fire_progress_event_on_student_view = Boolean(
        display_name=_("Fire Progress Event on Student View"),
        help=_('Set to True if you would like to get a progress event in the event stream when the user views this xBlock.'),
        scope=Scope.content,
        default=True
    )

    xml_config = String(help=_("XML Configuration"), default='<ooyala>\n</ooyala>',
                        scope=Scope.content)

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
            return {'result': 'error', 'message': self.ugettext('Missing event_type in JSON data')}

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
        transcript_id = data.get('transcript_id')
        content = ''

        if threeplay_id:
            content = Transcript.get_transcript_by_threeplay_id(
                api_key=self.get_attribute_or_default('api_key_3play'),
                threeplay_id=threeplay_id,
                transcript_id=transcript_id,
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
        display_name=_("Display Name"),
        help=_("This name appears in the horizontal navigation at the top of the page."),
        scope=LCScope.content,
        default=_("Ooyala Player")
    )

    content_id = LCString(
        display_name=_("Content Id"),
        help=_("Identifier for the Content Id."),
        scope=LCScope.content,
        default='RpOGxhMTE6p6DkTB8MBGtKN6v0_A_BdQ'
    )

    reference_id = LCString(
        display_name=_("Reference Id"),
        help=_("Reference ID for the Content Id."),
        scope=LCScope.content,
        default=''
    )

    transcript_file_id = LCString(
        display_name=_("3Play Transcript Id"),
        help=_("Identifier for the 3Play Transcript File"),
        scope=LCScope.content,
        default=''
    )

    cc_language_preference = LCString(
        display_name=_("Closed Captions Language"),
        help=_("User's preference for closed captions language"),
        scope=LCScope.user_state,
        default='en'
    )

    disable_cc_and_translations = LCBoolean(
        display_name=_("Turn Off Closed Captions and Translated transcripts"),
        help=_("Hides the CC button and transcript languages selection for this video"),
        scope=LCScope.content,
        default=False
    )

    autoplay = LCBoolean(
        display_name=_("Enable Player Autoplay"),
        help=_('Set to True if you the player to automatically play.'),
        scope=LCScope.content,
        default=False
    )

    enable_player_token = LCBoolean(
        display_name=_("Enable Player Token"),
        help=_('Set to True if a player token is required, e.g. if streaming videos to the mobile app.'),
        scope=LCScope.content,
        default=False
    )

    partner_code = LCString(
        display_name=_("Partner Code"),
        help=_('Needed to generate a player token.'),
        scope=LCScope.content,
        default=''
    )

    api_key = LCString(
        display_name=_("Api Key"),
        help=_('Needed to generate a player token.'),
        scope=LCScope.content,
        default=''
    )

    api_secret_key = LCString(
        display_name=_("Api SecRet Key"),
        help=_('Needed to generate a player token.'),
        scope=LCScope.content,
        default=''
    )

    api_key_3play = LCString(
        display_name=_("3play Api Key"),
        help=_('3play Api Key for transcript.'),
        scope=LCScope.content,
        default=''
    )

    width = LCString(
        display_name=_("Player Width"),
        help=_('The width of the player in pixels.'),
        scope=LCScope.content,
        default="100%"
    )

    height = LCString(
        display_name=_("Player Height"),
        help=_('The height of the player in pixels.'),
        scope=LCScope.content,
        default="428px"
    )

    expiration_time = Integer(
        display_name=_("Expiration Time"),
        help=_('Expiration time in seconds. Needed to generate a player token.'),
        scope=LCScope.content,
        default=600
    )

    fire_progress_event_on_student_view = LCBoolean(
        display_name=_("Fire Progress Event on Student View"),
        help=_('Set to True if you would like to get a progress event in the event stream when the user views this xBlock.'),
        scope=LCScope.content,
        default=True
    )

    xml_config = LCString(help=_("XML Configuration"), default='<ooyala>\n</ooyala>',
                        scope=LCScope.content)

    @property
    def brightcove_policy(self):
        xblock_settings = settings.XBLOCK_SETTINGS if hasattr(settings, "XBLOCK_SETTINGS") else {}
        return xblock_settings.get('OoyalaPlayerBlock', {}).get('BCOVE_POLICY')

    @property
    def brightcove_account(self):
        xblock_settings = settings.XBLOCK_SETTINGS if hasattr(settings, "XBLOCK_SETTINGS") else {}
        return xblock_settings.get('OoyalaPlayerBlock', {}).get('BCOVE_ACCOUNT_ID')

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

    def _get_unique_id(self):
        # We can have mulitple lightchild in the same block
        unique_id = self.location.name
        unique_id += "-{0}".format(uuid4().hex)
        return unique_id
