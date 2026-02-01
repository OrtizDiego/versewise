
import {
    stripHebrewVowels,
    getHebrewCandidates,
    BIBLE_BOOKS,
    BIBLE_CHAPTER_COUNTS,
    getChaptersForBook,
    getDefinition
} from './bible-data';

describe('Bible Data Logic', () => {
    describe('getDefinition', () => {
        const originalFetch = global.fetch;

        beforeEach(() => {
            global.fetch = jest.fn(() =>
                Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve([]),
                })
            ) as jest.Mock;
        });

        afterEach(() => {
            global.fetch = originalFetch;
        });

        it('should use BDBT dictionary for Hebrew words', async () => {
            // "Light" in Hebrew
            const hebrewWord = "אור";
            await getDefinition(hebrewWord);
            
            // Should verify that we are calling BDBT (Brown-Driver-Briggs Thayer) 
            // instead of BDB which is not available via API
            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining("/dictionary-definition/BDBT/")
            );
        });

        it('should use BDBT dictionary for Greek words', async () => {
            // "Logos" in Greek
            const greekWord = "λόγος";
            await getDefinition(greekWord);
            
            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining("/dictionary-definition/BDBT/")
            );
        });
    });

    describe('stripHebrewVowels', () => {
        it('should remove vowels and cantillation marks', () => {
            const withVowels = "בְּרֵאשִׁית"; // Bereshit with vowels
            const withoutVowels = "בראשית";
            expect(stripHebrewVowels(withVowels)).toBe(withoutVowels);
        });

        it('should leave non-Hebrew text alone', () => {
            expect(stripHebrewVowels("Hello")).toBe("Hello");
        });
    });

    describe('getHebrewCandidates', () => {
        it('should return original word', () => {
            const candidates = getHebrewCandidates("שלום");
            expect(candidates).toContain("שלום");
        });

        it('should handle prefixes', () => {
            // Ve-Ha-Arets -> "And The Earth"
            // Hebrew: והארץ
            const candidates = getHebrewCandidates("והארץ");

            // Expecting:
            // 1. והארץ (Original clean)
            // 2. הארץ (HaArets - Strip 'Ve' ו)
            // 3. ארץ (Arets - Strip 'VeHa' וה)

            expect(candidates).toContain("והארץ");
            expect(candidates).toContain("הארץ");
            expect(candidates).toContain("ארץ");
        });
    });

    describe('Bible Metadata', () => {
        it('should have 66 books', () => {
            expect(BIBLE_BOOKS.length).toBe(66);
        });

        it('Genesis should have 50 chapters', () => {
            expect(BIBLE_CHAPTER_COUNTS['Genesis']).toBe(50);
        });

        it('getChaptersForBook should return correct array', () => {
            const chapters = getChaptersForBook('Ruth');
            expect(chapters).toEqual([1, 2, 3, 4]);
        });
    });
});
