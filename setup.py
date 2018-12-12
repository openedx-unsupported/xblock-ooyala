# -*- coding: utf-8 -*-

# Imports ###########################################################

import os
from setuptools import setup


# Functions #########################################################

def package_data(pkg, root_list):
    """Generic function to find package_data for `pkg` under `root`."""
    data = []
    for root in root_list:
        for dirname, _, files in os.walk(os.path.join(pkg, root)):
            for fname in files:
                data.append(os.path.relpath(os.path.join(dirname, fname), pkg))

    return {pkg: data}


# Main ##############################################################

BLOCKS = [
    'ooyala-player = ooyala_player:OoyalaPlayerBlock'
]

BLOCKS_CHILDREN = [
    'ooyala-player = ooyala_player:OoyalaPlayerLightChildBlock'
]

setup(
    name='xblock-ooyala-player',
    version='2.0.20',
    description='XBlock - Ooyala Video Player',
    packages=['ooyala_player'],
    install_requires=[
        'XBlock',
    ],
    entry_points={
        'xblock.v1': BLOCKS,
        'xblock.light_children': BLOCKS_CHILDREN,
    },
    package_data=package_data("ooyala_player", ["templates", "public"]),
)
