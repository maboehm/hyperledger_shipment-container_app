interface sensorData {
  x: number,
  y: number,
  z: number,
  timestamp: number
}
interface geoData {
  lat: number,
  lon: number,
  timestamp: number
}

interface sensorEvent {
  acceleration: sensorData,
  gyroscope: sensorData,
  geolocation: geoData
}
