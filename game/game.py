from game.user import User
import random


class Game:

    STAGE_SHUFFLE = 0
    STAGE_RUN = 1
    STAGE_CATCH = 2
    STAGE_OVER = 3

    catcher: User
    flag_holder: User
    score = 0
    give_to = None

    signs = [i for i in range(10)]

    def __init__(self, players):
        self.players = players
        self.stage = self.STAGE_SHUFFLE

    def shuffle(self):
        flag_holder_index = random.randint(0, len(self.players)-1)
        self.flag_holder = self.players[flag_holder_index]
        self.flag_holder.give_to = True
        self.set_flag_holder(self.players[flag_holder_index])

        cather_index = random.randint(0, len(self.players) - 1)
        while flag_holder_index == cather_index and len(self.players) > 1:
            cather_index = random.randint(0, len(self.players) - 1)
        self.catcher = self.players[cather_index]
        self.catcher.is_alive = True

        player_signs = []
        while len(player_signs) < len(self.players):
            sign = random.choice(self.signs)
            if sign not in player_signs:
                player_signs.append(sign)
        for i, sign in enumerate(player_signs):
            self.players[i].set_sign(sign)

    def set_flag_holder(self, user):
        self.score += 1
        self.flag_holder.has_flag = False
        self.flag_holder = user
        self.flag_holder.has_flag = True

    def give_flag(self, sign: int):
        for p in self.players:
            if p is not self.flag_holder and p is not self.catcher and p.sign == sign:
                self.give_to = sign
                return p
        return None

    def receive_flag(self, player, sign: int):
        if self.flag_holder.sign == sign and player.sign == self.give_to:
            self.give_to = -1
            return self.flag_holder
        return None

    def has_flag(self, sign: int) -> bool:
        if self.flag_holder.sign == sign:
            self.stage = self.STAGE_OVER
            return True
        return False

    def next_stage(self):
        if self.stage == self.STAGE_SHUFFLE:
            self.stage = self.STAGE_RUN
        elif self.stage == self.STAGE_RUN:
            self.stage = self.STAGE_CATCH

    def get_broadcast(self):
        return {
            'flagHolder': self.flag_holder.get_broadcast(),
            'catcher': self.catcher.get_broadcast(),
            'stage': self.stage,
            'score': self.score
        }
