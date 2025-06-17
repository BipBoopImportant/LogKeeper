
import React, { useMemo } from 'react';
import { Vehicle, Checkpoint, Trip, CheckpointGap } from '../types';
import LogbookView from './LogbookView';
import Button from './Button';
import StatCard from './StatCard'; // Re-added
import { calculateCheckpointGaps, getStatsForVehicle } from '../utils/vehicleUtils'; // Re-added

interface DashboardViewProps {
  vehicle: Vehicle;
  onAddCheckpoint: () => void;
  onEditCheckpoint: (checkpoint: Checkpoint) => void;
  onDeleteCheckpoint: (checkpointId: string) => void;
  onAddTrip: (gap: CheckpointGap) => void;
  onEditTrip: (trip: Trip, gap: CheckpointGap) => void;
  onDeleteTrip: (tripId: string) => void;
  onEditVehicle: () => void;
}

const EditIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4" aria-hidden="true">
        <path d="M13.586 3.586a2 2 0 1 1 2.828 2.828l-.793.793-2.828-2.828.793-.793ZM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828Z" />
    </svg>
);


const DashboardView: React.FC<DashboardViewProps> = ({ 
  vehicle, 
  onAddCheckpoint, 
  onEditCheckpoint,
  onDeleteCheckpoint,
  onAddTrip,
  onEditTrip,
  onDeleteTrip,
  onEditVehicle
}) => {
  
  const checkpointGaps = useMemo(() => calculateCheckpointGaps(vehicle.checkpoints, vehicle.trips), [vehicle.checkpoints, vehicle.trips]);
  
  const stats = useMemo(() => getStatsForVehicle(vehicle, checkpointGaps), [vehicle, checkpointGaps]);

  const getRemainingKmsColorClasses = () => {
    if (stats.totalRemainingInGaps > 0) {
      return 'bg-theme-accent-yellow-bg-light text-theme-accent-yellow-text-on-light border-theme-accent-yellow/30';
    }
    if (stats.totalRemainingInGaps < 0) {
      return 'bg-theme-accent-red-bg-light text-theme-accent-red-text-on-light border-theme-accent-red/30';
    }
    return 'bg-theme-accent-green-bg-light text-theme-accent-green-text-on-light border-theme-accent-green/30';
  };


  return (
    <div className="space-y-6 md:space-y-8">
      {/* Vehicle Info Header */}
      <div className="bg-theme-bg-default shadow-md rounded-lg p-4 sm:p-5 md:p-6 border border-theme-border-default">
        <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-theme-text-default truncate" title={vehicle.name}>{vehicle.name}</h2>
            <div className="text-xs sm:text-sm text-theme-text-muted mt-1 space-x-2 divide-x divide-theme-border-default">
              {(vehicle.make || vehicle.model) && (
                <span className="pr-2 truncate">{vehicle.make} {vehicle.model} {vehicle.year ? `(${vehicle.year})` : ''}</span>
              )}
              {vehicle.licensePlate && (
                <span className="pl-2 truncate">Plaque : <span className="font-medium text-theme-text-default">{vehicle.licensePlate}</span></span>
              )}
            </div>
          </div>
          <Button 
            onClick={onEditVehicle} 
            variant="outline" 
            size="sm" 
            icon={<EditIcon/>} 
            className="self-start sm:self-auto flex-shrink-0"
            aria-label={`Modifier les informations pour ${vehicle.name}`}
          >
            Modifier Infos
          </Button>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5" role="region" aria-labelledby="vehicle-stats-heading">
        <h2 id="vehicle-stats-heading" className="sr-only">Statistiques du véhicule</h2>
        <StatCard title="Kilomètres totaux enregistrés" value={stats.totalKilometersLogged.toLocaleString('fr-CA', {maximumFractionDigits:1})} unit="km" />
        <StatCard title="Trajets totaux" value={stats.totalTrips.toLocaleString('fr-CA')} />
        <StatCard title="Kilomètres d'affaires" value={stats.businessKilometers.toLocaleString('fr-CA', {maximumFractionDigits:1})} unit="km" />
        <StatCard title="Kilomètres personnels" value={stats.personalKilometers.toLocaleString('fr-CA', {maximumFractionDigits:1})} unit="km" />
        <StatCard title="KM totaux dans les écarts" value={stats.totalKilometersInGaps.toLocaleString('fr-CA', {maximumFractionDigits:1})} unit="km" />
        <StatCard title="Justifiés dans les écarts" value={stats.totalJustifiedInGaps.toLocaleString('fr-CA', {maximumFractionDigits:1})} unit="km" />
        <StatCard 
          title="Restants dans les écarts" 
          value={stats.totalRemainingInGaps.toLocaleString('fr-CA', {maximumFractionDigits:1})} 
          unit="km" 
          className={getRemainingKmsColorClasses()}
          valueClassName={
            stats.totalRemainingInGaps > 0 ? 'text-theme-accent-yellow-text-on-light' : 
            stats.totalRemainingInGaps < 0 ? 'text-theme-accent-red-text-on-light' : 
            'text-theme-accent-green-text-on-light'
          }
        />
        <StatCard title="Longueur moy. trajet" value={stats.averageTripLength.toLocaleString('fr-CA', {minimumFractionDigits:1, maximumFractionDigits:1})} unit="km" />
      </div>


      {/* Directly render LogbookView */}
      <div id="detailed-logbook-panel">
            <LogbookView 
              vehicle={vehicle}
              onAddCheckpoint={onAddCheckpoint}
              onEditCheckpoint={onEditCheckpoint}
              onDeleteCheckpoint={onDeleteCheckpoint}
              onAddTrip={onAddTrip}
              onEditTrip={onEditTrip}
              onDeleteTrip={onDeleteTrip}
            />
        </div>
    </div>
  );
};

export default DashboardView;