import type { GameSlug } from "@/data/games";

export const difficulties = ["easy", "medium", "hard"] as const;
export type Difficulty = (typeof difficulties)[number];
export const modeNames: Record<Difficulty, string> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
};
export const isDifficulty = (value: unknown): value is Difficulty =>
  difficulties.includes(value as Difficulty);
export const modeTips: Record<GameSlug, readonly [string, string, string]> = {
  "pen-fight": [
    "A gentler rival with less accurate flicks.",
    "Balanced flick power and accuracy.",
    "Stronger flicks and precise aiming.",
  ],
  "tic-tac-toe": [
    "Ziggy makes random moves.",
    "Ziggy takes wins and blocks immediate threats.",
    "Ziggy plans ahead and cannot be beaten.",
  ],
  snake: [
    "A relaxed pace with more thinking time.",
    "Classic speed and steady acceleration.",
    "Fast movement from the first bite.",
  ],
  "rock-paper-scissors": [
    "Ziggy cycles rock, paper, scissors. Spot the pattern.",
    "Ziggy chooses randomly.",
    "Ziggy adapts to your previous choices.",
  ],
  "2048": [
    "New tiles are rarely 4s.",
    "Classic mix of 2s and 4s.",
    "More 4s make board management trickier.",
  ],
  "memory-match": [
    "6 pairs and a longer look at missed matches.",
    "8 pairs with a standard reveal time.",
    "10 pairs with faster card concealment.",
  ],
  pong: [
    "A slower paddle to play against.",
    "A balanced opponent with steady tracking.",
    "Quick paddle tracking and fewer openings.",
  ],
  flappy: [
    "Wider openings and a slower flight.",
    "Standard openings and flight speed.",
    "Narrower openings and faster obstacles.",
  ],
  "reaction-time": [
    "Aim for 350 ms or faster.",
    "Aim for 280 ms or faster.",
    "Aim for 220 ms with a less predictable wait.",
  ],
  "red-light-green-light": [
    "More warning time and a quicker runner.",
    "Balanced warning time and running pace.",
    "Short warnings and a slower runner.",
  ],
  "connect-four": [
    "Ziggy drops discs randomly.",
    "Ziggy takes wins and blocks your threats.",
    "Ziggy looks several turns ahead.",
  ],
  minesweeper: [
    "8 mines on the field.",
    "10 mines on the field.",
    "14 mines on the field.",
  ],
  "sliding-puzzle": [
    "A short, 6-move shuffle.",
    "A 30-move shuffle to untangle.",
    "A deep, 100-move shuffle.",
  ],
  "lights-out": [
    "A 4×4 board scrambled with 3 switches.",
    "A 4×4 board scrambled with 7 switches.",
    "A larger 5×5 board to switch off.",
  ],
  "mini-sudoku": [
    "10 clues to get you started.",
    "At least 7 clues, with one solution.",
    "Fewer clues and more deductions.",
  ],
  hangman: [
    "8 mistakes allowed and shorter words.",
    "6 mistakes allowed.",
    "Longer words and only 4 mistakes allowed.",
  ],
  "word-scramble": [
    "7 guesses with a clue.",
    "5 guesses with a clue.",
    "3 guesses with a clue and longer words.",
  ],
  "number-guess": [
    "1–50, with 8 guesses.",
    "1–100, with 7 guesses.",
    "1–500, with only 7 guesses.",
  ],
  "math-challenge": [
    "Numbers 1–6. Get 7 of 10 right.",
    "Numbers 1–12. Get 7 of 10 right.",
    "Numbers 1–25. Get 9 of 10 right.",
  ],
  "whack-a-mole": [
    "Slower moles. Hit 10 in 20 seconds.",
    "Hit 15 moles in 20 seconds.",
    "Fast moles. Hit 25 in 20 seconds.",
  ],
};
