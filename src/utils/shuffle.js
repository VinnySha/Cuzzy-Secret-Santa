/**
 * Fisher-Yates shuffle algorithm
 * Ensures no one gets themselves
 */
export function shuffleAssignments(names) {
  if (names.length < 2) return null;

  let assignments = {};
  let attempts = 0;
  const maxAttempts = 100;

  while (attempts < maxAttempts) {
    const shuffled = [...names];

    // Fisher-Yates shuffle
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // Check if anyone got themselves
    let valid = true;
    for (let i = 0; i < names.length; i++) {
      if (names[i] === shuffled[i]) {
        valid = false;
        break;
      }
    }

    if (valid) {
      // Create assignments object
      names.forEach((name, index) => {
        assignments[name] = shuffled[index];
      });
      return assignments;
    }

    attempts++;
  }

  // Fallback: if we can't find a valid shuffle after max attempts,
  // try one more time with a different approach
  const shuffled = [...names];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  // Force fix any self-assignments
  names.forEach((name, index) => {
    if (name === shuffled[index]) {
      // Swap with next person (wrapping around)
      const nextIndex = (index + 1) % shuffled.length;
      [shuffled[index], shuffled[nextIndex]] = [
        shuffled[nextIndex],
        shuffled[index],
      ];
    }
    assignments[name] = shuffled[index];
  });

  return assignments;
}
