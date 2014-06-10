from nose.tools import assert_false, assert_equal, assert_not_equal
import mock

import json
from xblock.field_data import DictFieldData

from ooyala_player import OoyalaPlayerBlock
import ooyala_player


def test_player_token_is_disabled_by_default():
    field_data = DictFieldData({})
    player = OoyalaPlayerBlock(None, field_data, None)
    assert_false(player.enable_player_token)


def test_disabled_player_token_is_empty():
    field_data = DictFieldData({"enable_player_token": False})
    player = OoyalaPlayerBlock(None, field_data, None)
    assert_equal(player.player_token, '')


def test_enabled_player_token_is_not_empty():
    field_data = DictFieldData({"enable_player_token": True})
    player = OoyalaPlayerBlock(None, field_data, None)
    assert_not_equal(player.player_token, '')


class _MockRequest:
    def __init__(self, body):
        self.body = json.dumps(body)


class _NotEmpty:
    """Placeholder for a value that must not be Null, 0, False or an empty sequence."""
    def __eq__(self, other):
        if not other:
            return False
        return True


def _assert_studio_submit(result, expected):
    assert_equal(result.status, "200 OK")
    assert_equal(result.content_type, "application/json")
    assert_equal(json.loads(result.body), expected)


def test_studio_submit_json_handler_invalid_xml_config():
    player = OoyalaPlayerBlock(None, None, None)
    request = _MockRequest({
        "xml_config": "this is clearly invalid xml"
    })
    result = player.studio_submit(request)
    _assert_studio_submit(result, {
        "result": "error",
        "message": _NotEmpty()
    })


def test_studio_submit_json_handler_valid_input():
    player = OoyalaPlayerBlock(None, None, None)
    request_data = {
        "xml_config": "<tag>this is a valid xml</tag>",
        "display_name": "exampleDisplayName",
        "content_id": "exampleContentID",
        "transcript_file_id": "exampleTranscriptFileID",
        "transcript_project_id": "exampleTranscriptProjectID",
        "enable_player_token": "examplePlayerToken",
        "partner_code": "examplePartnerCode",
        "api_key": "exampleApiKey",
        "api_secret_key": "exampleSecretKey",
        "expiration_time": "exampleExpirationTime"
    }
    result = player.studio_submit(_MockRequest(request_data))
    _assert_studio_submit(result, {"result": "success"})
    for key in request_data:
        assert_equal(getattr(player, key), request_data[key])


def test_studio_submit_json_handler_another_valid_input():
    player = OoyalaPlayerBlock(None, None, None)
    request_data = {
        "xml_config": (
            '<ooyala-player>'
            '    <overlay start="300" end="350">Overlayed content</overlay>'
            '</ooyala-player>'),
        "display_name": "The video we want to show you",
        "content_id": "6es2cT26W-vUkKHR17xZ3Wb6WSpyJQnP",
        "transcript_file_id": "the_transcript_profile",
        "transcript_project_id": "the_transcript_project",
        "enable_player_token": "the_player_token",
        "partner_code": "the_partner_code",
        "api_key": "the_api_key",
        "api_secret_key": "the_secret_key",
        "expiration_time": "10000",
        "player_width": "320px"
    }
    result = player.studio_submit(_MockRequest(request_data))
    _assert_studio_submit(result, {"result": "success"})
    for key in request_data:
        assert_equal(getattr(player, key), request_data[key])


class _MockOverlay:
    def __init__(self, *args):
        self.args = args

    def __repr__(self):
        return "_MockOverlay{}".format(self.args)

    def __eq__(self, other):
        return self.args == other.args


@mock.patch("ooyala_player.overlay.OoyalaOverlay", new=_MockOverlay)
def test_parse_overlays():
    player = OoyalaPlayerBlock(None, None, None)
    player.parent = "the_parent"
    player.content_id = "the_parent"
    player.xml_config = (
        '<ooyala-player>'
        '    <overlays>'
        '        <overlay/>'
        '        <overlay start="123" end="320" />'
        '        <overlay start="134" end="160">The overlayed text</overlay>'
        '    </overlays>'
        '</ooyala-player>')
    assert_equal(player.overlays, [
        _MockOverlay(0, 0, None, "ooyala-" + player._get_unique_id()),
        _MockOverlay(123, 320, None, "ooyala-" + player._get_unique_id()),
        _MockOverlay(134, 160, "The overlayed text", "ooyala-" + player._get_unique_id()),
    ])
