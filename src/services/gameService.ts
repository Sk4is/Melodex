import { Song } from '../types/song';
import { Guess, STAGES } from '../types/game';
import { isMatchingArtist } from '../utils/normalizeText';

export const SCORE_MAP: Record<number, number> = {
  0: 1000, // 0.5 sec
  1: 800,  // 1 sec
  2: 600,  // 3 sec
  3: 400,  // 5 sec
  4: 200,  // 15 sec
};

class GameService {
  public getStageDuration(stageIndex: number): number {
    if (stageIndex < 0) return STAGES[0];
    if (stageIndex >= STAGES.length) return STAGES[STAGES.length - 1];
    return STAGES[stageIndex];
  }

  public isLastStage(stageIndex: number): boolean {
    return stageIndex >= STAGES.length - 1;
  }

  public calculateScore(stageIndex: number, won: boolean): number {
    if (!won) return 0;
    return SCORE_MAP[stageIndex] ?? 0;
  }

  /**
   * Deterministic ID check without any AI dependencies
   */
  public validateGuess(selectedSongId: string, currentSongId: string): boolean {
    return selectedSongId === currentSongId;
  }

  /**
   * Checks if guess has matching artist/collaborator even if the song is wrong
   */
  public isArtistMatch(guessArtist: string, targetArtist: string): boolean {
    return isMatchingArtist(guessArtist, targetArtist);
  }

  public hasAlreadyGuessed(guesses: Guess[], songId: string): boolean {
    return guesses.some((g) => g.songId === songId);
  }

  public createGuess(selectedSong: Song, currentSong: Song, stageNumber: number): Guess {
    const isCorrect = this.validateGuess(selectedSong.id, currentSong.id);
    const correctArtist = !isCorrect && this.isArtistMatch(selectedSong.artist, currentSong.artist);
    return {
      songId: selectedSong.id,
      title: selectedSong.title,
      artist: selectedSong.artist,
      correct: isCorrect,
      correctArtist,
      stageNumber,
    };
  }
}

export const gameService = new GameService();

