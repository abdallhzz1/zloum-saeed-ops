import jsPDF from 'jspdf';
import { Machine, Note, MaintenanceEvent, Section } from '@/types';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Share } from '@capacitor/share';

// Load Arabic font for jsPDF (simplified version)
export const generateMaintenanceReport = async (
  section: Section,
  machines: Machine[],
  notes: Note[],
  events: MaintenanceEvent[],
  startDate: Date,
  endDate: Date
): Promise<void> => {
  const doc = new jsPDF();
  
  // Note: For proper Arabic support, you would need to add an Arabic font to jsPDF
  // For now, using English transliteration
  
  let yPos = 20;
  
  // Header
  doc.setFontSize(20);
  doc.text('Zloum & Saeed Factory', 105, yPos, { align: 'center' });
  yPos += 10;
  
  doc.setFontSize(16);
  doc.text('Maintenance Report', 105, yPos, { align: 'center' });
  yPos += 15;
  
  // Section info
  doc.setFontSize(12);
  doc.text(`Section: ${section.name}`, 20, yPos);
  yPos += 8;
  doc.text(`Period: ${format(startDate, 'PP', { locale: ar })} - ${format(endDate, 'PP', { locale: ar })}`, 20, yPos);
  yPos += 12;
  
  // Machines summary
  doc.setFontSize(14);
  doc.text('Machines Status:', 20, yPos);
  yPos += 8;
  
  doc.setFontSize(10);
  machines.forEach((machine) => {
    if (yPos > 270) {
      doc.addPage();
      yPos = 20;
    }
    doc.text(`- ${machine.name} (${machine.code}): ${machine.state}`, 25, yPos);
    yPos += 6;
  });
  
  yPos += 10;
  
  // Maintenance events
  doc.setFontSize(14);
  doc.text('Maintenance Activities:', 20, yPos);
  yPos += 8;
  
  doc.setFontSize(10);
  events.forEach((event) => {
    if (yPos > 270) {
      doc.addPage();
      yPos = 20;
    }
    const machine = machines.find(m => m.id === event.machineId);
    doc.text(`- ${machine?.name || 'Unknown'}: ${format(new Date(event.completedAt), 'PP', { locale: ar })}`, 25, yPos);
    if (event.notes) {
      yPos += 6;
      doc.text(`  Notes: ${event.notes}`, 30, yPos);
    }
    yPos += 6;
  });
  
  yPos += 10;
  
  // Notes summary
  doc.setFontSize(14);
  doc.text(`Total Notes: ${notes.length}`, 20, yPos);
  yPos += 8;
  
  doc.setFontSize(10);
  doc.text(`Text notes: ${notes.filter(n => n.type === 'text').length}`, 25, yPos);
  yPos += 6;
  doc.text(`Image notes: ${notes.filter(n => n.type === 'image').length}`, 25, yPos);
  yPos += 6;
  doc.text(`Audio notes: ${notes.filter(n => n.type === 'audio').length}`, 25, yPos);
  
  // Footer
  doc.setFontSize(8);
  doc.text(`Generated on ${format(new Date(), 'PPpp', { locale: ar })}`, 105, 285, { align: 'center' });
  
  // Save and share
  const pdfBlob = doc.output('blob');
  const fileName = `maintenance-report-${section.name}-${Date.now()}.pdf`;
  
  try {
    // Create a URL for the blob
    const url = URL.createObjectURL(pdfBlob);
    
    // Try to share via Capacitor Share API
    await Share.share({
      title: `Maintenance Report - ${section.name}`,
      text: `Report for ${section.name} from ${format(startDate, 'PP')} to ${format(endDate, 'PP')}`,
      url: url,
      dialogTitle: 'Share Report',
    });
  } catch (error) {
    // Fallback to download
    const link = document.createElement('a');
    link.href = URL.createObjectURL(pdfBlob);
    link.download = fileName;
    link.click();
  }
};

export const generateMachineReport = async (
  machine: Machine,
  notes: Note[],
  events: MaintenanceEvent[],
  startDate: Date,
  endDate: Date
): Promise<void> => {
  const doc = new jsPDF();
  
  let yPos = 20;
  
  // Header
  doc.setFontSize(20);
  doc.text('Machine Maintenance Report', 105, yPos, { align: 'center' });
  yPos += 15;
  
  // Machine info
  doc.setFontSize(14);
  doc.text(`Machine: ${machine.name}`, 20, yPos);
  yPos += 8;
  doc.text(`Code: ${machine.code}`, 20, yPos);
  yPos += 8;
  doc.text(`Status: ${machine.state}`, 20, yPos);
  yPos += 8;
  doc.setFontSize(10);
  doc.text(`Period: ${format(startDate, 'PP')} - ${format(endDate, 'PP')}`, 20, yPos);
  yPos += 15;
  
  // Maintenance history
  doc.setFontSize(12);
  doc.text('Maintenance History:', 20, yPos);
  yPos += 8;
  
  doc.setFontSize(10);
  events.forEach((event) => {
    if (yPos > 270) {
      doc.addPage();
      yPos = 20;
    }
    doc.text(`Date: ${format(new Date(event.completedAt), 'PPpp')}`, 25, yPos);
    yPos += 6;
    if (event.notes) {
      doc.text(`Notes: ${event.notes}`, 25, yPos);
      yPos += 6;
    }
    yPos += 4;
  });
  
  yPos += 10;
  
  // Notes
  doc.setFontSize(12);
  doc.text('Notes & Observations:', 20, yPos);
  yPos += 8;
  
  doc.setFontSize(10);
  notes.filter(n => n.type === 'text').slice(0, 10).forEach((note) => {
    if (yPos > 270) {
      doc.addPage();
      yPos = 20;
    }
    doc.text(`- ${format(new Date(note.createdAt), 'PP')}: ${note.content.substring(0, 80)}`, 25, yPos);
    yPos += 6;
  });
  
  // Save and share
  const pdfBlob = doc.output('blob');
  const fileName = `machine-report-${machine.code}-${Date.now()}.pdf`;
  
  try {
    const url = URL.createObjectURL(pdfBlob);
    await Share.share({
      title: `Machine Report - ${machine.name}`,
      text: `Maintenance report for ${machine.name} (${machine.code})`,
      url: url,
      dialogTitle: 'Share Report',
    });
  } catch (error) {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(pdfBlob);
    link.download = fileName;
    link.click();
  }
};
