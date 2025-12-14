/**
 * Echoless Category Taxonomy
 * Based on user requirements.
 */
const CATEGORIES = {
  'AI': ['artificial intelligence', 'llm', 'gpt', 'neural network', 'machine learning', 'openai', 'anthropic', 'bard', 'gemini'],
  'Cybersecurity': ['cybersecurity', 'hacker', 'exploit', 'malware', 'ransomware', 'security patch', 'zero-day'],
  'Consumer Electronics': ['iphone', 'samsung', 'pixel', 'laptop', 'macbook', 'gadget', 'smartwatch', 'consumer electronics'],
  'Software & Apps': ['app', 'software', 'ios', 'android', 'windows', 'macos', 'linux', 'saas'],
  'Cloud & Big Data': ['cloud', 'aws', 'azure', 'google cloud', 'big data', 'serverless', 'data center'],
  'Gaming': ['gaming', 'xbox', 'playstation', 'nintendo', 'steam', 'gpu', 'nvidia', 'rtx'],
  'Space Tech': ['space', 'nasa', 'spacex', 'rocket', 'mars', 'moon', 'satellite'],
  'Green Tech': ['green tech', 'renewable', 'solar', 'ev', 'tesla', 'electric vehicle', 'climate'],
  'Emerging Tech': ['quantum', 'iot', 'ar/vr', 'augmented reality', 'virtual reality', 'robotics'],
  'Coding': ['programming', 'javascript', 'python', 'react', 'developer', 'code']
};

export const categorizeArticle = (text) => {
  const normalizedText = text.toLowerCase();
  const matchedCategories = new Set();

  for (const [category, keywords] of Object.entries(CATEGORIES)) {
    if (keywords.some(keyword => normalizedText.includes(keyword))) {
      matchedCategories.add(category);
    }
  }

  // logical defaults
  if (matchedCategories.size === 0) {
    matchedCategories.add('General Tech');
  }

  return Array.from(matchedCategories);
};
