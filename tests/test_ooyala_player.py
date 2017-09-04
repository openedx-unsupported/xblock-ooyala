import json

import mock
from django.test import TestCase
from mock import Mock
from nose.tools import assert_equal, assert_not_equal
from xblock.field_data import DictFieldData
from xblock.fields import ScopeIds
from xblock.runtime import (
    DictKeyValueStore,
    KvsFieldData,
)
from xblock.test.tools import (
    assert_false, TestRuntime
)

from ooyala_player import OoyalaPlayerBlock
from .utils import MockNow, MockRuntime

runtime = MockRuntime()


class MockService(object):
    def __init__(self, block, settings_dict):
        self.block = block
        self.settings_dict = settings_dict

    def get_settings_bucket(self, block):
        return self.settings_dict[block.__class__.__name__]


class OoyalaPlayerTestCaseDefaultSettings(TestCase):
    DEFAULT_SETTING_NAME = 'EXAMPLE_SETTING'
    DEFAULT_SETTING_VALUE = 'xxx'
    REAL_ATTRIBUTE = 'api_secret_key'
    XBLOCK_SETTINGS = {
        'OoyalaPlayerBlock': {
            DEFAULT_SETTING_NAME: 'xxx'
        }
    }

    def setUp(self):
        field_data = KvsFieldData(DictKeyValueStore())
        runtime = TestRuntime(services={'settings': MockService(OoyalaPlayerBlock, self.XBLOCK_SETTINGS)})
        self.player = OoyalaPlayerBlock(runtime, field_data, scope_ids=Mock(spec=ScopeIds))
        self.player.unmixed_class = OoyalaPlayerBlock
        self.player.DEFAULT_ATTRIBUTE_SETTINGS = {
            self.REAL_ATTRIBUTE: self.DEFAULT_SETTING_NAME
        }

    def test_nonexistant_attribute(self):
        with self.assertRaises(AttributeError):
            self.player.get_attribute_or_default('wrong')

    def test_default_value(self):
        with self.settings(XBLOCK_SETTINGS=self.XBLOCK_SETTINGS):
            self.assertEqual(self.player.get_attribute_or_default(self.REAL_ATTRIBUTE), self.DEFAULT_SETTING_VALUE)

            instance_value = 'something new'
            setattr(self.player, self.REAL_ATTRIBUTE, instance_value)
            self.assertEqual(self.player.get_attribute_or_default(self.REAL_ATTRIBUTE), instance_value)


def test_player_token_is_disabled_by_default():
    field_data = DictFieldData({})
    player = OoyalaPlayerBlock(runtime, field_data, None)
    assert_false(player.enable_player_token)


def test_disabled_player_token_is_empty():
    field_data = DictFieldData({"enable_player_token": False})
    player = OoyalaPlayerBlock(runtime, field_data, None)
    token_data = player.player_token()
    assert_equal(token_data['player_token'], '')
    assert_equal(token_data['player_token_expires'], None)


@mock.patch("datetime.datetime", new=MockNow(10**10))
def test_enabled_player_token_is_not_empty():
    field_data = DictFieldData({"enable_player_token": True, "expiration_time": 1234})
    player = OoyalaPlayerBlock(runtime, field_data, None)
    token_data = player.player_token()
    assert_not_equal(token_data['player_token'], '')
    assert_equal(token_data['player_token_expires'], 10**10 + 1234)


def test_student_view_data_disable_player_token():
    """
    Test the student_view_data() results when enable_player_token=False.
    """
    field_data_dict = dict(
        partner_code='PARTNER-CODE',
        content_id='CONTENT-ID',
    )
    expected_data = dict(
        player_token="",
        player_token_expires=None,
        **field_data_dict
    )
    field_data = DictFieldData(dict(enable_player_token=False, **field_data_dict))
    player = OoyalaPlayerBlock(runtime, field_data, None)
    student_view_data = player.student_view_data()
    assert_equal(student_view_data, expected_data)


@mock.patch("ooyala_player.ooyala_player.generate_player_token", return_value=("http://player_token.url", 12345))
def test_student_view_data_enable_player_token(mock_generate_player_token):
    """
    Test the student_view_data() results when enable_player_token=True.
    """
    field_data_dict = dict(
        partner_code='PARTNER-CODE',
        content_id='CONTENT-ID',
    )
    expected_data = dict(
        player_token="http://player_token.url",
        player_token_expires=12345,
        **field_data_dict
    )
    field_data = DictFieldData(dict(enable_player_token=True, **field_data_dict))
    player = OoyalaPlayerBlock(runtime, field_data, None)
    student_view_data = player.student_view_data()
    mock_generate_player_token.assert_called_once()
    assert_equal(student_view_data, expected_data)


class _MockRequest:
    def __init__(self, body):
        self.body = json.dumps(body)
        self.method = "POST"
        self.host_url = 'http://example.com'


class _NotEmpty:
    """Placeholder for a value that must not be Null, 0, False or an empty sequence."""

    def __eq__(self, other):
        if not other:
            return False
        return True


def _assert_json_result(result, expected):
    assert_equal(result.status, "200 OK")
    assert_equal(result.content_type, "application/json")
    assert_equal(json.loads(result.body), expected)


def test_studio_submit_json_handler_invalid_xml_config():
    player = OoyalaPlayerBlock(runtime, None, None)
    request = _MockRequest({
        "xml_config": "this is clearly invalid xml"
    })
    result = player.studio_submit(request)
    _assert_json_result(result, {
        "result": "error",
        "message": _NotEmpty()
    })


def test_studio_submit_json_handler_valid_input():
    player = OoyalaPlayerBlock(runtime, None, None)
    request_data = {
        "xml_config": "<tag>this is a valid xml</tag>",
        "display_name": "exampleDisplayName",
        "content_id": "exampleContentID",
        "transcript_file_id": "exampleTranscriptFileID",
        "enable_player_token": "examplePlayerToken",
        "partner_code": "examplePartnerCode",
        "api_key": "exampleApiKey",
        "api_secret_key": "exampleSecretKey",
        "api_key_3play": "example3playApiKey",
        "expiration_time": "exampleExpirationTime",
        "width": "640px",
        "height": "480px",

    }
    result = player.studio_submit(_MockRequest(request_data))
    _assert_json_result(result, {"result": "success"})
    for key in request_data:
        assert_equal(getattr(player, key), request_data[key])


def test_studio_submit_json_handler_another_valid_input():
    player = OoyalaPlayerBlock(runtime, None, None)
    request_data = {
        "xml_config": (
            '<ooyala-player>'
            '    <overlay start="300" end="350">Overlayed content</overlay>'
            '</ooyala-player>'),
        "display_name": "The video we want to show you",
        "content_id": "6es2cT26W-vUkKHR17xZ3Wb6WSpyJQnP",
        "transcript_file_id": "the_transcript_profile",
        "enable_player_token": "the_player_token",
        "partner_code": "the_partner_code",
        "api_key": "the_api_key",
        "api_secret_key": "the_secret_key",
        "api_key_3play": "the_api_key_3play",
        "expiration_time": "10000",
        "width": "320px",
        "height": "280px",

    }
    result = player.studio_submit(_MockRequest(request_data))
    _assert_json_result(result, {"result": "success"})
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
    player = OoyalaPlayerBlock(runtime, None, None)
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
