
import React, { useState, useEffect, useCallback } from 'react';
import { Trip, CheckpointGap, MockAddress } from '../types';
import Modal from './Modal';
import InputField from './InputField';
import Button from './Button';
import { formatDate } from '../utils/vehicleUtils';

interface AddTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (trip: Omit<Trip, 'id'> | Trip) => void;
  gap: CheckpointGap;
  existingTrip?: Trip | null;
}

const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
    <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
  </svg>
);
const XMarkIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
    <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
  </svg>
);

const mockAddresses: MockAddress[] = [
  { id: 'addr1', fullAddress: "123 Rue Principale, Ville-Quelconque, QC" },
  { id: 'addr2', fullAddress: "456 Av. du Chêne, Petitville, QC" },
  { id: 'addr3', fullAddress: "789 Allée des Pins, Métropole, QC" },
  { id: 'addr4', fullAddress: "101 Prom. de l'Érable, Borddulac, QC" },
  { id: 'addr5', fullAddress: "222 Ch. des Bouleaux, HauteColline, QC" },
  { id: 'addr6', fullAddress: "333 Croissant des Cèdres, RiveCourbe, QC" },
  { id: 'addr7', fullAddress: "Édifice à bureaux, Centre-ville, Métropole" },
  { id: 'addr8', fullAddress: "Site Client A, Parc Industriel, Ville-Quelconque" },
  { id: 'addr9', fullAddress: "Complexe d'entrepôts, Quartier du Port, Métropole"},
  { id: 'addr10', fullAddress: "Centre commercial Suburbia, Périphérie de Petitville"}
];


const AddTripModal: React.FC<AddTripModalProps> = ({ isOpen, onClose, onSave, gap, existingTrip }) => {
  const [description, setDescription] = useState('');
  const [kilometers, setKilometers] = useState<number | ''>('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [purpose, setPurpose] = useState('');
  const [startAddress, setStartAddress] = useState('');
  const [endAddress, setEndAddress] = useState('');
  const [stops, setStops] = useState<string[]>([]);
  const [errors, setErrors] = useState<{ description?: string; kilometers?: string; date?: string; purpose?: string; startAddress?: string; endAddress?: string; stops?: string[] }>({});
  const [isKmSimulated, setIsKmSimulated] = useState(false);

  const maxKilometersAllowed = existingTrip
    ? parseFloat((gap.remainingKilometers + existingTrip.kilometers).toFixed(1))
    : parseFloat(gap.remainingKilometers.toFixed(1));

  const getFilteredMockAddresses = (query: string): {id: string, value: string}[] => {
    if (!query) return mockAddresses.map(a => ({id: a.id, value: a.fullAddress}));
    return mockAddresses
      .filter(addr => addr.fullAddress.toLowerCase().includes(query.toLowerCase()))
      .map(a => ({id: a.id, value: a.fullAddress}));
  };
  
  const simulateDistance = useCallback(() => {
    if (startAddress && endAddress) {
        let simulatedKm = 0;
        const baseDistance = Math.floor(Math.random() * (80 - 5 + 1)) + 5; 
        const perStopDistance = Math.floor(Math.random() * (20 - 2 + 1)) + 2; 
        
        simulatedKm = baseDistance + (stops.filter(s=>s.trim()).length * perStopDistance);
        
        if (maxKilometersAllowed > 0 && simulatedKm > maxKilometersAllowed) {
            simulatedKm = maxKilometersAllowed;
        } else if (simulatedKm <= 0) {
            simulatedKm = Math.random() * 5 + 1; 
        }

        setKilometers(parseFloat(simulatedKm.toFixed(1)));
        setIsKmSimulated(true);
        setErrors(prev => ({...prev, kilometers: undefined}));
    } else {
        if(isKmSimulated) {
            setKilometers('');
            setIsKmSimulated(false);
        }
    }
  }, [startAddress, endAddress, stops, maxKilometersAllowed, isKmSimulated]);

  useEffect(() => {
    simulateDistance();
  }, [startAddress, endAddress, stops, simulateDistance]);


  useEffect(() => {
    if (existingTrip) {
      setDescription(existingTrip.description);
      setKilometers(existingTrip.kilometers);
      setDate(new Date(existingTrip.date).toISOString().split('T')[0]);
      setPurpose(existingTrip.purpose || '');
      setStartAddress(existingTrip.startAddress || '');
      setEndAddress(existingTrip.endAddress || '');
      setStops(existingTrip.stops || []);
      setIsKmSimulated(false); 
    } else {
      setDescription('');
      setKilometers('');
      setPurpose('');
      setStartAddress('');
      setEndAddress('');
      setStops([]);
      setIsKmSimulated(false);
      const gapStartDate = new Date(gap.startCheckpoint.date);
      gapStartDate.setUTCHours(0,0,0,0); // Use UTC to avoid timezone issues with date comparison
      const today = new Date();
      today.setUTCHours(0,0,0,0);
      // Ensure date is not before gap start, prefer today if gap start is in future.
      const initialDate = gapStartDate > today ? gapStartDate : today;
      // Also ensure date is not after gap end date
      const gapEndDate = new Date(gap.endCheckpoint.date);
      gapEndDate.setUTCHours(0,0,0,0);
      setDate( (initialDate > gapEndDate ? gapEndDate : initialDate).toISOString().split('T')[0] );
    }
    setErrors({});
  }, [existingTrip, isOpen, gap]);

  const handleAddStop = () => {
    if (stops.length < 5) { 
        setStops([...stops, '']);
    }
  };

  const handleRemoveStop = (index: number) => {
    setStops(stops.filter((_, i) => i !== index));
  };

  const handleStopChange = (index: number, value: string) => {
    const newStops = [...stops];
    newStops[index] = value;
    setStops(newStops);
  };
  
  const handleKmChange = (value: string) => {
    setKilometers(value === '' ? '' : parseFloat(value));
    setIsKmSimulated(false); 
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const currentErrors: { description?: string; kilometers?: string; date?: string; purpose?: string } = {};
    if (!description.trim()) currentErrors.description = 'La description du trajet est requise.';
    if (!purpose.trim()) currentErrors.purpose = 'Le motif du trajet est requis (ex: Affaires, Personnel).';
    
    if (kilometers === '' || Number(kilometers) <= 0) {
      currentErrors.kilometers = 'Les kilomètres doivent être un nombre positif.';
    } else if (Number(kilometers) > maxKilometersAllowed) {
      currentErrors.kilometers = `Max. ${maxKilometersAllowed.toLocaleString('fr-CA')} km pour ce trajet (restant dans l'écart).`;
    }
    if (!date) currentErrors.date = 'La date est requise.';

    const tripDateObj = new Date(date + 'T00:00:00'); // Ensure local interpretation
    const gapStartDateObj = new Date(gap.startCheckpoint.date);
    const gapEndDateObj = new Date(gap.endCheckpoint.date);

    if (tripDateObj < gapStartDateObj || tripDateObj > gapEndDateObj) {
        currentErrors.date = `La date doit être entre le ${formatDate(gap.startCheckpoint.date)} et le ${formatDate(gap.endCheckpoint.date)}.`;
    }

    setErrors(currentErrors);

    if (Object.keys(currentErrors).length > 0) return;

    const tripData = {
      description: description.trim(),
      kilometers: Number(kilometers),
      date: new Date(date + 'T00:00:00').toISOString(), // Store as full ISO string, ensuring it's from local midnight
      checkpointGapId: gap.id,
      purpose: purpose.trim(),
      startAddress: startAddress.trim() || undefined,
      endAddress: endAddress.trim() || undefined,
      stops: stops.map(s => s.trim()).filter(s => s),
    };

    if (existingTrip) {
      onSave({ ...existingTrip, ...tripData });
    } else {
      onSave(tripData);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={existingTrip ? 'Modifier les détails du trajet' : 'Ajouter un nouveau trajet'}>
      <form onSubmit={handleSubmit} className="space-y-0">
        <div className="mb-4 p-3 bg-theme-bg-subtle rounded-md border border-theme-border-default text-xs sm:text-sm">
            <p className="text-theme-text-default font-semibold">
                Journalisation pour l'écart : <span className="text-theme-accent-blue">{gap.startCheckpoint.name} &rarr; {gap.endCheckpoint.name}</span>
            </p>
            <p className="text-theme-text-muted">
                Plage d'odomètre : {gap.startCheckpoint.odometer.toLocaleString('fr-CA')} km à {gap.endCheckpoint.odometer.toLocaleString('fr-CA')} km
            </p>
            <p className="text-theme-text-muted">
                KM max. pour ce trajet : <span className={`font-semibold ${maxKilometersAllowed > 0 ? 'text-theme-accent-green-text-on-light' : 'text-theme-accent-yellow-text-on-light'}`}>{maxKilometersAllowed.toLocaleString('fr-CA')} km</span> disponibles
            </p>
        </div>

        <InputField
          label="Adresse de départ"
          id="tripStartAddress"
          placeholder="Tapez pour rechercher ou entrez l'adresse"
          value={startAddress}
          onChange={(e) => setStartAddress(e.target.value)}
          error={errors.startAddress}
          maxLength={150}
          list="startAddress-list"
          datalistOptions={getFilteredMockAddresses(startAddress)}
          wrapperClassName="mb-3"
        />

        {stops.map((stop, index) => (
          <div key={`stop-${index}`} className="flex items-end space-x-2 mb-1">
            <InputField
              label={`Arrêt ${index + 1}`}
              id={`tripStop-${index}`}
              placeholder="Tapez pour rechercher ou entrez l'adresse de l'arrêt"
              value={stop}
              onChange={(e) => handleStopChange(index, e.target.value)}
              className="flex-grow !mb-0" 
              maxLength={150}
              list={`stopAddress-list-${index}`}
              datalistOptions={getFilteredMockAddresses(stop)}
              wrapperClassName="flex-grow !mb-0"
            />
            <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveStop(index)} className="mb-0 text-theme-accent-red hover:bg-theme-accent-red-bg-light h-[38px] px-2 self-center" aria-label="Supprimer l'arrêt" title="Supprimer l'arrêt">
              <XMarkIcon/>
            </Button>
          </div>
        ))}
        {stops.length < 5 && (
            <Button type="button" variant="outline" size="sm" onClick={handleAddStop} icon={<PlusIcon/>} className="mb-3 text-theme-text-muted">
            Ajouter un arrêt
            </Button>
        )}


        <InputField
          label="Adresse de fin"
          id="tripEndAddress"
          placeholder="Tapez pour rechercher ou entrez l'adresse"
          value={endAddress}
          onChange={(e) => setEndAddress(e.target.value)}
          error={errors.endAddress}
          maxLength={150}
          list="endAddress-list"
          datalistOptions={getFilteredMockAddresses(endAddress)}
          wrapperClassName="mb-3"
        />
        
        <div className="pt-1">
            <InputField
            label="Kilomètres parcourus*"
            id="tripKilometers"
            type="number"
            value={kilometers}
            onChange={(e) => handleKmChange(e.target.value)}
            max={maxKilometersAllowed > 0 ? maxKilometersAllowed : undefined}
            min="0.1"
            step="0.1"
            error={errors.kilometers}
            required
            />
            <p className="text-xs text-theme-text-muted -mt-2.5 mb-2.5 px-1">
                {isKmSimulated ? "Distance simulée selon les adresses. Ajustez si nécessaire." : "Entrez les km manuellement ou remplissez les adresses pour simulation."}
            </p>
        </div>

        <InputField
          label="Description du trajet*"
          id="tripDescription"
          placeholder="ex: Rencontre client à X, Visite de site Y"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          error={errors.description}
          maxLength={150}
          required
          wrapperClassName="mb-3"
        />
        <InputField
          label="Motif du trajet*"
          id="tripPurpose"
          placeholder="ex: Affaires, Personnel, Trajet domicile-travail"
          value={purpose}
          onChange={(e) => setPurpose(e.target.value)}
          error={errors.purpose}
          maxLength={50}
          required
          wrapperClassName="mb-3"
        />
        <InputField
          label="Date du trajet*"
          id="tripDate"
          type="date"
          value={date}
          min={new Date(gap.startCheckpoint.date).toISOString().split('T')[0]}
          max={new Date(gap.endCheckpoint.date).toISOString().split('T')[0]}
          onChange={(e) => setDate(e.target.value)}
          error={errors.date}
          required
        />
        <div className="pt-5 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3 space-y-2 space-y-reverse sm:space-y-0">
          <Button type="button" variant="secondary" onClick={onClose} fullWidth className="sm:w-auto">Annuler</Button>
          <Button type="submit" variant="primary" fullWidth className="sm:w-auto">Enregistrer le trajet</Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddTripModal;