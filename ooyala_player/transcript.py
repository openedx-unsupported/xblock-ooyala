from urllib2 import urlopen
import json

from .utils import render_template

FILES_API_ENDPOINT = "http://api.3playmedia.com/files?apikey={api_key}&q=video_id={video_id}"
TRANSLATIONS_API_ENDPOINT = "http://static.3playmedia.com/files/{file_id}/translations?apikey={api_key_3play}"
TRANSLATION_DOWNLOAD_URL = "//static.3playmedia.com/p/projects/{project_id}/files/{transcript_file_id}" \
                   "/translations/{translation_id}/transcript.html"

# 'ar' is 'Arabic' in Ooyala player.
# Transform it before sending to Player
TRANSLATION_ALIAS = {
    'ar': 'Arabic'
}

# Translated & Imported transcripts are
# get via different APIs
INCLUDE_IMPORTED_TRANSCRIPTS = True


class Transcript(object):
    """
    Represents 3play transcript which appears below video
    """
    transcript_id = None
    api_key = None
    project_id = None
    error = None
    translations = []
    imported_transcripts = []

    def __init__(self, threeplay_api_key, content_id, user_lang, cc_disabled):
        if threeplay_api_key and content_id:
            self.api_key = threeplay_api_key
            self._set_transcript_details(content_id)

        if self.transcript_id:
            self.translations = [{
                'language': 'English',
                'url': "//static.3playmedia.com/p/projects/{project_id}/files/{transcript_file_id}/transcript.html".format(
                    project_id=self.project_id, transcript_file_id=self.transcript_id
                ),
                'selected': True if 'en' == user_lang else False,
                'lang_code': 'en'
            }]

            if not cc_disabled:
                self._set_translations(selected_lang=user_lang)

            if INCLUDE_IMPORTED_TRANSCRIPTS and not cc_disabled:
                self._set_imported_transcripts(selected_lang=user_lang)

    def _set_transcript_details(self, content_id):
        """
        Use content id to retrieve and set transcript details
        """
        api_endpoint = FILES_API_ENDPOINT.format(
            api_key=self.api_key,
            video_id=content_id
        )

        try:
            response = urlopen(api_endpoint)
            data = response.read()
            transcript_details = json.loads(data)
        except Exception as e:
            self.error = str(e.message)
        else:
            files = transcript_details.get('files', [])
            if files:
                transcript = files[0]
                self.transcript_id = transcript.get('id')
                self.project_id = transcript.get('project_id')

    def _set_translations(self, selected_lang):
        """
        Fetch the list of available translations
        """
        api_endpoint = TRANSLATIONS_API_ENDPOINT.format(
            file_id=self.transcript_id,
            api_key_3play=self.api_key
        )

        try:
            response = urlopen(api_endpoint)
            data = response.read()
            translations_list = json.loads(data)
        except Exception as e:
            self.error = str(e.message)
        else:
            translations = [{
                'language': translation.get('target_language_name'),
                'lang_code': TRANSLATION_ALIAS.get(translation.get(
                    'target_language_iso_639_1_code'), translation.get('target_language_iso_639_1_code')
                ),
                'selected': True if selected_lang in [translation.get(
                        'target_language_iso_639_1_code'), translation.get('target_language_name')] else False,
                'url': TRANSLATION_DOWNLOAD_URL.format(
                     project_id=self.project_id, transcript_file_id=self.transcript_id,
                     translation_id=translation.get('id')
                )}
                for translation in translations_list
                if translation.get('state') == 'complete'
            ]

            self.translations.extend(translations)

    def _set_imported_transcripts(self, selected_lang):
        """
        Retrieve imported transcripts.
        *Imported transcripts are not listed in translation api.
        """
        api_endpoint = "http://api.3playmedia.com/caption_imports?apikey={api_key_3play}".format(
            api_key_3play=self.api_key
        )

        lang_endpoint = "http://api.3playmedia.com/caption_imports//available_languages?apikey={api_key_3play}".format(
            api_key_3play=self.api_key
        )

        try:
            response = urlopen(api_endpoint)
            data = response.read()
            imports_list = json.loads(data)
        except Exception as e:
            self.error = str(e.message)
        else:
            try:
                response = urlopen(lang_endpoint)
                data = response.read()
                lang_list = json.loads(data)
            except Exception:
                return
            else:
                lang_ids = {
                    d.get('language_id'): {'name': d.get('full_name'), 'code': d.get('iso_639_1_code')}
                    for d in lang_list
                }

                imported_transcripts = []
                for caption_import in imports_list:
                    if caption_import['media_file_id'] == self.transcript_id:
                        lang_id = caption_import.get('language_id', 0)
                        language = lang_ids.get(lang_id).get('name')
                        lang_code = lang_ids.get(lang_id).get('code')
                        threeplay_id = caption_import.get('threeplay_transcript_id')

                        if language and lang_code and threeplay_id:
                            imported_transcripts.append({
                                'threeplay_id': threeplay_id,
                                'language': language,
                                'lang_code': lang_code,
                                'selected': True if selected_lang in [language, lang_code] else False
                            })

                self.imported_transcripts = imported_transcripts

    @staticmethod
    def get_transcript_by_threeplay_id(api_key, threeplay_id):
        transcript_content = ''
        api_endpoint = "http://api.3playmedia.com/files/1340681/transcript.html?apikey={api_key}" \
                       "&threeplay_transcript_id={threeplay_id}".format(api_key=api_key, threeplay_id=threeplay_id)

        try:
            response = urlopen(api_endpoint)
            data = response.read()
        except Exception as e:
            pass
        else:
            transcript_content = data

        return transcript_content

    def render(self):
        """
        Render in interactive transcript
        """
        return render_template('templates/html/ooyala_transcript.html', {
            'self': self
        })
