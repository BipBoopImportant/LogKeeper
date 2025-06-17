import React, { useState, useEffect } from 'react';
import { Vehicle } from '../types';
import Modal from './Modal';
import InputField from './InputField';
import Button from './Button';

interface AddVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (vehicle: Vehicle | Omit<Vehicle, 'id' | 'checkpoints' | 'trips'>) => void;
  existingVehicle?: Vehicle | null;
}

const AddVehicleModal: React.FC<AddVehicleModalProps> = ({ isOpen, onClose, onSave, existingVehicle }) => {
  const [name, setName] = useState('');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState<number | ''>('');
  const [licensePlate, setLicensePlate] = useState('');
  const [errors, setErrors] = useState<{ name?: string; year?: string }>({});

  useEffect(() => {
    if (existingVehicle) {
      setName(existingVehicle.name);
      setMake(existingVehicle.make || '');
      setModel(existingVehicle.model || '');
      setYear(existingVehicle.year || '');
      setLicensePlate(existingVehicle.licensePlate || '');
    } else {
      setName('');
      setMake('');
      setModel('');
      setYear('');
      setLicensePlate('');
    }
    setErrors({});
  }, [existingVehicle, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const currentErrors: { name?: string; year?: string } = {};
    if (!name.trim()) {
      currentErrors.name = 'Le nom du véhicule est requis.';
    }
    if (year && (Number(year) < 1900 || Number(year) > new Date().getFullYear() + 2)) {
      currentErrors.year = `Veuillez entrer une année valide (ex: 1900-${new Date().getFullYear() + 2}).`;
    }

    setErrors(currentErrors);
    if (Object.keys(currentErrors).length > 0) return;
    
    const vehicleData = {
      name: name.trim(),
      make: make.trim(),
      model: model.trim(),
      year: year ? Number(year) : undefined,
      licensePlate: licensePlate.trim(),
    };

    if (existingVehicle) {
      onSave({ ...existingVehicle, ...vehicleData });
    } else {
      onSave(vehicleData);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={existingVehicle ? 'Modifier les détails du véhicule' : 'Ajouter un nouveau véhicule'}>
      <form onSubmit={handleSubmit} className="space-y-0">
        <InputField
          label="Nom / Identifiant du véhicule*"
          id="vehicleName"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
          maxLength={100}
          required
          placeholder="ex: Camion 01, Auto de service"
        />
        <InputField
          label="Marque"
          id="vehicleMake"
          placeholder="ex: Toyota, Ford"
          value={make}
          maxLength={50}
          onChange={(e) => setMake(e.target.value)}
        />
        <InputField
          label="Modèle"
          id="vehicleModel"
          placeholder="ex: Camry, F-150"
          value={model}
          maxLength={50}
          onChange={(e) => setModel(e.target.value)}
        />
        <InputField
          label="Année"
          id="vehicleYear"
          type="number"
          placeholder="ex: 2023"
          value={year}
          min="1900"
          max={new Date().getFullYear() + 2} 
          onChange={(e) => setYear(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
          error={errors.year}
        />
        <InputField
          label="Plaque d'immatriculation"
          id="vehicleLicensePlate"
          placeholder="ex: ABC-123"
          value={licensePlate}
          maxLength={20}
          onChange={(e) => setLicensePlate(e.target.value)}
        />
        <div className="pt-5 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3 space-y-2 space-y-reverse sm:space-y-0">
          <Button type="button" variant="secondary" onClick={onClose} fullWidth className="sm:w-auto">Annuler</Button>
          <Button type="submit" variant="primary" fullWidth className="sm:w-auto">Enregistrer le véhicule</Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddVehicleModal;