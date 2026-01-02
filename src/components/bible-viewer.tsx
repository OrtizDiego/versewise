"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BIBLE_BOOKS, getChaptersForBook, getVersesForChapter, BIBLE_VERSIONS, getGreekVerses, getHebrewVerses, getDefinition, type DictionaryDefinition } from "@/lib/bible-data";
import type { BibleLocation } from "@/app/page";
import { ScrollArea } from "./ui/scroll-area";
import { Skeleton } from "./ui/skeleton";
import { LexiconModal } from "./lexicon-modal";

interface BibleViewerProps {
  location: BibleLocation;
  setLocation: (location: BibleLocation) => void;
  onVerseClick: (verseRef: string, book: string, chapter: number, verse: number) => void;
  version: string;
  setVersion: (version: string) => void;
}

export function BibleViewer({ location, setLocation, onVerseClick, version, setVersion }: BibleViewerProps) {
  const [chapters, setChapters] = React.useState<number[]>([]);
  const [verses, setVerses] = React.useState<string[]>([]);
  const [greekVerses, setGreekVerses] = React.useState<string[]>([]);
  const [hebrewVerses, setHebrewVerses] = React.useState<string[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isGreekLoading, setIsGreekLoading] = React.useState(false);
  const [isHebrewLoading, setIsHebrewLoading] = React.useState(false);
  const [isGreekOpen, setIsGreekOpen] = React.useState(false);

  // Lexicon Modal State
  const [selectedWord, setSelectedWord] = React.useState<string | null>(null);
  const [definitions, setDefinitions] = React.useState<DictionaryDefinition[] | null>(null);
  const [isLexiconLoading, setIsLexiconLoading] = React.useState(false);

  const verseRefs = React.useRef<Array<HTMLDivElement | null>>([]);

  React.useEffect(() => {
    const newChapters = getChaptersForBook(location.book);
    setChapters(newChapters);
    if (location.chapter > newChapters.length && newChapters.length > 0) {
      setLocation({ ...location, chapter: 1, verse: 1 });
    }
  }, [location.book, location.chapter, setLocation]);

  React.useEffect(() => {
    const fetchVerses = async () => {
      if (!location.book || !location.chapter) return;
      setIsLoading(true);
      const newVerses = await getVersesForChapter(location.book, location.chapter, version);
      setVerses(newVerses);
      if (location.verse > newVerses.length) {
        setLocation({ ...location, verse: 1 });
      }
      setIsLoading(false);
    };
    fetchVerses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.book, location.chapter, version]);

  // Fetch Greek verses when enabled or location changes
  React.useEffect(() => {
    const fetchGreek = async () => {
      if (!isGreekOpen || !location.book || !location.chapter) return;
      setIsGreekLoading(true);
      const newVerses = await getGreekVerses(location.book, location.chapter);
      setGreekVerses(newVerses);
      setIsGreekLoading(false);
    };
    fetchGreek();
  }, [isGreekOpen, location.book, location.chapter]);

  // Fetch Hebrew verses for OT
  React.useEffect(() => {
    const fetchHebrew = async () => {
      const bookIndex = BIBLE_BOOKS.indexOf(location.book);
      // 0-38 is OT
      if (!isGreekOpen || !location.book || !location.chapter || bookIndex >= 39) {
        setHebrewVerses([]);
        return;
      }
      setIsHebrewLoading(true);
      const newVerses = await getHebrewVerses(location.book, location.chapter);
      setHebrewVerses(newVerses);
      setIsHebrewLoading(false);
    };
    fetchHebrew();
  }, [isGreekOpen, location.book, location.chapter]);

  React.useEffect(() => {
    // Only scroll if not loading and the verse exists.
    if (!isLoading) {
      const verseElement = verseRefs.current[location.verse - 1];
      if (verseElement) {
        verseElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [location.verse, isLoading, isGreekOpen]);

  // Handle word click for lexicon
  const handleWordClick = async (e: React.MouseEvent, word: string) => {
    e.stopPropagation(); // Prevent verse selection
    setSelectedWord(word);
    setIsLexiconLoading(true);
    const defs = await getDefinition(word);
    setDefinitions(defs);
    setIsLexiconLoading(false);
  };

  const closeLexicon = () => {
    setSelectedWord(null);
    setDefinitions(null);
  };

  const handleBookChange = (book: string) => {
    setLocation({ book, chapter: 1, verse: 1 });
  };

  const handleChapterChange = (chapter: string) => {
    setLocation({ ...location, chapter: parseInt(chapter), verse: 1 });
  };

  // Decide which Greek version name to display
  const bookIndex = BIBLE_BOOKS.indexOf(location.book);
  const isOT = bookIndex < 39;
  const greekLabel = isOT ? "Septuagint" : "Greek NT";

  // Decide grid layout
  const gridClass = isGreekOpen
    ? (isOT ? "grid grid-cols-3 gap-8" : "grid grid-cols-2 gap-8")
    : "";

  return (
    <div className="flex h-full flex-col gap-4">
      <LexiconModal
        word={selectedWord}
        definitions={definitions}
        isLoading={isLexiconLoading}
        isOpen={!!selectedWord}
        onClose={closeLexicon}
      />
      <div className="flex-none">
        <div className="flex gap-2 flex-wrap justify-center items-center">
          <Select value={version} onValueChange={setVersion}>
            <SelectTrigger className="w-auto sm:w-[180px] h-9">
              <SelectValue placeholder="Select a version" />
            </SelectTrigger>
            <SelectContent>
              {BIBLE_VERSIONS.map((v) => (
                <SelectItem key={v.id} value={v.id}>
                  {v.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={location.book} onValueChange={handleBookChange}>
            <SelectTrigger className="w-auto sm:w-[160px] h-9">
              <SelectValue placeholder="Select a book" />
            </SelectTrigger>
            <SelectContent>
              {BIBLE_BOOKS.map((book) => (
                <SelectItem key={book} value={book}>
                  {book}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={location.chapter.toString()}
            onValueChange={handleChapterChange}
          >
            <SelectTrigger className="w-auto sm:w-[90px] h-9">
              <SelectValue placeholder="Ch." />
            </SelectTrigger>
            <SelectContent>
              {chapters.map((chapter) => (
                <SelectItem key={chapter} value={chapter.toString()}>
                  {chapter}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <button
            onClick={() => setIsGreekOpen(!isGreekOpen)}
            className={`px-3 h-9 rounded-md border text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground ${isGreekOpen ? "bg-primary text-primary-foreground underline" : "bg-transparent border-input"
              }`}
          >
            Greek/Hebrew
          </button>
        </div>
      </div>

      <Card className="flex-1 flex flex-col min-w-0">
        <CardHeader className={isGreekOpen ? `${gridClass} pb-2` : "pb-2"}>
          <CardTitle className="font-headline text-2xl font-bold">
            {location.book} {location.chapter}
          </CardTitle>
          {isGreekOpen && (
            <CardTitle className="font-headline text-2xl font-bold">
              {greekLabel}
            </CardTitle>
          )}
          {isGreekOpen && isOT && (
            <CardTitle className="font-headline text-2xl font-bold">
              Hebrew (WLC)
            </CardTitle>
          )}
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden pt-0">
          <ScrollArea className="h-full pr-4">
            <div className="space-y-4 font-body text-lg leading-relaxed pt-4">
              {isLoading
                ? Array.from({ length: 15 }).map((_, i) => (
                  <div key={i} className="flex gap-2 items-start p-2">
                    <Skeleton className="h-4 w-6 mt-1" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-5/6" />
                    </div>
                  </div>
                ))
                : verses.map((text, index) => {
                  const verseNumber = index + 1;
                  const greekText = isGreekOpen && greekVerses[index] ? greekVerses[index] : "";
                  const hebrewText = isGreekOpen && isOT && hebrewVerses[index] ? hebrewVerses[index] : "";

                  return (
                    <div key={verseNumber} className={isGreekOpen ? `${gridClass} border-b border-border/40 py-4 first:pt-0 last:border-0` : ""}>
                      {/* English Verse */}
                      <div
                        ref={(el) => { verseRefs.current[index] = el; }}
                        className={`group p-2 rounded-md transition-colors duration-300 cursor-pointer ${!isGreekOpen ? "hover:bg-accent" : ""}`}
                        onClick={() => onVerseClick(`${location.book} ${location.chapter}:${verseNumber}`, location.book, location.chapter, verseNumber)}
                      >
                        <sup className="mr-2 font-semibold text-primary">{verseNumber}</sup>
                        <span className={!isGreekOpen ? "group-hover:text-primary" : ""}>
                          {text}
                        </span>
                      </div>

                      {/* Greek Verse */}
                      {isGreekOpen && (
                        <div
                          className="p-2 rounded-md transition-colors duration-300 cursor-pointer hover:bg-accent"
                          onClick={() => onVerseClick(`${location.book} ${location.chapter}:${verseNumber}`, location.book, location.chapter, verseNumber)}
                        >
                          {isGreekLoading ? (
                            <div className="space-y-2">
                              <Skeleton className="h-4 w-full" />
                              <Skeleton className="h-4 w-5/6" />
                            </div>
                          ) : (
                            <>
                              <sup className="mr-2 font-semibold text-primary">{verseNumber}</sup>
                              <span>
                                {greekText.split(' ').map((word, wIdx) => (
                                  <span
                                    key={wIdx}
                                    className="hover:text-primary hover:underline hover:decoration-primary cursor-pointer decoration-dotted underline-offset-4 decoration-2"
                                    onClick={(e) => handleWordClick(e, word)}
                                  >
                                    {word}{' '}
                                  </span>
                                ))}
                              </span>
                            </>
                          )}
                        </div>
                      )}

                      {/* Hebrew Verse */}
                      {isGreekOpen && isOT && (
                        <div
                          dir="rtl"
                          className="p-2 rounded-md transition-colors duration-300 cursor-pointer hover:bg-accent font-serif text-xl"
                          onClick={() => onVerseClick(`${location.book} ${location.chapter}:${verseNumber}`, location.book, location.chapter, verseNumber)}
                        >
                          {isHebrewLoading ? (
                            <div className="space-y-2">
                              <Skeleton className="h-4 w-full" />
                              <Skeleton className="h-4 w-5/6" />
                            </div>
                          ) : (
                            <>
                              <sup className="ml-2 font-semibold text-primary">{verseNumber}</sup>
                              <span>
                                {hebrewText.split(' ').map((word, wIdx) => (
                                  <span
                                    key={wIdx}
                                    className="hover:text-primary hover:underline hover:decoration-primary cursor-pointer decoration-dotted underline-offset-4 decoration-2"
                                    onClick={(e) => handleWordClick(e, word)}
                                  >
                                    {word}{' '}
                                  </span>
                                ))}
                              </span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
