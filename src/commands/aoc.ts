import Cache from 'node-cache';
import fetch from 'node-fetch';

import { getConfig } from '../config';
import type { Command } from '../types';

const LEADERBOARD_URL = 'https://adventofcode.com/2022/leaderboard/private/view/756840';
const AOC_SESSION = getConfig('ADVENT_OF_CODE_SESSION');

const CACHE_TTL = 15 * 60;
const CACHE_KEY = 'leaderboard';
const aocCache = new Cache({ stdTTL: CACHE_TTL, deleteOnExpire: true });

const aoc: Command = {
  name: 'aoc',
  description: 'Wyświetla ranking Advent of Code serwera Type of Web',
  args: 'prohibited',
  cooldown: 60,
  async execute(msg) {
    if (!aocCache.has('leaderboard')) {
      const res = await fetch(`${LEADERBOARD_URL}.json`, {
        headers: {
          Cookie: `session=${AOC_SESSION}`,
        },
      });
      const data = (await res.json()) as LeaderboardResponse;
      const leaderboard = Object.values(data.members)
        .sort((a, b) => b.local_score - a.local_score)
        .splice(0, 10);

      aocCache.set(CACHE_KEY, leaderboard);
    }

    const leaderboard = aocCache.get<readonly LeaderboardEntry[]>(CACHE_KEY);
    const lastUpdateDate = new Date(aocCache.getTtl(CACHE_KEY)! - CACHE_TTL * 1000);

    console.log(lastUpdateDate);

    const messages = [
      `**TOP 10 leaderboard AOC** (stan na ${lastUpdateDate
        .getHours()
        .toString()
        .padStart(2, '0')}:${lastUpdateDate.getMinutes().toString().padStart(2, '0')}):`,
      ...leaderboard!.map(
        ({ name, local_score, stars }, index) =>
          `\`${(index + 1).toString().padStart(2, ' ')}\`. ${name} – ${local_score} - ${stars} ⭐️`,
      ),
    ];

    return msg.channel.send(messages.join('\n'));
  },
};

export default aoc;

interface LeaderboardEntry {
  readonly id: number;
  readonly name: string;
  readonly local_score: number;
  readonly global_score: number;
  readonly stars: number;
}

interface LeaderboardResponse {
  readonly members: {
    readonly [key: string]: LeaderboardEntry;
  };
}
