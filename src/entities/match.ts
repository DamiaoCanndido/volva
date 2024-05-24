import { Team } from './team';

export type Match = {
  id: number;
  fullTime: boolean;
  startDate: string;
  round: string;
  leagueId: number;
  homeId: number;
  awayId: number;
  homeScore: string | null;
  awayScore: string | null;
  homePenalty: string | null;
  awayPenalty: string | null;
  home: Team;
  away: Team;
  league: {
    name: string;
  };
};
