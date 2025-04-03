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
- LEDs and Speaker for alerts

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
