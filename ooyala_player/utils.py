# -*- coding: utf-8 -*-
#

# Imports ###########################################################

import logging
import pkg_resources

from django.template import Context, Template
from django.core.urlresolvers import reverse


# Globals ###########################################################

log = logging.getLogger(__name__)


# Functions #########################################################

def _(text):
    """
    Dummy `gettext` replacement to make string extraction tools scrape strings marked for translation
    """
    return text


def load_resource(resource_path):
    """
    Gets the content of a resource
    """
    resource_content = pkg_resources.resource_string(__name__, resource_path)
    return unicode(resource_content)


def render_template(template_path, context={}):
    """
    Evaluate a template by resource path, applying the provided context
    """
    template_str = load_resource(template_path)
    template = Template(template_str)
    return template.render(Context(context))


def resource_url(block_type, uri):
    """
    Returns the xblock_resource_url with the specific block_type and uri
    """
    return reverse('xblock_resource_url', kwargs={
        'block_type': block_type,
        'uri': uri,
    })


def ngettext_fallback(text_singular, text_plural, number):
    """ Dummy `ngettext` replacement to make string extraction tools scrape strings marked for translation """
    if number == 1:
        return text_singular
    else:
        return text_plural


class DummyTranslationService(object):
    """
    Dummy drop-in replacement for i18n XBlock service
    """
    _catalog = {}
    gettext = _
    ngettext = ngettext_fallback


class I18NService(object):
    """
    Add i18n_service attribute to XBlocks
    """
    @property
    def i18n_service(self):
        """ Obtains translation service """
        return self.runtime.service(self, "i18n") or DummyTranslationService()
