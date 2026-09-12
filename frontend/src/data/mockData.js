// 8 Delhi Camera Locations
export const mockCameras = [
  { id: 'CAM-01', code: 'C1', name: 'Connaught Place Outer Circle', pos: [28.6328, 77.2197], status: 'ACTIVE', resolution: '1080p @ 30fps', readsToday: 14230, accuracy: 94.2, lastSeen: 'Just now' },
  { id: 'CAM-02', code: 'C2', name: 'India Gate Radial Spine', pos: [28.6129, 77.2295], status: 'ACTIVE', resolution: '1080p @ 30fps', readsToday: 18940, accuracy: 96.1, lastSeen: 'Just now' },
  { id: 'CAM-03', code: 'C3', name: 'ITO Junction North Arterial', pos: [28.6289, 77.2415], status: 'ACTIVE', resolution: '4K @ 25fps', readsToday: 23150, accuracy: 91.8, lastSeen: 'Just now' },
  { id: 'CAM-04', code: 'C4', name: 'Karol Bagh Pusa Road', pos: [28.6448, 77.1895], status: 'ACTIVE', resolution: '1080p @ 30fps', readsToday: 11420, accuracy: 93.5, lastSeen: '1 min ago' },
  { id: 'CAM-05', code: 'C5', name: 'AIIMS Ring Road Flyover', pos: [28.5672, 77.2100], status: 'ACTIVE', resolution: '4K @ 30fps', readsToday: 29800, accuracy: 95.0, lastSeen: 'Just now' },
  { id: 'CAM-06', code: 'C6', name: 'Dhaula Kuan Intersect', pos: [28.5921, 77.1563], status: 'ACTIVE', resolution: '1080p @ 30fps', readsToday: 16750, accuracy: 92.4, lastSeen: 'Just now' },
  { id: 'CAM-07', code: 'C7', name: 'Lajpat Nagar Central Market', pos: [28.5700, 77.2435], status: 'OFFLINE', resolution: '1080p @ 30fps', readsToday: 8430, accuracy: 89.2, lastSeen: '14 mins ago' },
  { id: 'CAM-08', code: 'C8', name: 'Kashmiri Gate ISBT Junction', pos: [28.6675, 77.2290], status: 'ACTIVE', resolution: '4K @ 30fps', readsToday: 21900, accuracy: 94.7, lastSeen: 'Just now' }
];

// 20 ANPR Plate Records
export const mockANPRRecords = [
  { id: 'REC-001', plate: 'PB10XX1234', camera: 'CAM-01', location: 'Connaught Place', timestamp: '2026-09-12 14:48:12', speed: 42, status: 'Clear', vehicleType: 'Sedan (White)' },
  { id: 'REC-002', plate: 'DL08CX9901', camera: 'CAM-05', location: 'AIIMS Flyover', timestamp: '2026-09-12 14:47:55', speed: 78, status: 'Blacklist', vehicleType: 'SUV (Black)' },
  { id: 'REC-003', plate: 'HR26DQ5521', camera: 'CAM-03', location: 'ITO Junction', timestamp: '2026-09-12 14:46:30', speed: 85, status: 'Speeding', vehicleType: 'Sedan (Silver)' },
  { id: 'REC-004', plate: 'UP16AZ4120', camera: 'CAM-02', location: 'India Gate', timestamp: '2026-09-12 14:45:10', speed: 38, status: 'Clear', vehicleType: 'Hatchback (Red)' },
  { id: 'REC-005', plate: 'DL01AB1234', camera: 'CAM-04', location: 'Karol Bagh', timestamp: '2026-09-12 14:44:02', speed: 34, status: 'Clear', vehicleType: 'SUV (White)' },
  { id: 'REC-006', plate: 'CH01TB9002', camera: 'CAM-08', location: 'Kashmiri Gate', timestamp: '2026-09-12 14:42:50', speed: 92, status: 'Speeding', vehicleType: 'Motorcycle' },
  { id: 'REC-007', plate: 'DL04NB3119', camera: 'CAM-06', location: 'Dhaula Kuan', timestamp: '2026-09-12 14:41:18', speed: 45, status: 'Clear', vehicleType: 'Sedan (Grey)' },
  { id: 'REC-008', plate: 'HR55AC7788', camera: 'CAM-05', location: 'AIIMS Flyover', timestamp: '2026-09-12 14:40:05', speed: 51, status: 'Clear', vehicleType: 'Commercial Van' },
  { id: 'REC-009', plate: 'DL10CE0044', camera: 'CAM-01', location: 'Connaught Place', timestamp: '2026-09-12 14:38:44', speed: 29, status: 'Clear', vehicleType: 'Hatchback (Blue)' },
  { id: 'REC-010', plate: 'UP14BT8899', camera: 'CAM-03', location: 'ITO Junction', timestamp: '2026-09-12 14:36:20', speed: 41, status: 'Clear', vehicleType: 'Sedan (White)' },
  { id: 'REC-011', plate: 'RJ14CV6060', camera: 'CAM-02', location: 'India Gate', timestamp: '2026-09-12 14:34:15', speed: 68, status: 'Speeding', vehicleType: 'SUV (Grey)' },
  { id: 'REC-012', plate: 'DL03XY9100', camera: 'CAM-04', location: 'Karol Bagh', timestamp: '2026-09-12 14:32:00', speed: 32, status: 'Clear', vehicleType: 'Hatchback (White)' },
  { id: 'REC-013', plate: 'DL09MC4401', camera: 'CAM-08', location: 'Kashmiri Gate', timestamp: '2026-09-12 14:30:19', speed: 47, status: 'Clear', vehicleType: 'Bus (State)' },
  { id: 'REC-014', plate: 'HR29AK2233', camera: 'CAM-06', location: 'Dhaula Kuan', timestamp: '2026-09-12 14:28:40', speed: 82, status: 'Speeding', vehicleType: 'Sedan (Black)' },
  { id: 'REC-015', plate: 'UK07TA1010', camera: 'CAM-05', location: 'AIIMS Flyover', timestamp: '2026-09-12 14:26:12', speed: 39, status: 'Clear', vehicleType: 'SUV (Silver)' },
  { id: 'REC-016', plate: 'DL01SA7711', camera: 'CAM-01', location: 'Connaught Place', timestamp: '2026-09-12 14:24:50', speed: 22, status: 'Clear', vehicleType: 'Auto Rickshaw' },
  { id: 'REC-017', plate: 'UP32DE5544', camera: 'CAM-03', location: 'ITO Junction', timestamp: '2026-09-12 14:22:30', speed: 40, status: 'Clear', vehicleType: 'Sedan (Red)' },
  { id: 'REC-018', plate: 'DL07CC2020', camera: 'CAM-02', location: 'India Gate', timestamp: '2026-09-12 14:20:10', speed: 36, status: 'Clear', vehicleType: 'Hatchback (Black)' },
  { id: 'REC-019', plate: 'DL08CX9901', camera: 'CAM-08', location: 'Kashmiri Gate', timestamp: '2026-09-12 14:15:02', speed: 64, status: 'Blacklist', vehicleType: 'SUV (Black)' },
  { id: 'REC-020', plate: 'PB10XX1234', camera: 'CAM-06', location: 'Dhaula Kuan', timestamp: '2026-09-12 14:10:00', speed: 50, status: 'Clear', vehicleType: 'Sedan (White)' }
];

// Active Alerts (5 records)
export const mockAlerts = [
  { id: 'ALT-101', severity: 'critical', type: 'Blacklisted Vehicle', message: 'Flagged plate DL08CX9901 spotted at AIIMS Flyover (CAM-05)', camera: 'CAM-05', time: '14:47:55', status: 'Active' },
  { id: 'ALT-102', severity: 'warning', type: 'Severe Speeding', message: 'Vehicle HR26DQ5521 traveling at 85 km/h in 50 km/h corridor', camera: 'CAM-03', time: '14:46:30', status: 'Active' },
  { id: 'ALT-103', severity: 'warning', type: 'Overspeed Violation', message: 'Vehicle CH01TB9002 clocked at 92 km/h at ISBT entry', camera: 'CAM-08', time: '14:42:50', status: 'Active' },
  { id: 'ALT-104', severity: 'info', type: 'Camera Offline', message: 'CAM-07 Lajpat Nagar disconnected (Heartbeat timeout)', camera: 'CAM-07', time: '14:35:00', status: 'Investigating' },
  { id: 'ALT-105', severity: 'info', type: 'High Density Congestion', message: 'Queue length exceeding 450m on ITO Junction approach', camera: 'CAM-03', time: '14:30:00', status: 'Active' },
  { id: 'ALT-106', severity: 'resolved', type: 'Wrong Way Entry', message: 'Two-wheeler entered one-way corridor at Outer Circle', camera: 'CAM-01', time: '13:55:10', status: 'Resolved' },
  { id: 'ALT-107', severity: 'resolved', type: 'Signal Jump', message: 'Commercial carrier jumped red signal at Ring Road cross', camera: 'CAM-05', time: '13:20:44', status: 'Resolved' }
];

// Trajectories Data
export const mockTrajectories = {
  'PB10XX1234': {
    plate: 'PB10XX1234',
    model: 'Hyundai Verna (White)',
    status: 'Clear',
    totalDistance: '18.4 km',
    duration: '38 mins',
    avgSpeed: '39.2 km/h',
    stops: [
      { camera: 'CAM-06', location: 'Dhaula Kuan Intersect', time: '14:10:00', speed: '50 km/h', direction: 'North-East', pos: [28.5921, 77.1563] },
      { camera: 'CAM-04', location: 'Karol Bagh Pusa Road', time: '14:22:15', speed: '36 km/h', direction: 'East', pos: [28.6448, 77.1895] },
      { camera: 'CAM-01', location: 'Connaught Place Outer Circle', time: '14:35:40', speed: '31 km/h', direction: 'South-East', pos: [28.6328, 77.2197] },
      { camera: 'CAM-02', location: 'India Gate Radial Spine', time: '14:48:12', speed: '42 km/h', direction: 'South', pos: [28.6129, 77.2295] }
    ]
  },
  'DL08CX9901': {
    plate: 'DL08CX9901',
    model: 'Toyota Fortuner (Black)',
    status: 'Blacklist',
    warningReason: 'Wanted: NCR Stolen Vehicle FIR #8821',
    totalDistance: '22.1 km',
    duration: '32 mins',
    avgSpeed: '52.4 km/h',
    stops: [
      { camera: 'CAM-08', location: 'Kashmiri Gate ISBT Junction', time: '14:15:02', speed: '64 km/h', direction: 'South', pos: [28.6675, 77.2290] },
      { camera: 'CAM-03', location: 'ITO Junction North Arterial', time: '14:26:18', speed: '58 km/h', direction: 'South', pos: [28.6289, 77.2415] },
      { camera: 'CAM-02', location: 'India Gate Radial Spine', time: '14:37:40', speed: '48 km/h', direction: 'South-West', pos: [28.6129, 77.2295] },
      { camera: 'CAM-05', location: 'AIIMS Ring Road Flyover', time: '14:47:55', speed: '78 km/h', direction: 'West', pos: [28.5672, 77.2100] }
    ]
  }
};

// 24-Hour Traffic Counts
export const mockHourlyTraffic = [
  { hour: '00:00', count: 420, avgSpeed: 52 },
  { hour: '01:00', count: 280, avgSpeed: 55 },
  { hour: '02:00', count: 190, avgSpeed: 58 },
  { hour: '03:00', count: 160, avgSpeed: 60 },
  { hour: '04:00', count: 230, avgSpeed: 57 },
  { hour: '05:00', count: 540, avgSpeed: 50 },
  { hour: '06:00', count: 1120, avgSpeed: 44 },
  { hour: '07:00', count: 2450, avgSpeed: 35 },
  { hour: '08:00', count: 4100, avgSpeed: 28 },
  { hour: '09:00', count: 5600, avgSpeed: 22 },
  { hour: '10:00', count: 6200, avgSpeed: 19 },
  { hour: '11:00', count: 5400, avgSpeed: 24 },
  { hour: '12:00', count: 4900, avgSpeed: 27 },
  { hour: '13:00', count: 4700, avgSpeed: 29 },
  { hour: '14:00', count: 5100, avgSpeed: 26 },
  { hour: '15:00', count: 5800, avgSpeed: 23 },
  { hour: '16:00', count: 6400, avgSpeed: 20 },
  { hour: '17:00', count: 7200, avgSpeed: 16 },
  { hour: '18:00', count: 7800, avgSpeed: 15 },
  { hour: '19:00', count: 7100, avgSpeed: 18 },
  { hour: '20:00', count: 5900, avgSpeed: 24 },
  { hour: '21:00', count: 4200, avgSpeed: 32 },
  { hour: '22:00', count: 2600, avgSpeed: 40 },
  { hour: '23:00', count: 1100, avgSpeed: 48 }
];

// 10 Congested Road Segments
export const mockCongestedSegments = [
  { name: 'ITO Junction → Vikas Marg', congestion: 88, status: 'Severe', length: '2.4 km' },
  { name: 'AIIMS Flyover → Dhaula Kuan', congestion: 82, status: 'Severe', length: '4.8 km' },
  { name: 'Kashmiri Gate → ISBT Radial', congestion: 74, status: 'Heavy', length: '1.9 km' },
  { name: 'Connaught Place Outer → Barakhamba', congestion: 69, status: 'Heavy', length: '1.2 km' },
  { name: 'Karol Bagh → Pusa Road', congestion: 61, status: 'Moderate', length: '2.1 km' },
  { name: 'India Gate Radial → Tilak Marg', congestion: 54, status: 'Moderate', length: '1.6 km' },
  { name: 'Lajpat Nagar Ring Rd Underpass', congestion: 48, status: 'Moderate', length: '3.1 km' },
  { name: 'Dhaula Kuan → Airport Corridor', congestion: 39, status: 'Normal', length: '5.5 km' },
  { name: 'Moti Bagh → Shanti Path', congestion: 32, status: 'Normal', length: '2.8 km' },
  { name: 'Civil Lines → Mall Road', congestion: 24, status: 'Clear', length: '3.4 km' }
];

// Speed Distribution
export const mockSpeedDistribution = [
  { range: '0-20 km/h', count: 1840 },
  { range: '20-40 km/h', count: 4920 },
  { range: '40-60 km/h', count: 6810 },
  { range: '60-80 km/h', count: 2350 },
  { range: '80+ km/h', count: 420 }
];

// Top Origin-Destination Routes
export const mockTopRoutes = [
  { route: 'Kashmiri Gate → AIIMS', trips: 1420 },
  { route: 'Dhaula Kuan → CP', trips: 1290 },
  { route: 'ITO → Karol Bagh', trips: 1150 },
  { route: 'Lajpat Nagar → India Gate', trips: 980 },
  { route: 'Karol Bagh → CP', trips: 870 },
  { route: 'AIIMS → Dhaula Kuan', trips: 810 },
  { route: 'India Gate → ITO', trips: 760 },
  { route: 'CP → Kashmiri Gate', trips: 690 },
  { route: 'Pusa Rd → Ring Road', trips: 590 },
  { route: 'Barakhamba → Vikas Marg', trips: 520 }
];
