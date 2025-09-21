export function categoryIcon(name: string, className = 'h-6 w-6') {
  const n = String(name).toLowerCase()
  if (n.includes('tool')) {
    return (
      <svg
        viewBox="0 0 24 24"
        className={className}
        fill="none"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M7 7l10 10M12 8l4-4 4 4-4 4M8 12l-4 4 4 4 4-4"
        />
      </svg>
    )
  }
  if (n.includes('electric')) {
    return (
      <svg
        viewBox="0 0 24 24"
        className={className}
        fill="none"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 3L4 14h7l-1 7 9-11h-7l1-7z"
        />
      </svg>
    )
  }
  if (n.includes('plumb') || n.includes('pipe')) {
    return (
      <svg
        viewBox="0 0 24 24"
        className={className}
        fill="none"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 10h6v4H4a2 2 0 01-2-2v0a2 2 0 012-2zm10 0h6m-6 4h6"
        />
      </svg>
    )
  }
  if (n.includes('safety')) {
    return (
      <svg
        viewBox="0 0 24 24"
        className={className}
        fill="none"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 3l8 4v5c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V7l8-4z"
        />
      </svg>
    )
  }
  if (n.includes('light')) {
    return (
      <svg
        viewBox="0 0 24 24"
        className={className}
        fill="none"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 3a6 6 0 00-6 6c0 2.2 1.2 3.6 2.5 5l.5 1.5h6l.5-1.5C16.8 12.6 18 11.2 18 9a6 6 0 00-6-6zm-2 14h4m-3 3h2"
        />
      </svg>
    )
  }
  if (n.includes('lumber') || n.includes('wood')) {
    return (
      <svg
        viewBox="0 0 24 24"
        className={className}
        fill="none"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 7h18M5 7v10a2 2 0 002 2h10a2 2 0 002-2V7"
        />
      </svg>
    )
  }
  if (n.includes('hvac') || n.includes('vent') || n.includes('air')) {
    return (
      <svg
        viewBox="0 0 24 24"
        className={className}
        fill="none"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 12h16M8 8l-4 4 4 4M16 8l4 4-4 4"
        />
      </svg>
    )
  }
  if (n.includes('paint')) {
    return (
      <svg
        viewBox="0 0 24 24"
        className={className}
        fill="none"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 13l8-8 5 5-8 8H4v-5zM13 5l6 6"
        />
      </svg>
    )
  }
  if (n.includes('fasten') || n.includes('screw') || n.includes('bolt')) {
    return (
      <svg
        viewBox="0 0 24 24"
        className={className}
        fill="none"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 3v6m0 6v6M9 12h6"
        />
      </svg>
    )
  }
  if (n.includes('adhes') || n.includes('glue')) {
    return (
      <svg
        viewBox="0 0 24 24"
        className={className}
        fill="none"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 4c3 3 5 5 5 7a5 5 0 11-10 0c0-2 2-4 5-7z"
        />
      </svg>
    )
  }
  if (n.includes('concrete') || n.includes('cement')) {
    return (
      <svg
        viewBox="0 0 24 24"
        className={className}
        fill="none"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 10h16M4 14h16M6 6h12M6 18h12"
        />
      </svg>
    )
  }
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 7h16M4 12h16M4 17h16"
      />
    </svg>
  )
}
