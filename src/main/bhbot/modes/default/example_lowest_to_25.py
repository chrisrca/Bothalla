from abstract_mode import Mode

class LowestTo25(Mode):
    name = {
        'default': 'Leveling up characters to level 25',
        'Русский': 'Повышение персонажей до 25 уровня',
        'English': 'Leveling up characters to level 25',
    }
    character_selection_enabled = False
    duration_selection_enabled = False

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    @property
    def next_duration(self):
        return self.next_character.get_duration_for_xp(self.next_character.get_xp_to_level(25)) if self.next_character.level < 25 else 15

    @property
    def next_character(self):
        sorted_by_xp = sorted(self.bot.unlocked_characters, key=lambda char: char.total_xp)
        try:
            return next(filter(lambda x: x.level < 25, sorted_by_xp))
        except StopIteration:
            
            return sorted_by_xp[0]
