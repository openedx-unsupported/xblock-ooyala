Brightcove XBlock
========================

This XBlock allows to include Brightcove videos within an edX course.

**Note:** Ooyala has been shutdown since `April 2020` so the XBlock
has been renamed to Brightcove and only supports Brightcove videos now.

It supports:

* **Brightcove Video**, the component to visualize the video.
* **3Play Transcript**, which allows your users to view the 3Play Transcript
associated with the video. That requires you to have the
[3Play integration ](https://www.brightcove.com/en/partners/3play-media)
setup.

Installation
------------

Install the requirements into the python virtual environment of your
`edx-platform` installation by running the following command from the
root folder:

```bash
pip install -r requirements.txt
```

This will install requirements and the Brightcove XBlock itself.

Settings
--------

Add following settings in `XBLOCK_SETTINGS` in `lms.env.json` and `cms.env.json`:

```bash
"OoyalaPlayerBlock": {
    "BCOVE_ACCOUNT_ID": "YOUR_BRIGHTCOVE_ACCOUNT_ID"
    "BCOVE_POLICY": "BCOVE_POLICY_KEY [Optional]",
    "3PLAY_API_KEY": "3Play_API_Key [Optional]"
},
...
```

Set following in `lms.env.json` to control after what percentage of
video watched the module should be marked as completed.
It should be a value between `0.0` and `1.0`. By default it is set to `1.0` i.e. 100%.

```bash
COMPLETION_VIDEO_COMPLETE_PERCENTAGE
```

Enabling in Studio
------------------

You can enable the Brightcove XBlock in Studio through the advanced
settings:

1. From the main page of a specific course, click on *Settings*,
   *Advanced Settings* in the top menu.
2. Locate the *advanced_modules* policy key, and add
   `"ooyala-player"` to the policy value list.
3. Click on the *Save changes* button.

Usage
-----

Once enabled, you can find _Brightcove Player_ component under the _Advanced_
tab in the Studio. When you add it to a course in the studio, the
block is set up with the default content.

### Studio Settings

The following settings can be set in studio edit:

* _Content Id_: Brightcove content identifier.
* _Enable Autoplay_: Set to True if you want the video to automatically play.
* _Fire Progress Event on Student View_: Set to True if you would like to trigger progress event when the user views this xBlock.
By default progress event is triggered when [COMPLETION_VIDEO_COMPLETE_PERCENTAGE](#Settings) is reached.

![Studio Edit](/doc/img/studio-edit.png?raw=true "Studio View")

Custom workbench settings
-------------------------

Not available yet.

Starting the workbench
----------------------

Not available yet.

Running tests
-------------

1. In a virtualenv, run

```bash
$ pip install -r requirements.txt
$ pip install -r tests/requirements.txt
$ pushd $VIRTUAL_ENV/src/xblock-sdk/; make install; popd
$ pushd $VIRTUAL_ENV/src/xblock-mentoring/; pip install -r requirements.txt; popd
```

2. To run the tests, from the xblock-ooyala repository root:

```bash
$ python run_tests.py --with-cover --cover-package=ooyala_player
```

Translation (i18n)
-------------------------------

This repo offers multiple make targets to automate the translation tasks.
First, install `requirements-dev.txt`:

```bash
pip install -r requirements-dev.txt
```

Each make target will be explained below:

- `extract_translations`. Use [`i18n_tool` extract](https://github.com/edx/i18n-tools) to create `.po` files based on all the tagged strings in the python and javascript code.
- `compile_translations`. Use [`i18n_tool` generate](https://github.com/edx/i18n-tools) to create `.mo` compiled files.
- `detect_changed_source_translations`. Use [`i18n_tool` changed](https://github.com/edx/i18n-tools) to identify any updated translations.
- `validate_translations`. Compile translations and check the source translations haven't changed.

If you want to add a new language:
  1. Add language to `ooyala_player/translations/config.yaml`
  2. Make sure all tagged strings have been extracted:
  ```bash
  make extract_translations
  ```
  3. Clone `en` directory to `ooyala_player/translations/<lang_code>/` for example: `ooyala_player/translations/fa_IR/`
  4. Make necessary changes to translation files headers. Make sure you have proper `Language` and `Plural-Forms` lines.
  5. When you finished your modification process, re-compile the translation messages.
  ```bash
  make compile_translations
  ```

License
-------

The Brightcove XBlock is available under the GNU Affero General
Public License (AGPLv3).
