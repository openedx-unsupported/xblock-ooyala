from urllib2 import urlopen
import json

from django.utils.translation import get_language_info
from django.core.cache import cache

from xblockutils.resources import ResourceLoader

from .brightcove_player import get_brightcove_video_detail

loader = ResourceLoader(__name__)

FILES_API_ENDPOINT = "http://api.3playmedia.com/files?apikey={api_key}&q=video_id={video_id}"
TRANSLATIONS_API_ENDPOINT = "http://static.3playmedia.com/files/{file_id}/translations?apikey={api_key_3play}"
TRANSLATION_DOWNLOAD_URL = "//static.3playmedia.com/p/projects/{project_id}/files/{transcript_file_id}" \
                   "/translations/{translation_id}/transcript.html"
LANGUAGE_API_ENDPOINT = "http://api.3playmedia.com/caption_imports/available_languages?apikey={api_key_3play}"
LANGUAGE_LIST_CACHE_EXPIRY = (60 * 60) * 24  # 24 Hours
TRANSCRIPT_DETAIL_CACHE_EXPIRY = (60 * 60) * 24  # 24 Hours
TRANSCRIPT_LIST_CACHE_EXPIRY = (60 * 60) * 1  # 1 Hour

RTL_LANGUAGES = ['Arabic']

# Translated & Imported transcripts are
# get via different APIs
INCLUDE_IMPORTED_TRANSCRIPTS = True


class Transcript(object):
    """
    Represents 3play transcript which appears below video
    """
    def __init__(
        self, threeplay_api_key, content_id, user_lang,
        cc_disabled, bcove_policy, bcove_account, video_type
    ):
        self.transcript_id = None
        self.api_key = None
        self.project_id = None
        self.error = None
        self.translations = []
        self.imported_translations = []

        if threeplay_api_key and content_id:
            self.api_key = threeplay_api_key
            self._get_transcript_details(content_id, video_type, bcove_policy, bcove_account)

        if self.transcript_id:
            # add source language in all cases
            language_details = self.get_language_details(self.language_id)
            lang_name = language_details.get('name', 'English')
            lang_code = language_details.get('code', 'en')
            localized_name = self.get_localized_name(lang_name, lang_code)
            self.translations = [{
                'language': lang_name,
                'lang_code': lang_code,
                'localized_name': localized_name,
                'url': "//static.3playmedia.com/p/projects/{project_id}/files/{transcript_file_id}/transcript.html".format(
                    project_id=self.project_id, transcript_file_id=self.transcript_id
                ),
                'selected': True if lang_code == user_lang else False,
                'dir': 'rtl' if lang_name in RTL_LANGUAGES else 'ltr'
            }]

            if not cc_disabled:
                self._get_translations(selected_lang=user_lang)

            if INCLUDE_IMPORTED_TRANSCRIPTS and not cc_disabled:
                self._get_imported_transcripts(selected_lang=user_lang)

    def _get_transcript_details(self, content_id, video_type, bcove_policy, bcove_account):
        """
        Use content id to retrieve and set transcript details
        """
        from .ooyala_player import VideoType

        api_endpoint = FILES_API_ENDPOINT.format(
            api_key=self.api_key,
            video_id=content_id
        )
        cache_key = 'ooyala_transcript_{}_details'.format(content_id)
        transcript = cache.get(cache_key)

        if transcript is None:
            try:
                response = urlopen(api_endpoint)
                data = response.read()
                transcript_details = json.loads(data)
            except Exception as e:
                self.error = str(e.message)
                transcript = {}
            else:
                files = transcript_details.get('files', [])
                if files:
                    transcript = files[0]
                    if transcript.get('state', '') == 'delivered':
                        cache.set(cache_key, transcript, TRANSCRIPT_DETAIL_CACHE_EXPIRY)
                    else:
                        transcript = {}
                else:
                    if video_type == VideoType.BRIGHTCOVE:
                        # this might be a migrated video with 3play link detached
                        # get corresponding reference id and try fetching transcript
                        video_data = get_brightcove_video_detail(content_id, bcove_policy, bcove_account)
                        if isinstance(video_data, dict) and video_data.get('reference_id'):
                            return self._get_transcript_details(
                                content_id=video_data.get('reference_id'),
                                video_type=VideoType.OOYALA,
                                bcove_policy=bcove_policy,
                                bcove_account=bcove_account,
                            )
                        else:
                            transcript = {}
                    else:
                        transcript = {}

        self.transcript_id = transcript.get('id')
        self.project_id = transcript.get('project_id')
        self.language_id = transcript.get('language_id')

    def _get_translations(self, selected_lang):
        """
        Fetch the list of available translations
        """
        api_endpoint = TRANSLATIONS_API_ENDPOINT.format(
            file_id=self.transcript_id,
            api_key_3play=self.api_key
        )
        cache_key = 'ooyala_{}_translated_transcripts'.format(self.transcript_id)
        translations_list = cache.get(cache_key)

        if translations_list is None:
            try:
                response = urlopen(api_endpoint)
                data = response.read()
                translations_list = json.loads(data)
            except Exception as e:
                self.error = str(e.message)
                translations_list = []
            else:
                cache.set(cache_key, translations_list, TRANSCRIPT_LIST_CACHE_EXPIRY)

        for translation in translations_list:
            if translation.get('state') == 'complete':
                lang_name = translation.get('target_language_name')
                lang_code = translation.get('target_language_iso_639_1_code')
                localized_name = self.get_localized_name(lang_name, lang_code)

                self.translations.append({
                    'language': lang_name,
                    'lang_code': lang_code,
                    'localized_name': localized_name,
                    'selected': True if selected_lang in [lang_code, lang_name] else False,
                    'url': TRANSLATION_DOWNLOAD_URL.format(
                        project_id=self.project_id, transcript_file_id=self.transcript_id,
                        translation_id=translation.get('id')
                    ),
                    'dir': 'rtl' if lang_name in RTL_LANGUAGES else 'ltr'
                })

    def get_localized_name(self, lang_name, lang_code):
        try:
            lang_info = get_language_info(lang_code)
            localized_name = lang_info.get('name_local')
        except KeyError:
            localized_name = lang_name
        return localized_name

    def get_language_details(self, lang_id=None):
        """
        Fetch the language details against language id from available languages
        """
        language_api_endpoint = LANGUAGE_API_ENDPOINT.format(
            api_key_3play=self.api_key
        )
        cache_key = 'ooyala_lang_details'
        lang_details = cache.get(cache_key)

        if lang_details is None:
            try:
                response = urlopen(language_api_endpoint)
                data = response.read()
                lang_list = json.loads(data)
            except Exception:
                lang_details = {}
            else:
                lang_details = {
                    d.get('language_id'): {'name': d.get('full_name'), 'code': d.get('iso_639_1_code')}
                    for d in lang_list
                }
                cache.set(cache_key, lang_details, LANGUAGE_LIST_CACHE_EXPIRY)

        if lang_id:
            return lang_details.get(lang_id, {})
        else:
            return lang_details

    def get_imported_transcripts_list(self):
        api_endpoint = "http://api.3playmedia.com/caption_imports?apikey={api_key_3play}".format(
            api_key_3play=self.api_key
        )
        cache_key = 'ooyala_imported_transcripts'
        imports_list = cache.get(cache_key)

        if imports_list is None:
            try:
                response = urlopen(api_endpoint)
                data = response.read()
                imports_list = json.loads(data)
            except Exception as e:
                imports_list = []
            else:
                cache.set(cache_key, imports_list, TRANSCRIPT_LIST_CACHE_EXPIRY)

        return imports_list

    def _get_imported_transcripts(self, selected_lang):
        """
        Retrieve imported transcripts.
        *Imported transcripts are not listed in translation api.
        """
        imports_list = self.get_imported_transcripts_list()
        lang_ids = self.get_language_details()

        for caption_import in imports_list:
            if caption_import['media_file_id'] == self.transcript_id:
                lang_id = caption_import.get('language_id', 0)
                language = lang_ids.get(lang_id).get('name')
                lang_code = lang_ids.get(lang_id).get('code')
                threeplay_id = caption_import.get('threeplay_transcript_id')

                try:
                    lang_info = get_language_info(lang_code)
                    localized_name = lang_info.get('name_local')
                except KeyError:
                    localized_name = language

                if language and lang_code and threeplay_id:
                    self.imported_translations.append({
                        'threeplay_id': threeplay_id,
                        'transcript_id': self.transcript_id,
                        'language': language,
                        'lang_code': lang_code,
                        'selected': True if selected_lang in [language, lang_code] else False,
                        'localized_name': localized_name,
                        'dir': 'rtl' if language in RTL_LANGUAGES else 'ltr'
                    })

    @staticmethod
    def get_transcript_by_threeplay_id(api_key, transcript_id, threeplay_id):
        transcript_content = ''
        api_endpoint = "http://api.3playmedia.com/files/{file_id}/transcript.html?apikey={api_key}" \
                       "&threeplay_transcript_id={threeplay_id}"\
            .format(file_id=transcript_id, api_key=api_key, threeplay_id=threeplay_id)

        try:
            response = urlopen(api_endpoint)
            data = response.read()
        except Exception as e:
            pass
        else:
            transcript_content = data

        return transcript_content

    def render(self, i18n_service=None):
        """
        Render in interactive transcript
        """
        return loader.render_django_template(
            'templates/html/ooyala_transcript.html', {
                'self': self
            },
            i18n_service=i18n_service
        )

