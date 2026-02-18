export const fuzzyMatch = (
  text,
  keyword,
  {
    minWordMatchRatio = 0.8,
  } = {}
) => {
  if (!text || !keyword) return false;

  const cleanText = text.replace(/\s+/g, " ");
  const words = keyword.toUpperCase().split(" ").filter(Boolean);

  let matchedWords = 0;

  for (const word of words) {
    if (word.length < 3) continue;

    
    let maxMatch = 0;

    for (let i = 0; i <= cleanText.length - word.length; i++) {
      const chunk = cleanText.substring(i, i + word.length);

      let match = 0;
      for (let j = 0; j < word.length; j++) {
        if (chunk[j] === word[j]) match++;
      }

      maxMatch = Math.max(maxMatch, match / word.length);
    }

    if (maxMatch >= minWordMatchRatio) {
      matchedWords++;
    }
  }

  return matchedWords >= Math.ceil(words.length / 2);
};