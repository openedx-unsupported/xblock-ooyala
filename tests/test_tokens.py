from nose.tools import assert_equal
import mock
import datetime

from ooyala_player import tokens

# Mocks and helpers


class _MockNow:
    def __init__(self, mock_timestamp):
        self._old_datetime = datetime.datetime
        self.mock_timestamp = mock_timestamp

    def now(self):
        return self._old_datetime.fromtimestamp(self.mock_timestamp)


def _create_test_case(**kwargs):
    def expected_url():
        format_values = dict(kwargs)
        format_values["expiration_time"] += datetime.datetime.mock_timestamp
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

    return expected_url(), input_params()

# Tests


@mock.patch("datetime.datetime", new=_MockNow(10**10))
def test_generate_player_token():
    expected_url, input_params = _create_test_case(
        partner_code="field_partner_code",
        api_key="field_api_key",
        api_secret_key="field_api_secret_key",
        video_code="field_content_id",
        expiration_time=1000,
        signature="pThDB4rSxpQsDnVQuf7eO4grituDKp3z11uW5tiNFEg",
    )

    result_url = tokens.generate_player_token(**input_params)
    assert_equal(expected_url, result_url)


@mock.patch("datetime.datetime", new=_MockNow(10**10))
def test_generate_player_token_with_other_parameters():
    expected_url, input_params = _create_test_case(
        partner_code="examplePartnerCode1337",
        api_key="exampleApiKey1337",
        api_secret_key="exampleSecretKey1337",
        video_code="exampleVideoCode1337",
        expiration_time=1337,
        signature="EOyl4QQ3OxDvPfRShHMb6oaK3Qp6c6g1Bbl%2BAsHmIWI"
    )

    result_url = tokens.generate_player_token(**input_params)
    assert_equal(expected_url, result_url)


@mock.patch("datetime.datetime", new=_MockNow(11**10))
def test_generate_player_token_at_another_time():
    expected_url, input_params = _create_test_case(
        partner_code="examplePartnerCode1337",
        api_key="exampleApiKey1337",
        api_secret_key="exampleSecretKey1337",
        video_code="exampleVideoCode1337",
        expiration_time=1337,
        signature="OBZGfULRcrq%2F1NPgNtjv%2FTMdE64l2k5wZe%2BrIDWiXKU"
    )

    result_url = tokens.generate_player_token(**input_params)
    assert_equal(expected_url, result_url)


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


@mock.patch("datetime.datetime", new=_MockNow(0))
def test_expiration_timestamp_from_delta():
    _expiration_timestamp_test(10000, 1000, "11000")
    _expiration_timestamp_test(12345000000, 98765, "12345098765")
    _expiration_timestamp_test(55555, 43210, "98765")


def _expiration_timestamp_test(mock_now, delta, expected_string):
    datetime.datetime.mock_timestamp = mock_now

    result = tokens._expiration_timestamp_from_delta(delta)
    assert_equal(result, expected_string)

