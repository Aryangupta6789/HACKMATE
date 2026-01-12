# HackMate

Find the perfect teammates for your next hackathon or project.

## Tech Stack
-   **Frontend**: React (Vite)
-   **Styling**: Tailwind CSS
-   **Backend**: Firebase (Auth, Firestore, Storage)

## Setup

1.  Clone repository.
2.  `npm install`
3.  Create `.env` file with Firebase config:
    ```env
    VITE_FIREBASE_API_KEY=...
    VITE_FIREBASE_AUTH_DOMAIN=...
    VITE_FIREBASE_PROJECT_ID=...
    VITE_FIREBASE_STORAGE_BUCKET=...
    VITE_FIREBASE_MESSAGING_SENDER_ID=...
    VITE_FIREBASE_APP_ID=...
    ```
4.  `npm run dev`

## Deploy Firestore Rules
Make sure to deploy the security rules in `firestore.rules` and `storage.rules` to your Firebase Console.
