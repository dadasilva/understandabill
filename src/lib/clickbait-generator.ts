export function generateClickbaitTitle(originalTitle: string, summary: string, topic?: string): string {
  // Extract key words and concepts
  const title = originalTitle.toLowerCase();
  const summaryText = summary.toLowerCase();
  
  // Common clickbait patterns
  const patterns = [
    // Shocking/Controversial patterns
    { keywords: ['ban', 'prohibit', 'restrict', 'outlaw'], template: '🚫 Congress Just Banned {subject}' },
    { keywords: ['tax', 'taxes', 'taxation'], template: '💰 New Tax Law Will {action}' },
    { keywords: ['fund', 'funding', 'money', 'billion', 'million'], template: '💸 {amount} Billions for {subject}' },
    { keywords: ['health', 'medical', 'healthcare'], template: '🏥 Major Healthcare Change: {subject}' },
    { keywords: ['education', 'school', 'student'], template: '🎓 Education Reform: {subject}' },
    { keywords: ['environment', 'climate', 'pollution'], template: '🌍 Environmental Law: {subject}' },
    { keywords: ['immigration', 'border', 'visa'], template: '🛂 Immigration Policy: {subject}' },
    { keywords: ['gun', 'firearm', 'weapon'], template: '🔫 Gun Law Update: {subject}' },
    { keywords: ['drug', 'marijuana', 'cannabis'], template: '💊 Drug Policy Change: {subject}' },
    { keywords: ['privacy', 'data', 'surveillance'], template: '🔒 Privacy Law: {subject}' },
    { keywords: ['internet', 'tech', 'digital'], template: '💻 Tech Regulation: {subject}' },
    { keywords: ['veteran', 'military', 'defense'], template: '🎖️ Military Bill: {subject}' },
    { keywords: ['senior', 'elderly', 'aging'], template: '👴 Senior Care Law: {subject}' },
    { keywords: ['child', 'youth', 'minor'], template: '👶 Child Protection Law: {subject}' },
    { keywords: ['worker', 'employment', 'labor'], template: '👷 Worker Rights: {subject}' },
    { keywords: ['small business', 'entrepreneur'], template: '🏢 Small Business Law: {subject}' },
    { keywords: ['transportation', 'road', 'highway'], template: '🚗 Transportation Bill: {subject}' },
    { keywords: ['energy', 'renewable', 'solar', 'wind'], template: '⚡ Energy Policy: {subject}' },
    { keywords: ['agriculture', 'farm', 'food'], template: '🌾 Agriculture Law: {subject}' },
    { keywords: ['housing', 'home', 'mortgage'], template: '🏠 Housing Law: {subject}' },
    { keywords: ['banking', 'finance', 'bank'], template: '🏦 Banking Regulation: {subject}' },
  ];

  // Find matching pattern
  for (const pattern of patterns) {
    if (pattern.keywords.some(keyword => title.includes(keyword) || summaryText.includes(keyword))) {
      // Extract subject from title or summary
      const subject = extractSubject(title, summaryText);
      
      // Apply template
      let clickbaitTitle = pattern.template.replace('{subject}', subject);
      
      // Add amount if money-related
      if (pattern.template.includes('{amount}')) {
        const amount = extractAmount(title, summaryText);
        clickbaitTitle = clickbaitTitle.replace('{amount}', amount);
      }
      
      // Add action if needed
      if (pattern.template.includes('{action}')) {
        const action = extractAction(title, summaryText);
        clickbaitTitle = clickbaitTitle.replace('{action}', action);
      }
      
      return clickbaitTitle;
    }
  }

  // Fallback patterns based on topic
  if (topic) {
    const topicPatterns: { [key: string]: string } = {
      'Healthcare': '🏥 Major Healthcare Bill Passed',
      'Education': '🎓 Education Reform Bill',
      'Environment': '🌍 Environmental Protection Law',
      'Immigration': '🛂 Immigration Policy Update',
      'Taxes': '💰 Tax Law Changes',
      'Defense': '🎖️ Military Funding Bill',
      'Technology': '💻 Tech Regulation Law',
      'Transportation': '🚗 Transportation Bill',
      'Energy': '⚡ Energy Policy Update',
      'Agriculture': '🌾 Agriculture Law',
      'Housing': '🏠 Housing Policy Bill',
      'Finance': '🏦 Banking Regulation',
      'Labor': '👷 Worker Rights Bill',
      'Privacy': '🔒 Privacy Protection Law',
      'Guns': '🔫 Gun Law Update',
      'Drugs': '💊 Drug Policy Reform',
      'Veterans': '🎖️ Veterans Benefits Bill',
      'Seniors': '👴 Senior Care Law',
      'Children': '👶 Child Protection Bill',
      'Small Business': '🏢 Small Business Law',
    };
    
    if (topicPatterns[topic]) {
      return topicPatterns[topic];
    }
  }

  // Generic fallback
  const genericPatterns = [
    '📋 New Law Just Passed',
    '⚖️ Congress Approves New Bill',
    '📜 Major Legislation Update',
    '🏛️ New Federal Law',
    '📄 Bill Signed Into Law',
    '🎯 Important Policy Change',
    '📊 New Regulation Passed',
    '🔔 Breaking: New Law',
    '📰 Congressional Update',
    '⚡ Policy Change Alert'
  ];
  
  return genericPatterns[Math.floor(Math.random() * genericPatterns.length)];
}

function extractSubject(title: string, summaryText: string): string {
  // Extract key nouns from title
  const words = title.split(' ').filter(word => 
    word.length > 3 && 
    !['the', 'and', 'for', 'with', 'that', 'this', 'will', 'shall', 'have', 'been', 'from', 'into', 'during', 'including', 'until', 'against', 'among', 'throughout', 'despite', 'towards', 'upon'].includes(word.toLowerCase())
  );
  
  if (words.length > 0) {
    // Take the first significant word and capitalize it
    return words[0].charAt(0).toUpperCase() + words[0].slice(1);
  }
  
  // Fallback to topic-based subject
  return 'Important Policy';
}

function extractAmount(title: string, summaryText: string): string {
  // Look for dollar amounts
  const moneyMatch = (title + ' ' + summaryText).match(/\$(\d+(?:\.\d+)?)\s*(billion|million|thousand|trillion)/i);
  if (moneyMatch) {
    return moneyMatch[1] + ' ' + moneyMatch[2];
  }
  
  // Look for just numbers that might be amounts
  const numberMatch = (title + ' ' + summaryText).match(/(\d+(?:\.\d+)?)\s*(billion|million|thousand|trillion)/i);
  if (numberMatch) {
    return numberMatch[1] + ' ' + numberMatch[2];
  }
  
  return 'Billions of';
}

function extractAction(title: string, summaryText: string): string {
  const text = (title + ' ' + summaryText).toLowerCase();
  
  if (text.includes('increase') || text.includes('raise')) return 'Increase Your Taxes';
  if (text.includes('decrease') || text.includes('lower') || text.includes('cut')) return 'Lower Your Taxes';
  if (text.includes('fund') || text.includes('provide')) return 'Fund New Programs';
  if (text.includes('protect') || text.includes('safeguard')) return 'Protect Citizens';
  if (text.includes('regulate') || text.includes('control')) return 'Regulate Industry';
  if (text.includes('support') || text.includes('help')) return 'Support Americans';
  
  return 'Affect You';
} 