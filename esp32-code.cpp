#include <WiFi.h>
#include <TFT_eSPI.h>
#include "time.h"
#include <FirebaseESP32.h>

// WiFi credentials
const char* ssid = "X28VP-2.4G-6D9581";
const char* password = "9A0DA89F";

// NTP server settings (UAE Time)
const char* ntpServer = "ae.pool.ntp.org";
const long gmtOffset_sec = 14400; // UTC+4
const int daylightOffset_sec = 0; // No daylight saving

// Shift register pins
#define DATA_PIN 17 // DS
#define CLOCK_PIN 22 // SHCP
#define LATCH_PIN 27 // STCP

// TFT display object
TFT_eSPI tft = TFT_eSPI();
#define SCREEN_WIDTH 240
#define SCREEN_HEIGHT 135

// Firebase credentials - Updated to your specific database
#define FIREBASE_HOST "https://medicinereminder-f62b8-default-rtdb.asia-southeast1.firebasedatabase.app/"
#define FIREBASE_AUTH "EGDc1Ju1QAIetSssk0Y3EF1KEGY6zwfm1Pc4HCm8" 

// Firebase objects
FirebaseConfig config;
FirebaseAuth auth;
FirebaseData firebaseData;

// Structure to hold schedule data
struct Schedule {
  int hour;
  int minute;
  bool tablets[4]; // Array for 4 tablets (true/false for each)
};

// Array for 3 schedules
Schedule schedules[3];

// Last time device status was updated
unsigned long lastStatusUpdate = 0;
const unsigned long STATUS_UPDATE_INTERVAL = 30000; // Update status every 30 seconds

void setup() {
  Serial.begin(115200);

  // Initialize TFT
  tft.init();
  tft.setRotation(1);
  tft.fillScreen(TFT_BLACK);
  tft.setTextColor(TFT_WHITE, TFT_BLACK);

  // Initialize shift register pins
  pinMode(DATA_PIN, OUTPUT);
  pinMode(CLOCK_PIN, OUTPUT);
  pinMode(LATCH_PIN, OUTPUT);
  digitalWrite(LATCH_PIN, LOW);

  // Connect to WiFi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nConnected to WiFi");

  // Configure NTP
  configTime(gmtOffset_sec, daylightOffset_sec, ntpServer);
  while (!time(nullptr)) {
    delay(1000);
  }
  Serial.println("Time synced!");

  // Configure Firebase
  config.host = FIREBASE_HOST;
  config.signer.tokens.legacy_token = FIREBASE_AUTH;
  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);

  // Initial device status update
  updateDeviceStatus();
}

// Function to update shift register
void updateShiftRegister(byte data) {
  digitalWrite(LATCH_PIN, LOW);
  shiftOut(DATA_PIN, CLOCK_PIN, MSBFIRST, data);
  digitalWrite(LATCH_PIN, HIGH);
}

// Update device status in Firebase
void updateDeviceStatus() {
  String path = "/esp32/status";
  
  // Get current time as timestamp
  struct tm timeinfo;
  if (getLocalTime(&timeinfo)) {
    char timestamp[30];
    strftime(timestamp, sizeof(timestamp), "%Y-%m-%dT%H:%M:%S", &timeinfo);
    
    // Create a JSON object for the status
    FirebaseJson json;
    json.set("online", true);
    json.set("lastSeen", timestamp);
    
    // Update status in Firebase
    if (Firebase.updateNode(firebaseData, path, json)) {
      Serial.println("Status updated successfully");
    } else {
      Serial.println("Status update failed");
      Serial.println("Reason: " + firebaseData.errorReason());
    }
  }
}

// Fetch schedule data from Firebase (modified to handle strings)
void getFirebaseData() {
  for (int i = 0; i < 3; i++) {
    String path = "/schedules/schedule" + String(i+1);
    FirebaseJson *json = nullptr;

    if (Firebase.getJSON(firebaseData, path)) {
      json = new FirebaseJson();
      json->setJsonData(firebaseData.jsonString());
      
      FirebaseJsonData result;
      
      // Get hour
      json->get(result, "hour");
      if (result.success) {
        schedules[i].hour = result.stringValue.toInt();
      }

      // Get minute
      json->get(result, "minute");
      if (result.success) {
        schedules[i].minute = result.stringValue.toInt();
      }

      // Get tablets status
      for (int j = 0; j < 4; j++) {
        String tabletKey = "tablet" + String(j+1);
        json->get(result, tabletKey);
        if (result.success) {
          schedules[i].tablets[j] = (result.stringValue == "true" || result.stringValue == "TRUE");
        }
      }

      delete json;
    }
  }
}

// Display a single schedule on TFT
void displaySchedule(int scheduleIndex) {
  char timeStr[10];
  snprintf(timeStr, sizeof(timeStr), "%02d:%02d",
    schedules[scheduleIndex].hour, schedules[scheduleIndex].minute);

  int y = 70 + (scheduleIndex * 20);
  tft.setTextSize(1);
  tft.setTextColor(TFT_CYAN, TFT_BLACK);
  tft.setCursor(10, y);
  tft.print("Schedule ");
  tft.print(scheduleIndex + 1);
  tft.print(": ");
  tft.print(timeStr);
  tft.print(" Tablets:");

  for (int i = 0; i < 4; i++) {
    if (schedules[scheduleIndex].tablets[i]) {
      tft.print(" ");
      tft.print(i + 1);
    }
  }
}

// Display the current time and schedules
void displayTimeAndSchedules(struct tm *timeinfo) {
  static int lastMinute = -1;
  
  // Only update display if minute has changed
  if (timeinfo->tm_min != lastMinute) {
    lastMinute = timeinfo->tm_min;
    
    tft.fillScreen(TFT_BLACK);

    // Display current time
    char timeStr[20];
    strftime(timeStr, sizeof(timeStr), "%H:%M:%S", timeinfo);
    tft.setTextSize(3);
    int x = (SCREEN_WIDTH - (strlen(timeStr) * 18)) / 2;
    tft.setCursor(x, 20);
    tft.setTextColor(TFT_WHITE, TFT_BLACK);
    tft.println(timeStr);

    // Display all schedules
    for (int i = 0; i < 3; i++) {
      displaySchedule(i);
    }
  }
}

// Check schedules and trigger alerts
void checkAndTriggerAlerts(struct tm *timeinfo) {
  bool alertActive = false;
  byte shiftData = 0;

  for (int i = 0; i < 3; i++) {
    if (timeinfo->tm_hour == schedules[i].hour &&
        timeinfo->tm_min == schedules[i].minute &&
        timeinfo->tm_sec < 5) {

      alertActive = true;
      tft.setTextSize(2);
      tft.setCursor(10, 50);
      tft.setTextColor(TFT_RED, TFT_BLACK);
      tft.print("Schedule ");
      tft.print(i + 1);
      tft.println(": Take Meds!");

      // Set LED bits for tablets
      for (int j = 0; j < 4; j++) {
        if (schedules[i].tablets[j]) {
          shiftData |= (1 << j);
        }
      }
      shiftData |= (1 << 4); // Activate buzzer
    }
  }

  if (alertActive) {
    updateShiftRegister(shiftData);
    delay(5000); // Alarm delay
    updateShiftRegister(0); // Turn off buzzer and LEDs
  }
}

void loop() {
  struct tm timeinfo;
  if (!getLocalTime(&timeinfo)) {
    tft.fillScreen(TFT_BLACK);
    tft.setTextSize(2);
    tft.setCursor(50, SCREEN_HEIGHT / 2 - 10);
    tft.println("Failed to get time");
    delay(1000);
    return;
  }

  // Update device status periodically
  unsigned long currentMillis = millis();
  if (currentMillis - lastStatusUpdate >= STATUS_UPDATE_INTERVAL) {
    updateDeviceStatus();
    lastStatusUpdate = currentMillis;
  }

  // Update data from Firebase every minute
  static unsigned long lastFetchTime = 0;
  if (currentMillis - lastFetchTime >= 60000) { // Fetch every 60 seconds
    getFirebaseData();
    lastFetchTime = currentMillis;
  }

  // Display the time and schedules
  displayTimeAndSchedules(&timeinfo);

  // Check and trigger alerts if needed
  checkAndTriggerAlerts(&timeinfo);

  delay(1000);
}

