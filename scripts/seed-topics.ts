#!/usr/bin/env ts-node

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
  // ... (rest of the topics unchanged) ...
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