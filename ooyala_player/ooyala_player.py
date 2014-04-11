# -*- coding: utf-8 -*-
#

# Imports ###########################################################

import logging

from xblock.core import XBlock
from xblock.fields import Scope, String
from xblock.fragment import Fragment

from .utils import render_template


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
        default='hkdjY5bDq8v1L5e1S4NZ3nvIKi8ADt1n'
    )

    transcript_id = String(
        display_name="Transcript Id",
        help="Identifier for the 3Play Transcript.",
        scope=Scope.content
    )

    player_id = '635104fd644c4170ae227af2de27deab'

    def student_view(self, context):
        """
        Player view, displayed to the student
        """

        context = {
            'title': self.display_name,
            'content_id': self.content_id,
            'transcript_id': self.transcript_id,
            'player_id': self.player_id,
        }

        fragment = Fragment()
        fragment.add_content(render_template('/templates/html/ooyala_player.html', context))
        fragment.add_css_url(self.runtime.local_resource_url(self, 'public/css/ooyala_player.css'))
        fragment.add_css_url(self.runtime.local_resource_url(self, 'public/css/vendor/jquery-ui.css'))
        fragment.add_css_url(self.runtime.local_resource_url(self, 'public/css/vendor/speed_plugin.css'))

        #fragment.add_javascript_url(self.runtime.local_resource_url(self, 'public/js/vendor/jquery-1_10_1.js'))
        fragment.add_javascript_url(self.runtime.local_resource_url(self, 'public/js/vendor/jquery-ui.js'))
        fragment.add_javascript_url('//player.ooyala.com/v3/' + self.player_id + '?platform=html5-priority')
        fragment.add_javascript_url(self.runtime.local_resource_url(self, 'public/js/vendor/speed_plugin.js'))
        fragment.add_javascript_url(self.runtime.local_resource_url(self, 'public/js/vendor/popcorn.js'))
        fragment.add_javascript_url(self.runtime.local_resource_url(self, 'public/js/vendor/underscore.js'))
        fragment.add_javascript_url(self.runtime.local_resource_url(self, 'public/js/ooyala_player.js'))

        #fragment.add_javascript_url('//static.3playmedia.com/p/projects/12901/files/375889/embed.js?plugin=transcript&settings=width:640,height:240,skin:frost,can_collapse:true,collapse_onload:true,can_print:true,can_download:true,scan_view:true&player_type=ooyala&player_id=635104fd644c4170ae227af2de27deab')

        fragment.initialize_js('OoyalaPlayerBlock')

        return fragment

    def studio_view(self, context):
        """
        Editing view in Studio
        """
        fragment = Fragment()
        fragment.add_content(render_template('/templates/html/ooyala_player_edit.html', {
            'self': self,
        }))
        fragment.add_javascript_url(self.runtime.local_resource_url(self, 'public/js/ooyala_player_edit.js'))

        fragment.initialize_js('OolayaPlayerEditBlock')

        return fragment

    @XBlock.json_handler
    def studio_submit(self, submissions, suffix=''):

        self.display_name = submissions['display_name']
        self.content_id = submissions['content_id']
        self.transcript_id = submissions['transcript_id']

        return {
            'result': 'success',
        }
