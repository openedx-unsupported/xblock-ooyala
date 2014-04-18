xblock-ooyala
=====================

Overlays
--------

You can add messages to be displayed during the video using overlays. You can add an overlay in the
studio using xml:

```xml
<ooyala>
  <overlays>
    <overlay start="39" end="45"><html>Thats <b>Sasha!!</b> one of our colleagues!</html></overlay>
    <overlay start="4"  end="15"><html><a href='http://www.edx.org'>Welcome</a> to <b>McKinsey Academys 7 STEP APPROACH!!</b>!</html></overlay>
    <overlay start="16" end="20">This is raw text</overlay>
  </overlays>

</ooyala>
```
