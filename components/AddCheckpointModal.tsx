import React, { useState, useEffect } from 'react';
import { Checkpoint } from '../types';
import Modal from './Modal';
import InputField from './InputField';
import Button from './Button';
import { sortCheckpoints, formatDate } from '../utils/vehicleUtils';

interface AddCheckpointModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (checkpoint: Omit<Checkpoint, 'id'> | Checkpoint) => void;
  existingCheckpoint?: Checkpoint | null;
  vehicleCheckpoints: Checkpoint[]; // All checkpoints for the current vehicle
}

const AddCheckpointModal: React.FC<AddCheckpointModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  existingCheckpoint,
  vehicleCheckpoints
}) => {
  const [name, setName] = useState('');
  const [odometer, setOdometer] = useState<number | ''>('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [errors, setErrors] = useState<{ name?: string; odometer?: string; date?: string }>({});

  const sortedVehicleCheckpoints = sortCheckpoints(vehicleCheckpoints);
  
  const getPrecedingCheckpoint = () => {
    if (existingCheckpoint) {
      const currentIndex = sortedVehicleCheckpoints.findIndex(cp => cp.id === existingCheckpoint.id);
      return currentIndex > 0 ? sortedVehicleCheckpoints[currentIndex - 1] : null;
    }
    return sortedVehicleCheckpoints.length > 0 ? sortedVehicleCheckpoints[sortedVehicleCheckpoints.length - 1] : null;
  };

  const getSucceedingCheckpoint = () => {
    if (existingCheckpoint) {
      const currentIndex = sortedVehicleCheckpoints.findIndex(cp => cp.id === existingCheckpoint.id);
      return currentIndex < sortedVehicleCheckpoints.length - 1 ? sortedVehicleCheckpoints[currentIndex + 1] : null;
    }
    return null; 
  };


  useEffect(() => {
    if (existingCheckpoint) {
      setName(existingCheckpoint.name);
      setOdometer(existingCheckpoint.odometer);
      setDate(new Date(existingCheckpoint.date).toISOString().split('T')[0]);
    } else {
      setName('');
      const lastCheckpoint = sortedVehicleCheckpoints.length > 0 ? sortedVehicleCheckpoints[sortedVehicleCheckpoints.length - 1] : null;
      setOdometer(lastCheckpoint && typeof lastCheckpoint.odometer === 'number' ? '' : 0);
      setDate(new Date().toISOString().split('T')[0]);
    }
    setErrors({});
  }, [existingCheckpoint, isOpen, vehicleCheckpoints]); // sortedVehicleCheckpoints removed as it's derived

  const validateOdometer = (currentOdometer: number): string | undefined => {
    const precedingCp = getPrecedingCheckpoint();
    const succeedingCp = getSucceedingCheckpoint();

    if (precedingCp && currentOdometer <= precedingCp.odometer) {
      return `Doit être > précédent : ${precedingCp.odometer.toLocaleString('fr-CA')} km.`;
    }
    if (succeedingCp && currentOdometer >= succeedingCp.odometer) {
      return `Doit être < suivant : ${succeedingCp.odometer.toLocaleString('fr-CA')} km.`;
    }
    return undefined;
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const currentErrors: { name?: string; odometer?: string; date?: string } = {};
    if (!name.trim()) currentErrors.name = 'Le nom du point de contrôle est requis.';
    if (odometer === '' || Number(odometer) < 0) { // Check for negative explicitly
        currentErrors.odometer = "Le relevé d'odomètre doit être un nombre non négatif.";
    } else {
        const odometerError = validateOdometer(Number(odometer));
        if (odometerError) {
            currentErrors.odometer = odometerError;
        }
    }
    if (!date) currentErrors.date = 'La date est requise.';
    
    setErrors(currentErrors);

    if (Object.keys(currentErrors).length > 0) return;

    const checkpointData = {
      name: name.trim(),
      odometer: Number(odometer),
      date: new Date(date + 'T00:00:00').toISOString(), // Ensure consistent time for date-only input
    };

    if (existingCheckpoint) {
      onSave({ ...existingCheckpoint, ...checkpointData });
    } else {
      onSave(checkpointData);
    }
  };

  const precedingCp = getPrecedingCheckpoint();
  const succeedingCp = getSucceedingCheckpoint();
  const minOdometerValue = precedingCp ? precedingCp.odometer + 0.1 : 0; // Allow decimals
  const maxOdometerValue = succeedingCp ? succeedingCp.odometer - 0.1 : undefined;


  return (
    <Modal isOpen={isOpen} onClose={onClose} title={existingCheckpoint ? 'Modifier le point de contrôle' : 'Ajouter un nouveau point de contrôle'}>
      <form onSubmit={handleSubmit} className="space-y-0">
        <InputField
          label="Nom du point de contrôle*"
          id="checkpointName"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
          placeholder="ex: Début de journée, Arrêt essence"
          maxLength={100}
          required
        />
        <InputField
          label="Relevé d'odomètre (km)*"
          id="checkpointOdometer"
          type="number"
          value={odometer}
          onChange={(e) => setOdometer(e.target.value === '' ? '' : parseFloat(e.target.value))} // Allow float
          min={minOdometerValue.toString()}
          max={maxOdometerValue?.toString()}
          step="0.1" // Allow decimal input
          error={errors.odometer}
          placeholder={`ex: ${minOdometerValue > 0 ? minOdometerValue.toLocaleString('fr-CA', {minimumFractionDigits: 1}) : 12345.0}`}
          required
        />
        {(precedingCp || succeedingCp) && (
          <div className="text-xs text-theme-text-muted -mt-2.5 mb-2.5 space-y-0.5 px-1">
            {precedingCp && <p>Préc : {precedingCp.name} à {precedingCp.odometer.toLocaleString('fr-CA')} km ({formatDate(precedingCp.date)})</p>}
            {succeedingCp && <p>Suiv : {succeedingCp.name} à {succeedingCp.odometer.toLocaleString('fr-CA')} km ({formatDate(succeedingCp.date)})</p>}
          </div>
        )}
        <InputField
          label="Date du relevé*"
          id="checkpointDate"
          type="date"
          value={date}
          max={new Date().toISOString().split('T')[0]} 
          onChange={(e) => setDate(e.target.value)}
          error={errors.date}
          required
        />
        <div className="pt-5 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3 space-y-2 space-y-reverse sm:space-y-0">
          <Button type="button" variant="secondary" onClick={onClose} fullWidth className="sm:w-auto">Annuler</Button>
          <Button type="submit" variant="primary" fullWidth className="sm:w-auto">Enregistrer le point</Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddCheckpointModal;