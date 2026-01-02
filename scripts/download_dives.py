import os
import ssl
from pytube import YouTube
from youtube_transcript_api import YouTubeTranscriptApi

# --- START OF FIX ---
# This part bypasses the SSL certificate verification.
try:
    _create_unverified_https_context = ssl._create_unverified_context
except AttributeError:
    # Python 2.7.9+ and 3.4+ have this, but older versions may not
    pass
else:
    ssl._create_default_https_context = _create_unverified_https_context
# --- END OF FIX ---


def get_video_id(url):
    """Extracts the video ID from a YouTube URL."""
    return url.split("v=")[1].split("&")[0]

def download_transcripts(video_urls, output_dir="transcripts"):
    """Downloads transcripts for a list of YouTube video URLs."""
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    for url in video_urls:
        try:
            video_id = get_video_id(url)
            
            # Get video title for the filename
            video_title = YouTube(url).title
            # Sanitize the title to create a valid filename
            safe_title = "".join([c for c in video_title if c.isalnum() or c in (' ', '-')]).rstrip()

            transcript_list = YouTubeTranscriptApi.list_transcripts(video_id)
            
            # Find an available transcript
            transcript = transcript_list.find_transcript(['en'])
                
            fetched_transcript = transcript.fetch()
            
            # Save the transcript to a file
            file_path = os.path.join(output_dir, f"{safe_title}.txt")
            with open(file_path, "w", encoding="utf-8") as f:
                for line in fetched_transcript:
                    f.write(f"{line['text']} ") # Write as a single block of text
            
            print(f"✅ Successfully downloaded transcript for: {video_title}")

        except Exception as e:
            print(f"❌ Could not download transcript for {url}: {e}")

if __name__ == "__main__":
    try:
        with open("videos.txt", "r") as f:
            video_links = [line.strip() for line in f.readlines() if line.strip()]
        
        if not video_links:
            print("The 'videos.txt' file is empty. Please add YouTube URLs to it.")
        else:
            download_transcripts(video_links)
            
    except FileNotFoundError:
        print("Error: 'videos.txt' not found. Please create it in the same directory as the script.")