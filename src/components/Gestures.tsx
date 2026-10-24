export function Gesture({ choice }: { choice: number }) {
  return (
    <svg className="gesture-icon" viewBox="0 0 80 80" aria-hidden="true">
      <g
        fill="#ffd078"
        stroke="#735034"
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      >
        {choice === 0 ? (
          <>
            <path d="M20 42V27q0-7 7-7h27q8 0 8 9v24q0 15-18 17H33q-14-3-14-17z" />
            <path d="M20 40h26q8 0 8 7v13H42V49H26q-9 0-9-7v-5q0-5 7-5h14v9M31 21v12M42 21v12M53 23v17" />
            <path d="M29 61h11" stroke="#e5a447" />
          </>
        ) : choice === 1 ? (
          <>
            <path d="M24 46 13 35q-4-5 0-9 4-4 8 1l8 8V15q0-7 5-7t5 7v17-23q0-6 5-6t5 6v24-19q0-6 5-6t5 6v23-14q0-5 5-5t5 5v27q0 18-20 23H37q-12-4-13-17z" />
            <path d="M34 45q12-4 22 1M36 52v12" stroke="#dfa247" />
          </>
        ) : (
          <>
            <path d="M24 43 18 33q-3-6 2-9 5-2 8 3l7 11-7-25q-2-7 4-8 5-2 7 5l8 23 7-23q2-6 7-4 5 1 3 8l-6 27q10 5 8 16-2 14-20 16H35q-13-2-16-13l-3-10q-1-5 4-6z" />
            <path d="m36 40 12 4q7 3 4 9l-3 7M24 43l15 7q5 3 2 9" />
          </>
        )}
      </g>
    </svg>
  );
}
