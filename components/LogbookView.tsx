
import React, { useMemo } from 'react';
import { Vehicle, Checkpoint, Trip, CheckpointGap } from '../types';
import Button from './Button';
import { calculateCheckpointGaps, formatDate } from '../utils/vehicleUtils';

interface LogbookViewProps {
  vehicle: Vehicle;
  onAddCheckpoint: () => void;
  onEditCheckpoint: (checkpoint: Checkpoint) => void;
  onDeleteCheckpoint: (checkpointId: string) => void;
  onAddTrip: (gap: CheckpointGap) => void;
  onEditTrip: (trip: Trip, gap: CheckpointGap) => void;
  onDeleteTrip: (tripId: string) => void;
}

const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4" aria-hidden="true">
    <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
  </svg>
);

const LogbookView: React.FC<LogbookViewProps> = ({
  vehicle,
  onAddCheckpoint,
  onEditCheckpoint,
  onDeleteCheckpoint,
  onAddTrip,
  onEditTrip,
  onDeleteTrip
}) => {
  const checkpointGaps = useMemo(() => calculateCheckpointGaps(vehicle.checkpoints, vehicle.trips), [vehicle.checkpoints, vehicle.trips]);

  const truncateAddress = (address: string | undefined, maxLength: number = 15) => { 
    if (!address) return <span className="text-theme-text-subtle">S/O</span>;
    if (address.length <= maxLength) return address;
    return address.substring(0, maxLength) + '...';
  };

  return (
    <div className="space-y-6 md:space-y-8 mt-4 md:mt-6">
      {/* Checkpoints Section */}
      <div className="bg-theme-bg-default shadow-md rounded-lg border border-theme-border-default overflow-hidden">
        <div className="p-4 sm:p-5 md:p-6 flex flex-col sm:flex-row justify-between sm:items-center border-b border-theme-border-default gap-2" role="region" aria-labelledby="checkpoints-heading">
          <h3 id="checkpoints-heading" className="text-lg sm:text-xl font-semibold text-theme-text-default">Journal des points de contrôle</h3>
          <Button onClick={onAddCheckpoint} variant="primary" size="sm" icon={<PlusIcon/>} className="self-start sm:self-auto">Ajouter un point de contrôle</Button>
        </div>
        {vehicle.checkpoints.length === 0 ? (
          <p className="text-theme-text-muted py-6 text-center text-sm px-4">Aucun point de contrôle ajouté pour l'instant. Ajoutez un point de contrôle pour commencer à suivre les écarts de kilométrage.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-theme-border-default" aria-label="Journal des points de contrôle">
              <thead className="bg-theme-bg-subtle">
                <tr>
                  <th scope="col" className="px-3 py-2.5 sm:px-4 sm:py-3 text-left text-xs font-semibold text-theme-text-muted uppercase tracking-wider">Nom</th>
                  <th scope="col" className="px-3 py-2.5 sm:px-4 sm:py-3 text-left text-xs font-semibold text-theme-text-muted uppercase tracking-wider">Date</th>
                  <th scope="col" className="px-3 py-2.5 sm:px-4 sm:py-3 text-right text-xs font-semibold text-theme-text-muted uppercase tracking-wider">Odomètre (km)</th>
                  <th scope="col" className="px-3 py-2.5 sm:px-4 sm:py-3 text-center text-xs font-semibold text-theme-text-muted uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-theme-bg-default divide-y divide-theme-border-default">
                {vehicle.checkpoints.map(cp => (
                  <tr key={cp.id} className="hover:bg-theme-bg-subtle transition-colors">
                    <td className="px-3 py-2.5 sm:px-4 sm:py-3 whitespace-nowrap text-xs sm:text-sm font-medium text-theme-text-default">{cp.name}</td>
                    <td className="px-3 py-2.5 sm:px-4 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-theme-text-muted">{formatDate(cp.date)}</td>
                    <td className="px-3 py-2.5 sm:px-4 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-theme-text-muted text-right">{cp.odometer.toLocaleString('fr-CA')}</td>
                    <td className="px-3 py-2.5 sm:px-4 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-center space-x-1 sm:space-x-2">
                      <Button onClick={() => onEditCheckpoint(cp)} variant="outline" size="sm" aria-label={`Modifier le point de contrôle ${cp.name}`}>Modifier</Button>
                      <Button onClick={() => onDeleteCheckpoint(cp.id)} variant="outline" size="sm" className="border-theme-accent-red text-theme-accent-red hover:bg-theme-accent-red-bg-light focus:ring-theme-accent-red" aria-label={`Supprimer le point de contrôle ${cp.name}`}>Supprimer</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Checkpoint Gaps & Trips Section */}
      {checkpointGaps.length > 0 && (
        <div className="space-y-6 md:space-y-8">
          <h3 className="text-lg sm:text-xl font-semibold text-theme-text-default px-1">Écarts de kilométrage et trajets</h3>
          {checkpointGaps.map(gap => (
            <div key={gap.id} className="bg-theme-bg-default shadow-md rounded-lg border border-theme-border-default overflow-hidden" role="region" aria-labelledby={`gap-heading-${gap.id}`}>
              <div className="p-4 sm:p-5 md:p-6 bg-theme-bg-subtle border-b border-theme-border-default">
                <h4 id={`gap-heading-${gap.id}`} className="text-base sm:text-lg font-semibold text-theme-text-default">
                  Écart : {gap.startCheckpoint.name} &rarr; {gap.endCheckpoint.name}
                </h4>
                <p className="text-xs text-theme-text-muted mt-0.5">
                    Odomètre : {gap.startCheckpoint.odometer.toLocaleString('fr-CA')} km ({formatDate(gap.startCheckpoint.date)})
                    &nbsp;à&nbsp; {gap.endCheckpoint.odometer.toLocaleString('fr-CA')} km ({formatDate(gap.endCheckpoint.date)})
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 mt-3 text-xs">
                    <div className="p-2 sm:p-2.5 bg-theme-bg-default rounded-md border border-theme-border-subtle">
                        <span className="block text-theme-text-muted uppercase tracking-wider">Total</span>
                        <span className="block font-semibold text-theme-text-default text-sm sm:text-base">{gap.totalKilometers.toLocaleString('fr-CA')} km</span>
                    </div>
                    <div className="p-2 sm:p-2.5 bg-theme-accent-green-bg-light rounded-md border border-theme-accent-green/30">
                        <span className="block text-theme-accent-green-text-on-light uppercase tracking-wider">Justifié</span>
                        <span className="block font-semibold text-theme-accent-green-text-on-light text-sm sm:text-base">{gap.justifiedKilometers.toLocaleString('fr-CA')} km</span>
                    </div>
                    <div className="p-2 sm:p-2.5 bg-theme-bg-default rounded-md border border-theme-border-subtle">
                        <span className="block text-theme-text-muted uppercase tracking-wider">À justifier</span>
                        <span className={`block font-semibold text-sm sm:text-base ${gap.remainingKilometers > 0 ? 'text-theme-accent-yellow-text-on-light' : (gap.remainingKilometers < 0 ? 'text-theme-accent-red-text-on-light' : 'text-theme-text-default')}`}>
                            {gap.remainingKilometers.toLocaleString('fr-CA')} km
                            {gap.remainingKilometers < 0 && <span className="ml-1 text-xs font-normal">(Dépassement de {Math.abs(gap.remainingKilometers).toLocaleString('fr-CA')})</span>}
                        </span>
                    </div>
                </div>
              </div>

              <div className="p-4 sm:p-5 md:p-6">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-3 sm:mb-4 gap-2" role="toolbar" aria-label={`Trajets pour l'écart ${gap.startCheckpoint.name} à ${gap.endCheckpoint.name}`}>
                  <h5 className="text-sm sm:text-base font-semibold text-theme-text-default">Trajets dans cet écart ({gap.tripsInGap.length})</h5>
                  <Button
                    onClick={() => onAddTrip(gap)}
                    variant="primary"
                    size="sm"
                    disabled={gap.remainingKilometers <= 0} 
                    title={gap.remainingKilometers <= 0 ? "Aucun kilomètre restant à justifier, ou l'écart est sur-justifié." : "Ajouter un trajet à cet écart"}
                    icon={<PlusIcon/>}
                    className="self-start sm:self-auto"
                  >
                    Ajouter un trajet
                  </Button>
                </div>
                {gap.tripsInGap.length === 0 ? (
                  <p className="text-theme-text-muted text-sm py-6 text-center">Aucun trajet enregistré pour cet écart de kilométrage.</p>
                ) : (
                  <div className="overflow-x-auto -mx-4 sm:-mx-5 md:-mx-6">
                      <table className="min-w-full divide-y divide-theme-border-default text-xs sm:text-sm" aria-label={`Trajets pour l'écart ${gap.startCheckpoint.name} à ${gap.endCheckpoint.name}`}>
                          <thead className="bg-theme-bg-subtle">
                              <tr>
                                  <th scope="col" className="px-3 py-2.5 sm:px-4 sm:py-3 text-left font-semibold text-theme-text-muted uppercase tracking-wider">Date</th>
                                  <th scope="col" className="px-3 py-2.5 sm:px-4 sm:py-3 text-left font-semibold text-theme-text-muted uppercase tracking-wider">Description</th>
                                  <th scope="col" className="px-3 py-2.5 sm:px-4 sm:py-3 text-left font-semibold text-theme-text-muted uppercase tracking-wider">Motif</th>
                                  <th scope="col" className="px-3 py-2.5 sm:px-4 sm:py-3 text-left font-semibold text-theme-text-muted uppercase tracking-wider">Route</th>
                                  <th scope="col" className="px-3 py-2.5 sm:px-4 sm:py-3 text-right font-semibold text-theme-text-muted uppercase tracking-wider">KM</th>
                                  <th scope="col" className="px-3 py-2.5 sm:px-4 sm:py-3 text-center font-semibold text-theme-text-muted uppercase tracking-wider">Actions</th>
                              </tr>
                          </thead>
                          <tbody className="bg-theme-bg-default divide-y divide-theme-border-default">
                          {gap.tripsInGap.map(trip => (
                              <tr key={trip.id} className="hover:bg-theme-bg-subtle transition-colors">
                                <td className="px-3 py-2.5 sm:px-4 sm:py-3 whitespace-nowrap text-theme-text-muted">{formatDate(trip.date)}</td>
                                <td className="px-3 py-2.5 sm:px-4 sm:py-3 text-theme-text-default max-w-[150px] sm:max-w-xs truncate" title={trip.description}>{trip.description}</td>
                                <td className="px-3 py-2.5 sm:px-4 sm:py-3 text-theme-text-default">{trip.purpose || '-'}</td>
                                <td className="px-3 py-2.5 sm:px-4 sm:py-3 text-theme-text-default max-w-[150px] sm:max-w-xs truncate" title={`${trip.startAddress || 'S/O'}${trip.stops && trip.stops.length > 0 ? ' via ' + trip.stops.join(', ') : ''} à ${trip.endAddress || 'S/O'}`}>
                                    {truncateAddress(trip.startAddress)} &rarr; {truncateAddress(trip.endAddress)}
                                    {trip.stops && trip.stops.length > 0 && <span className="text-xs block text-theme-text-subtle">(+{trip.stops.length} arrêt{trip.stops.length > 1 ? 's' : ''})</span>}
                                </td>
                                <td className="px-3 py-2.5 sm:px-4 sm:py-3 whitespace-nowrap text-right font-medium text-theme-text-default">{trip.kilometers.toLocaleString('fr-CA')}</td>
                                <td className="px-3 py-2.5 sm:px-4 sm:py-3 whitespace-nowrap text-center space-x-1 sm:space-x-2">
                                    <Button onClick={() => onEditTrip(trip, gap)} variant="outline" size="sm" aria-label={`Modifier le trajet ${trip.description}`}>Modifier</Button>
                                    <Button onClick={() => onDeleteTrip(trip.id)} variant="outline" size="sm" className="border-theme-accent-red text-theme-accent-red hover:bg-theme-accent-red-bg-light focus:ring-theme-accent-red" aria-label={`Supprimer le trajet ${trip.description}`}>Suppr.</Button>
                                </td>
                              </tr>
                          ))}
                          </tbody>
                      </table>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
       {vehicle.checkpoints.length > 0 && checkpointGaps.length === 0 && (
         <div className="bg-theme-bg-default shadow-md rounded-lg p-6 md:p-8 mt-6 border border-theme-border-default">
            <p className="text-theme-text-muted text-center py-4 text-sm px-4">Vous avez besoin d'au moins deux points de contrôle pour définir un écart de kilométrage afin d'enregistrer des trajets. Veuillez ajouter un autre point de contrôle.</p>
         </div>
       )}
        {vehicle.checkpoints.length === 0 && (
            <div className="bg-theme-bg-default shadow-md rounded-lg p-6 md:p-8 mt-6 border border-theme-border-default">
                <p className="text-theme-text-muted text-center py-4 text-sm px-4">Ajoutez des points de contrôle pour commencer à créer des écarts de kilométrage et à enregistrer vos trajets.</p>
            </div>
        )}
    </div>
  );
};

export default LogbookView;