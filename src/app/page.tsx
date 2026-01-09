"use client";

import * as React from "react";
import { BookOpen, Search, MessageSquare } from "lucide-react";
import { VerseWiseLogo } from "@/components/icons";

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Tabs,
  TabsContent,
} from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BibleViewer } from "@/components/bible-viewer";
import { BibleSearch, BibleSearchPassage } from "@/components/bible-search";
import { AiAssistant } from "@/components/ai-assistant";
import { useIsMobile } from "@/hooks/use-mobile";
import { ThemeToggle } from "@/components/theme-toggle";

export type BibleLocation = {
  book: string;
  chapter: number;
  verse: number;
};

export default function App() {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = React.useState("bible");
  const [bibleLocation, setBibleLocation] = React.useState<BibleLocation>({
    book: "Genesis",
    chapter: 1,
    verse: 1,
  });
  const [bibleVersion, setBibleVersion] = React.useState("esv");
  const [chatInput, setChatInput] = React.useState("");
  const [sidebarOpen, setSidebarOpen] = React.useState(true);

  const handleNavigateToVerse = (location: BibleLocation | BibleSearchPassage) => {
    const verse = Array.isArray(location.verses) ? location.verses[0] : location.verse ?? 1;
    setBibleLocation({
      book: location.book,
      chapter: location.chapter,
      verse: verse,
    });
    setActiveTab("bible");
  };

  const handleInterpretVerse = (verseRef: string) => {
    setChatInput(`Tell me more about ${verseRef}`);
    setActiveTab("chat");
  };

  const handleVerseLinkClick = (verseRef: string) => {
    const parts = verseRef.match(/(\d*\s?[A-Za-z\s]+)\s(\d+):(\d+)/);
    if (parts) {
      handleNavigateToVerse({ book: parts[1].trim(), chapter: parseInt(parts[2]), verse: parseInt(parts[3]) });
    }
  };

  return (
    <SidebarProvider open={sidebarOpen} onOpenChange={setSidebarOpen} defaultOpen={true}>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <VerseWiseLogo className="size-8 text-primary" />
            <span className="font-headline text-2xl font-bold text-primary">
              VerseWise
            </span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => setActiveTab("bible")}
                isActive={activeTab === "bible"}
                tooltip={isMobile ? "" : "Bible"}
              >
                <BookOpen />
                <span className="font-body">Bible</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => setActiveTab("search")}
                isActive={activeTab === "search"}
                tooltip={isMobile ? "" : "Search"}
              >
                <Search />
                <span className="font-body">Search</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => setActiveTab("chat")}
                isActive={activeTab === "chat"}
                tooltip={isMobile ? "" : "AI Assistant"}
              >
                <MessageSquare />
                <span className="font-body">AI Assistant</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <Separator />
          <div className="flex items-center justify-between p-2">
            <div className="flex items-center gap-2">
              <Avatar className="size-8">
                <AvatarImage src="https://placehold.co/40x40.png" data-ai-hint="user avatar" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
              <span className="font-body text-sm font-medium">Guest User</span>
            </div>
            <ThemeToggle />
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-card px-4 sm:px-6">
          <SidebarTrigger />
          <h1 className="font-headline text-xl font-bold capitalize">{activeTab}</h1>
        </header>
        <main className="flex-1 overflow-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
            <TabsContent value="bible" className="p-4 md:p-6 h-full mt-0">
              <BibleViewer
                location={bibleLocation}
                onVerseClick={handleInterpretVerse}
                setLocation={setBibleLocation}
                version={bibleVersion}
                setVersion={setBibleVersion}
              />
            </TabsContent>
            <TabsContent value="search" className="p-4 md:p-6 h-full mt-0">
              <BibleSearch onResultClick={handleNavigateToVerse} />
            </TabsContent>
            <TabsContent value="chat" className="p-4 md:p-6 h-full mt-0">
              <AiAssistant
                initialInput={chatInput}
                onVerseLinkClick={handleVerseLinkClick}
              />
            </TabsContent>
          </Tabs>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
