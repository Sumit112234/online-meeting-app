# VideoMeet - Professional Video Conferencing App

A complete Google Meet-like video conferencing application built with Next.js, Firebase, and WebRTC.

## Features

- **Authentication**
  - Google OAuth
  - Email/Password login
  - Guest access

- **Meeting Management**
  - Create instant meetings
  - Join with meeting code/link
  - Waiting room with host approval
  - Pre-join device preview

- **Video Conferencing**
  - HD video and audio
  - WebRTC peer-to-peer connections
  - Firebase Realtime Database signaling
  - Multiple layout views (grid, pinned)
  - Up to 50 participants

- **Meeting Controls**
  - Toggle camera on/off
  - Toggle microphone on/off
  - Screen sharing/presentation
  - Raise hand
  - Leave meeting

- **Real-time Features**
  - Live chat
  - Participant list
  - Real-time status updates
  - Connection state monitoring

- **Host Controls**
  - Admit/reject from waiting room
  - Remove participants
  - Lower raised hands
  - End meeting

## Setup Instructions

### 1. Firebase Configuration

Create a Firebase project at [https://console.firebase.google.com](https://console.firebase.google.com)

Enable the following services:
- **Authentication**: Enable Google and Email/Password providers
- **Realtime Database**: Create a database and set rules:

\`\`\`json
{
  "rules": {
    "meetings": {
      "$meetingId": {
        ".read": true,
        ".write": true
      }
    },
    "users": {
      "$userId": {
        ".read": true,
        ".write": "$userId === auth.uid"
      }
    }
  }
}
\`\`\`

### 2. Environment Variables

Create a `.env.local` file in the root directory with your Firebase configuration:

\`\`\`env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your_project_id.firebaseio.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
\`\`\`

### 3. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 4. Run Development Server

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

\`\`\`
app/
  ├── page.jsx              # Landing page
  ├── login/
  │   └── page.jsx          # Login/signup page
  ├── dashboard/
  │   └── page.jsx          # User dashboard
  ├── meet/[meetingId]/
  │   └── page.jsx          # Meeting page
  └── layout.jsx            # Root layout

components/
  ├── auth-provider.jsx     # Auth context provider
  ├── navbar.jsx            # Navigation bar
  ├── pre-join.jsx          # Pre-join screen
  ├── waiting-room.jsx      # Waiting room view
  ├── admin-waiting-room.jsx # Host waiting room controls
  ├── meeting-room.jsx      # Main meeting container
  ├── meeting-header.jsx    # Meeting info header
  ├── meeting-controls.jsx  # Control bar
  ├── video-grid.jsx        # Video layout grid
  ├── participant-tile.jsx  # Individual video tile
  ├── chat-panel.jsx        # Chat sidebar
  └── participants-panel.jsx # Participants sidebar

lib/
  ├── firebase.js           # Firebase initialization
  ├── auth.js               # Auth helpers
  ├── realtime.js           # Realtime DB operations
  └── webrtc.js             # WebRTC utilities

hooks/
  ├── use-auth.js           # Auth hook
  ├── use-meeting-state.js  # Meeting state hook
  ├── use-webrtc.js         # WebRTC hook
  └── use-chat.js           # Chat hook
\`\`\`

## Usage

### Creating a Meeting

1. Sign in or continue as guest
2. Click "New Meeting" on homepage or dashboard
3. You'll be redirected to your meeting room
4. Share the meeting link with participants

### Joining a Meeting

1. Enter the meeting code or click the meeting link
2. Enter your name (if guest)
3. Preview and adjust camera/mic settings
4. Click "Join Meeting"
5. Wait for host approval (if required)

### During the Meeting

- **Toggle Camera/Mic**: Click the camera or mic button
- **Screen Share**: Click the screen share button
- **Raise Hand**: Click the hand button to get host's attention
- **Chat**: Click the chat button to open messaging
- **View Participants**: Click the users button
- **Leave Meeting**: Click the red phone button

### Host Controls

- **Waiting Room**: Admit or reject participants
- **Participant Management**: Remove users or lower raised hands
- **Meeting Control**: End meeting for all participants

## Browser Requirements

- Chrome 90+ (recommended)
- Firefox 88+
- Safari 15+
- Edge 90+

WebRTC requires:
- Camera and microphone permissions
- Secure context (HTTPS or localhost)

## Production Deployment

For production deployment:

1. Use HTTPS (required for WebRTC)
2. Configure TURN servers for better connectivity
3. Set proper Firebase security rules
4. Implement rate limiting
5. Add error logging and monitoring

## Troubleshooting

**No video/audio**:
- Check browser permissions
- Ensure HTTPS or localhost
- Check device connections

**Cannot connect to peers**:
- Check firewall settings
- Configure TURN servers
- Verify Firebase connection

**Waiting room not working**:
- Check Firebase rules
- Verify authentication state

## License

This project is created for demonstration purposes.
