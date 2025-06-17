
export interface MockAddress {
  id: string;
  fullAddress: string;
  // Potentially add city, street, etc. if more complex simulation is needed
}

export interface Trip {
  id:string;
  date: string; // ISO string
  description: string;
  kilometers: number;
  checkpointGapId: string; // Links trip to a specific gap: "checkpointStartId_checkpointEndId"
  purpose?: string; // e.g., "Business Meeting", "Client Visit", "Personal"
  startAddress?: string; // Could be MockAddress.id or free text
  endAddress?: string;   // Could be MockAddress.id or free text
  stops?: string[];      // Array of MockAddress.id or free text
}

export interface Checkpoint {
  id: string;
  name: string;
  odometer: number;
  date: string; // ISO string
}

export interface Vehicle {
  id: string;
  name: string;
  make?: string;
  model?: string;
  year?: number;
  licensePlate?: string;
  checkpoints: Checkpoint[];
  trips: Trip[];
}

export interface CheckpointGap {
  id: string;
  startCheckpoint: Checkpoint;
  endCheckpoint: Checkpoint;
  totalKilometers: number;
  justifiedKilometers: number;
  remainingKilometers: number;
  tripsInGap: Trip[];
}

export enum ModalType {
  NONE,
  ADD_VEHICLE,
  EDIT_VEHICLE,
  ADD_CHECKPOINT,
  EDIT_CHECKPOINT,
  ADD_TRIP,
  EDIT_TRIP
}

export interface ReportFilters {
  vehicleId: string; // 'all' or a specific vehicle ID
  startDate: string; // ISO string date part
  endDate: string;   // ISO string date part
}