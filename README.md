Brightcove XBlock
========================

This XBlock allows to include Brightcove videos within an edX course.

**Note:** Ooyala has been shutdown since `April 2020` so the XBlock 
has been renamed to Brightcove and only supports Brightcove videos now.

It supports:

* **Brightcove Video**, the component to visualize the video.
* **Transcript**, which allows your users to interact with your video
  using text capabilities (video words, search, navigation).
* **Overlays**, which allows you to place raw text or HTML content at
  a specific moment in your video.
* **Player token**, which allows you to secure your video content
  using a token with an expiration time.

Installation
------------

Install the requirements into the python virtual environment of your
`edx-platform` installation by running the following command from the
root folder:

```bash
pip install -r requirements.txt
```

This will install requirements and the Ooyala XBlock itself.

Enabling in Studio
------------------

You can enable the Ooyala XBlock in Studio through the advanced
settings:

1. From the main page of a specific course, click on *Settings*,
   *Advanced Settings* in the top menu.
2. Locate the *advanced_modules* policy key, and add
   `"ooyala-player"` to the policy value list.
3. Click on the *Save changes* button.

Usage
-----

Once enabled, you can find _Ooyala Player_ component under the _Advanced_
tab in the Studio. When you add it to a course in the studio, the
block is set up with default content, shown in the screenshot
below.

![Studio View](https://raw.githubusercontent.com/edx-solutions/xblock-ooyala/cfb3a47c8b4842491a1c9797fd6752df3bad5fbf/doc/img/studio-view.png)

### Settings

The following settings can be set in studio edit:

* _Title_: The title displayed in the unit for this xblock.
* _Content Id_: Brightcove content identifier.
* _Transcript File Id_: 3Play transcript file identifier. Leave empty
  if your video does not use a transcript.
* _3Play Api key_: 3play API key, to access the 3Play transcript file
* _Enable Player Token_: has to be set to `True` if you want to use
  short-lived tokens. Defaults to `False`.
* _Partner Code_: Ooyala partner code (also known as _pcode_) is
  needed to be able to generate a player token. Only required when
  using short-lived tokens.
* _Api Key_: Ooyala API key. Only required when using a transcript
  file and/or short-lived tokens.
* _Api Secret Key_: Ooyala secret key. Only required when using
  short-lived tokens.
* _Player Width_: The width of the player in valid CSS units; defaults
  to `760px`.
* _Player Height_: The height of the player in valid CSS units;
  defaults to `427px`.
* _Expiration Time_: the expiration time of a short-lived token in
  seconds; defaults to `600`.
* _XML Configuration_: Allows you to configure advanced properties of
  the player (ie. overlays) by editing the XML.

![Studio Edit](https://raw.githubusercontent.com/edx-solutions/xblock-ooyala/cfb3a47c8b4842491a1c9797fd6752df3bad5fbf/doc/img/studio-edit.png)

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

License
-------

The Image Explorer XBlock is available under the GNU Affero General
Public License (AGPLv3).
