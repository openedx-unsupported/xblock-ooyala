import datetime

import mock
from nose.tools import assert_equal

from ooyala_player import tokens

from .utils import MockNow

# Helpers


def _create_test_case(**kwargs):
    expected_expiry = kwargs["expiration_time"] + datetime.datetime.mock_timestamp

    def expected_url():
        format_values = dict(kwargs)
        format_values["expiration_time"] = expected_expiry
        expected_url = (
            'http://player.ooyala.com/sas/embed_token/{partner_code}/{video_code}?'
            'api_key={api_key}&'
            'expires={expiration_time:d}&'
            'signature={signature}').format(**format_values)
        return expected_url

    def input_params():
        params = dict(kwargs)
        params.pop("signature", None)
        return params

    return expected_url(), input_params(), expected_expiry

# Tests


@mock.patch("datetime.datetime", new=MockNow(10**10))
def test_generate_player_token():
    expected_url, input_params, expected_expiry = _create_test_case(
        partner_code="field_partner_code",
        api_key="field_api_key",
        api_secret_key="field_api_secret_key",
        video_code="field_content_id",
        expiration_time=1000,
        signature="pThDB4rSxpQsDnVQuf7eO4grituDKp3z11uW5tiNFEg",
    )

    result_url, expiry = tokens.generate_player_token(**input_params)
    assert_equal(expected_url, result_url)
    assert_equal(expected_expiry, expected_expiry)


@mock.patch("datetime.datetime", new=MockNow(10**10))
def test_generate_player_token_with_other_parameters():
    expected_url, input_params, expected_expiry = _create_test_case(
        partner_code="examplePartnerCode1337",
        api_key="exampleApiKey1337",
        api_secret_key="exampleSecretKey1337",
        video_code="exampleVideoCode1337",
        expiration_time=1337,
        signature="EOyl4QQ3OxDvPfRShHMb6oaK3Qp6c6g1Bbl%2BAsHmIWI"
    )

    result_url, expiry = tokens.generate_player_token(**input_params)
    assert_equal(expected_url, result_url)
    assert_equal(expected_expiry, expiry)


@mock.patch("datetime.datetime", new=MockNow(11**10))
def test_generate_player_token_at_another_time():
    expected_url, input_params, expected_expiry = _create_test_case(
        partner_code="examplePartnerCode1337",
        api_key="exampleApiKey1337",
        api_secret_key="exampleSecretKey1337",
        video_code="exampleVideoCode1337",
        expiration_time=1337,
        signature="OBZGfULRcrq%2F1NPgNtjv%2FTMdE64l2k5wZe%2BrIDWiXKU"
    )

    result_url, expiry = tokens.generate_player_token(**input_params)
    assert_equal(expected_url, result_url)
    assert_equal(expected_expiry, expiry)


def test_generate_signature():
    params = {
        "partner_code": "example_partner_code",
        "api_key": "example_api_key",
        "api_secret_key": "example_secret_key",
        "video_code": "example_video_code",
        "expiry": "12345",
    }
    _test_generate_signature(params, "RrIXVVw9UUYMAr85D7RT6X0DGoUP1q8vHvae%2FCuAJ3Q")

    params = {
        "partner_code": "anotherPartnerCode",
        "api_key": "anotherApiKey",
        "api_secret_key": "anotherSecretKey",
        "video_code": "anotherVideoCode",
        "expiry": "987654",
    }
    _test_generate_signature(params, "xsTjgLreux4xfOmYK28GNQHfC%2Fe3WkYvayv7hkLqLg4")


def _test_generate_signature(params, expected):
    result = tokens._generate_signature(**params)
    assert_equal(result, expected)


@mock.patch("datetime.datetime", new=MockNow(0))
def test_expiration_timestamp_from_delta():
    _expiration_timestamp_test(10000, 1000, "11000")
    _expiration_timestamp_test(12345000000, 98765, "12345098765")
    _expiration_timestamp_test(55555, 43210, "98765")


def _expiration_timestamp_test(mock_now, delta, expected_string):
    datetime.datetime.mock_timestamp = mock_now

    result = tokens._expiration_timestamp_from_delta(delta)
    assert_equal(result, expected_string)
