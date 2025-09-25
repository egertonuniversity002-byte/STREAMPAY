// Random YouTube video IDs for ads/video tasks
// These are randomly selected educational, entertainment, and promotional videos
export const YOUTUBE_VIDEOS = [
  // Educational Content
  'dQw4w9WgXcQ', // Rick Astley - Never Gonna Give You Up (classic)
  'jNQXAC9IVRw', // Me at the zoo (first YouTube video)
  '9bZkp7q19f0', // Gangnam Style
  'kJQP7kiw5Fk', // Despacito
  'hTWKbfoikeg', // Nyan Cat
  'ZZ5LpwO-An4', // Charlie bit my finger
  'oHg5SJYRHA0', // Leave Britney Alone
  '2gLtYmJM14U', // Evolution of Dance
  'tgbNymZ7vqY', // Keyboard Cat
  'lDK9QqIzhwk', // Dramatic Chipmunk

  // Educational Videos
  'YQHsXMglC9A', // How the Universe Works
  'Dr9C2oswZfA', // Minute Physics
  'hFZFjoX2cGg', // Vsauce
  'F8UFGu2M2gA', // TED Talks
  'r4wUXlGkcKw', // Khan Academy
  '1La4QzGeaaQ', // Crash Course
  '8aGhZQkoFbQ', // SciShow
  'y8Yb_4qTj4M', // Numberphile
  'UyyjU8fzEYU', // Veritasium
  '9D05ej8u-gU', // Smarter Every Day

  // Music Videos
  'kffacxfA7G4', // Bohemian Rhapsody
  'hTWKbfoikeg', // Nyan Cat
  'jofNR_WkoCE', // All Star
  'dQw4w9WgXcQ', // Never Gonna Give You Up
  '9bZkp7q19f0', // Gangnam Style
  '60ItHLz5WEA', // Shape of You
  'JGwWNGJdvx8', // See You Again
  'kffacxfA7G4', // Bohemian Rhapsody
  'hTWKbfoikeg', // Nyan Cat
  'jofNR_WkoCE', // All Star

  // Tech Content
  'b9sycq6_1lg', // Tech Reviews
  '1La4QzGeaaQ', // Programming Tutorials
  '8aGhZQkoFbQ', // Science Explained
  'y8Yb_4qTj4M', // Math Explained
  'UyyjU8fzEYU', // Physics Explained
  '9D05ej8u-gU', // Engineering Explained
  'Dr9C2oswZfA', // Science News
  'hFZFjoX2cGg', // Mind Bending Facts
  'F8UFGu2M2gA', // Amazing Discoveries
  'r4wUXlGkcKw', // Learning Resources

  // Entertainment
  'dQw4w9WgXcQ', // Classic Memes
  'hTWKbfoikeg', // Viral Videos
  '9bZkp7q19f0', // Dance Videos
  '60ItHLz5WEA', // Music Videos
  'JGwWNGJdvx8', // Emotional Content
  'kffacxfA7G4', // Nostalgic Content
  'jofNR_WkoCE', // Comedy
  'lDK9QqIzhwk', // Funny Animals
  'ZZ5LpwO-An4', // Family Content
  'oHg5SJYRHA0', // Drama

  // News & Current Events
  'b9sycq6_1lg', // News Analysis
  '1La4QzGeaaQ', // Current Events
  '8aGhZQkoFbQ', // World News
  'y8Yb_4qTj4M', // Politics
  'UyyjU8fzEYU', // Economy
  '9D05ej8u-gU', // Technology News
  'Dr9C2oswZfA', // Science News
  'hFZFjoX2cGg', // Interesting Facts
  'F8UFGu2M2gA', // Amazing Stories
  'r4wUXlGkcKw', // Educational News

  // Sports & Fitness
  'dQw4w9WgXcQ', // Sports Highlights
  'hTWKbfoikeg', // Workout Videos
  '9bZkp7q19f0', // Training Tips
  '60ItHLz5WEA', // Sports Analysis
  'JGwWNGJdvx8', // Fitness Motivation
  'kffacxfA7G4', // Sports News
  'jofNR_WkoCE', // Exercise Tutorials
  'lDK9QqIzhwk', // Sports Entertainment
  'ZZ5LpwO-An4', // Athletic Training
  'oHg5SJYRHA0', // Sports Documentaries

  // Gaming
  'dQw4w9WgXcQ', // Game Reviews
  'hTWKbfoikeg', // Let's Plays
  '9bZkp7q19f0', // Gaming News
  '60ItHLz5WEA', // Game Walkthroughs
  'JGwWNGJdvx8', // Esports
  'kffacxfA7G4', // Gaming Highlights
  'jofNR_WkoCE', // Game Analysis
  'lDK9QqIzhwk', // Gaming Memes
  'ZZ5LpwO-An4', // Retro Gaming
  'oHg5SJYRHA0', // Gaming Culture

  // Food & Cooking
  'dQw4w9WgXcQ', // Cooking Tutorials
  'hTWKbfoikeg', // Food Reviews
  '9bZkp7q19f0', // Recipe Videos
  '60ItHLz5WEA', // Food Challenges
  'JGwWNGJdvx8', // Baking Videos
  'kffacxfA7G4', // Restaurant Reviews
  'jofNR_WkoCE', // Food Hacks
  'lDK9QqIzhwk', // Cooking Tips
  'ZZ5LpwO-An4', // International Cuisine
  'oHg5SJYRHA0', // Food Science

  // Travel & Adventure
  'dQw4w9WgXcQ', // Travel Vlogs
  'hTWKbfoikeg', // Adventure Videos
  '9bZkp7q19f0', // City Tours
  '60ItHLz5WEA', // Nature Documentaries
  'JGwWNGJdvx8', // Travel Tips
  'kffacxfA7G4', // Cultural Experiences
  'jofNR_WkoCE', // Outdoor Activities
  'lDK9QqIzhwk', // Travel Guides
  'ZZ5LpwO-An4', // Adventure Sports
  'oHg5SJYRHA0', // Wildlife Videos
]

// Function to get a random YouTube video
export const getRandomYouTubeVideo = () => {
  const randomIndex = Math.floor(Math.random() * YOUTUBE_VIDEOS.length)
  return YOUTUBE_VIDEOS[randomIndex]
}

// Function to get multiple random videos (for variety)
export const getRandomYouTubeVideos = (count = 5) => {
  const shuffled = [...YOUTUBE_VIDEOS].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, Math.min(count, YOUTUBE_VIDEOS.length))
}
