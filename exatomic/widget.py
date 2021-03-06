# -*- coding: utf-8 -*-
# Copyright (c) 2015-2016, Exa Analytics Development Team
# Distributed under the terms of the Apache License 2.0
"""
Universe Notebook Widget
#########################
"""
import os
import subprocess
import pandas as pd
from glob import glob
from base64 import b64decode
from traitlets import Unicode
from exawidgets import ContainerWidget
from exa.utility import mkp


class UniverseWidget(ContainerWidget):
    """
    Custom widget for the :class:`~exatomic.universe.Universe` data container.
    """
    _model_module = Unicode("jupyter-exatomic").tag(sync=True)
    _view_module = Unicode("jupyter-exatomic").tag(sync=True)
    _model_name = Unicode("UniverseModel").tag(sync=True)
    _view_name = Unicode('UniverseView').tag(sync=True)


    def _handle_image(self, data):
        savedir = os.getcwd()
        if self.params['savedir'] != "":
            savedir = self.params['save_dir']
        if self.params['filename'] != "":
            imgname = filename
        else:
            nxt = 0
            try:
                lgfls = [fl.split(os.sep)[-1] for fl in glob(os.sep.join([savedir, "*png"]))]
                numbers = ["".join([c for c in fl if c.isdigit()]) for fl in lgfls]
                last = sorted(map(int, numbers))[-1]
                nxt = last + 1
                imgname = "{:06d}.png".format(nxt)
            except:
                imgname = "{:06d}.png".format(nxt)
        if os.path.isfile(os.sep.join([savedir, imgname])):
            print("Automatic file name generation failed. Use uni._widget.params['filename']")
            return
        with open(os.sep.join([savedir, imgname]), "wb") as f:
            f.write(b64decode(data.replace("data:image/png;base64,", "")))
        # TODO : this likely won"t work on windows but SHOULD automatically
        #        crop the image to minimize whitespace of the final image.
        try:
            crop = " ".join(["convert -trim", imgname, imgname])
            subprocess.call(crop, cwd=savedir, shell=True)
        except:
            pass
