import { GameGrid } from "@/components/Dashboard";
export const metadata = {
  alternates: { canonical: "/games/" },
  title: "All Games",
  description:
    "Ten free browser mini games. Find your next arcade, puzzle, strategy, or reflex challenge.",
};
export default function Games() {
  return <GameGrid />;
}
