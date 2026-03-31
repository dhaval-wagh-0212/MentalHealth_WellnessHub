# MentalHealth Wellness Hub

MentalHealth Wellness Hub is a full-stack wellness website designed to help users check in with their emotions, chat with a supportive AI guide, listen to calming music, and use interactive activities that encourage relaxation and self-awareness.

The platform brings several wellness tools into one place so users can move naturally between mood tracking, guided conversation, breathing support, music, and mindful mini-games.

## What The Website Offers

- A personalized dashboard with activity stats, mood insights, and quick wellness access
- A chat assistant that responds supportively based on the user's emotional state
- A mood tracker with score-based logging and mood history
- Breathing exercises for quick calming sessions
- Relaxing music and ambient sound playback
- Interactive wellness games such as affirmation, focus, rhythm, gratitude, and calming activities
- Report and PDF export options for reviewing progress
- Authentication with user-specific data and session support

## Main Features

### 1. Dashboard

The dashboard gives users an overview of their daily engagement, mood score, songs played, games completed, and mood trends. It acts as the central view for understanding progress at a glance.

### 2. AI Wellness Chat

The chat module allows users to describe how they feel and receive emotionally aware responses. It is designed to:

- detect mood and risk level
- provide supportive conversation
- maintain context from recent conversation history
- suggest calming steps like breathing exercises when appropriate

### 3. Mood Tracker

Users can record how they feel with a mood score and note. The system stores entries and displays mood history so patterns can be reviewed over time.

### 4. Breathing Support

The website includes guided breathing exercises with a visual breathing circle and optional theme audio support to help users calm down in stressful moments.

### 5. Music For Relaxation

The music section provides ambient sound playback and curated relaxing playlists that help improve focus, reduce stress, and create a soothing environment.

### 6. Wellness Games

The games section turns relaxation into interaction. It includes activities focused on mindfulness, reaction, positivity, gratitude, rhythm, and calm engagement.

## Advantages Of The Project

- Combines multiple wellness tools in one platform instead of requiring separate apps
- Encourages daily emotional check-ins and self-awareness
- Makes mental wellness support more engaging through music and games
- Gives users immediate calming options during stress or anxiety
- Tracks mood history to make emotional patterns easier to understand
- Provides a simple, student-friendly and user-friendly interface
- Supports personalized interaction through login and saved activity

## Tech Stack

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express
- Database: MongoDB
- Authentication: Express Session + Mongo store
- AI integration: API-based mood and response generation

## Project Structure

```text
backend/
  src/
index.html
login.html
script.js
style.css
moodRisk.js
package.json
```

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create a local `.env` file using the values from `.env.example`.

Example:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/mental_health
AI_PROVIDER=groq
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama-3.1-8b-instant
SESSION_SECRET=change_this_to_a_long_random_secret
```

### 3. Start the server

```bash
npm start
```

Then open the frontend in your browser and use the app with the backend running.

## Ideal Use Cases

- Students dealing with stress, pressure, or low motivation
- Users who want a lightweight mood journal
- People who benefit from calming audio and guided breathing
- Anyone looking for a friendly mental wellness companion experience

## Future Improvements

- Better analytics and long-term mood insights
- More personalized recommendations
- Crisis-support escalation flows
- More wellness games and guided exercises
- Deployment with a production-ready frontend/backend workflow

## Note

This project is designed as a wellness support platform and not as a replacement for licensed mental health care or emergency services.
