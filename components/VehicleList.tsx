
import React from 'react';
import { Vehicle, CheckpointGap } from '../types'; 
import Button from './Button';
import { formatDate, calculateCheckpointGaps } from '../utils/vehicleUtils'; 

interface VehicleListProps {
  vehicles: Vehicle[];
  onSelectVehicle: (id: string) => void;
  onAddVehicle: () => void;
  onEditVehicle: (vehicle: Vehicle) => void;
  onDeleteVehicle: (id: string) => void;
}

const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
    <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
  </svg>
);

const CarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-theme-border-default">
    <path d="M8.25 18.75a1.5 1.5 0 0 1-3 0m10.5 0a1.5 1.5 0 0 1-3 0m-12.75-1.5A3.75 3.75 0 0 0 6 19.5h12a3.75 3.75 0 0 0 3.75-2.25V9A1.5 1.5 0 0 0 20.25 7.5H3.75A1.5 1.5 0 0 0 2.25 9v8.25Z" />
    <path fillRule="evenodd" d="M3 8.25C3 7.836 3.336 7.5 3.75 7.5h16.5c.414 0 .75.336.75.75V15a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V8.25Zm1.506 1.163c.094.053.192.098.294.132l.006.002 4.5 1.5a.75.75 0 0 0 .5.176h6a.75.75 0 0 0 .5-.176l4.5-1.5a.75.75 0 1 0-.5-1.414l-4.5 1.5a.75.75 0 0 0-.5.176h-6a.75.75 0 0 0-.5-.176l-4.5-1.5a.75.75 0 1 0-.5 1.414l.006.002Z" clipRule="evenodd" />
  </svg>
);


const VehicleList: React.FC<VehicleListProps> = ({ vehicles, onSelectVehicle, onAddVehicle, onEditVehicle, onDeleteVehicle }) => {
  return (
    <div className="space-y-6 md:space-y-8">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 sm:gap-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-theme-text-default">Mes véhicules</h2>
        <Button onClick={onAddVehicle} variant="primary" size="md" icon={<PlusIcon/>} className="self-start sm:self-auto">
          Ajouter un véhicule
        </Button>
      </div>
      {vehicles.length === 0 ? (
        <div className="text-center py-12 sm:py-16 bg-theme-bg-default rounded-lg shadow-md border border-theme-border-default">
          <CarIcon />
          <p className="mt-4 text-lg sm:text-xl font-semibold text-theme-text-default">Aucun véhicule pour l'instant.</p>
          <p className="mt-1 text-sm text-theme-text-muted px-4">Cliquez sur « Ajouter un véhicule » pour commencer avec votre journal de bord.</p>
           <Button onClick={onAddVehicle} variant="primary" size="md" className="mt-6" icon={<PlusIcon/>}>
              Ajoutez votre premier véhicule
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 md:gap-6">
          {vehicles.map(vehicle => {
            const checkpointGaps: CheckpointGap[] = calculateCheckpointGaps(vehicle.checkpoints, vehicle.trips);
            return (
              <div key={vehicle.id} className="bg-theme-bg-default rounded-lg shadow-md border border-theme-border-default flex flex-col overflow-hidden transition-all hover:shadow-lg hover:-translate-y-0.5">
                <div className="p-5 flex-grow">
                  <h3 className="text-lg sm:text-xl font-semibold text-theme-accent-blue mb-1.5 truncate" title={vehicle.name}>{vehicle.name}</h3>
                  {(vehicle.make || vehicle.model || vehicle.year) && (
                    <p className="text-xs sm:text-sm text-theme-text-default mb-1 truncate">
                      {vehicle.make} {vehicle.model} {vehicle.year ? `(${vehicle.year})` : ''}
                    </p>
                  )}
                  {vehicle.licensePlate && (
                    <p className="text-xs sm:text-sm text-theme-text-muted mb-2.5 truncate">Plaque : <span className="font-medium text-theme-text-default">{vehicle.licensePlate}</span></p>
                  )}
                  <div className="text-xs text-theme-text-muted space-y-0.5">
                      <p>Points de contrôle : <span className="font-medium text-theme-text-default">{vehicle.checkpoints.length}</span></p>
                      <p>Trajets enregistrés : <span className="font-medium text-theme-text-default">{vehicle.trips.length}</span></p>
                      {vehicle.checkpoints.length > 0 && (
                        <p className="pt-1">
                          Dernier point : <span className="font-medium text-theme-text-default">{formatDate(vehicle.checkpoints[vehicle.checkpoints.length - 1].date)} à {vehicle.checkpoints[vehicle.checkpoints.length - 1].odometer.toLocaleString('fr-CA')} km</span>
                        </p>
                      )}
                  </div>

                  {/* Mileage Gaps Section */}
                  <div className="mt-3 pt-3 border-t border-theme-border-default">
                    <h4 className="text-xs font-semibold text-theme-text-subtle uppercase tracking-wider mb-1.5">
                      Écarts de kilométrage
                    </h4>
                    {vehicle.checkpoints.length < 2 ? (
                      <p className="text-xs text-theme-text-muted">
                        Ajoutez au moins deux points de contrôle pour suivre les écarts.
                      </p>
                    ) : checkpointGaps.length === 0 ? (
                      <p className="text-xs text-theme-text-muted">
                        Aucun écart séquentiel trouvé. Assurez-vous que les relevés d'odomètre sont croissants.
                      </p>
                    ) : (
                      <ul className="space-y-1 text-xs max-h-20 overflow-y-auto pr-1">
                        {checkpointGaps.map(gap => (
                          <li key={gap.id} className="flex justify-between items-center gap-x-2 py-0.5">
                            <span className="text-theme-text-muted truncate" title={`${gap.startCheckpoint.name} → ${gap.endCheckpoint.name}`}>
                              {`${gap.startCheckpoint.name.substring(0, 10)}${gap.startCheckpoint.name.length > 10 ? '..' : ''} → ${gap.endCheckpoint.name.substring(0, 10)}${gap.endCheckpoint.name.length > 10 ? '..' : ''}`}
                            </span>
                            <span 
                              className={`font-medium whitespace-nowrap px-1.5 py-0.5 rounded-sm text-xs ${
                                gap.remainingKilometers > 0 ? 'text-theme-accent-yellow-text-on-light bg-theme-accent-yellow-bg-light' :
                                gap.remainingKilometers === 0 ? 'text-theme-accent-green-text-on-light bg-theme-accent-green-bg-light' :
                                'text-theme-accent-red-text-on-light bg-theme-accent-red-bg-light'
                              }`}
                            >
                              {gap.remainingKilometers.toLocaleString('fr-CA')} km
                              {gap.remainingKilometers < 0 && <span className="font-normal"> (Dépassement)</span>}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
                <div className="px-4 py-3 bg-theme-bg-subtle border-t border-theme-border-default grid grid-cols-3 gap-2">
                  <Button onClick={() => onEditVehicle(vehicle)} variant="outline" size="sm">Modifier</Button>
                  <Button onClick={(e) => { e.stopPropagation(); onDeleteVehicle(vehicle.id);}} variant="outline" size="sm" className="border-theme-accent-red text-theme-accent-red hover:bg-theme-accent-red-bg-light focus:ring-theme-accent-red">Supprimer</Button>
                  <Button onClick={() => onSelectVehicle(vehicle.id)} variant="primary" size="sm">Voir les détails</Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default VehicleList;