import importlib.util

from abstract_mode import Mode
from characters import *
from direct_input import *
from utils import *


def display_changelog():
    pass

class Config:
    def __init__(self, config):
        self.character = config.get("character", "Random")
        self.duration = config.get("duration", 8)
        self.auto_stop = config.get("auto_stop", True)
        self.auto_detect_auto_stop = config.get("auto_detect_auto_stop", False)
        self.auto_stop_frequency = config.get("auto_stop_frequency", 5)
        self.auto_stop_duration = config.get("auto_stop_duration", 30)
        # self.bots = config.get('bots', 2)
        self.bots = 2
        self.mute = config.get("mute", False)
        self.stealth = config.get("stealth", True)
        self.modes = self.get_modes()
        if not self.modes:
            logger.error("no_modes")
        else:
            self.mode_name = config.get("mode_name", self.modes[0].get_name())
        self.version = global_settings.APP_VERSION

    @classmethod
    def load(cls):
        try:
            res = json.load(global_settings.config_location.open("r"))
            if res.get("version") != global_settings.APP_VERSION:
                logger.warning("old_config")
            return cls(res)
        except FileNotFoundError:
            return cls({})

    # noinspection PyUnresolvedReferences
    @staticmethod
    def get_modes():
        for mode in global_settings.modes_folder.glob("**/*.py"):
            if mode in global_settings.loaded_modes:
                continue
            spec = importlib.util.spec_from_file_location("module.name", mode)
            module = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(module)
            global_settings.loaded_modes[mode] = module
        return Mode.__subclasses__()

    def get_mode(self, name):
        try:
            return next(filter(lambda x: x.get_name() == name, self.modes))
        except StopIteration:
            return self.modes[0]

    @property
    def mode(self):
        return self.get_mode(self.mode_name)

    @property
    def not_save(self):
        return ["modes"]

    def get_save_vars(self):
        return {k: v for k, v in vars(self).items() if k not in self.not_save}

    def save(self):
        try:
            global_settings.config_location.parent.mkdir(parents=True, exist_ok=True)
            json.dump(self.get_save_vars(), global_settings.config_location.open("w+"))
        except Exception as e:
            logger.error("cant_save_config", e)

    def __str__(self):
        return global_settings.messages.get(
            "config", 'Missing "config" entry in language'
        ).format(self)