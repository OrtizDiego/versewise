export const BIBLE_BOOKS = [
  "Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy",
  "Joshua", "Judges", "Ruth", "1 Samuel", "2 Samuel", "1 Kings", "2 Kings",
  "1 Chronicles", "2 Chronicles", "Ezra", "Nehemiah", "Esther", "Job",
  "Psalms", "Proverbs", "Ecclesiastes", "Song of Solomon", "Isaiah",
  "Jeremiah", "Lamentations", "Ezekiel", "Daniel", "Hosea", "Joel",
  "Amos", "Obadiah", "Jonah", "Micah", "Nahum", "Habakkuk", "Zephaniah",
  "Haggai", "Zechariah", "Malachi", "Matthew", "Mark", "Luke", "John",
  "Acts", "Romans", "1 Corinthians", "2 Corinthians", "Galatians",
  "Ephesians", "Philippians", "Colossians", "1 Thessalonians",
  "2 Thessalonians", "1 Timothy", "2 Timothy", "Titus", "Philemon",
  "Hebrews", "James", "1 Peter", "2 Peter", "1 John", "2 John", "3 John",
  "Jude", "Revelation"
];

export const BIBLE_CHAPTER_COUNTS: Record<string, number> = {
  "Genesis": 50, "Exodus": 40, "Leviticus": 27, "Numbers": 36, "Deuteronomy": 34,
  "Joshua": 24, "Judges": 21, "Ruth": 4, "1 Samuel": 31, "2 Samuel": 24,
  "1 Kings": 22, "2 Kings": 25, "1 Chronicles": 29, "2 Chronicles": 36,
  "Ezra": 10, "Nehemiah": 13, "Esther": 10, "Job": 42, "Psalms": 150,
  "Proverbs": 31, "Ecclesiastes": 12, "Song of Solomon": 8, "Isaiah": 66,
  "Jeremiah": 52, "Lamentations": 5, "Ezekiel": 48, "Daniel": 12, "Hosea": 14,
  "Joel": 3, "Amos": 9, "Obadiah": 1, "Jonah": 4, "Micah": 7, "Nahum": 3,
  "Habakkuk": 3, "Zephaniah": 3, "Haggai": 2, "Zechariah": 14, "Malachi": 4,
  "Matthew": 28, "Mark": 16, "Luke": 24, "John": 21, "Acts": 28, "Romans": 16,
  "1 Corinthians": 16, "2 Corinthians": 13, "Galatians": 6, "Ephesians": 6,
  "Philippians": 4, "Colossians": 4, "1 Thessalonians": 5, "2 Thessalonians": 3,
  "1 Timothy": 6, "2 Timothy": 4, "Titus": 3, "Philemon": 1, "Hebrews": 13,
  "James": 5, "1 Peter": 5, "2 Peter": 3, "1 John": 5, "2 John": 1,
  "3 John": 1, "Jude": 1, "Revelation": 22
};

export const BIBLE_VERSIONS = [
  { id: 'esv', name: 'English Standard Version' },
  { id: 'rv', name: 'Recovery Version' },
  { id: 'kjv', name: 'King James Version' },
  { id: 'asv', name: 'American Standard Version' },
  { id: 'web', name: 'World English Bible' },
  { id: 'darby', name: 'Darby Bible' },
  { id: 'ylt', name: 'Youngs Literal Translation (NT only)' },
];

export const getChaptersForBook = (book: string): number[] => {
  const numChapters = BIBLE_CHAPTER_COUNTS[book] || 0;
  return Array.from({ length: numChapters }, (_, i) => i + 1);
};

const getVersesForChapterESV = async (book: string, chapter: number): Promise<string[]> => {
  const apiKey = process.env.NEXT_PUBLIC_ESV_API_KEY;
  if (!apiKey) {
    return ["ESV API key is not configured. Please set NEXT_PUBLIC_ESV_API_KEY in your .env.local file."];
  }

  try {
    const response = await fetch(`https://api.esv.org/v3/passage/text/?q=${book}+${chapter}&include-headings=false&include-footnotes=false`,
      {
        headers: {
          'Authorization': `Token ${apiKey}`
        }
      }
    );

    if (!response.ok) {
      return [`Failed to load chapter from ESV. Status: ${response.status}`];
    }

    const data = await response.json();
    if (data.passages && data.passages.length > 0) {
      // The ESV API returns the passage as a single string with verse numbers in brackets.
      // We need to split this into individual verses.
      const passageText = data.passages[0];
      let verses = passageText.trim().split(/\s*\[\d+\]\s*/).filter(Boolean);

      // Remove the first element if it matches the book and chapter (e.g., "Genesis 1")
      const expectedTitle = `${book} ${chapter}`;
      if (verses.length > 0 && verses[0].trim() === expectedTitle) {
        verses = verses.slice(1);
      }
      return verses;
    }
    return ["No content found for this chapter in the ESV translation."];

  } catch (error) {
    console.error("Error fetching ESV data:", error);
    return ["An error occurred while fetching ESV data."];
  }
};

const getVersesForChapterRV = async (book: string, chapter: number): Promise<string[]> => {
  const appid = process.env.NEXT_PUBLIC_RV_APP_ID;
  const token = process.env.NEXT_PUBLIC_RV_TOKEN;

  if (!appid || !token) {
    return ["Recovery Version API credentials are not configured. Please set RV_APP_ID and RV_TOKEN in your .env.local file."];
  }

  try {
    const response = await fetch(`https://api.lsm.org/recver/txo.php?String=${book}.${chapter}&Out=json`,
      {
        headers: {
          'Authorization': `Basic ${btoa(`${appid}:${token}`)}`
        }
      }
    );

    if (!response.ok) {
      return [`Failed to load chapter from Recovery Version. Status: ${response.status}`];
    }

    const data = await response.json();
    if (data.verses && data.verses.length > 0) {
      return data.verses.map((v: { text: string }) => v.text);
    }
    return ["No content found for this chapter in the Recovery Version."];

  } catch (error) {
    console.error("Error fetching Recovery Version data:", error);
    return ["An error occurred while fetching Recovery Version data."];
  }
};

export const getVersesForChapter = async (book: string, chapter: number, version: string = 'kjv'): Promise<string[]> => {
  if (!book || !chapter) return ["Invalid book or chapter."];

  if (version === 'esv') {
    return getVersesForChapterESV(book, chapter);
  }

  if (version === 'rv') {
    return getVersesForChapterRV(book, chapter);
  }

  const supportedByBibleApi = ['kjv', 'web', 'asv', 'darby', 'ylt'];
  if (!supportedByBibleApi.includes(version)) {
    return [`The version '${version}' is not supported by the current default API.`];
  }

  try {
    const response = await fetch(`https://bible-api.com/${book}+${chapter}?translation=${version}`);
    if (!response.ok) {
      return [`Failed to load chapter. Status: ${response.status}`];
    }
    const data = await response.json();

    if (data.error) {
      return [data.error];
    }
    // The API returns verse text with newline characters. Let's replace them with spaces.
    // ... existing code ...
    return data.verses.map((v: { text: string }) => v.text.replace(/(\r\n|\n|\r)/gm, " ").trim());
  } catch (error) {
    console.error("Error fetching Bible data:", error);
    return ["An error occurred while fetching Bible data."];
  }
};

export const getGreekVerses = async (book: string, chapter: number): Promise<string[]> => {
  const bookIndex = BIBLE_BOOKS.indexOf(book);
  if (bookIndex === -1) return ["Invalid book."];

  // Bolls.life uses integers for book IDs (Genesis=1... Revelation=66)
  const bookId = bookIndex + 1;

  // OT (0-38) -> LXX (Septuagint)
  // NT (39-65) -> TR (Textus Receptus)
  // Note: API might have different codes, but assuming 'LXX' and 'TR' based on testing.
  const version = bookIndex < 39 ? 'LXX' : 'TR';

  try {
    const response = await fetch(`https://bolls.life/get-text/${version}/${bookId}/${chapter}/`);
    if (!response.ok) {
      return [`Failed to load Greek text. Status: ${response.status}`];
    }
    const data = await response.json();
    // API returns array of objects { pk, verse, text }
    // We just want the text. They seem to be HTML encoded or unicode.
    // The previous read_url_content showed unicode chars.
    return data.map((v: { text: string }) => v.text);
  } catch (error) {
    console.error("Error fetching Greek data:", error);
    return ["An error occurred while fetching Greek data."];
  }
};

export const getHebrewVerses = async (book: string, chapter: number): Promise<string[]> => {
  const bookIndex = BIBLE_BOOKS.indexOf(book);
  if (bookIndex === -1 || bookIndex >= 39) return []; // Only OT has Hebrew

  // Bolls.life integer ID (Genesis=1)
  const bookId = bookIndex + 1;

  try {
    // WLC is the Westminster Leningrad Codex, standard for Hebrew
    const response = await fetch(`https://bolls.life/get-text/WLC/${bookId}/${chapter}/`);
    if (!response.ok) {
      // If WLC fails, we might try OHB or similar, but let's stick to WLC for now
      return [`Failed to load Hebrew text. Status: ${response.status}`];
    }
    const data = await response.json();
    return data.map((v: { text: string }) => v.text);
  } catch (error) {
    console.error("Error fetching Hebrew data:", error);
    return ["An error occurred while fetching Hebrew data."];
  }
};

export interface DictionaryDefinition {
  definition: string;
  lexeme: string;
  transliteration: string;
  pronunciation: string;
  short_definition: string;
}

// Helper to strip Hebrew vowels/cantillation
const stripHebrewVowels = (word: string) => {
  return word.replace(/[\u0591-\u05C7]/g, "");
};

// Helper to generate potential Hebrew lemmas
const getHebrewCandidates = (word: string): string[] => {
  const candidates = new Set<string>();

  // 1. Original (cleaned of punctuation)
  candidates.add(word);

  // 2. No vowels
  const noVowels = stripHebrewVowels(word);
  candidates.add(noVowels);

  // 3. Strip common prefixes from No-Vowels version
  // Common prefixes: He (Ha-), Vav (Ve-), Bet (Be-), Lamed (Le-), Kaf (Ke-), Mem (Mi-), Shin (She-)
  // Only strip if word is long enough (> 2 chars)
  if (noVowels.length > 2) {
    const prefixes = ['ה', 'ו', 'ב', 'ל', 'כ', 'מ', 'ש'];

    // Single prefix
    prefixes.forEach(p => {
      if (noVowels.startsWith(p)) {
        candidates.add(noVowels.slice(1));
      }
    });

    // Double prefix (e.g. Ve-Ha-...)
    if (noVowels.length > 3) {
      if (noVowels.startsWith('וה')) candidates.add(noVowels.slice(2)); // Ve-Ha
      if (noVowels.startsWith('וב')) candidates.add(noVowels.slice(2)); // Ve-Be
      if (noVowels.startsWith('ול')) candidates.add(noVowels.slice(2)); // Ve-Le
      if (noVowels.startsWith('וכ')) candidates.add(noVowels.slice(2)); // Ve-Ke
    }
  }

  return Array.from(candidates);
};

export const getDefinition = async (word: string): Promise<DictionaryDefinition[] | null> => {
  // Clean punctuation from word
  let cleanWord = word.replace(/[.,;·:?!\(\)«»]/g, '');

  // Detect Hebrew characters range: \u0590-\u05FF
  const isHebrew = /[\u0590-\u05FF]/.test(cleanWord);

  if (!isHebrew) {
    // Greek Lookup (Simple)
    try {
      const response = await fetch(`https://bolls.life/dictionary-definition/LSJ/${cleanWord}/`);
      if (!response.ok) return null;
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) return data as DictionaryDefinition[];
      return null;
    } catch (error) {
      console.error("Error fetching Greek definition:", error);
      return null;
    }
  } else {
    // Hebrew Lookup (Complex)
    const candidates = getHebrewCandidates(cleanWord);

    // Try candidates in order until we get a hit
    for (const candidate of candidates) {
      try {
        const response = await fetch(`https://bolls.life/dictionary-definition/BDB/${candidate}/`);
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data) && data.length > 0) {
            return data as DictionaryDefinition[];
          }
        }
      } catch (ignore) {
        // Continue to next candidate
      }
    }
    return null;
  }
};