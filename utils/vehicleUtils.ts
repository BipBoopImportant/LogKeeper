import { Checkpoint, Trip, CheckpointGap, Vehicle } from '../types';

export const sortCheckpoints = (checkpoints: Checkpoint[]): Checkpoint[] => {
  return [...checkpoints].sort((a, b) => a.odometer - b.odometer);
};

export const calculateCheckpointGaps = (checkpoints: Checkpoint[], trips: Trip[]): CheckpointGap[] => {
  const sortedCheckpoints = sortCheckpoints(checkpoints);
  const gaps: CheckpointGap[] = [];

  if (sortedCheckpoints.length < 2) {
    return gaps;
  }

  for (let i = 0; i < sortedCheckpoints.length - 1; i++) {
    const startCheckpoint = sortedCheckpoints[i];
    const endCheckpoint = sortedCheckpoints[i+1];

    if (endCheckpoint.odometer <= startCheckpoint.odometer) {
        console.warn(`Séquence d'odomètre invalide : L'odomètre de fin (${endCheckpoint.odometer}) n'est pas supérieur à l'odomètre de début (${startCheckpoint.odometer}) pour les points ${startCheckpoint.name} et ${endCheckpoint.name}. Écart ignoré.`);
        continue;
    }
    
    const gapId = `${startCheckpoint.id}_${endCheckpoint.id}`;
    const totalKilometers = endCheckpoint.odometer - startCheckpoint.odometer;
    
    const tripsInGap = trips.filter(trip => trip.checkpointGapId === gapId);
    const justifiedKilometers = tripsInGap.reduce((sum, trip) => sum + trip.kilometers, 0);
    const remainingKilometers = totalKilometers - justifiedKilometers;

    gaps.push({
      id: gapId,
      startCheckpoint,
      endCheckpoint,
      totalKilometers,
      justifiedKilometers,
      remainingKilometers,
      tripsInGap
    });
  }
  return gaps;
};

export const formatDate = (isoDateString: string): string => {
  if (!isoDateString) return 'S/O';
  try {
    // Ensure the date is interpreted as local before formatting to fr-CA
    const date = new Date(isoDateString);
    // Add time component to avoid timezone shifts affecting the date part for display
    const localDate = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
    return localDate.toLocaleDateString('fr-CA', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch (e) {
    return 'Date invalide';
  }
};

export const getStatsForVehicle = (vehicle: Vehicle | null, gaps: CheckpointGap[]) => {
  if (!vehicle) {
    return {
      totalKilometersLogged: 0,
      totalTrips: 0,
      businessKilometers: 0,
      personalKilometers: 0, 
      totalKilometersInGaps: 0,
      totalJustifiedInGaps: 0,
      totalRemainingInGaps: 0,
      averageTripLength: 0,
    };
  }

  const totalKilometersLogged = vehicle.trips.reduce((sum, trip) => sum + trip.kilometers, 0);
  const totalTrips = vehicle.trips.length;
  
  const businessKilometers = vehicle.trips
    .filter(trip => trip.purpose?.toLowerCase().includes('affaires')) // Translated
    .reduce((sum, trip) => sum + trip.kilometers, 0);
  
  const personalKilometers = vehicle.trips
    .filter(trip => trip.purpose?.toLowerCase().includes('personnel')) // Translated
    .reduce((sum, trip) => sum + trip.kilometers, 0);

  const totalKilometersInGaps = gaps.reduce((sum, gap) => sum + gap.totalKilometers, 0);
  const totalJustifiedInGaps = gaps.reduce((sum, gap) => sum + gap.justifiedKilometers, 0);
  const totalRemainingInGaps = gaps.reduce((sum, gap) => sum + gap.remainingKilometers, 0);
  
  const averageTripLength = totalTrips > 0 ? totalKilometersLogged / totalTrips : 0;

  return {
    totalKilometersLogged,
    totalTrips,
    businessKilometers,
    personalKilometers,
    totalKilometersInGaps,
    totalJustifiedInGaps,
    totalRemainingInGaps,
    averageTripLength,
  };
};

export interface MileageByPurposeData {
  labels: string[];
  datasets: {
    data: number[];
    backgroundColor: string[];
    hoverBackgroundColor: string[];
  }[];
}

export const getMileageByPurpose = (trips: Trip[]): MileageByPurposeData => {
  const purposeMap: { [key: string]: number } = {};
  trips.forEach(trip => {
    const purposeKey = trip.purpose?.trim().toLowerCase() || 'non catégorisé';
    purposeMap[purposeKey] = (purposeMap[purposeKey] || 0) + trip.kilometers;
  });

  const labels = Object.keys(purposeMap).map(p => p.charAt(0).toUpperCase() + p.slice(1)); 
  const data = Object.values(purposeMap);
  
  const bgColors = [ 
    '#2563EB', 
    '#60A5FA', 
    '#93C5FD', 
    '#D1D5DB', 
    '#A78BFA', 
    '#FBBF24', 
  ];
   const hoverBgColors = [ 
    '#1D4ED8', 
    '#3B82F6', 
    '#60A5FA', 
    '#9CA3AF', 
    '#8B5CF6', 
    '#F59E0B', 
  ];


  return {
    labels,
    datasets: [{
      data,
      backgroundColor: labels.map((_, i) => bgColors[i % bgColors.length]),
      hoverBackgroundColor: labels.map((_, i) => hoverBgColors[i % hoverBgColors.length]),
    }]
  };
};

export interface MileageOverTimeData {
  labels: string[]; 
  datasets: {
    label: string;
    data: number[];
    fill: boolean;
    borderColor: string;
    backgroundColor?: string; 
    tension: number;
  }[];
}

export const getMileageOverTime = (trips: Trip[], numberOfMonths: number = 6): MileageOverTimeData => {
  const monthlyData: { [key: string]: number } = {}; 
  const monthLabels: string[] = [];

  const today = new Date();
  for (let i = numberOfMonths - 1; i >= 0; i--) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const monthLabel = date.toLocaleString('fr-CA', { month: 'short' }); // Use fr-CA
    
    monthlyData[monthKey] = 0;
    monthLabels.push(monthLabel);
  }
  
  trips.forEach(trip => {
    const tripDate = new Date(trip.date);
    const tripMonthKey = `${tripDate.getFullYear()}-${String(tripDate.getMonth() + 1).padStart(2, '0')}`;
    if (monthlyData.hasOwnProperty(tripMonthKey)) {
      monthlyData[tripMonthKey] += trip.kilometers;
    }
  });

  return {
    labels: monthLabels,
    datasets: [{
      label: 'Kilomètres enregistrés',
      data: Object.values(monthlyData),
      fill: false,
      borderColor: '#2563EB', 
      backgroundColor: '#2563EB', 
      tension: 0.1
    }]
  };
};