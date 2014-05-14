from nose.tools import assert_false, assert_equal, assert_not_equal

from xblock.field_data import DictFieldData
from ooyala_player import OoyalaPlayerBlock


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
