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
        default="Drag and Drop"
    )

    content_id = String(
        display_name="Content Id",
        help="Identifier for the Content Id.",
        scope=Scope.content
    )

    transcript_id = String(
        display_name="Transcript Id",
        help="Identifier for the 3Play Transcript.",
        scope=Scope.content
    )

    def student_view(self, context):
        """
        Player view, displayed to the student
        """

        context = {
            'title': self.display_name,
            'content_id': self.content_id,
            'transcript_id': self.transcript_id,
        }

        fragment = Fragment()
        fragment.add_content(render_template('/templates/html/ooyala_player.html', context))
        fragment.add_css_url(self.runtime.local_resource_url(self, 'public/css/ooyala_player.css'))
        fragment.add_javascript_url(self.runtime.local_resource_url(self, 'public/js/ooyala_player.js'))

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

        fragment.initialize_js('OolayaPlayerBlock')

        return fragment
