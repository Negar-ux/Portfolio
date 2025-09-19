# Deployment Checklist for negardeilami.com

## Files to Upload to Web Server

### 1. Updated HTML Files
- `hospital-discharge.html`
- `fitness-app.html`
- `surgical-dashboard.html`
- `design-workshops.html`

### 2. Updated CSS File
- `case-study.css` (with improved navigation button styling)

### 3. New Image Files (28 total)
Upload all these files to `assets/images/` directory on the server:

#### Hospital Discharge Case Study (3 images)
- `alc-statistics.png`
- `stakeholder-map.svg`
- `patient-quotes.svg`

#### Fitness App Case Study (14 images)
- `fitness-admin-panel.webp`
- `fitness-audio-iterations.webp`
- `fitness-audio-setting.webp`
- `fitness-class-detail-after.png`
- `fitness-class-detail-before.webp`
- `fitness-classes.webp`
- `fitness-description-iterations.webp`
- `fitness-homepage.webp`
- `fitness-instructors.webp`
- `fitness-split-after.webp`
- `fitness-split-before.webp`
- `fitness-split-screen.webp`
- `fitness-terminology.webp`

#### Surgical Dashboard Case Study (5 images)
- `surgical-dashboard-after.png`
- `surgical-dashboard-before.png`
- `surgical-meeting.jpg`
- `surgical-survey-methodology.png`
- `surgical-survey-results.png`

#### Design Workshops Case Study (7 images)
- `workshop-identity-cards.webp`
- `workshop-scenario-cards.webp`
- `workshop-slide-1.png`
- `workshop-slide-2.png`
- `workshop-team-1.jpg`
- `workshop-team-2.jpg`
- `workshop-templates.webp`

## What This Fixes
✅ All case study images will load properly (previously broken external URLs)
✅ Navigation buttons have consistent white text and no underlines
✅ Faster page loading (local images vs external requests)
✅ Better reliability (no dependency on external image hosting)

## Deployment Steps
1. Upload all image files to `assets/images/` directory on web server
2. Upload the 4 updated HTML files
3. Upload the updated `case-study.css` file
4. Test all case study pages to ensure images load correctly
5. Verify navigation buttons appear with white text and no underlines

## File Sizes
Total additional storage needed: ~2.5MB for all new images