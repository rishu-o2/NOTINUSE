export const mockCameras = [
  { id: 'CAM-01', location: 'Main Street Intersection', status: 'active' },
  { id: 'CAM-02', location: 'Highway 42 Exit', status: 'inactive' }
];

export const mockVehicles = [
  { id: 'V-101', type: 'Sedan', color: 'Blue', speed: 45 },
  { id: 'V-102', type: 'Truck', color: 'White', speed: 38 }
];

export const mockANPR = [
  { id: 'A-1', plate: 'XYZ-1234', timestamp: '2026-09-12T10:00:00Z', confidence: 0.98 },
  { id: 'A-2', plate: 'ABC-9876', timestamp: '2026-09-12T10:05:00Z', confidence: 0.95 }
];

export const mockTrajectories = [
  { vehicleId: 'V-101', path: [[0, 0], [1, 1], [2, 2]] }
];

export const mockAlerts = [
  { id: 'AL-1', type: 'Speeding', severity: 'High', message: 'Vehicle V-101 exceeded speed limit.' }
];
