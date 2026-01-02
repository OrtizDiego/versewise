"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DictionaryDefinition } from "@/lib/bible-data";

interface LexiconModalProps {
    word: string | null;
    definitions: DictionaryDefinition[] | null;
    isLoading: boolean;
    isOpen: boolean;
    onClose: () => void;
}

export function LexiconModal({ word, definitions, isLoading, isOpen, onClose }: LexiconModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md max-h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold font-headline">{word}</DialogTitle>
                    <DialogDescription>
                        Lexicon Definition (LSJ)
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-hidden mt-2">
                    <ScrollArea className="h-full pr-4">
                        {isLoading ? (
                            <div className="space-y-4 animate-pulse">
                                <div className="h-4 bg-muted rounded w-3/4"></div>
                                <div className="h-4 bg-muted rounded w-full"></div>
                                <div className="h-4 bg-muted rounded w-5/6"></div>
                            </div>
                        ) : definitions ? (
                            <div className="space-y-6">
                                {definitions.map((def, idx) => (
                                    <div key={idx} className="space-y-2 border-b border-border pb-4 last:border-0">
                                        <div className="flex gap-2 items-baseline flex-wrap">
                                            <span className="font-bold text-lg font-serif">{def.lexeme}</span>
                                            {def.transliteration && <span className="text-muted-foreground italic">({def.transliteration})</span>}
                                        </div>
                                        {def.short_definition && (
                                            <div className="font-medium text-primary">{def.short_definition}</div>
                                        )}
                                        <div
                                            className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground"
                                            dangerouslySetInnerHTML={{ __html: def.definition }}
                                        />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center text-muted-foreground py-8">
                                No definition found for this word.
                            </div>
                        )}
                    </ScrollArea>
                </div>
            </DialogContent>
        </Dialog>
    );
}
