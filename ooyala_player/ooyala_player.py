# -*- coding: utf-8 -*-
#

# Imports ###########################################################
from uuid import uuid4

from django.conf import settings
from django.urls import NoReverseMatch, reverse
from lxml import etree
from mentoring.light_children import Boolean as LCBoolean
from mentoring.light_children import LightChild
from mentoring.light_children import Scope as LCScope
from mentoring.light_children import String as LCString
from xblock.core import XBlock
from xblock.exceptions import JsonHandlerError
from xblock.fields import Boolean, Scope, String
from xblockutils.studio_editable import StudioEditableXBlockMixin

from .brightcove_player import BrightcovePlayerMixin
from .transcript import Transcript
from .utils import I18NService, _

# Globals ###########################################################
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
        'brightcove_policy': 'BCOVE_POLICY',
        'brightcove_account': 'BCOVE_ACCOUNT_ID',
    }

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
    def transcript(self):
        return Transcript(
            threeplay_api_key=self.get_attribute_or_default('api_key_3play'),
            content_id=self.content_id,
            user_lang=self.cc_language_preference,
            bcove_policy=self.get_attribute_or_default('brightcove_policy'),
            bcove_account=self.get_attribute_or_default('brightcove_account'),
            video_type=VideoType.BRIGHTCOVE if self.is_brightcove_video else VideoType.OOYALA,
        )

    def student_view(self, context):
        """
        Player view, displayed to the student
        """
        if hasattr(self, 'lightchild_block_type'):
            # Don't display transcript in case of OoyalaPlayerLightChildBlock
            transcript = ''
        else:
            transcript = self.transcript.render(i18n_service=self.i18n_service)

        context = {
            'dom_id': 'bcove-' + self._get_unique_id(),
            'content_id': self.content_id,
            'complete_percentage': COMPLETION_VIDEO_COMPLETE_PERCENTAGE,
            'transcript': transcript,
            'autoplay': self.autoplay,
            'cc_lang': self.cc_language_preference,
        }

        if self.fire_progress_event_on_student_view:
            # In certain cases we want to know when a student has visited a video player
            # as an indication that they are progressing through a course
            # Progress *does not* mean progress over viewing a video (i.e. elapsed time)
            self.runtime.publish(self, 'completion', {"completion": 1.0})

        return self.bcov_student_view(context=context)

    def xblock_view(self):
        """
        Returns the JSON that represents the xblock for jquery.xblock.
        """

        try:
            course_id = str(self.course_id)
            usage_id = self.course_id.make_usage_key(self.scope_ids.block_type, self.location.name)
            usage_id = str(usage_id).replace('/', ';_')
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
                  "content_id": "6068615189001",
                  "player_type": "bcove",
                  "bcove_id": "6068615189001",
                  "bcove_account_id": "893493",
                  "bcove_policy": "secret_key"
                }

        """
        data = {}
        data.update({
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
            message = "Invalid completion value {}. Must be in range [0.0, 1.0]"
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
class OoyalaPlayerBlock(OoyalaPlayerMixin, StudioEditableXBlockMixin, XBlock):
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
        help=_("Brightcove Video ID."),
        scope=Scope.content,
        default='6110589153001'
    )

    reference_id = String(
        display_name=_("Reference Id"),
        help=_("Reference ID for the Content Id."),
        scope=Scope.content,
        default=''
    )

    cc_language_preference = String(
        display_name=_("Closed Captions Language"),
        help=_("User's preference for closed captions language"),
        scope=Scope.user_info,
        default='en'
    )

    autoplay = Boolean(
        display_name=_("Enable Autoplay"),
        help=_("Set to True if you want the video to automatically play."),
        scope=Scope.content,
        default=True
    )

    fire_progress_event_on_student_view = Boolean(
        display_name=_("Fire Progress Event on Student View"),
        help=_('Set to True if you would like to trigger progress event when the user views this xBlock.'),
        scope=Scope.content,
        default=False
    )

    editable_fields = ('display_name', 'content_id', 'autoplay', 'fire_progress_event_on_student_view')

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
        except KeyError:
            return {'result': 'error', 'message': self.ugettext('Missing event_type in JSON data')}

        data['content_id'] = self.content_id
        data['user_id'] = self.scope_ids.user_id

        self.runtime.publish(self, event_type, data)
        return {'result': 'success'}

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
        video_id = data.get('video_id')
        content = ''

        if threeplay_id:
            content = Transcript.get_transcript_by_threeplay_id(
                api_key=self.get_attribute_or_default('api_key_3play'),
                threeplay_id=threeplay_id,
                video_id=video_id,
            )

        return {'content': content}

    @staticmethod
    def workbench_scenarios():
        """A canned scenario for display in the workbench."""
        return [("Ooyala scenario", "<vertical_demo><ooyala-player/></vertical_demo>")]


class OoyalaPlayerLightChildBlock(OoyalaPlayerMixin, LightChild):
    """
    LightChild XBlock providing a video player for videos hosted on Brightcove.

    TODO: refactor to not duplicated all field definitions.
    """

    lightchild_block_type = 'ooyala-player'  # used by LightChild.local_resource_url

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
        default='6110589153001'
    )

    reference_id = LCString(
        display_name=_("Reference Id"),
        help=_("Reference ID for the Content Id."),
        scope=LCScope.content,
        default=''
    )

    cc_language_preference = LCString(
        display_name=_("Closed Captions Language"),
        help=_("User's preference for closed captions language"),
        scope=LCScope.user_state,
        default='en'
    )

    autoplay = LCBoolean(
        display_name=_("Enable Player Autoplay"),
        help=_('Set to True if you the player to automatically play.'),
        scope=LCScope.content,
        default=False
    )

    fire_progress_event_on_student_view = LCBoolean(
        display_name=_("Fire Progress Event on Student View"),
        help=_(
            'Set to True if you would like to get a progress event in the event stream when the user views this xBlock.'
        ),
        scope=LCScope.content,
        default=True
    )

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
        xml_config = "<ooyala>\n"
        for child in node:
            xml_config += str(etree.tostring(child))
            node.remove(child)
        xml_config += "</ooyala>"

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
