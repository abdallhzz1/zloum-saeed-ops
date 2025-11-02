import { Section, Machine, Note, MaintenanceSchedule, MaintenanceEvent, Settings } from '@/types';

const STORAGE_KEYS = {
  SECTIONS: 'factory_sections',
  MACHINES: 'factory_machines',
  NOTES: 'factory_notes',
  SCHEDULES: 'factory_schedules',
  EVENTS: 'factory_events',
  SETTINGS: 'factory_settings',
};

// Sections
export const getSections = async (): Promise<Section[]> => {
  const data = localStorage.getItem(STORAGE_KEYS.SECTIONS);
  return data ? JSON.parse(data) : [];
};

export const saveSection = async (section: Section): Promise<void> => {
  const sections = await getSections();
  const index = sections.findIndex(s => s.id === section.id);
  if (index >= 0) {
    sections[index] = section;
  } else {
    sections.push(section);
  }
  localStorage.setItem(STORAGE_KEYS.SECTIONS, JSON.stringify(sections));
};

export const deleteSection = async (id: string): Promise<void> => {
  const sections = await getSections();
  localStorage.setItem(STORAGE_KEYS.SECTIONS, JSON.stringify(sections.filter(s => s.id !== id)));
};

// Machines
export const getMachines = async (sectionId?: string): Promise<Machine[]> => {
  const data = localStorage.getItem(STORAGE_KEYS.MACHINES);
  const machines: Machine[] = data ? JSON.parse(data) : [];
  return sectionId ? machines.filter(m => m.sectionId === sectionId) : machines;
};

export const getMachine = async (id: string): Promise<Machine | null> => {
  const machines = await getMachines();
  return machines.find(m => m.id === id) || null;
};

export const saveMachine = async (machine: Machine): Promise<void> => {
  const machines = await getMachines();
  const index = machines.findIndex(m => m.id === machine.id);
  if (index >= 0) {
    machines[index] = machine;
  } else {
    machines.push(machine);
  }
  localStorage.setItem(STORAGE_KEYS.MACHINES, JSON.stringify(machines));
};

export const deleteMachine = async (id: string): Promise<void> => {
  const machines = await getMachines();
  localStorage.setItem(STORAGE_KEYS.MACHINES, JSON.stringify(machines.filter(m => m.id !== id)));
};

// Notes
export const getNotes = async (machineId?: string): Promise<Note[]> => {
  const data = localStorage.getItem(STORAGE_KEYS.NOTES);
  const notes: Note[] = data ? JSON.parse(data) : [];
  return machineId ? notes.filter(n => n.machineId === machineId) : notes;
};

export const saveNote = async (note: Note): Promise<void> => {
  const notes = await getNotes();
  const index = notes.findIndex(n => n.id === note.id);
  if (index >= 0) {
    notes[index] = note;
  } else {
    notes.push(note);
  }
  localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
};

export const deleteNote = async (id: string): Promise<void> => {
  const notes = await getNotes();
  localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes.filter(n => n.id !== id)));
};

// Schedules
export const getSchedules = async (machineId?: string): Promise<MaintenanceSchedule[]> => {
  const data = localStorage.getItem(STORAGE_KEYS.SCHEDULES);
  const schedules: MaintenanceSchedule[] = data ? JSON.parse(data) : [];
  return machineId ? schedules.filter(s => s.machineId === machineId) : schedules;
};

export const saveSchedule = async (schedule: MaintenanceSchedule): Promise<void> => {
  const schedules = await getSchedules();
  const index = schedules.findIndex(s => s.id === schedule.id);
  if (index >= 0) {
    schedules[index] = schedule;
  } else {
    schedules.push(schedule);
  }
  localStorage.setItem(STORAGE_KEYS.SCHEDULES, JSON.stringify(schedules));
};

export const deleteSchedule = async (id: string): Promise<void> => {
  const schedules = await getSchedules();
  localStorage.setItem(STORAGE_KEYS.SCHEDULES, JSON.stringify(schedules.filter(s => s.id !== id)));
};

// Maintenance Events
export const getMaintenanceEvents = async (machineId?: string): Promise<MaintenanceEvent[]> => {
  const data = localStorage.getItem(STORAGE_KEYS.EVENTS);
  const events: MaintenanceEvent[] = data ? JSON.parse(data) : [];
  return machineId ? events.filter(e => e.machineId === machineId) : events;
};

export const saveMaintenanceEvent = async (event: MaintenanceEvent): Promise<void> => {
  const events = await getMaintenanceEvents();
  events.push(event);
  localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
};

// Settings
export const getSettings = async (): Promise<Settings> => {
  const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
  return data ? JSON.parse(data) : {
    notificationsEnabled: true,
    darkMode: false,
    demoDataLoaded: false,
  };
};

export const saveSettings = async (settings: Settings): Promise<void> => {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
};

// Demo Data
export const loadDemoData = async (): Promise<void> => {
  const sections: Section[] = [
    { id: '1', name: 'Electrical Department', description: 'Main electrical systems', createdAt: new Date().toISOString() },
    { id: '2', name: 'Public Health Department', description: 'Water and sanitation systems', createdAt: new Date().toISOString() },
  ];

  const machines: Machine[] = [
    { id: '1', sectionId: '1', name: 'Generator A', code: 'GEN-001', state: 'Working', lastMaintenanceDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), createdAt: new Date().toISOString() },
    { id: '2', sectionId: '1', name: 'Transformer B', code: 'TRF-001', state: 'Needs Maintenance', createdAt: new Date().toISOString() },
    { id: '3', sectionId: '1', name: 'Control Panel C', code: 'CTL-001', state: 'Working', createdAt: new Date().toISOString() },
    { id: '4', sectionId: '2', name: 'Water Pump 1', code: 'PMP-001', state: 'Working', lastMaintenanceDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), createdAt: new Date().toISOString() },
    { id: '5', sectionId: '2', name: 'Filtration System', code: 'FLT-001', state: 'Stopped', createdAt: new Date().toISOString() },
    { id: '6', sectionId: '2', name: 'Boiler Unit', code: 'BLR-001', state: 'Working', createdAt: new Date().toISOString() },
  ];

  for (const section of sections) {
    await saveSection(section);
  }
  for (const machine of machines) {
    await saveMachine(machine);
  }

  const settings = await getSettings();
  await saveSettings({ ...settings, demoDataLoaded: true });
};

export const clearAllData = async (): Promise<void> => {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
};
