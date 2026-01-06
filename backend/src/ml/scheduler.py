import sys
import json
import pandas as pd
import numpy as np
from sklearn.preprocessing import MinMaxScaler
from datetime import datetime

def calculate_priority(tasks_df):
    """
    Calculate priority score based on difficulty, deadline, and status.
    """
    if tasks_df.empty:
        return tasks_df

    # 1. Feature Engineering
    
    # Map Difficulty
    difficulty_map = {'easy': 1, 'medium': 2, 'hard': 3}
    tasks_df['difficulty_score'] = tasks_df['difficulty'].map(difficulty_map).fillna(2)

    # Map Status (New topics get higher priority to start)
    status_map = {'new': 3, 'learning': 2, 'revised': 1, 'completed': 0}
    tasks_df['status_score'] = tasks_df['status'].map(status_map).fillna(1)
    
    # Days Until Exam / Due Date
    # If no date, set to a far future (e.g., 365 days)
    today = datetime.now()
    
    def get_days_until_due(row):
        # Prefer scheduledDate if available, else look for subject examDate (passed in input?)
        # For this script, we assume the input JSON contains 'daysUntilDate' or we calculate it here if 'date' is provided
        # Let's assume the caller pre-calculates days relative to now, OR provides date strings.
        
        # Let's try to parse 'scheduledDate' or 'nextReviewDate'
        # If 'nextReviewDate' is present and passed, it is urgent.
        
        target_date = None
        if row.get('nextReviewDate'):
            target_date = row['nextReviewDate']
        elif row.get('scheduledDate'):
            target_date = row['scheduledDate']
            
        if not target_date:
            return 365.0 # default far future
            
        try:
            # Handle ISO string Z format if needed, though pandas often handles it
            dt = pd.to_datetime(target_date).replace(tzinfo=None) # naive comparison
            delta = (dt - today).days
            return delta
        except:
            return 365.0

    tasks_df['days_until'] = tasks_df.apply(get_days_until_due, axis=1)
    
    # Invert days_until for urgency (closer date = higher score)
    # effective_urgency = 1 / (days_until + c)
    # Or just use MinMax scaling on negative days?
    # Let's use specific logic:
    # Overdue (negative days) should range very high.
    # Future should range lower.
    
    tasks_df['urgency_score'] = tasks_df['days_until'].apply(lambda x: 100 if x < 0 else 100/(x+1) if x < 30 else 0)

    # 2. Normalization
    scaler = MinMaxScaler()
    
    # We want to combine these features
    # features = ['difficulty_score', 'status_score', 'urgency_score']
    # But direct weighted sum is often better for simple "ML" heuristics than scaling if ranges are known.
    # Urgency is 0-100+. Difficulty is 1-3. Status is 1-3.
    # We should boost Difficulty and Status importance.
    
    tasks_df['final_score'] = (
        tasks_df['urgency_score'] * 1.5 +        # High weight on urgency
        tasks_df['difficulty_score'] * 5.0 +     # 5-15 points
        tasks_df['status_score'] * 3.0           # 3-9 points
    )
    
    # 3. Sort
    tasks_df = tasks_df.sort_values(by='final_score', ascending=False)
    
    return tasks_df

def main():
    try:
        # Read JSON from stdin
        input_data = sys.stdin.read()
        if not input_data:
            print(json.dumps([]))
            return

        tasks = json.loads(input_data)
        if not tasks:
            print(json.dumps([]))
            return

        df = pd.DataFrame(tasks)
        
        # Ensure columns exist
        required_cols = ['difficulty', 'status']
        for col in required_cols:
            if col not in df.columns:
                df[col] = None # fill missing

        # Run Algorithm
        result_df = calculate_priority(df)
        
        # Return only _id and priorityScore (or full object?)
        # We need to return the list with updated priority scores.
        # Let's return the full sorted list with the NEW score.
        
        result_df['priorityScore'] = result_df['final_score']
        
        # Convert necessary fields back to simple types if pandas made them complex
        output_records = result_df.to_dict(orient='records')
        
        # Clean up timestamps for JSON serialization
        def default_serializer(obj):
            if isinstance(obj, (datetime, pd.Timestamp)):
                return obj.isoformat()
            return str(obj)

        print(json.dumps(output_records, default=default_serializer))

    except Exception as e:
        # Send error to stderr so Node can catch it
        print(f"Error in python script: {str(e)}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
