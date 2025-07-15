#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });
const connectDB = require('../src/lib/database').default;
const BillTopic = require('../src/models/BillTopic').default;

const topics = [
  {
    name: 'Environment & Climate',
    emoji: '🌱',
    category: 'Environment',
    keywords: ['environment', 'climate', 'pollution', 'clean air', 'clean water', 'emissions', 'renewable', 'solar', 'wind', 'carbon', 'greenhouse', 'conservation', 'wildlife', 'parks', 'forest', 'ocean', 'marine', 'fishing', 'agriculture', 'farming'],
    description: 'Bills related to environmental protection, climate change, and natural resources'
  },
  {
    name: 'Healthcare & Medicine',
    emoji: '🏥',
    category: 'Healthcare',
    keywords: ['health', 'medical', 'healthcare', 'medicine', 'drug', 'pharmaceutical', 'insurance', 'medicare', 'medicaid', 'hospital', 'doctor', 'patient', 'treatment', 'disease', 'vaccine', 'mental health', 'addiction', 'opioid'],
    description: 'Bills related to healthcare, medical research, and public health'
  },
  {
    name: 'Education & Schools',
    emoji: '🎓',
    category: 'Education',
    keywords: ['education', 'school', 'student', 'teacher', 'university', 'college', 'loan', 'financial aid', 'curriculum', 'testing', 'charter', 'public school', 'private school', 'higher education', 'vocational', 'training'],
    description: 'Bills related to education, schools, and student support'
  },
  {
    name: 'Economy & Jobs',
    emoji: '💼',
    category: 'Economy',
    keywords: ['economy', 'job', 'employment', 'unemployment', 'business', 'trade', 'tariff', 'tax', 'revenue', 'budget', 'deficit', 'inflation', 'recession', 'stimulus', 'small business', 'entrepreneur', 'workforce'],
    description: 'Bills related to economic policy, jobs, and business regulation'
  },
  {
    name: 'Immigration & Border',
    emoji: '🛂',
    category: 'Immigration',
    keywords: ['immigration', 'border', 'visa', 'citizenship', 'deportation', 'asylum', 'refugee', 'migration', 'undocumented', 'daca', 'dreamers', 'border security', 'customs'],
    description: 'Bills related to immigration policy and border security'
  },
  {
    name: 'Defense & Military',
    emoji: '🛡️',
    category: 'Defense',
    keywords: ['defense', 'military', 'veteran', 'armed forces', 'navy', 'army', 'air force', 'marine', 'weapon', 'nuclear', 'missile', 'cybersecurity', 'intelligence', 'veterans affairs', 'benefits'],
    description: 'Bills related to national defense, military, and veterans'
  },
  {
    name: 'Technology & Innovation',
    emoji: '💻',
    category: 'Technology',
    keywords: ['technology', 'tech', 'internet', 'digital', 'cyber', 'artificial intelligence', 'ai', 'blockchain', 'cryptocurrency', 'social media', 'privacy', 'data', 'algorithm', 'automation', 'innovation'],
    description: 'Bills related to technology, innovation, and digital policy'
  },
  {
    name: 'Transportation & Infrastructure',
    emoji: '🚗',
    category: 'Infrastructure',
    keywords: ['transportation', 'infrastructure', 'road', 'highway', 'bridge', 'rail', 'transit', 'airport', 'port', 'vehicle', 'electric vehicle', 'ev', 'charging', 'public transit', 'amtrak'],
    description: 'Bills related to transportation and infrastructure projects'
  },
  {
    name: 'Housing & Real Estate',
    emoji: '🏠',
    category: 'Housing',
    keywords: ['housing', 'home', 'mortgage', 'rent', 'landlord', 'tenant', 'real estate', 'property', 'affordable housing', 'homeless', 'fha', 'fannie mae', 'freddie mac'],
    description: 'Bills related to housing policy and real estate'
  },
  {
    name: 'Criminal Justice & Law',
    emoji: '⚖️',
    category: 'Justice',
    keywords: ['criminal', 'justice', 'law', 'police', 'prison', 'jail', 'sentencing', 'reform', 'civil rights', 'discrimination', 'hate crime', 'domestic violence', 'gun', 'firearm', 'second amendment'],
    description: 'Bills related to criminal justice, law enforcement, and civil rights'
  },
  {
    name: 'Energy & Utilities',
    emoji: '⚡',
    category: 'Energy',
    keywords: ['energy', 'electric', 'power', 'grid', 'utility', 'oil', 'gas', 'fossil fuel', 'renewable energy', 'solar', 'wind', 'nuclear', 'coal', 'pipeline', 'fracking'],
    description: 'Bills related to energy policy and utilities'
  },
  {
    name: 'Finance & Banking',
    emoji: '🏦',
    category: 'Finance',
    keywords: ['finance', 'banking', 'bank', 'credit', 'loan', 'mortgage', 'investment', 'securities', 'wall street', 'federal reserve', 'fdic', 'consumer protection', 'financial regulation'],
    description: 'Bills related to financial services and banking regulation'
  },
  {
    name: 'Social Security & Retirement',
    emoji: '👴',
    category: 'Social Services',
    keywords: ['social security', 'retirement', 'pension', 'medicare', 'medicaid', 'elderly', 'senior', 'aging', 'disability', 'benefits', 'ssi', 'ssdi'],
    description: 'Bills related to social security, retirement, and elderly benefits'
  },
  {
    name: 'Food & Agriculture',
    emoji: '🌾',
    category: 'Agriculture',
    keywords: ['food', 'agriculture', 'farming', 'farm', 'crop', 'livestock', 'dairy', 'subsidy', 'organic', 'gmo', 'pesticide', 'fertilizer', 'rural', 'usda'],
    description: 'Bills related to agriculture, farming, and food policy'
  },
  {
    name: 'Foreign Policy & Trade',
    emoji: '🌍',
    category: 'Foreign Affairs',
    keywords: ['foreign', 'international', 'trade', 'tariff', 'diplomacy', 'sanction', 'embargo', 'treaty', 'alliance', 'nato', 'united nations', 'global', 'china', 'russia', 'mexico', 'canada'],
    description: 'Bills related to foreign policy and international trade'
  },
  {
    name: 'Other',
    emoji: '📋',
    category: 'General',
    keywords: ['other', 'general', 'miscellaneous'],
    description: 'General bills that don\'t fit into specific categories'
  }
];

async function seedTopics() {
  try {
    console.log('Connecting to database...');
    await connectDB();
    console.log('Database connected successfully');

    console.log('Seeding bill topics...');
    
    for (const topic of topics) {
      const existing = await BillTopic.findOne({ name: topic.name });
      if (existing) {
        console.log(`Topic "${topic.name}" already exists, skipping...`);
        continue;
      }

      const newTopic = new BillTopic(topic);
      await newTopic.save();
      console.log(`✅ Created topic: ${topic.emoji} ${topic.name}`);
    }

    console.log('\n🎉 Bill topics seeded successfully!');
    console.log(`Total topics: ${topics.length}`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding topics:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  seedTopics();
}

module.exports = { seedTopics }; 