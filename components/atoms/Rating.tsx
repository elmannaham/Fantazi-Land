interface RatingProps {
  score: number;
  maxScore?: number;
  reviewCount?: number;
  interactive?: boolean;
  onChange?: (score: number) => void;
}

export function Rating({
  score,
  maxScore = 5,
  reviewCount,
  interactive = false,
  onChange,
}: RatingProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-0.5">
        {Array.from({ length: maxScore }).map((_, i) => (
          <button
            key={i}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onChange?.(i + 1)}
            className={`text-lg transition-colors ${
              i < Math.floor(score)
                ? "text-yellow-400"
                : i < score
                  ? "text-yellow-300"
                  : "text-slate-300"
            } ${interactive ? "cursor-pointer hover:text-yellow-400" : ""}`}
          >
            ★
          </button>
        ))}
      </div>
      <span className="text-sm font-semibold text-slate-700">
        {score.toFixed(1)}/{maxScore}
      </span>
      {reviewCount !== undefined && (
        <span className="text-xs text-slate-500">({reviewCount} avis)</span>
      )}
    </div>
  );
}
