# Quiz Proctoring System

## Overview
The StudyNow AI quiz system now includes comprehensive proctoring features to ensure academic integrity during quiz sessions. This document outlines the proctoring capabilities and how they work.

## Proctoring Features

### 1. **Camera Monitoring**
- **What it does**: Activates the user's webcam to monitor them during the quiz
- **How it works**: 
  - Requests camera permission before quiz starts
  - Displays live video feed in top-right corner
  - Camera remains active throughout the quiz session
- **Violations**: Camera access denial is logged as a violation

### 2. **Face Detection**
- **What it does**: Verifies that a person is present in front of the camera
- **How it works**:
  - Analyzes video frames every 2 seconds
  - Uses brightness analysis to detect face presence
  - Triggers warning if no face detected for 5+ seconds
- **Violations**: Extended absence of face detection is logged
- **Visual Feedback**: Green indicator = face detected, Yellow = no face

### 3. **Fullscreen Enforcement**
- **What it does**: Requires the quiz to be in fullscreen mode
- **How it works**:
  - Automatically requests fullscreen when quiz starts
  - Monitors fullscreen state continuously
  - Auto-prompts to return to fullscreen if exited
- **Violations**: Exiting fullscreen is immediately logged
- **Visual Feedback**: Green indicator = fullscreen active, Red = not fullscreen

### 4. **Tab Switching Detection**
- **What it does**: Detects when user switches to another tab or window
- **How it works**:
  - Uses browser visibility API to monitor tab focus
  - Detects both tab switches and window minimization
  - Logs each instance of leaving the quiz tab
- **Violations**: Every tab switch/minimization is logged
- **User Feedback**: Toast notification warns user

### 5. **Window Blur Detection**
- **What it does**: Detects when the quiz window loses focus
- **How it works**:
  - Monitors window blur events
  - Captures when user switches to another application
- **Violations**: Window focus loss is logged
- **User Feedback**: Warning message displayed

### 6. **Screenshot Prevention**
- **What it does**: Prevents users from taking screenshots
- **How it works**:
  - Blocks common screenshot keyboard shortcuts:
    - `PrintScreen` key
    - `Ctrl + Shift + P` (Chrome DevTools print)
    - `Ctrl + Shift + I` (DevTools)
    - `Ctrl + P` (Print dialog)
    - `Cmd + Shift + 3/4` (Mac screenshots)
- **Violations**: Screenshot attempts are logged
- **User Feedback**: Toast notification informs user screenshots are disabled

### 7. **Copy Prevention**
- **What it does**: Prevents copying quiz content
- **How it works**:
  - Blocks copy events (Ctrl+C, right-click copy)
  - Prevents text selection copying
- **User Feedback**: Toast notification when copy is attempted

### 8. **Right-Click Prevention**
- **What it does**: Disables right-click context menu
- **How it works**:
  - Prevents contextmenu events
  - Blocks access to browser features via right-click
- **User Feedback**: Toast notification when right-click is attempted

## User Experience Flow

### 1. **Proctoring Setup Screen**
Before starting the quiz, users see a setup screen that:
- Explains all proctoring features
- Allows camera testing
- Requires explicit consent
- Shows visual indicators for camera status

**User Requirements:**
- Must test camera successfully
- Must accept proctoring terms
- Cannot proceed without consent

### 2. **During Quiz**
- Live camera feed displayed in top-right corner
- Real-time status indicators:
  - Camera status (green/red dot)
  - Face detection status (green/yellow dot)
  - Fullscreen status (green/red badge)
- Violation counter shows number of violations
- Expandable violation log shows recent violations

### 3. **Quiz Completion**
Results screen shows:
- Quiz score and percentage
- Proctoring summary with color coding:
  - **Green**: No violations (excellent)
  - **Yellow**: 1-2 violations (minor concerns)
  - **Red**: 3+ violations (significant concerns)
- Complete list of all violations with timestamps
- Areas to improve based on quiz performance

## Violation Types Logged

1. **Camera access denied**
2. **No face detected for 5+ seconds**
3. **Exited fullscreen mode**
4. **Tab switched or minimized**
5. **Window lost focus**
6. **Attempted screenshot or print**
7. **Alt+Tab detected**

## Backend Integration

### Data Storage
Proctoring data is stored with quiz results:
```javascript
{
  proctoring: {
    violations: [
      {
        type: "Tab switched or minimized",
        timestamp: "2026-01-07T12:30:45.123Z"
      }
    ],
    violationCount: 1,
    timestamp: "2026-01-07T12:35:00.000Z"
  }
}
```

### API Endpoints Updated
- `POST /api/topics/:id/quiz` - Submit topic quiz with proctoring data
- `POST /api/topics/:id/roadmap/steps/:stepIndex/quiz` - Submit step quiz with proctoring data

## Technical Implementation

### Frontend Components

1. **ProctorSetup.jsx**
   - Setup and consent screen
   - Camera testing functionality
   - Feature explanation

2. **ProctorMonitor.jsx**
   - Live camera monitoring
   - Face detection
   - Violation tracking
   - Event listeners for all proctoring features

3. **QuizPage.jsx**
   - Integrates proctoring components
   - Manages proctoring state
   - Submits proctoring data with quiz answers

### Browser Permissions Required
- **Camera/Microphone**: For video monitoring
- **Fullscreen**: For fullscreen enforcement

## Privacy & Security

### Data Collection
- Video is displayed but **NOT recorded or stored**
- Only violation events are logged (type + timestamp)
- No personal data beyond user ID is associated with violations

### User Consent
- Explicit consent required before quiz starts
- Clear explanation of all monitoring features
- Option to decline (results in quiz cancellation)

## Future Enhancements

Potential additions for enhanced proctoring:

1. **Advanced Face Recognition**
   - Integration with face-api.js or TensorFlow.js
   - Verify identity against registered photo
   - Detect multiple faces in frame

2. **Audio Monitoring**
   - Detect background voices
   - Alert on suspicious audio patterns

3. **Eye Tracking**
   - Monitor gaze direction
   - Detect looking away from screen

4. **AI Behavior Analysis**
   - Pattern recognition for suspicious behavior
   - Machine learning to identify cheating patterns

5. **Video Recording** (with consent)
   - Optional video recording for review
   - Secure storage with automatic deletion

6. **Screen Recording**
   - Record entire screen activity
   - Detect use of external resources

## Browser Compatibility

### Fully Supported
- Chrome 90+
- Firefox 88+
- Edge 90+
- Safari 14+

### Limitations
- Some features may not work in private/incognito mode
- Safari has limited fullscreen API support
- Mobile browsers have restricted camera access

## Troubleshooting

### Camera Not Working
1. Check browser permissions
2. Ensure camera is not in use by another app
3. Try different browser
4. Check if camera is physically covered

### Fullscreen Issues
1. Use F11 or browser fullscreen button
2. Check if browser allows fullscreen
3. Disable browser extensions that block fullscreen

### False Positives
- Poor lighting may trigger "no face" warnings
- Very fast tab switches during page load may be logged
- Browser extensions may interfere with detection

## Best Practices for Users

1. **Environment Setup**
   - Use well-lit room
   - Ensure stable internet connection
   - Close unnecessary applications
   - Disable browser extensions

2. **During Quiz**
   - Stay in front of camera
   - Keep quiz in fullscreen
   - Don't switch tabs or windows
   - Avoid looking away for extended periods

3. **Technical Preparation**
   - Test camera before starting
   - Use supported browser
   - Ensure battery/power supply
   - Have backup device ready
