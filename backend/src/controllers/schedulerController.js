const { spawn } = require('child_process');
const path = require('path');
const Topic = require('../models/topicModel');

// @desc    Optimize task schedule using ML
// @route   POST /api/schedule/optimize
// @access  Private
const optimizeSchedule = async (req, res) => {
    try {
        const userId = req.user.id;

        // 1. Fetch all active topics for the user
        const topics = await Topic.find({
            user: userId,
            status: { $ne: 'completed' }
        }).lean(); // lean() for plain JSON objects

        if (!topics || topics.length === 0) {
            return res.status(200).json({ message: 'No tasks to optimize' });
        }

        // 2. Prepare Python Process
        const scriptPath = path.join(__dirname, '../ml/scheduler.py');
        const pythonProcess = spawn('python', [scriptPath]);

        let dataString = '';
        let errorString = '';

        // 3. Send data to Python script
        pythonProcess.stdin.write(JSON.stringify(topics));
        pythonProcess.stdin.end();

        // 4. Collect Output
        pythonProcess.stdout.on('data', (data) => {
            dataString += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            errorString += data.toString();
        });

        pythonProcess.on('close', async (code) => {
            if (code !== 0) {
                console.error(`Python script exited with code ${code}`);
                console.error(`Error details: ${errorString}`);
                return res.status(500).json({ message: 'ML Optimization failed', error: errorString });
            }

            try {
                const optimizedTasks = JSON.parse(dataString);

                // 5. Update Priorities in DB
                const bulkOps = optimizedTasks.map(task => ({
                    updateOne: {
                        filter: { _id: task._id },
                        update: { $set: { priorityScore: task.priorityScore } }
                    }
                }));

                if (bulkOps.length > 0) {
                    await Topic.bulkWrite(bulkOps);
                }

                res.status(200).json({
                    success: true,
                    message: `Optimized ${optimizedTasks.length} tasks`,
                    tasks: optimizedTasks
                });

            } catch (err) {
                console.error('Error parsing Python output:', err);
                res.status(500).json({ message: 'Failed to parse ML results' });
            }
        });

    } catch (error) {
        console.error('Error in schedule optimization:', error);
        res.status(500).json({ message: 'Server error during optimization' });
    }
};

module.exports = {
    optimizeSchedule
};
