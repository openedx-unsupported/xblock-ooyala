import re
from io import StringIO

from lxml import etree
from mock import MagicMock
from nose.tools import assert_equal, assert_false

from ooyala_player.overlay import OoyalaOverlay


def test_init_overlay_from_minimal_node():
    node = etree.parse(StringIO("<overlay />")).getroot()
    video_id = "minimalTestVideoId"

    r = OoyalaOverlay.init_overlay_from_node(node, video_id)

    assert_equal(r.start, 0)
    assert_equal(r.end, 0)
    assert_false(r.text)
    assert_equal(r.video_id, video_id)

def _test_init_overlay_from_node(start, end, text, video_id):
    xml = '<overlay start="{}" end="{}">{}</overlay>'.format(start, end, text)
    node = etree.parse(StringIO(xml)).getroot()

    text = re.sub("html", "div", text)

    r = OoyalaOverlay.init_overlay_from_node(node, video_id)

    assert_equal(r.start, start)
    assert_equal(r.end, end)
    assert_equal(r.text, text)
    assert_equal(r.video_id, video_id)

def test_init_overlay_from_full_node():
    _test_init_overlay_from_node(100, 200, "SomeText", "AnotherVideoId")

def test_init_overlay_replaces_html_with_div():
    _test_init_overlay_from_node(213, 234, '<html>Some <em>formatted</em> content</html>', "some_other_video_id")
