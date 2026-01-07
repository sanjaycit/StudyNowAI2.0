# ⚠️ Two-Warning Violation System - Implementation Complete!

## Overview
Implemented automatic quiz termination after 2 violations to ensure strict proctoring compliance.

## System Behavior

### Violation Tracking

| Violation # | Action | UI Indicator | Toast Message |
|-------------|--------|--------------|---------------|
| **0** | Normal operation | Green/No warning | - |
| **1** | First warning | Yellow badge: "⚠️ Warning 1/2 - 1 left" | "⚠️ Warning 1/2 - 1 warning remaining before termination!" |
| **2** | Second warning → **TERMINATION** | Red pulsing badge: "⚠️ Warning 2/2 - TERMINATING!" | "Maximum violations reached! Quiz will be terminated." |

### Termination Flow

```
Violation #2 occurs
  ↓
Log violation
  ↓
Show error toast (5s duration)
  ↓
Wait 2 seconds
  ↓
Trigger termination callback
  ↓
Show termination toast
  ↓
Wait 3 seconds
  ↓
Navigate away from quiz
  ↓
Quiz window closed
```

## User Experience

### Setup Screen
**Clear warning displayed**:
```
⚠️ Two-Strike Policy
• 1st violation: Warning - 1 chance remaining
• 2nd violation: Quiz automatically terminated
• No exceptions - maintain proper exam conditions at all times
```

### During Quiz

**Status Display** (Camera Monitor):
- **No violations**: No warning badge shown
- **1 violation**: Yellow badge - "⚠️ Warning 1/2 - 1 left"
- **2 violations**: Red pulsing badge - "⚠️ Warning 2/2 - TERMINATING!"

**Toast Notifications**:
- **1st violation**: Warning toast with countdown
- **2nd violation**: Error toast → Termination message → Auto-close

### Console Logs

**First Violation**:
```
📝 Violation logged: No face detected for 5+ seconds (ML verified)
Total violations: 1
```

**Second Violation** (Triggers termination):
```
📝 Violation logged: Tab switched or minimized
Total violations: 2
🚨 MAX VIOLATIONS REACHED! Terminating quiz...
Quiz terminated due to violations
```

## Technical Implementation

### Files Modified

#### 1. `ProctorMonitorML.jsx`

**Updated `logViolation` function**:
```javascript
const logViolation = (type) => {
    const newViolations = [...violations, violation];
    
    // Check if max violations exceeded
    if (newViolations.length >= 2) {
        console.log('🚨 MAX VIOLATIONS REACHED!');
        toast.error('Maximum violations reached!');
        
        // Trigger termination after 2s delay
        setTimeout(() => {
            onViolation({ ...violation, terminate: true });
        }, 2000);
    } else {
        // Show warning with remaining count
        const remaining = 2 - newViolations.length;
        toast.warning(`⚠️ Warning ${newViolations.length}/2`);
        onViolation(violation);
    }
};
```

**Updated violation counter display**:
```javascript
<div className={violations.length >= 2 ? 'bg-red-600 animate-pulse' : 'bg-yellow-500'}>
    ⚠️ Warning {violations.length}/2 
    {violations.length >= 2 ? '- TERMINATING!' : `- ${2 - violations.length} left`}
</div>
```

#### 2. `QuizPage.jsx`

**Updated `handleViolation`**:
```javascript
const handleViolation = (violation) => {
    setViolations(prev => [...prev, violation]);
    
    if (violation.terminate) {
        toast.error('Quiz terminated due to excessive violations!');
        
        // Navigate away after 3s
        setTimeout(() => {
            navigate('/topics', {
                state: { 
                    terminated: true,
                    reason: 'Maximum violations (2) exceeded',
                    violations: violations.length + 1
                }
            });
        }, 3000);
    }
};
```

#### 3. `ProctorSetup.jsx`

**Added two-strike policy warning**:
- Updated main warning message
- Added prominent red warning box
- Clear explanation of consequences

## Violation Types That Count

All violations count toward the 2-warning limit:

1. **No face detected** (5+ seconds)
2. **Multiple faces detected** (3+ seconds)
3. **Unauthorized device detected** (3+ seconds)
4. **Exited fullscreen mode**
5. **Tab switched or minimized**
6. **Window lost focus**
7. **Screenshot attempt**
8. **Right-click** (disabled)
9. **Copy attempt**
10. **Camera access denied**

## Testing Guide

### Test 1: First Violation
1. Start quiz
2. Trigger any violation (e.g., move face away for 5+ seconds)
3. **Expected**:
   - Yellow badge: "⚠️ Warning 1/2 - 1 left"
   - Toast: "⚠️ Warning 1/2 - 1 warning remaining before termination!"
   - Quiz continues

### Test 2: Second Violation (Termination)
1. Continue from Test 1
2. Trigger another violation
3. **Expected**:
   - Red pulsing badge: "⚠️ Warning 2/2 - TERMINATING!"
   - Toast: "Maximum violations reached! Quiz will be terminated."
   - Wait 2 seconds
   - Toast: "Quiz terminated due to excessive violations!"
   - Wait 3 seconds
   - Navigate away from quiz
   - Quiz ends (no results saved)

### Test 3: Console Verification
Open browser console (F12) and watch for:
```
📝 Violation logged: [type]
Total violations: 1
⚠️ Warning 1/2...

📝 Violation logged: [type]
Total violations: 2
🚨 MAX VIOLATIONS REACHED! Terminating quiz...
Quiz terminated due to violations
```

## User Notifications

### Timing Breakdown

| Event | Delay | Purpose |
|-------|-------|---------|
| Violation detected | 0s | Log violation |
| First warning toast | 0s | Alert user immediately |
| Second violation detected | 0s | Log violation |
| Termination toast | 0s | Inform about termination |
| Termination trigger | 2s | Give time to see toast |
| Quiz termination toast | 0s | Confirm termination |
| Navigation away | 3s | Time to read final message |
| **Total time** | **~5s** | From 2nd violation to exit |

## Color Coding

- 🟢 **Green**: All good (no violations)
- 🟡 **Yellow**: First warning (1 violation)
- 🔴 **Red (pulsing)**: Critical (2 violations, terminating)

## Benefits

### 1. **Strict Compliance**
- Zero tolerance for repeated violations
- Clear consequences

### 2. **Fair Warning System**
- User gets one chance  
- Clear indication of status
- Countdown to termination

### 3. **Prevents Gaming**
- Can't accumulate many violations
- Must maintain proper conditions

### 4. **Clear Communication**
- Setup screen explains policy
- Real-time violation count
- Visual and toast notifications

### 5. **Automatic Enforcement**
- No manual intervention needed
- Consistent application
- Immediate consequences

## Edge Cases Handled

1. **Multiple rapid violations**: Each counted separately
2. **Simultaneous violations**: Processed in order
3. **At termination threshold**: Quiz closes immediately after logging
4. **Network issues**: Violations still counted locally
5. **Browser refresh**: New quiz session (violations reset)

## Console Debugging

Watch console for violation progression:
```
// First violation
📝 Violation logged: No face detected for 5+ seconds (ML verified)
Total violations: 1

// Second violation - triggers termination  
📝 Violation logged: Tab switched or minimized
Total violations: 2
🚨 MAX VIOLATIONS REACHED! Terminating quiz...
[2 second delay]
Quiz terminated due to violations
[3 second delay]
[Navigation occurs]
```

## Future Enhancements (Optional)

1. **Configurable limit**: Allow admins to set 1, 2, or 3 warnings
2. **Violation severity**: Weight different violations differently
3. **Grace period**: Ignore first 30 seconds of quiz
4. **Warning accumulation**: Violations decay over time
5. **Second chance**: Allow quiz retake after cooldown
6. **Admin override**: Manual termination or forgiveness

## Summary

**What was implemented**:
- ✅ Maximum 2 violations allowed
- ✅ Clear warnings on setup screen
- ✅ Real-time violation counter (X/2)
- ✅ Color-coded status indicators
- ✅ Automatic termination on 2nd violation
- ✅ 5-second delay before navigation
- ✅ Clear toast notifications
- ✅ Comprehensive console logging

**User experience**:
- ⚠️ Warning 1: Yellow badge, clear warning
- 🚨 Warning 2: Red pulsing badge, immediate termination
- 🔴 Quiz closes automatically after brief delay

**Status**: ✅ **READY FOR PRODUCTION**

---

**Policy**: Two strikes maximum - zero tolerance for repeated violations!
