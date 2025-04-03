# Medicine Reminder App

A Next.js application that helps users manage their medicine schedules with ESP32 hardware integration.

## Features

- User authentication
- Medicine schedule management
- Real-time ESP32 device status monitoring
- Automatic alerts for medicine schedules
- Beautiful and responsive UI

## Tech Stack

- Next.js 15.2.4
- Firebase (Authentication & Realtime Database)
- TailwindCSS
- ESP32 Integration

## Hardware Requirements

- ESP32 Development Board
- TFT Display
- 74HC595 Shift Register
- LEDs and Buzzer for alerts

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables in `.env.local`:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
   NEXT_PUBLIC_FIREBASE_DATABASE_URL=your_database_url
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```

## ESP32 Setup

1. Install required libraries in Arduino IDE:
   - TFT_eSPI
   - FirebaseESP32
   - WiFi

2. Configure the ESP32 code with your:
   - WiFi credentials
   - Firebase credentials
   - Pin configurations

3. Upload the code to your ESP32 device

## Deployment

The application is deployed on Vercel. Any push to the main branch will trigger automatic deployment.

## License

MIT 