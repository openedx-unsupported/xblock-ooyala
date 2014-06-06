Ooyala XBlock
=====================

This XBlock allows to include ooyala video within an edX course.

It supports:

* **Ooyala Video**, the component to visualize the video.
* **Transcript**, which allows your users to interact with your video using text
    capabilities. (video words, search, navigation)
* **Overlays**, which allows you to place raw text or html content at a specific moment in your
    video.
* **Player token**, which allows you to secure your video content using a token with an expiration
    time.

Settings
--------

The following settings can be set in studio edit:

* Video title: the title displayed in the unit for this xblock.
* Content id: Ooyala content identifier
* Transcript project id: 3Play transcript project identifier
* Transcript file id: 3Play transcript file identifier
* Enable player token: have to be `True` if you need the functionnality.
* Api key: needed to generate a player token.
* Api Secret Key: needed to generate a player token.
* Expiration Time: the expiration time of a token, in seconds. Teeded to generate a player token.
* XML Configuration: Additional settings. (ie. overlays)

Overlays
--------

In studio edit, you can add messages to be displayed during the video using overlays. You can add an
overlay in the studio using xml:

```xml
<ooyala>
  <overlays>
    <overlay start="39" end="45"><html>Thats <b>Chris!!</b> one of our colleagues!</html></overlay>
    <overlay start="4"  end="15"><html><a href='http://www.edx.org'>Welcome</a> to <b>our course</b>!</html></overlay>
    <overlay start="16" end="20">This is raw text</overlay>
  </overlays>

</ooyala>
```

Installing dependencies
-----------------------

From the xblock-ooyala repository, and within the Python virtual environment you used to setup the
XBlock workbench or the LMS, install the requirements:

```bash
$ pip install -r requirements.txt
```

This will install requirements and the ooyala xblock itself.


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

2. In the xblock-sdk repository, create the following configuration file in `workbench/settings_ooyala.py`

```python
from settings import *

INSTALLED_APPS += ('ooyala_player',)
```

3. To run the tests, from the xblock-ooyala repository root:

```bash
$ DJANGO_SETTINGS_MODULE="workbench.settings_ooyala" nosetests --rednose --verbose --with-cover --cover-package=ooyala_player
```
