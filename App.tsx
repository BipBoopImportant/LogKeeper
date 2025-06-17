
import React, { useState, useEffect, useCallback } from 'react';
import { Vehicle, Checkpoint, Trip, ModalType, CheckpointGap, ReportFilters } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import VehicleList from './components/VehicleList';
import DashboardView from './components/DashboardView'; // New
import AddVehicleModal from './components/AddVehicleModal';
import AddCheckpointModal from './components/AddCheckpointModal';
import AddTripModal from './components/AddTripModal';
import Header from './components/Header';
import ReportView from './components/ReportView';
import ConfirmModal from './components/ConfirmModal'; // Import ConfirmModal
import { calculateCheckpointGaps, sortCheckpoints } from './utils/vehicleUtils';

interface ConfirmModalState {
  isOpen: boolean;
  message: string;
  onConfirm: () => void;
  confirmButtonText?: string;
  confirmButtonVariant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
}

const App: React.FC = () => {
  const [vehicles, setVehicles] = useLocalStorage<Vehicle[]>('vehicles', []);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<ModalType>(ModalType.NONE);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [editingCheckpoint, setEditingCheckpoint] = useState<Checkpoint | null>(null);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [currentGapForTrip, setCurrentGapForTrip] = useState<CheckpointGap | null>(null);

  type ViewType = 'vehicleList' | 'dashboard' | 'reports';
  const [currentView, setCurrentView] = useState<ViewType>('vehicleList');

  const [confirmModalState, setConfirmModalState] = useState<ConfirmModalState>({
    isOpen: false,
    message: '',
    onConfirm: () => {},
    confirmButtonText: 'Confirmer',
    confirmButtonVariant: 'danger',
  });

  const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId) || null;

  useEffect(() => {
    if (selectedVehicleId && selectedVehicle && currentView === 'vehicleList') {
      setCurrentView('dashboard');
    }
    else if (!selectedVehicleId && currentView === 'dashboard') {
      setCurrentView('vehicleList');
    }
    else if (selectedVehicleId && !selectedVehicle && currentView === 'dashboard') {
        setSelectedVehicleId(null); 
        setCurrentView('vehicleList');
    }
  }, [selectedVehicleId, selectedVehicle, currentView, setSelectedVehicleId]);


  const handleAddVehicle = (vehicle: Omit<Vehicle, 'id' | 'checkpoints' | 'trips'>) => {
    const newVehicle: Vehicle = {
      ...vehicle,
      id: crypto.randomUUID(),
      checkpoints: [],
      trips: []
    };
    setVehicles(prev => [...prev, newVehicle]);
    setActiveModal(ModalType.NONE);
    setSelectedVehicleId(newVehicle.id); 
  };

  const handleUpdateVehicle = (updatedVehicle: Vehicle) => {
    setVehicles(prev => prev.map(v => v.id === updatedVehicle.id ? updatedVehicle : v));
    setActiveModal(ModalType.NONE);
    setEditingVehicle(null);
  };

  const closeConfirmModal = () => {
    setConfirmModalState(prev => ({ ...prev, isOpen: false }));
  };

  const handleDeleteVehicle = (vehicleId: string) => {
    const vehicleToDelete = vehicles.find(v => v.id === vehicleId);
    setConfirmModalState({
      isOpen: true,
      message: `Êtes-vous sûr de vouloir supprimer le véhicule « ${vehicleToDelete?.name || 'ce véhicule'} » et toutes ses données ? Cette action est irréversible.`,
      confirmButtonText: 'Supprimer le véhicule',
      confirmButtonVariant: 'danger',
      onConfirm: () => {
        setVehicles(prev => prev.filter(v => v.id !== vehicleId));
        if (selectedVehicleId === vehicleId) {
          setSelectedVehicleId(null);
          setCurrentView('vehicleList');
        }
        closeConfirmModal();
      },
    });
  };

  const handleAddCheckpoint = (vehicleId: string, checkpoint: Omit<Checkpoint, 'id'>) => {
    setVehicles(prev => prev.map(v => {
      if (v.id === vehicleId) {
        const newCheckpoint: Checkpoint = { ...checkpoint, id: crypto.randomUUID() };
        const updatedCheckpoints = sortCheckpoints([...v.checkpoints, newCheckpoint]);
        return { ...v, checkpoints: updatedCheckpoints };
      }
      return v;
    }));
    setActiveModal(ModalType.NONE);
  };

  const handleUpdateCheckpoint = (vehicleId: string, updatedCheckpoint: Checkpoint) => {
     setVehicles(prev => prev.map(v => {
      if (v.id === vehicleId) {
        const updatedCheckpoints = sortCheckpoints(
          v.checkpoints.map(cp => cp.id === updatedCheckpoint.id ? updatedCheckpoint : cp)
        );
        return { ...v, checkpoints: updatedCheckpoints };
      }
      return v;
    }));
    setActiveModal(ModalType.NONE);
    setEditingCheckpoint(null);
  };

  const handleDeleteCheckpoint = (vehicleId: string, checkpointId: string) => {
    const checkpointToDelete = vehicles.find(v => v.id === vehicleId)?.checkpoints.find(cp => cp.id === checkpointId);
    setConfirmModalState({
      isOpen: true,
      message: `Êtes-vous sûr de vouloir supprimer le point de contrôle « ${checkpointToDelete?.name || 'ce point de contrôle'} » ? Ceci pourrait affecter les trajets et écarts associés.`,
      confirmButtonText: 'Supprimer le point de contrôle',
      confirmButtonVariant: 'danger',
      onConfirm: () => {
        setVehicles(prev => prev.map(v => {
            if (v.id === vehicleId) {
                const remainingCheckpoints = v.checkpoints.filter(cp => cp.id !== checkpointId);
                const currentGaps = calculateCheckpointGaps(remainingCheckpoints, v.trips);
                const validGapIds = new Set(currentGaps.map(g => g.id));
                const filteredTrips = v.trips.filter(trip => validGapIds.has(trip.checkpointGapId));
                return { ...v, checkpoints: remainingCheckpoints, trips: filteredTrips };
            }
            return v;
        }));
        closeConfirmModal();
      },
    });
  };

  const handleAddTrip = (vehicleId: string, trip: Omit<Trip, 'id'>) => {
    setVehicles(prev => prev.map(v => {
      if (v.id === vehicleId) {
        const newTrip: Trip = {
          ...trip,
          id: crypto.randomUUID(),
          startAddress: trip.startAddress || undefined,
          endAddress: trip.endAddress || undefined,
          stops: trip.stops || [],
        };
        return { ...v, trips: [...v.trips, newTrip] };
      }
      return v;
    }));
    setActiveModal(ModalType.NONE);
    setCurrentGapForTrip(null);
  };

  const handleUpdateTrip = (vehicleId: string, updatedTrip: Trip) => {
    setVehicles(prev => prev.map(v => {
      if (v.id === vehicleId) {
        return { ...v, trips: v.trips.map(t => t.id === updatedTrip.id ? {
          ...updatedTrip,
          startAddress: updatedTrip.startAddress || undefined,
          endAddress: updatedTrip.endAddress || undefined,
          stops: updatedTrip.stops || [],
        } : t) };
      }
      return v;
    }));
    setActiveModal(ModalType.NONE);
    setEditingTrip(null);
    setCurrentGapForTrip(null);
  };

  const handleDeleteTrip = (vehicleId: string, tripId: string) => {
    const tripToDelete = vehicles.find(v => v.id === vehicleId)?.trips.find(t => t.id === tripId);
    setConfirmModalState({
      isOpen: true,
      message: `Êtes-vous sûr de vouloir supprimer le trajet « ${tripToDelete?.description || 'ce trajet'} » ?`,
      confirmButtonText: 'Supprimer le trajet',
      confirmButtonVariant: 'danger',
      onConfirm: () => {
        setVehicles(prev => prev.map(v => {
            if (v.id === vehicleId) {
                return { ...v, trips: v.trips.filter(t => t.id !== tripId) };
            }
            return v;
        }));
        closeConfirmModal();
      },
    });
  };

  const openModal = (type: ModalType, data?: any) => {
    setActiveModal(type);
    if (type === ModalType.EDIT_VEHICLE && data) setEditingVehicle(data as Vehicle);
    if (type === ModalType.ADD_CHECKPOINT && data) { /* pass vehicle for context if needed */ }
    if (type === ModalType.EDIT_CHECKPOINT && data) setEditingCheckpoint(data as Checkpoint);
    if (type === ModalType.ADD_TRIP && data) setCurrentGapForTrip(data as CheckpointGap);
    if (type === ModalType.EDIT_TRIP && data) {
      setEditingTrip(data.trip as Trip);
      setCurrentGapForTrip(data.gap as CheckpointGap);
    }
  };

  const closeModal = () => {
    setActiveModal(ModalType.NONE);
    setEditingVehicle(null);
    setEditingCheckpoint(null);
    setEditingTrip(null);
    setCurrentGapForTrip(null);
  };

  const onSelectVehicle = useCallback((id: string) => {
    setSelectedVehicleId(id);
  }, []);

  const navigateToVehicleList = useCallback(() => {
    setSelectedVehicleId(null);
    setCurrentView('vehicleList');
  }, []);

  const navigateToReports = () => setCurrentView('reports');

  const handleBackFromReport = () => {
    if (selectedVehicleId) {
      setCurrentView('dashboard');
    } else {
      setCurrentView('vehicleList');
    }
  };


  const renderView = () => {
    switch (currentView) {
      case 'reports':
        return <ReportView vehicles={vehicles} onBack={handleBackFromReport} />;
      case 'dashboard':
        if (selectedVehicle) {
          return <DashboardView
                    vehicle={selectedVehicle}
                    onAddCheckpoint={() => openModal(ModalType.ADD_CHECKPOINT)}
                    onEditCheckpoint={(checkpoint) => openModal(ModalType.EDIT_CHECKPOINT, checkpoint)}
                    onDeleteCheckpoint={(checkpointId) => handleDeleteCheckpoint(selectedVehicle.id, checkpointId)}
                    onAddTrip={(gap) => openModal(ModalType.ADD_TRIP, gap)}
                    onEditTrip={(trip, gap) => openModal(ModalType.EDIT_TRIP, {trip, gap})}
                    onDeleteTrip={(tripId) => handleDeleteTrip(selectedVehicle.id, tripId)}
                    onEditVehicle={() => openModal(ModalType.EDIT_VEHICLE, selectedVehicle)}
                 />;
        }
        if (currentView === 'dashboard') { 
          navigateToVehicleList();
        }
        return null; 
      case 'vehicleList':
      default:
        return <VehicleList
                  vehicles={vehicles}
                  onSelectVehicle={onSelectVehicle}
                  onAddVehicle={() => openModal(ModalType.ADD_VEHICLE)}
                  onEditVehicle={(vehicle) => openModal(ModalType.EDIT_VEHICLE, vehicle)}
                  onDeleteVehicle={handleDeleteVehicle}
                />;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-theme-bg-default text-theme-text-default">
      <Header
        onGoHome={navigateToVehicleList}
        currentView={currentView}
        selectedVehicleName={selectedVehicle?.name}
        onViewReports={navigateToReports}
      />
      <main className="flex-grow container mx-auto p-3 sm:p-4 md:p-6 lg:p-8 w-full overflow-y-auto min-h-0">
        {renderView()}
      </main>

        {activeModal === ModalType.ADD_VEHICLE && (
          <AddVehicleModal
            isOpen={true}
            onClose={closeModal}
            onSave={handleAddVehicle}
          />
        )}
        {activeModal === ModalType.EDIT_VEHICLE && editingVehicle && (
          <AddVehicleModal
            isOpen={true}
            onClose={closeModal}
            onSave={handleUpdateVehicle}
            existingVehicle={editingVehicle}
          />
        )}
        {activeModal === ModalType.ADD_CHECKPOINT && selectedVehicle && (
          <AddCheckpointModal
            isOpen={true}
            onClose={closeModal}
            onSave={(checkpoint) => handleAddCheckpoint(selectedVehicle.id, checkpoint)}
            vehicleCheckpoints={selectedVehicle.checkpoints}
          />
        )}
        {activeModal === ModalType.EDIT_CHECKPOINT && selectedVehicle && editingCheckpoint && (
          <AddCheckpointModal
            isOpen={true}
            onClose={closeModal}
            onSave={(checkpoint) => handleUpdateCheckpoint(selectedVehicle.id, {...editingCheckpoint, ...checkpoint})}
            existingCheckpoint={editingCheckpoint}
            vehicleCheckpoints={selectedVehicle.checkpoints}
          />
        )}
        {activeModal === ModalType.ADD_TRIP && selectedVehicle && currentGapForTrip && (
          <AddTripModal
            isOpen={true}
            onClose={closeModal}
            onSave={(trip) => handleAddTrip(selectedVehicle.id, trip)}
            gap={currentGapForTrip}
          />
        )}
        {activeModal === ModalType.EDIT_TRIP && selectedVehicle && editingTrip && currentGapForTrip && (
           <AddTripModal
            isOpen={true}
            onClose={closeModal}
            onSave={(trip) => handleUpdateTrip(selectedVehicle.id, {...editingTrip, ...trip, kilometers: Number(trip.kilometers)})}
            existingTrip={editingTrip}
            gap={currentGapForTrip}
          />
        )}
        <ConfirmModal
          isOpen={confirmModalState.isOpen}
          title="Confirmer la suppression"
          message={confirmModalState.message}
          onConfirm={confirmModalState.onConfirm}
          onCancel={closeConfirmModal}
          confirmButtonText={confirmModalState.confirmButtonText || "Supprimer"}
          confirmButtonVariant={confirmModalState.confirmButtonVariant || "danger"}
        />
    </div>
  );
};

export default App;