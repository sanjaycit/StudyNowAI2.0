const mongoose = require('mongoose');
const Topic = require('./src/models/topicModel');
const User = require('./src/models/userModel');
require('dotenv').config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://sanjay:sanjay123@cluster0.tv0l2.mongodb.net/study-now-ai?retryWrites=true&w=majority&appName=Cluster0');
        console.log('Connected to Mongo');

        // Find the test user
        const user = await User.findOne({ email: 'test@daacs.com' });
        if (!user) {
            console.log('User not found');
            return;
        }

        const topics = await Topic.find({
            user: user._id,
            status: { $ne: 'completed' }
        }).lean();

        console.log(`Found ${topics.length} topics`);

        if (topics.length > 0) {
            const t = topics[topics.length - 1];
            console.log('Sample Topic:', JSON.stringify(t, null, 2));

            // Check prereqs
            const withPrereqs = topics.find(t => t.prerequisites && t.prerequisites.length > 0);
            if (withPrereqs) {
                console.log('Topic with Prereqs:', JSON.stringify(withPrereqs, null, 2));
            } else {
                console.log('NO TOPICS HAVE PREREQUISITES!');
            }
        }

        mongoose.connection.close();
    } catch (e) {
        console.error(e);
    }
};

run();
