import GameResult from "@/components/GameResult";
export default function ResultPopup({
  scores,
  won,
  onContinue,
}: {
  scores: readonly number[];
  won: boolean;
  onContinue: () => void;
}) {
  return (
    <GameResult
      title={won ? "Round won!" : "CPU wins the round"}
      stats={[
        ["You", scores[0]],
        ["CPU", scores[1]],
      ]}
      celebrate={won}
      highlight={won ? 0 : 1}
      eyebrow={`ROUND ${scores[0] + scores[1]} COMPLETE`}
      subtitle="Session score"
      scoreLabel="Session score"
      onContinue={onContinue}
    />
  );
}
