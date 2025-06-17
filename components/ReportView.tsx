
import React, { useState, useMemo, useEffect } from 'react';
import { Vehicle, Trip, ReportFilters, Checkpoint } from '../types';
import Button from './Button';
import InputField from './InputField';
import { formatDate, calculateCheckpointGaps } from '../utils/vehicleUtils';

// Ensure jsPDF types are available (global from CDN)
declare const jspdf: any;

interface ReportViewProps {
  vehicles: Vehicle[];
  onBack: () => void;
}

interface ReportTripData extends Trip {
  vehicleName: string;
  startCheckpointName?: string;
  endCheckpointName?: string;
}

const ReportView: React.FC<ReportViewProps> = ({ vehicles, onBack }) => {
  const today = new Date().toISOString().split('T')[0];
  const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

  const [filters, setFilters] = useState<ReportFilters>({
    vehicleId: 'all',
    startDate: firstDayOfMonth,
    endDate: today,
  });

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const allTripsWithDetails = useMemo(() => {
    const reportTrips: ReportTripData[] = [];
    vehicles.forEach(vehicle => {
      const gaps = calculateCheckpointGaps(vehicle.checkpoints, vehicle.trips);
      vehicle.trips.forEach(trip => {
        const gapForTrip = gaps.find(g => g.id === trip.checkpointGapId);
        reportTrips.push({
          ...trip,
          vehicleName: vehicle.name,
          startCheckpointName: gapForTrip?.startCheckpoint.name,
          endCheckpointName: gapForTrip?.endCheckpoint.name,
        });
      });
    });
    return reportTrips.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [vehicles]);


  const filteredTrips = useMemo(() => {
    return allTripsWithDetails.filter(trip => {
      const tripDateOnly = trip.date.substring(0,10); 
      const vehicleMatch = filters.vehicleId === 'all' ||
                           (vehicles.find(v => v.id === filters.vehicleId)?.trips.some(t => t.id === trip.id));
      
      const dateMatch = tripDateOnly >= filters.startDate && tripDateOnly <= filters.endDate;

      return vehicleMatch && dateMatch;
    });
  }, [filters, allTripsWithDetails, vehicles]);

  const summary = useMemo(() => {
    const totalKilometers = filteredTrips.reduce((sum, trip) => sum + trip.kilometers, 0);
    const businessKilometers = filteredTrips
        .filter(trip => trip.purpose?.toLowerCase().includes('affaires')) 
        .reduce((sum, trip) => sum + trip.kilometers, 0);
    const personalKilometers = filteredTrips
        .filter(trip => trip.purpose?.toLowerCase().includes('personnel'))
        .reduce((sum, trip) => sum + trip.kilometers, 0);
    const otherKilometers = totalKilometers - businessKilometers - personalKilometers;

    return {
      totalTrips: filteredTrips.length,
      totalKilometers,
      businessKilometers,
      personalKilometers,
      otherKilometers,
    };
  }, [filteredTrips]);

  const generatePdfReport = () => {
    if (typeof jspdf === 'undefined' || typeof jspdf.jsPDF === 'undefined') {
        alert("La librairie jsPDF n'est pas chargée. Veuillez vérifier votre connexion internet ou contacter le support.");
        console.error("jsPDF ou jspdf.jsPDF n'est pas chargé.");
        return;
    }

    const { jsPDF } = jspdf;
    const doc = new jsPDF('landscape'); 

    if (typeof (doc as any).autoTable !== 'function') {
        alert("Le plugin jsPDF-AutoTable n'est pas chargé ou a échoué. Veuillez vérifier la console pour les erreurs.");
        console.error("doc.autoTable n'est pas une fonction. Le plugin jsPDF-AutoTable est peut-être manquant ou mal chargé.");
        return;
    }

    const reportMainTitle = "Turmel Tracker - Rapport de journal de kilométrage";
    const selectedVehicleObj = vehicles.find(v => v.id === filters.vehicleId);
    const vehicleNameForReport = filters.vehicleId === 'all' ? 'Tous les véhicules' : selectedVehicleObj?.name || 'Véhicule inconnu';
    const dateRangeForReport = `${formatDate(filters.startDate)} - ${formatDate(filters.endDate)}`;
    
    const logoText = "Les Roulottes Turmel";
    const logoPlaceholderHeight = 15;
    const margin = 14;
    const pageWidth = doc.internal.pageSize.getWidth();
    const textLogoX = pageWidth - margin; 
    const textLogoY = margin + (logoPlaceholderHeight / 2); 

    doc.setFontSize(14);
    doc.setFont(undefined, 'bold'); 
    doc.setTextColor(26, 26, 26); 
    doc.text(logoText, textLogoX, textLogoY, { align: 'right', baseline: 'middle' });
    doc.setFont(undefined, 'normal'); 

    doc.setFontSize(16);
    doc.setTextColor(26, 26, 26); 
    doc.text(reportMainTitle, 14, 20); 
    doc.setFontSize(10);
    doc.setTextColor(115, 115, 115); 
    doc.text(`Véhicule : ${vehicleNameForReport}`, 14, 28);
    doc.text(`Plage de dates : ${dateRangeForReport}`, 14, 34);
    if (selectedVehicleObj?.licensePlate) {
      doc.text(`Plaque d'immatriculation : ${selectedVehicleObj.licensePlate}`, 14, 40);
    }

    doc.setFontSize(11);
    doc.setTextColor(26, 26, 26);
    doc.text("Résumé :", 14, selectedVehicleObj?.licensePlate ? 50 : 46);
    doc.setFontSize(9);
    doc.setTextColor(115, 115, 115);
    let summaryYPos = selectedVehicleObj?.licensePlate ? 55 : 51;
    doc.text(`Trajets totaux : ${summary.totalTrips}`, 14, summaryYPos);
    doc.text(`Kilomètres totaux : ${summary.totalKilometers.toLocaleString('fr-CA', {minimumFractionDigits:1, maximumFractionDigits:1})} km`, 14, summaryYPos + 5);
    doc.text(`Kilomètres d'affaires : ${summary.businessKilometers.toLocaleString('fr-CA', {minimumFractionDigits:1, maximumFractionDigits:1})} km`, 14, summaryYPos + 10);
    doc.text(`Kilomètres personnels : ${summary.personalKilometers.toLocaleString('fr-CA', {minimumFractionDigits:1, maximumFractionDigits:1})} km`, 14, summaryYPos + 15);
    doc.text(`Autres kilomètres : ${summary.otherKilometers.toLocaleString('fr-CA', {minimumFractionDigits:1, maximumFractionDigits:1})} km`, 14, summaryYPos + 20);
    
    const tableColumn = ["Date", "Véhicule", "Description", "Motif", "Adr. Départ", "Adr. Fin", "Arrêts", "PD Départ", "PD Fin", "KM"];
    const tableRows: any[][] = [];

    filteredTrips.forEach(trip => {
      const tripData = [
        formatDate(trip.date),
        trip.vehicleName,
        trip.description,
        trip.purpose || '-',
        trip.startAddress || '-',
        trip.endAddress || '-',
        trip.stops && trip.stops.length > 0 ? trip.stops.length.toString() : '0',
        trip.startCheckpointName || '-',
        trip.endCheckpointName || '-',
        trip.kilometers.toLocaleString('fr-CA', {minimumFractionDigits:1, maximumFractionDigits:1})
      ];
      tableRows.push(tripData);
    });

    (doc as any).autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: summaryYPos + 30, // Adjusted Y position for summary
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235], textColor: [255, 255, 255], fontStyle: 'bold' }, 
      styles: { fontSize: 7, cellPadding: 1.2, lineColor: [229, 229, 229], lineWidth: 0.1 }, 
      columnStyles: {
        0: {cellWidth: 16}, 1: {cellWidth: 22}, 2: {cellWidth: 'auto'}, 3: {cellWidth: 20},
        4: {cellWidth: 25}, 5: {cellWidth: 25}, 6: {cellWidth: 10, halign: 'center'},
        7: {cellWidth: 20}, 8: {cellWidth: 20}, 9: {cellWidth: 12, halign: 'right'},
      },
      didDrawPage: function (data: any) {
        doc.setFontSize(8);
        doc.setTextColor(150); 
        const pageCount = doc.internal.getNumberOfPages();
        doc.text(`Page ${data.pageNumber} de ${pageCount}`, data.settings.margin.left, doc.internal.pageSize.height - 10);
        doc.text(`Généré : ${new Date().toLocaleDateString('fr-CA')} ${new Date().toLocaleTimeString('fr-CA')}`, doc.internal.pageSize.width - data.settings.margin.right - 50, doc.internal.pageSize.height - 10);
      }
    });

    const safeVehicleName = vehicleNameForReport.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    doc.save(`Turmel_Tracker_Rapport_${safeVehicleName}_${filters.startDate}_au_${filters.endDate}.pdf`);
  };

  const truncateAddress = (address: string | undefined, maxLength: number = 20) => {
    if (!address) return '-';
    if (address.length <= maxLength) return address;
    return address.substring(0, maxLength) + '...';
  };


  return (
    <div className="space-y-6 md:space-y-8">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <h2 className="text-2xl sm:text-3xl font-bold text-theme-text-default">Rapports de kilométrage</h2>
        <Button onClick={onBack} variant="secondary" size="md" className="self-start sm:self-auto" aria-label="Retour à la page précédente">
          <span aria-hidden="true">&larr;</span> Retour
        </Button>
      </div>

      <div className="bg-theme-bg-default shadow-md rounded-lg p-4 sm:p-5 md:p-6 border border-theme-border-default">
        <h3 className="sr-only">Filtres du rapport</h3> 
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div>
            <label htmlFor="reportVehicleId" className="block text-sm font-medium text-theme-text-muted mb-1">Véhicule</label>
            <select
              id="reportVehicleId"
              name="vehicleId"
              value={filters.vehicleId}
              onChange={handleFilterChange}
              className="block w-full px-3 py-2 bg-theme-bg-default text-theme-text-default border border-theme-border-default rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-theme-accent-blue focus:border-theme-accent-blue sm:text-sm h-[42px]"
              aria-label="Sélectionner le véhicule pour le rapport"
            >
              <option value="all">Tous les véhicules</option>
              {vehicles.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
            </select>
          </div>
          <InputField
            label="Date de début"
            id="reportStartDate"
            name="startDate"
            type="date"
            value={filters.startDate}
            onChange={handleFilterChange}
            className="w-full !mb-0" 
            wrapperClassName="!mb-0"
          />
          <InputField
            label="Date de fin"
            id="reportEndDate"
            name="endDate"
            type="date"
            value={filters.endDate}
            onChange={handleFilterChange}
            className="w-full !mb-0"
            wrapperClassName="!mb-0"
          />
          <Button
              onClick={generatePdfReport}
              variant="primary"
              disabled={filteredTrips.length === 0}
              className="w-full h-[42px] mt-auto" 
              title={filteredTrips.length === 0 ? "Aucune donnée pour les filtres sélectionnés pour générer le PDF" : "Télécharger le rapport PDF"}
              aria-label="Télécharger le rapport PDF"
          >
              Télécharger PDF
          </Button>
        </div>
      </div>

      {filteredTrips.length > 0 && (
        <div className="bg-theme-bg-default shadow-md rounded-lg p-4 sm:p-5 md:p-6 border border-theme-border-default" role="region" aria-labelledby="report-summary-heading">
            <h3 id="report-summary-heading" className="text-lg sm:text-xl font-semibold text-theme-text-default mb-3 sm:mb-4">Résumé du rapport</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 text-sm">
                <div className="p-3 bg-theme-bg-subtle rounded-md border border-theme-border-default"><p className="text-theme-text-muted text-xs uppercase tracking-wider">Trajets totaux</p> <p className="font-semibold text-lg sm:text-xl text-theme-text-default">{summary.totalTrips}</p></div>
                <div className="p-3 bg-theme-bg-subtle rounded-md border border-theme-border-default"><p className="text-theme-text-muted text-xs uppercase tracking-wider">KM totaux</p> <p className="font-semibold text-lg sm:text-xl text-theme-text-default">{summary.totalKilometers.toLocaleString('fr-CA', {minimumFractionDigits:1, maximumFractionDigits:1})}</p></div>
                <div className="p-3 bg-theme-bg-subtle rounded-md border border-theme-border-default"><p className="text-theme-text-muted text-xs uppercase tracking-wider">KM d'affaires</p> <p className="font-semibold text-lg sm:text-xl text-theme-text-default">{summary.businessKilometers.toLocaleString('fr-CA', {minimumFractionDigits:1, maximumFractionDigits:1})}</p></div>
                <div className="p-3 bg-theme-accent-green-bg-light rounded-md border border-theme-accent-green/30"><p className="text-theme-accent-green-text-on-light text-xs uppercase tracking-wider">KM personnels</p> <p className="font-semibold text-lg sm:text-xl text-theme-accent-green-text-on-light">{summary.personalKilometers.toLocaleString('fr-CA', {minimumFractionDigits:1, maximumFractionDigits:1})}</p></div>
                <div className="p-3 bg-theme-accent-yellow-bg-light rounded-md border border-theme-accent-yellow/30"><p className="text-theme-accent-yellow-text-on-light text-xs uppercase tracking-wider">Autres KM</p> <p className="font-semibold text-lg sm:text-xl text-theme-accent-yellow-text-on-light">{summary.otherKilometers.toLocaleString('fr-CA', {minimumFractionDigits:1, maximumFractionDigits:1})}</p></div>
            </div>
        </div>
      )}

      <div className="bg-theme-bg-default shadow-md rounded-lg border border-theme-border-default overflow-hidden" role="region" aria-labelledby="detailed-log-heading">
        <h3 id="detailed-log-heading" className="text-lg sm:text-xl font-semibold text-theme-text-default px-4 pt-4 sm:px-5 sm:pt-5 md:px-6 md:pt-6">Journal détaillé</h3>
        {filteredTrips.length === 0 ? (
          <div className="text-center py-10 sm:py-12 px-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-theme-text-subtle" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
            </svg>
            <p className="mt-3 text-theme-text-default font-medium">Aucun trajet ne correspond à vos filtres actuels.</p>
            <p className="text-sm text-theme-text-muted">Essayez d'ajuster la plage de dates ou le véhicule sélectionné.</p>
          </div>
        ) : (
          <div className="overflow-x-auto mt-3 sm:mt-4">
            <table className="min-w-full divide-y divide-theme-border-default text-xs sm:text-sm" aria-label="Rapport détaillé du journal de kilométrage">
              <thead className="bg-theme-bg-subtle">
                <tr>
                  <th scope="col" className="px-3 py-2.5 sm:px-4 sm:py-3 text-left font-semibold text-theme-text-muted uppercase tracking-wider">Date</th>
                  <th scope="col" className="px-3 py-2.5 sm:px-4 sm:py-3 text-left font-semibold text-theme-text-muted uppercase tracking-wider">Véhicule</th>
                  <th scope="col" className="px-3 py-2.5 sm:px-4 sm:py-3 text-left font-semibold text-theme-text-muted uppercase tracking-wider">Description</th>
                  <th scope="col" className="px-3 py-2.5 sm:px-4 sm:py-3 text-left font-semibold text-theme-text-muted uppercase tracking-wider">Motif</th>
                  <th scope="col" className="px-3 py-2.5 sm:px-4 sm:py-3 text-left font-semibold text-theme-text-muted uppercase tracking-wider">Route</th>
                  <th scope="col" className="px-3 py-2.5 sm:px-4 sm:py-3 text-left font-semibold text-theme-text-muted uppercase tracking-wider">PD Départ</th>
                  <th scope="col" className="px-3 py-2.5 sm:px-4 sm:py-3 text-left font-semibold text-theme-text-muted uppercase tracking-wider">PD Fin</th>
                  <th scope="col" className="px-3 py-2.5 sm:px-4 sm:py-3 text-right font-semibold text-theme-text-muted uppercase tracking-wider">KM</th>
                </tr>
              </thead>
              <tbody className="bg-theme-bg-default divide-y divide-theme-border-default">
                {filteredTrips.map(trip => (
                  <tr key={trip.id} className="hover:bg-theme-bg-subtle transition-colors">
                    <td className="px-3 py-2.5 sm:px-4 sm:py-3 whitespace-nowrap text-theme-text-default">{formatDate(trip.date)}</td>
                    <td className="px-3 py-2.5 sm:px-4 sm:py-3 whitespace-nowrap text-theme-text-default" title={trip.vehicleName}>{trip.vehicleName}</td>
                    <td className="px-3 py-2.5 sm:px-4 sm:py-3 text-theme-text-default max-w-xs truncate" title={trip.description}>{trip.description}</td>
                    <td className="px-3 py-2.5 sm:px-4 sm:py-3 text-theme-text-default" title={trip.purpose || '-'}>{trip.purpose || '-'}</td>
                    <td className="px-3 py-2.5 sm:px-4 sm:py-3 text-theme-text-default max-w-xs md:max-w-sm truncate" title={`${trip.startAddress || 'S/O'}${trip.stops && trip.stops.length > 0 ? ' via ' + trip.stops.join(', ') : ''} à ${trip.endAddress || 'S/O'}`}>
                        {truncateAddress(trip.startAddress, 15)} &rarr; {truncateAddress(trip.endAddress, 15)}
                        {trip.stops && trip.stops.length > 0 && <span className="text-xs block text-theme-text-subtle">(+{trip.stops.length} arrêt{trip.stops.length > 1 ? 's' : ''})</span>}
                    </td>
                    <td className="px-3 py-2.5 sm:px-4 sm:py-3 whitespace-nowrap text-theme-text-default" title={trip.startCheckpointName || '-'}>{trip.startCheckpointName || '-'}</td>
                    <td className="px-3 py-2.5 sm:px-4 sm:py-3 whitespace-nowrap text-theme-text-default" title={trip.endCheckpointName || '-'}>{trip.endCheckpointName || '-'}</td>
                    <td className="px-3 py-2.5 sm:px-4 sm:py-3 whitespace-nowrap text-right font-medium text-theme-text-default">{trip.kilometers.toLocaleString('fr-CA', {minimumFractionDigits:1, maximumFractionDigits:1})}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportView;