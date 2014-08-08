Ooyala XBlock
=============

This XBlock allows to include Ooyala videos within an edX course.

It supports:

* **Ooyala Video**, the component to visualize the video.
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

![Studio View](https://raw.githubusercontent.com/mtyaka/xblock-ooyala/readme-doc/doc/img/studio-view.png)

### Settings

The following settings can be set in studio edit:

* _Title_: The title displayed in the unit for this xblock.
* _Content Id_: Ooyala content identifier.
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

![Studio Edit](https://raw.githubusercontent.com/mtyaka/xblock-ooyala/readme-doc/doc/img/studio-edit.png)

### Overlays

In studio edit, you can add messages to be displayed at certain points
while the video is playing using overlays. You can add an overlay in
the studio by editing the _XML Configuration_ field.

Each overlay is configured using an `<overlay>` tag. The `start` and
`end` attributes control the time during video play while the overlay
is visible and should be given in seconds.

The content of an `<overlay>` tag can be either plain text or HTML
content wrapped in a `<html>` tag.

All overlays should be grouped under an `<overlays>` tag. Example:

```xml
<ooyala>
  <overlays>
    <overlay start="39" end="45"><html>Thats <b>Chris!!</b> one of our colleagues!</html></overlay>
    <overlay start="4"  end="15"><html><a href='http://www.edx.org'>Welcome</a> to <b>our course</b>!</html></overlay>
    <overlay start="16" end="20">This is raw text</overlay>
  </overlays>
</ooyala>
```

One of the overlay displayed during video play:

![Video Overlay](https://raw.githubusercontent.com/mtyaka/xblock-ooyala/readme-doc/doc/img/student-view-overlay.png)

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
$ (cd ../xblock-sdk/; pip install -r requirements.txt)
$ (cd ../xblock-ooyala/; pip install -r tests/requirements.txt)
```

2. In the xblock-sdk repository, create the following configuration
   file in `workbench/settings_ooyala.py`

```python
from settings import *

INSTALLED_APPS += ('ooyala_player',)
```

3. To run the tests, from the xblock-ooyala repository root:

```bash
$ DJANGO_SETTINGS_MODULE="workbench.settings_ooyala" nosetests --rednose --verbose --with-cover --cover-package=ooyala_player
```

License
-------

The Image Explorer XBlock is available under the GNU Affero General
Public License (AGPLv3).
