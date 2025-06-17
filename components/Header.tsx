
import React from 'react';
import Button from './Button';

interface HeaderProps {
  onGoHome: () => void; // Navigates to Vehicle List
  currentView: 'vehicleList' | 'dashboard' | 'reports';
  selectedVehicleName?: string;
  onViewReports: () => void;
}

const Header: React.FC<HeaderProps> = ({ onGoHome, currentView, selectedVehicleName, onViewReports }) => {
  const showReportsButton = currentView !== 'reports';
  const showBackToVehicleListButton = currentView === 'dashboard' || (currentView === 'reports' && !selectedVehicleName);

  return (
    <header className="bg-theme-bg-default shadow-sm text-theme-text-default print:hidden border-b border-theme-border-default">
      <div className="container mx-auto px-3 sm:px-6 lg:px-8">
        <div className="py-3 md:py-4 flex flex-wrap justify-between items-center gap-y-2">
          <div
            className="text-xl sm:text-2xl font-bold cursor-pointer hover:text-theme-accent-blue transition-colors"
            onClick={onGoHome}
            title="Aller à la liste des véhicules"
            role="button"
            tabIndex={0}
            onKeyPress={(e) => e.key === 'Enter' && onGoHome()}
          >
            <span className="block sm:inline">Turmel Tracker</span>
            {currentView === 'dashboard' && selectedVehicleName && (
              <span className="block text-sm sm:inline sm:text-base font-normal sm:ml-2 text-theme-text-muted truncate max-w-xs sm:max-w-sm md:max-w-md">
                - {selectedVehicleName}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2 sm:space-x-3">
            {showBackToVehicleListButton && (
              <button
                onClick={onGoHome}
                className="text-theme-text-muted hover:text-theme-accent-blue transition-colors text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-1.5 rounded-md hover:bg-theme-bg-subtle focus:outline-none focus:ring-2 focus:ring-theme-accent-blue"
                aria-label="Retour à la liste des véhicules"
              >
                <span aria-hidden="true">&larr;</span> Véhicules
              </button>
            )}
            {showReportsButton && (
              <Button
                onClick={onViewReports}
                variant="outline" // Changed to outline for a more Notion-like secondary action
                size="sm"
                className="text-xs sm:text-sm" // Outline variant will provide border and text color
              >
                Voir les rapports
              </Button>
            )}
          </div>
        </div>
         {currentView === 'dashboard' && selectedVehicleName && (
         <div className="sm:hidden bg-theme-bg-subtle border-t border-theme-border-default px-3 py-1.5 text-center text-theme-text-default text-sm font-semibold truncate">
           {selectedVehicleName}
         </div>
       )}
      </div>
    </header>
  );
};

export default Header;