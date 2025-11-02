export type MachineState = 'Working' | 'Stopped' | 'Needs Maintenance';

export type NoteType = 'text' | 'audio' | 'image';

export type RecurrenceType = 'Daily' | 'Weekly' | 'Monthly' | 'Custom';

export interface Section {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
}

export interface Machine {
  id: string;
  sectionId: string;
  name: string;
  code: string;
  state: MachineState;
  lastMaintenanceDate?: string;
  createdAt: string;
}

export interface Note {
  id: string;
  machineId: string;
  type: NoteType;
  content: string; // text content, audio URI, or image URI
  description?: string;
  tags?: string[];
  createdAt: string;
}

export interface MaintenanceSchedule {
  id: string;
  machineId: string;
  recurrence: RecurrenceType;
  intervalDays?: number; // for Custom type
  nextDueDate: string;
  notificationId?: string;
  createdAt: string;
}

export interface MaintenanceEvent {
  id: string;
  machineId: string;
  completedAt: string;
  notes?: string;
}

export interface Settings {
  notificationsEnabled: boolean;
  darkMode: boolean;
  demoDataLoaded: boolean;
}
