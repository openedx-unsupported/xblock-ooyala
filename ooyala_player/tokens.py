import sys
import urllib
import datetime
import hashlib
import base64

OOYALA_TOKEN_URL = 'http://player.ooyala.com/sas/embed_token/%s/%s?api_key=%s&expires=%s&signature=%s'


def generate_player_token(partner_code, api_key, api_secret_key, video_code, expiration_time):
    http_method = "GET"
    slug = "/sas/embed_token/"

    request_path = slug+partner_code+"/"+video_code

    # Set the expiration date
    expiry = (datetime.datetime.now() + datetime.timedelta(seconds=expiration_time)).strftime('%s')

    # Request string with parameters
    request_string = api_secret_key + http_method + request_path + api_key + expiry

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
    signature_for_query = urllib.quote(res_base_clean, '')

    return OOYALA_TOKEN_URL % (partner_code, video_code, api_key, expiry, signature_for_query)
