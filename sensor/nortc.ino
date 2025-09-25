#include <WiFi.h>
#include <HTTPClient.h>
#include <PubSubClient.h>
#include <DHT.h>

// ---------- CONFIG ----------
#define WIFI_SSID     "YourWiFiSSID"
#define WIFI_PASS     "YourWiFiPassword"

// Backend API (HTTP)
#define SERVER_URL    "http://your-backend-server/api/hvac"

// MQTT Broker
#define MQTT_SERVER   "your-mqtt-broker-ip"
#define MQTT_PORT     1883
#define MQTT_USER     "mqttuser"
#define MQTT_PASS     "mqttpass"

// Topics
#define TOPIC_HVAC_PUB   "hvac/data"    // ESP32 publishes temp+hum+aqi
#define TOPIC_AQI_SUB    "sensor/aqi"   // AQI comes from another device

// DHT Sensor
#define DHTPIN 4          // GPIO4
#define DHTTYPE DHT22
DHT dht(DHTPIN, DHTTYPE);

// Relays for HVAC Control
#define RELAY_COOL  26
#define RELAY_HEAT  27
#define RELAY_FAN   25

WiFiClient espClient;
PubSubClient client(espClient);

// AQI value from MQTT
int aqiValue = -1;

// ---------- FUNCTIONS ----------
void setup_wifi() {
  delay(10);
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(WIFI_SSID);

  WiFi.begin(WIFI_SSID, WIFI_PASS);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\nWiFi connected");
  Serial.println(WiFi.localIP());
}

void callback(char* topic, byte* payload, unsigned int length) {
  String message;
  for (unsigned int i = 0; i < length; i++) {
    message += (char)payload[i];
  }
  Serial.print("MQTT message arrived [");
  Serial.print(topic);
  Serial.print("]: ");
  Serial.println(message);

  if (String(topic) == TOPIC_AQI_SUB) {
    aqiValue = message.toInt();
    Serial.print("Updated AQI from MQTT: ");
    Serial.println(aqiValue);
  }
}

void reconnectMQTT() {
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    if (client.connect("ESP32Client", MQTT_USER, MQTT_PASS)) {
      Serial.println("connected");
      client.subscribe(TOPIC_AQI_SUB);  // subscribe to AQI topic
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      delay(5000);
    }
  }
}

void sendHTTP(float temp, float hum, int aqi) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(SERVER_URL);
    http.addHeader("Content-Type", "application/json");

    String json = "{\"temperature\":" + String(temp) +
                  ",\"humidity\":" + String(hum) +
                  ",\"aqi\":" + String(aqi) + "}";

    int httpResponseCode = http.POST(json);
    Serial.print("HTTP Response: ");
    Serial.println(httpResponseCode);
    http.end();
  }
}

void sendMQTT(float temp, float hum, int aqi) {
  if (!client.connected()) {
    reconnectMQTT();
  }
  client.loop();

  String payload = "{\"temperature\":" + String(temp) +
                   ",\"humidity\":" + String(hum) +
                   ",\"aqi\":" + String(aqi) + "}";

  client.publish(TOPIC_HVAC_PUB, payload.c_str());
}

void controlHVAC(float temp, float target) {
  if (temp > target + 1) {
    // Too hot → Cooling ON
    digitalWrite(RELAY_COOL, LOW);
    digitalWrite(RELAY_HEAT, HIGH);
    digitalWrite(RELAY_FAN, LOW);
    Serial.println("Cooling ON");
  } else if (temp < target - 1) {
    // Too cold → Heating ON
    digitalWrite(RELAY_HEAT, LOW);
    digitalWrite(RELAY_COOL, HIGH);
    digitalWrite(RELAY_FAN, LOW);
    Serial.println("Heating ON");
  } else {
    // Comfortable → All OFF
    digitalWrite(RELAY_COOL, HIGH);
    digitalWrite(RELAY_HEAT, HIGH);
    digitalWrite(RELAY_FAN, HIGH);
    Serial.println("System OFF");
  }
}

void setup() {
  Serial.begin(115200);

  pinMode(RELAY_COOL, OUTPUT);
  pinMode(RELAY_HEAT, OUTPUT);
  pinMode(RELAY_FAN, OUTPUT);

  digitalWrite(RELAY_COOL, HIGH);
  digitalWrite(RELAY_HEAT, HIGH);
  digitalWrite(RELAY_FAN, HIGH);

  dht.begin();

  setup_wifi();
  client.setServer(MQTT_SERVER, MQTT_PORT);
  client.setCallback(callback);
}

void loop() {
  if (!client.connected()) {
    reconnectMQTT();
  }
  client.loop();

  float temp = dht.readTemperature();
  float hum  = dht.readHumidity();

  if (isnan(temp) || isnan(hum)) {
    Serial.println("Failed to read from DHT sensor!");
    return;
  }

  // If AQI hasn't arrived yet, default to 0
  int aqi = (aqiValue >= 0) ? aqiValue : 0;

  Serial.print("Temp: "); Serial.print(temp);
  Serial.print(" °C, Hum: "); Serial.print(hum);
  Serial.print(" %, AQI: "); Serial.println(aqi);

  // Send combined data
  sendHTTP(temp, hum, aqi);
  sendMQTT(temp, hum, aqi);

  // Example target temperature
  float targetTemp = 25.0;
  controlHVAC(temp, targetTemp);

  delay(5000);
}
