import logging

import requests
from django.core.cache import cache
from django.utils.translation import get_language_info
from xblockutils.resources import ResourceLoader

from .brightcove_player import get_brightcove_video_detail

loader = ResourceLoader(__name__)

TRANSCRIPTS_API = "https://api.3playmedia.com/files/{video_id}/transcripts?apikey={api_key_3play}&usevideoid=1"
TRANSCRIPT_CONTENT_API = "https://api.3playmedia.com/files/{video_id}/transcript.html?" \
                         "apikey={api_key_3play}&usevideoid=1&threeplay_transcript_id={threeplay_id}"
LANGUAGE_API = "https://api.3playmedia.com/caption_imports/available_languages?apikey={api_key_3play}"

MINUTE = (60 * 1)
HOUR = (60 * MINUTE)

TRANSCRIPTS_CACHE_EXPIRY = 1 * HOUR
LANGUAGE_LIST_CACHE_EXPIRY = 24 * HOUR

RTL_LANGUAGES = ['Arabic']

# Enable transcript download
TRANSCRIPT_DOWNLOAD_OPTION = False

logger = logging.getLogger(__name__)


class Transcript:
    """
    Represents 3play transcript which appears below video
    """
    download_transcript_button = TRANSCRIPT_DOWNLOAD_OPTION

    def __init__(
        self, threeplay_api_key, content_id, user_lang,
        bcove_policy, bcove_account, video_type
    ):
        self.video_id = content_id
        self.bcove_account_id = bcove_account
        self.bcove_policy_key = bcove_policy
        self.threeplay_api_key = threeplay_api_key

        self.transcripts = self._get_transcripts(self.video_id, video_type)

        for transcript in self.transcripts:
            lang_details = self.get_language_details(
                transcript.get('language_id'))
            lang_name = lang_details.get('name', 'English')
            lang_code = lang_details.get('code', 'en')
            localized_name = self.get_localized_name(lang_name, lang_code)

            transcript.update({
                'language': lang_name,
                'lang_code': lang_code,
                'localized_name': localized_name,
                'selected': user_lang in (lang_code, lang_name),
                'dir': 'rtl' if lang_name in RTL_LANGUAGES else 'ltr',
            })

    def _get_transcripts(self, video_id, video_type):
        from .ooyala_player import VideoType

        api_endpoint = TRANSCRIPTS_API.format(
            video_id=self.video_id,
            api_key_3play=self.threeplay_api_key
        )
        cache_key = f'{video_id}_3play_transcripts'
        transcripts = cache.get(cache_key)

        if transcripts is None:
            try:
                transcripts = requests.get(api_endpoint).json()
            except Exception as e:
                logger.error(
                    # pylint: disable-next=consider-using-f-string
                    'Failed to load 3Play transcripts for video {}. Error {}'.format(video_id, e))
                transcripts = []
            else:
                if type(transcripts) == dict and 'iserror' in transcripts:
                    transcripts = []
                    if video_type == VideoType.BRIGHTCOVE:
                        # this might be a migrated video with 3play link detached
                        # get corresponding reference id and try re-fetching
                        video_data = get_brightcove_video_detail(
                            self.video_id, self.bcove_policy_key, self.bcove_account_id
                        )
                        if isinstance(video_data, dict) and video_data.get('reference_id'):
                            return self._get_transcripts(
                                video_id=video_data.get('reference_id'),
                                video_type=VideoType.OOYALA,
                            )
                else:
                    cache.set(cache_key, transcripts, TRANSCRIPTS_CACHE_EXPIRY)

        return transcripts

    def get_language_details(self, lang_id=None):
        """
        Fetch the language details against language id from available languages
        """
        language_api_endpoint = LANGUAGE_API.format(
            api_key_3play=self.threeplay_api_key
        )
        cache_key = '3play_lang_details'
        lang_details = cache.get(cache_key)

        if lang_details is None:
            try:
                response = requests.get(language_api_endpoint).json()
            except Exception as e:

                logger.error(
                    # pylint: disable-next=consider-using-f-string
                    'Failed to load 3Play languages list. Error {}'.format(e))
                lang_details = {}
            else:
                lang_details = {
                    d.get('language_id'): {'name': d.get('full_name'), 'code': d.get('brightcove_code')}
                    for d in response
                }
                cache.set(cache_key, lang_details, LANGUAGE_LIST_CACHE_EXPIRY)

        if lang_id:
            return lang_details.get(lang_id, {})
        else:
            return lang_details

    @staticmethod
    def get_localized_name(lang_name, lang_code):
        try:
            lang_info = get_language_info(lang_code)
            localized_name = lang_info.get('name_local')
        except KeyError:
            localized_name = lang_name
        return localized_name

    @staticmethod
    def get_transcript_by_threeplay_id(api_key, threeplay_id, video_id):
        transcript_content = ''
        api_endpoint = TRANSCRIPT_CONTENT_API.format(
            video_id=video_id,
            api_key_3play=api_key,
            threeplay_id=threeplay_id
        )

        try:
            transcript_content = requests.get(
                api_endpoint).content.decode("utf-8")
        except Exception as e:
            # pylint: disable-next=consider-using-f-string
            logger.error('Failed to load transcript content for transcript {}. Error {}'.format(
                threeplay_id, e))
        return transcript_content

    def render(self, i18n_service=None):
        """
        Render in interactive transcript
        """
        return loader.render_django_template(
            'templates/html/3play_transcript.html', {
                'self': self
            },
            i18n_service=i18n_service
        )
