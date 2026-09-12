class WebSocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  connect(url) {
    // To be implemented: connect to real WebSocket
    console.log('WebSocket mock connect to', url);
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  // Placeholder for future events:
  // - vehicle_detected
  // - anpr_read
  // - camera_status_change
  // - trajectory_update
  // - alert_triggered
  // - traffic_stats_update
}

export const wsService = new WebSocketService();
