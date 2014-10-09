# -*- coding: utf-8 -*-
#

from lxml import etree

from .utils import loader


class OoyalaOverlay(object):
    """
    Class to represent an Ooyala overlay.
    """

    @classmethod
    def init_overlay_from_node(cls, node, video_id):
        """
        Parse an overlay xml child and initialize an overlay object.
        """

        try:
            start = int(node.attrib['start']) if 'start' in node.attrib else 0
        except ValueError:
            start = 0

        try:
            end = int(node.attrib['end']) if 'end' in node.attrib else 0
        except ValueError:
            end = 0

        html_node = node.find('html')
        if html_node is not None:
            html_node.tag = 'div'
            text = unicode(etree.tostring(html_node))
            html_node.tag = 'html'
        else:
            text = node.text

        return OoyalaOverlay(start, end, text, video_id)

    def __init__(self, start, end, text, video_id):
        self.start = start
        self.end = end
        self.text = text
        self.video_id = video_id

    @property
    def target(self):
        return 'ooyala-overlay-container-' + self.video_id

    def render(self):
        """
        Returns a fragment containing the formatted overlay.
        """

        return loader.render_template('templates/html/ooyala_overlay.html', {
            'self': self
        })
