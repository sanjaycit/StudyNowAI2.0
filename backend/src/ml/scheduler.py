import sys
import json
import random
import datetime
from datetime import timedelta
import numpy as np

# Set recursion limit just in case, though we try to avoid recursion
sys.setrecursionlimit(2000)

class DAACS_Scheduler:
    def __init__(self, user_profile, topics):
        """
        Initialize the Scheduler with User Profile and Topic List.
        """
        self.user = user_profile
        self.topics = topics
        self.topic_map = {t['_id']: t for t in topics}
        
        # Extract DAACS parameters
        self.alpha = float(self.user.get('alpha', 1.0))
        self.beta = float(self.user.get('beta', 0.5))
        self.phi = float(self.user.get('phi', 0.1))
        self.daily_capacity = float(self.user.get('dailyCapacity', 2.0))
        
        # Build Graph
        self.adj_list = {t['_id']: [] for t in topics}
        self.in_degree = {t['_id']: 0 for t in topics}
        self.build_graph()

    def build_graph(self):
        """Builds the Dependency Graph from prerequisites."""
        for t in self.topics:
            prereqs = t.get('prerequisites', [])
            # Ensure prereqs is a list of ID strings
            if not isinstance(prereqs, list):
                continue
                
            for p_id in prereqs:
                # Handle populated objects or raw IDs
                pid_str = p_id['_id'] if isinstance(p_id, dict) else str(p_id)
                
                if pid_str in self.topic_map:
                    self.adj_list[pid_str].append(t['_id'])
                    self.in_degree[t['_id']] += 1
                    sys.stderr.write(f"DEBUG: Edge {pid_str} -> {t['_id']}\n")
                else:
                    sys.stderr.write(f"DEBUG: Prereq {pid_str} not found in topic map for task {t['_id']}\n")
                    
        # Debug In-Degrees
        for tid, deg in self.in_degree.items():
            sys.stderr.write(f"DEBUG: Topic {self.topic_map[tid].get('name')} In-Degree: {deg}\n")
    def calculate_actual_time(self, topic):
        """
        Calculates the expected time to master a topic based on Learner's Alpha.
        DAACS Eq (1): T_actual = T_base / (alpha * (m_target - m_start)^gamma)
        Simplified: T_actual = EstimatedTime / Alpha
        """
        base_time = float(topic.get('estimatedTime', 1.0))
        # Add stochastic noise modeled by phi (consistency factor)
        noise = np.random.normal(0, self.phi)
        
        actual_time = (base_time / self.alpha) + noise
        return max(0.1, actual_time)  # Minimum time 6 mins

    def topological_sort_with_priority(self):
        """
        Returns a valid execution order respecting prerequisites.
        Uses a priority mechanism (Heap) would be better, but simple list sorting works for now.
        """
        ready_queue = [t for t in self.topics if self.in_degree[t['_id']] == 0]
        sorted_tasks = []
        
        # We process 'ready' tasks. 
        # To make it "Deadline-Aware", we should pick the most urgent tasks from the ready queue first.
        
        while ready_queue:
            # Sort ready_queue by Urgency (Deadline) and Importance (Weight/Difficulty)
            # Heuristic: Score = Difficulty + (1/DaysUntilDue)*10
            
            def heuristic(t):
                diff_map = {'easy': 1, 'medium': 2, 'hard': 3}
                d_score = diff_map.get(t.get('difficulty', 'medium'), 2)
                
                # Check for explicit deadline
                due_date = t.get('scheduledDate') or t.get('nextReviewDate')
                days_left = 100
                if due_date:
                    try:
                        dt = datetime.datetime.fromisoformat(str(due_date).replace('Z', '+00:00')).replace(tzinfo=None)
                        now = datetime.datetime.now()
                        days_left = (dt - now).days
                    except:
                        pass
                
                urgency = 100 / (max(1, days_left)) if days_left > 0 else 100
                return d_score + urgency

            # Pop the highest priority task
            ready_queue.sort(key=heuristic, reverse=True)
            current_task = ready_queue.pop(0)
            sorted_tasks.append(current_task)
            
            # Unlock neighbors
            for neighbor_id in self.adj_list[current_task['_id']]:
                self.in_degree[neighbor_id] -= 1
                if self.in_degree[neighbor_id] == 0:
                    ready_queue.append(self.topic_map[neighbor_id])
                    
        # Append any remaining tasks (cycles?) - though graph should be DAG
        processed_ids = set(t['_id'] for t in sorted_tasks)
        for t in self.topics:
            if t['_id'] not in processed_ids:
                sorted_tasks.append(t)
                
        return sorted_tasks

    def schedule_tasks(self):
        """
        Assigns dates to tasks based on capacity and valid order.
        Tactical Scheduler (Simplified GA/Greedy Approach).
        """
        sorted_tasks = self.topological_sort_with_priority()
        
        current_date = datetime.datetime.now().date()
        daily_load = 0
        schedule_map = {} # task_id -> date
        
        updated_tasks = []
        
        for task in sorted_tasks:
            # Calculate required time
            req_time = self.calculate_actual_time(task)
            
            # If adding this task exceeds capacity, move to next day
            if daily_load + req_time > self.daily_capacity:
                current_date += timedelta(days=1)
                daily_load = 0
            
            # Assign Date
            task['scheduledDate'] = current_date.isoformat()
            schedule_map[task['_id']] = current_date
            
            # Update Load
            daily_load += req_time
            
            # Calculate a Priority Score for frontend visualization
            # High priority = Scheduled Soon
            days_from_now = (current_date - datetime.date.today()).days
            # Score 0-100. Today = 100. 10 days out = 50.
            p_score = max(0, 100 - (days_from_now * 5))
            task['priorityScore'] = p_score
            
            # Add DAACS metadata for debugging/UI
            task['daacs_meta'] = {
                'estimated_duration_hrs': round(req_time, 2),
                'assigned_date': str(current_date)
            }
            
            updated_tasks.append(task)
            
        return updated_tasks

def main():
    try:
        input_data = sys.stdin.read()
        if not input_data:
            print(json.dumps([]))
            return

        payload = json.loads(input_data)
        
        # Check payload structure
        if 'user' in payload and 'topics' in payload:
            user = payload['user']
            topics = payload['topics']
        else:
            # Fallback for old format
            user = {}
            topics = payload if isinstance(payload, list) else []

        if not topics:
            print(json.dumps([]))
            return

        scheduler = DAACS_Scheduler(user, topics)
        optimized_tasks = scheduler.schedule_tasks()
        
        # Serialize with default for dates
        def date_handler(obj):
            if isinstance(obj, (datetime.datetime, datetime.date)):
                return obj.isoformat()
            return str(obj)

        print(json.dumps(optimized_tasks, default=date_handler))

    except Exception as e:
        # Properly log error to stderr so Node.js can catch it
        sys.stderr.write(f"DAACS Engine Error: {str(e)}\n")
        sys.exit(1)

if __name__ == "__main__":
    main()
