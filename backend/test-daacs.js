const fetch = global.fetch || require('node-fetch'); // Fallback if needed, but Node 18+ has fetch
const BASE_URL = 'http://localhost:5000/api';

const USER_CREDENTIALS = {
    name: 'DAACS Test User',
    email: 'test@daacs.com',
    password: 'test123'
};

async function runTest() {
    console.log('🚀 Starting DAACS Test Script...');

    let token = '';
    let subjectId = '';
    let topicIds = {};

    // 1. Login or Register
    console.log('\n🔒 Authenticating...');
    try {
        let res = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: USER_CREDENTIALS.email, password: USER_CREDENTIALS.password })
        });

        if (res.status === 404) {
            console.log('User not found, registering...');
            res = await fetch(`${BASE_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(USER_CREDENTIALS)
            });
        }

        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        token = data.token;
        console.log('✅ Logged in as:', data.user.email);

    } catch (e) {
        console.error('Authentication failed:', e.message);
        return;
    }

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };

    // 2. Create Subject
    console.log('\n📚 Creating Subject...');
    try {
        // Check if subject exists first or just create new
        const res = await fetch(`${BASE_URL}/subjects`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ name: 'DAACS Mathematics', description: 'Testing Adaptive Scheduler' })
        });
        const data = await res.json();
        // If 400 (already exists) or 201
        if (res.ok) {
            subjectId = data._id;
            console.log('✅ Created Subject:', data.name);
        } else {
            // Assume it might exist, fetch all
            const getRes = await fetch(`${BASE_URL}/subjects`, { headers });
            const subjects = await getRes.json();
            const found = subjects.find(s => s.name === 'DAACS Mathematics');
            if (found) {
                subjectId = found._id;
                console.log('ℹ️  Subject already exists:', found.name);
            } else {
                throw new Error('Failed to create or find subject');
            }
        }
    } catch (e) {
        console.error('Subject creation failed:', e.message);
    }

    // 3. Create Topics with Deadlines and Prerequisites
    console.log('\n📝 Creating/Resetting Topics...');

    // Cleanup old topics for this subject first to avoid duplicates cluttering
    try {
        const getTopics = await fetch(`${BASE_URL}/topics`, { headers });
        const allTopics = await getTopics.json();
        const myTopics = allTopics.filter(t => t.subject._id === subjectId || t.subject === subjectId);

        for (const t of myTopics) {
            await fetch(`${BASE_URL}/topics/${t._id}`, {
                method: 'DELETE',
                headers
            });
        }
        console.log(`cleaned up ${myTopics.length} old topics.`);
    } catch (e) {
        // Ignore cleanup errors
    }

    const today = new Date();
    const addDays = (days) => {
        const d = new Date(today);
        d.setDate(d.getDate() + days);
        return d.toISOString();
    };

    const topicsToCreate = [
        {
            name: 'Linear Algebra (Base)',
            difficulty: 'easy',
            estimatedTime: 1.0,
            deadline: addDays(5),
            status: 'new'
        },
        {
            name: 'Vector Spaces (Depends on Linear Algebra)',
            difficulty: 'medium',
            estimatedTime: 2.0,
            deadline: addDays(10),
            prereq: 'Linear Algebra (Base)',
            status: 'new'
        },
        {
            name: 'Eigenvalues (Depends on Vector Spaces)',
            difficulty: 'hard',
            estimatedTime: 3.0,
            deadline: addDays(15),
            prereq: 'Vector Spaces (Depends on Linear Algebra)',
            status: 'new'
        },
        {
            name: 'Probability (Urgent & Independent)',
            difficulty: 'easy',
            estimatedTime: 1.0,
            deadline: addDays(2),
            status: 'new'
        }
    ];

    try {
        for (const t of topicsToCreate) {
            // Resolve prereq ID
            let prereqs = [];
            if (t.prereq && topicIds[t.prereq]) {
                prereqs.push(topicIds[t.prereq]);
            }

            const payload = {
                subject: subjectId,
                name: t.name,
                difficulty: t.difficulty,
                estimatedTime: t.estimatedTime,
                prerequisites: prereqs,
                status: t.status,
                // We'll use 'nextReviewDate' or a specially crafted field to simulate external deadline preference if model supports it
                // Or we accept the scheduler will just use today.
                // NOTE: The Python script I wrote looks for 'scheduledDate' or 'nextReviewDate' for urgency.
                // Let's set 'nextReviewDate' as the desired deadline for the test.
                nextReviewDate: t.deadline
            };

            const res = await fetch(`${BASE_URL}/topics`, {
                method: 'POST',
                headers,
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (res.ok) {
                topicIds[t.name] = data._id;
                console.log(`✅ Created: ${t.name}`);
            } else {
                console.error(`❌ Failed: ${t.name}`, data);
            }
        }
    } catch (e) {
        console.error('Topic creation failed:', e.message);
    }

    // 4. Run Optimization
    console.log('\n🧠 Running DAACS Optimization...');
    try {
        const res = await fetch(`${BASE_URL}/schedule/optimize`, {
            method: 'POST',
            headers
        });
        const data = await res.json();

        if (res.ok) {
            console.log('SUCCESS! Optimized Schedule:');
            console.table(data.tasks.map(t => ({
                name: t.name,
                difficulty: t.difficulty,
                priorityScore: Math.round(t.priorityScore),
                scheduledDate: t.scheduledDate.split('T')[0],
                deadline: t.nextReviewDate ? t.nextReviewDate.split('T')[0] : 'None'
            })));
        } else {
            console.error('Optimization Failed:', data);
        }
    } catch (e) {
        console.error('Optimization request failed:', e.message);
    }
}

runTest();
