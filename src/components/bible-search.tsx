"use client";

import * as React from "react";
import { searchPassages } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import type { FindRelevantPassagesOutput } from "@/ai/flows/find-relevant-passages";
import { Skeleton } from "./ui/skeleton";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";

export type BibleSearchPassage = FindRelevantPassagesOutput[0];

interface BibleSearchProps {
  onResultClick: (passage: BibleSearchPassage) => void;
}

export function BibleSearch({ onResultClick }: BibleSearchProps) {
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<FindRelevantPassagesOutput>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const { toast } = useToast();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;

    setIsLoading(true);
    setResults([]);
    const response = await searchPassages({ query });
    setIsLoading(false);

    if ("error" in response) {
      toast({
        title: "Search Error",
        description: response.error,
        variant: "destructive",
      });
    } else {
      setResults(response);
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="font-headline">Search the Scriptures</CardTitle>
        <CardDescription>
          Find passages related to a topic, question, or keyword.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 flex-1">
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g., love your neighbor"
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Searching..." : "Search"}
          </Button>
        </form>
        <Separator />
        <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full pr-4">
          <div className="space-y-4">
            {isLoading &&
              Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-5 w-1/4" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4 mt-2" />
                  </CardContent>
                </Card>
              ))}
            {results.map((passage, index) => (
              <Card
                key={index}
                className="cursor-pointer hover:border-primary transition-colors"
                onClick={() => onResultClick(passage)}
              >
                <CardHeader>
                  <CardTitle className="font-body text-lg">
                    {passage.book} {passage.chapter}:{passage.verses.join(", ")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-body">{passage.text}</p>
                </CardContent>
              </Card>
            ))}
            {!isLoading && results.length === 0 && (
                <div className="text-center text-muted-foreground pt-12">
                    <p>No search results yet.</p>
                    <p className="text-sm">Enter a query above to begin.</p>
                </div>
            )}
          </div>
        </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}
