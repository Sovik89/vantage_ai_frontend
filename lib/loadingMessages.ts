export const getATSLoadingMessage = () => {
  const messages = [
    "🔍 Analyzing resumes with the precision of a hiring manager who's had their morning coffee...",
    "🎯 Matching skills faster than a recruiter can say 'years of experience'...",
    "📄 Reading through resumes quicker than someone updating their LinkedIn after getting a new job...",
    "💼 Processing applications with more care than a candidate formatting their resume...",
    "🤖 Teaching our AI to read resumes better than a recruiter on their fifth cup of coffee...",
    "🎮 Leveling up your candidate search like a pro gamer...",
    "🧩 Putting together the perfect candidate puzzle...",
    "📊 Crunching numbers faster than candidates calculating their desired salary...",
    "🎭 Screening resumes more thoroughly than an actor preparing for a role...",
    "🎨 Crafting insights like an artist perfecting their masterpiece..."
  ];
  return messages[Math.floor(Math.random() * messages.length)];
};

export const getSentimentLoadingMessage = () => {
  const messages = [
    "🎭 Analyzing emotions with more depth than a Shakespeare play...",
    "📊 Processing feedback with the care of a therapist in session...",
    "🎯 Finding insights sharper than a detective's intuition...",
    "🌟 Mining for meaningful patterns like a star gazer finding constellations...",
    "🎨 Painting a picture of employee sentiment with all the colors of feedback...",
    "🧩 Putting together the feedback puzzle, one piece at a time...",
    "🔍 Reading between the lines better than an English professor...",
    "💭 Understanding feelings deeper than a poet writing about love...",
    "📈 Tracking sentiment trends like a meteorologist tracking weather patterns...",
    "🎵 Harmonizing feedback like a conductor leading an orchestra..."
  ];
  return messages[Math.floor(Math.random() * messages.length)];
};