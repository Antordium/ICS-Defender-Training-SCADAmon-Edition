# ICS Defender Training: SCADAmon Edition

## cmi5 Course Package for PCTE

**Version:** 1.0  
**Date:** January 2026  
**Alignment:** SANS ICS410 / GICSP Certification Prep

---

## Quick Start

### For GitHub Pages Deployment:
1. Upload the `course/` folder to a GitHub repository
2. Enable GitHub Pages in repository settings
3. Access via `https://[username].github.io/[repo]/`

### For PCTE cmi5 Player:
1. Zip the `course/` folder
2. Upload to PCTE as a cmi5 package
3. The `cmi5.xml` manifest defines the course structure

---

## Package Contents

```
course/
├── index.html              # Main course launcher
├── cmi5.xml                # cmi5 course manifest
├── css/
│   └── pokemon-theme.css   # Pokemon-inspired styling
├── js/
│   ├── cmi5-wrapper.js     # LRS communication
│   └── quiz-engine.js      # Quiz functionality
├── modules/
│   ├── module1.html        # ICS Fundamentals
│   ├── module2.html        # Network Architecture
│   ├── module3.html        # ICS Protocols
│   ├── module4.html        # Windows in OT
│   ├── module5.html        # Unix/Linux in OT
│   ├── module6.html        # Governance & Compliance
│   ├── module7.html        # Incident Detection & Response
│   └── module8.html        # Synthesis & Capstone
├── quizzes/
│   └── module[1-8]-questions.json  # Question banks
└── assets/
    ├── images/             # Infographic placeholders
    └── videos/             # Video placeholders
```

---

## Course Structure

| Module | Title | Duration | Topics |
|--------|-------|----------|--------|
| 1 | ICS Fundamentals | 60 min | SCADA, PLCs, RTUs, HMIs, Purdue Model |
| 2 | Network Architecture | 75 min | Segmentation, DMZ, Defense in Depth |
| 3 | ICS Protocols | 60 min | Modbus, DNP3, OPC UA |
| 4 | Windows in OT | 60 min | HMI Security, Patching, AD |
| 5 | Unix/Linux in OT | 45 min | Hardening, sudo, Logging |
| 6 | Governance | 75 min | NIST CSF, NERC CIP, IEC 62443 |
| 7 | Incident Response | 60 min | Detection, Forensics, Recovery |
| 8 | Synthesis | 45 min | Integration, Capstone Prep |

---

## Quiz Configuration

- **Questions per quiz:** 10 (randomized from 15+ pool)
- **Passing score:** 80%
- **Question types:** Multiple choice, True/False
- **Answer randomization:** Enabled
- **Feedback:** Immediate with explanations

---

## cmi5 Features

### xAPI Statements Generated:
- `launched` - Module started
- `progressed` - Progress through content
- `answered` - Quiz question responses
- `passed/failed` - Quiz completion
- `completed` - Module finished
- `terminated` - Session ended

### LRS Integration:
- Statements sent to PCTE cmi5 player's configured LRS
- Supports standalone mode (localStorage) for testing
- Session tracking with unique registration IDs

---

## Media Assets Required

See `docs/MEDIA_REQUIREMENTS_AI_PROMPTS.md` for:
- Complete list of 18 videos needed
- Complete list of 26 infographics needed
- AI generation prompts for NanoBanana/Gemini
- Style specifications (Pokemon/anime theme)

### Placeholder Locations:
- Videos: `assets/videos/m[X]_v[Y]_[name].mp4`
- Images: `assets/images/m[X]_i[Y]_[name].png`

---

## Customization

### Changing Passing Score:
Edit `quiz-engine.js` or pass option when creating QuizEngine:
```javascript
new QuizEngine('quiz-container', {
  passingScore: 70  // Change from 80 to 70
});
```

### Adding Questions:
Add to the appropriate `module[X]-questions.json`:
```json
{
  "id": "m1_q20",
  "type": "multiple_choice",
  "question": "Your question here?",
  "options": ["A", "B", "C", "D"],
  "correctIndex": 0,
  "explanation": "Explanation here."
}
```

### Theming:
Modify `css/pokemon-theme.css` to change:
- Colors (CSS variables at top)
- Fonts
- Component styling

---

## Capstone Integration

After completing all 8 modules, students unlock the **SCADAmon Game** capstone assessment. The game tests knowledge through interactive Pokemon-style battles where correct answers determine success.

Game files are in a separate package: `/scadamon/`

---

## Support

**Course Design:** See `docs/COURSE_DESIGN_DOCUMENT.md`  
**Media Generation:** See `docs/MEDIA_REQUIREMENTS_AI_PROMPTS.md`  
**SCADAmon Game:** See `/scadamon/docs/`

---

## License

For USCYBERCOM J74 Train the Force use.  
ICS Defender Training: SCADAmon Edition © 2026

---

*Gotta Secure 'Em All!* 🛡️⚡
