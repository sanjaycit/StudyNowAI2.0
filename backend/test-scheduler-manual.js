const { spawn } = require('child_process');
const path = require('path');

const dummyTasks = [
    { _id: '1', difficulty: 'hard', status: 'new', completionPercent: 0, scheduledDate: new Date(Date.now() + 86400000).toISOString() }, // Tomorrow
    { _id: '2', difficulty: 'easy', status: 'learning', completionPercent: 50, scheduledDate: new Date(Date.now() - 86400000).toISOString() }, // Yesterday (Overdue)
    { _id: '3', difficulty: 'medium', status: 'revised', completionPercent: 100, scheduledDate: null }
];

console.log('Testing Python Scheduler with dummy data...');
const scriptPath = path.join(__dirname, 'src/ml/scheduler.py');
const py = spawn('python', [scriptPath]);

let dataString = '';
let errorString = '';

py.stdin.write(JSON.stringify(dummyTasks));
py.stdin.end();

py.stdout.on('data', (data) => dataString += data.toString());
py.stderr.on('data', (data) => errorString += data.toString());

py.on('close', (code) => {
    if (code !== 0) {
        console.error('Python Code:', code);
        console.error('Error:', errorString);
    } else {
        console.log('Success! Output:');
        try {
            const result = JSON.parse(dataString);
            console.log(JSON.stringify(result, null, 2));
        } catch (e) {
            console.error('Invalid JSON:', dataString);
        }
    }
});
