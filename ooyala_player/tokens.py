import sys
import urllib
import datetime
import hashlib
import base64


def generate_player_token(partner_code, api_key, api_secret_key, video_code, expiration_time):

    OOYALA_TOKEN_URL = 'http://player.ooyala.com/sas/embed_token/{}/{}?api_key={}&expires={}&signature={}'
    expiry = _expiration_timestamp_from_delta(expiration_time)
    signature = _generate_signature(partner_code, api_key, api_secret_key, video_code, expiry)

    return OOYALA_TOKEN_URL.format(partner_code, video_code, api_key, expiry, signature), int(expiry)


def _expiration_timestamp_from_delta(seconds):
    return (datetime.datetime.now() + datetime.timedelta(seconds=seconds)).strftime('%s')


def _generate_signature(partner_code, api_key, api_secret_key, video_code, expiry):
    http_method = "GET"
    slug = "/sas/embed_token/"

    # Request string with parameters
    request_path = slug + str(partner_code) + "/" + str(video_code)
    request_string = str(api_secret_key) + http_method + request_path + str(api_key) + str(expiry)

    # Generate a SHA-256 digest in base64 for request string
    m = hashlib.sha256()
    m.update(request_string)
    sha = m.digest()
    res_base = base64.b64encode(sha)

    # truncate string to 43 characters
    res_base_truncated = res_base[0:43]

    # remove any trailing = signs
    res_base_clean = res_base_truncated.rstrip('=')

    # URL encode the signature with quote(string[, safe])
    return urllib.quote(res_base_clean, '')
