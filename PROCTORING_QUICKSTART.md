# 🎓 Quick Start Guide: Quiz Proctoring

## For Students/Quiz Takers

### Before You Start

**System Requirements:**
✅ Working webcam  
✅ Modern browser (Chrome, Firefox, Edge, or Safari)  
✅ Stable internet connection  
✅ Well-lit room  
✅ Quiet environment  

### Taking a Proctored Quiz

#### Step 1: Setup & Consent
When you click to start a quiz, you'll see the **Proctoring Setup Screen**:

1. **Read the features** - Understand what will be monitored
2. **Test your camera** - Click "Test Camera" button
   - Allow camera access when prompted
   - Verify the green checkmark appears
3. **Accept terms** - Check the consent checkbox
4. **Start quiz** - Click "Start Proctored Quiz"

#### Step 2: During the Quiz
Once the quiz starts:

- **Stay in fullscreen** - Don't press ESC or exit fullscreen
- **Keep your face visible** - Stay in front of the camera
- **Don't switch tabs** - Stay on the quiz tab
- **Don't take screenshots** - This will be flagged
- **Don't copy/paste** - Content copying is disabled

**What You'll See:**
- 📹 Small camera preview in top-right corner
- 🟢 Green dots = Everything is good
- 🔴 Red/Yellow dots = Issue detected
- ⚠️ Violation counter (if any violations occur)

#### Step 3: Completing the Quiz
After finishing:

- You'll see your score
- Proctoring summary shows:
  - 🟢 **Green box** = No violations (Perfect!)
  - 🟡 **Yellow box** = 1-2 minor violations
  - 🔴 **Red box** = 3+ violations
- View detailed violation list if applicable
- See areas to improve based on performance

### Common Issues & Solutions

#### "Camera access denied"
- ✅ Check browser permissions (usually a camera icon in address bar)
- ✅ Ensure no other app is using the camera
- ✅ Try refreshing the page
- ✅ Try a different browser

#### "No face detected" warning
- ✅ Improve lighting in your room
- ✅ Position yourself in front of camera
- ✅ Remove anything blocking your face
- ✅ Adjust camera angle

#### Accidentally exited fullscreen
- ✅ Press F11 to re-enter fullscreen
- ✅ Or click the fullscreen button
- ✅ The system will prompt you automatically

#### Tab switch warning appeared
- ✅ Return to quiz tab immediately
- ✅ Avoid clicking on other windows
- ✅ Disable notifications during quiz

### Tips for Success

**Before Quiz:**
- 📱 Put phone on silent
- 💻 Close unnecessary programs
- 🔇 Mute notifications
- 🔋 Ensure full battery or plugged in
- 🧪 Do a practice run with camera

**During Quiz:**
- 👀 Look at the screen
- 🪑 Sit comfortably but stay in view
- 💡 Use consistent lighting
- 🤫 Stay in a quiet room
- ⏱️ Manage your time wisely

**After Quiz:**
- 📊 Review your results
- 📝 Check violation summary
- 🎯 Note areas to improve
- 💪 Learn from mistakes

### Understanding Violations

**Minor (Usually acceptable):**
- Brief window blur at start
- Momentary face not detected
- Quick tab switch due to notification

**Moderate (Concerning):**
- Multiple tab switches
- Exiting fullscreen repeatedly
- Face not detected for extended time

**Severe (May invalidate quiz):**
- Screenshot attempts
- Prolonged absence from camera
- Frequent tab switching pattern
- Copy/paste attempts

### Privacy Information

**What is monitored:**
- ✅ Camera feed (live preview only)
- ✅ Tab focus status
- ✅ Fullscreen status
- ✅ Violation events

**What is stored:**
- ✅ Violation types and timestamps
- ✅ Total violation count
- ✅ Quiz completion time

**What is NOT stored:**
- ❌ Video recordings
- ❌ Screenshots
- ❌ Audio recordings
- ❌ Personal information beyond user ID

---

## For Instructors/Administrators

### Enabling Proctoring

Proctoring is **automatically enabled** for all quizzes. No configuration needed.

### Reviewing Results

**Access Quiz Results:**
1. Navigate to student's quiz submission
2. Check `proctoring` object in quiz results:
```json
{
  "violations": [
    {
      "type": "Tab switched or minimized",
      "timestamp": "2026-01-07T12:30:45.123Z"
    }
  ],
  "violationCount": 1,
  "timestamp": "2026-01-07T12:35:00.000Z"
}
```

### Setting Policies

**Recommended Violation Thresholds:**
- **0 violations** = Excellent integrity ⭐⭐⭐
- **1-2 violations** = Acceptable (may be accidental) ⭐⭐
- **3-5 violations** = Review recommended ⚠️
- **5+ violations** = High concern - manual review 🚨

### Best Practices

**Before Quiz:**
- 📢 Inform students about proctoring in advance
- 📋 Provide technical requirements
- 🧪 Offer practice quiz to test setup
- ❓ Set up support channel for technical issues

**During Quiz:**
- 👁️ Monitor violation alerts (if real-time monitoring is enabled)
- 📞 Be available for technical support
- ⏰ Set appropriate time limits
- 🔄 Have backup assessment ready

**After Quiz:**
- 📊 Review violation patterns
- 🤔 Investigate suspicious activity
- 👥 Consider violations in context
- 📝 Provide feedback to students

### Technical Support

**Common Student Issues:**
1. Camera not working → Check permissions
2. Fullscreen issues → Try F11 key
3. False face detection → Improve lighting
4. Browser compatibility → Use Chrome/Firefox

**Database Access:**
Look for `quiz.results.proctoring` field in Topic model.

### Customization Options

**To adjust face detection sensitivity:**
Edit `ProctorMonitor.jsx` lines 70-75:
```javascript
// Adjust brightness thresholds
return avgBrightness > 30 && avgBrightness < 240;
```

**To change violation check frequency:**
Edit `ProctorMonitor.jsx` line 69:
```javascript
}, 2000); // Change interval (milliseconds)
```

**To modify violation severity display:**
Edit `QuizPage.jsx` lines 148-159 for color thresholds.

---

## Troubleshooting

### For Students

| Problem | Solution |
|---------|----------|
| Camera blocked | Check browser permissions, disable other camera apps |
| Quiz won't start | Test camera first, accept consent |
| Fullscreen keeps exiting | Disable browser extensions, use F11 |
| Violation warning appearing | Follow on-screen guidance, stay focused |
| Page frozen | Refresh page (progress is saved) |

### For Instructors

| Problem | Solution |
|---------|----------|
| High violation rates | Review system requirements with students |
| Camera issues reported | Ensure students tested beforehand |
| False positives | Adjust detection sensitivity |
| Student complaints | Communicate expectations clearly |

---

## FAQ

**Q: Can I pause the quiz?**  
A: No, once started, the quiz should be completed in one session.

**Q: What if my internet disconnects?**  
A: Refresh the page. Your progress may be saved depending on implementation.

**Q: Is the video recorded?**  
A: No, only a live preview is shown. No recording is stored.

**Q: Can violations be disputed?**  
A: Contact your instructor with details. Technical issues may be considered.

**Q: What if I need accommodation?**  
A: Contact your instructor before the quiz for alternative arrangements.

**Q: Can I use mobile device?**  
A: Desktop/laptop is strongly recommended. Mobile has limited support.

**Q: What browsers are supported?**  
A: Chrome, Firefox, Edge (90+), Safari (14+). Chrome recommended.

**Q: How strict is the monitoring?**  
A: The system is designed to be fair. Minor accidental violations are usually acceptable.

---

## Support Contacts

**Technical Issues:**  
- Check browser console for errors
- Clear browser cache and cookies
- Try different browser
- Contact system administrator

**Assessment Questions:**  
- Contact course instructor
- Check course syllabus
- Review quiz policies

---

**Version:** 1.0  
**Last Updated:** January 7, 2026  
**Status:** Active
