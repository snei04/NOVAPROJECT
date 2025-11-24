import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BoardsService } from '../../../../services/boards.service';
import { StakeholderService, Stakeholder } from '../../../../services/stakeholder.service';
import { MeetingService, Meeting, ActionItem } from '../../services/meeting.service';
import { Board } from '../../../../models/board.model';
import { forkJoin } from 'rxjs';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { MeetingReminderService } from '../../services/meeting-reminder.service';

@Component({
  selector: 'app-stakeholder-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, FullCalendarModule],
  templateUrl: './stakeholder-dashboard.component.html',
  styleUrls: ['./stakeholder-dashboard.component.scss']
})
export class StakeholderDashboardComponent implements OnInit {
  private boardsService = inject(BoardsService);
  private stakeholderService = inject(StakeholderService);
  private meetingService = inject(MeetingService);
  private reminderService = inject(MeetingReminderService);

  projects: Board[] = [];
  selectedProject: Board | null = null;

  stakeholders: Stakeholder[] = [];
  meetings: Meeting[] = [];
  commitments: ActionItem[] = []; // Derivado o cargado

  isLoading = false;
  
  // Estado del Modal de Reunión
  showMeetingModal = false;
  isCreatingMeeting = false;
  newMeeting: Partial<Meeting> = {
    title: '',
    startTime: '',
    endTime: ''
  };

  // Estado del Modal de Compromiso
  showCommitmentModal = false;
  isCreatingCommitment = false;
  newCommitment: Partial<ActionItem> = {
    description: '',
    meetingId: '',
    dueDate: ''
  };

  // Estado del Modal de Stakeholder
  showStakeholderModal = false;
  isCreatingStakeholder = false;
  newStakeholder: Partial<Stakeholder> = {
    name: '',
    role: '',
    priority: 'medium',
    contactInfo: { email: '' }
  };

  // Calendario
  showCalendar = false;
  calendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth',
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek'
    },
    events: [],
    height: 'auto',
    locale: 'es'
  };

  ngOnInit() {
    this.loadProjects();
  }

  loadProjects() {
    this.boardsService.loadBoards().subscribe(boards => {
      this.projects = boards;
      if (boards.length > 0) {
        this.selectProject(boards[0]);
      }
    });
  }

  selectProject(project: Board) {
    this.selectedProject = project;
    this.isLoading = true;

    forkJoin({
      stakeholders: this.stakeholderService.getStakeholdersByProject(project.id),
      meetings: this.meetingService.getMeetingsByProject(project.id)
    }).subscribe({
      next: (data) => {
        this.stakeholders = data.stakeholders;
        this.meetings = data.meetings;
        
        // Extraer compromisos de las reuniones cargadas
        this.commitments = this.meetings.flatMap(m => m.actionItems || []);
        
        // Actualizar calendario y recordatorios
        this.updateCalendarEvents();
        this.reminderService.trackMeetings(this.meetings);

        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error cargando datos del proyecto', err);
        this.isLoading = false;
      }
    });
  }

  updateCalendarEvents() {
    this.calendarOptions.events = this.meetings.map(m => ({
      title: m.title,
      start: m.startTime,
      end: m.endTime,
      color: m.status === 'completed' ? '#10B981' : '#3B82F6', // Verde o Azul
      extendedProps: {
        status: m.status
      }
    }));
  }

  toggleCalendarView() {
    this.showCalendar = !this.showCalendar;
  }

  getMeetingCommitments(meetingId: string): ActionItem[] {
    return this.commitments.filter(c => c.meetingId === meetingId);
  }

  // Métodos para Crear Reunión
  openMeetingModal() {
    if (!this.selectedProject) return;
    
    this.newMeeting = {
      projectId: this.selectedProject.id,
      title: '',
      startTime: '', // Debería inicializarse con fecha actual si se desea
      endTime: ''
    };
    this.showMeetingModal = true;
  }

  closeMeetingModal() {
    this.showMeetingModal = false;
  }

  createMeeting() {
    if (!this.newMeeting.title || !this.newMeeting.startTime || !this.newMeeting.endTime) {
      alert('Por favor completa todos los campos');
      return;
    }

    this.isCreatingMeeting = true;
    
    // Asegurar que el projectId esté asignado
    if (this.selectedProject) {
      this.newMeeting.projectId = this.selectedProject.id;
    }

    this.meetingService.createMeeting(this.newMeeting as Meeting).subscribe({
      next: (meeting) => {
        // Añadir a la lista local y cerrar
        this.meetings.push(meeting);
        // Ordenar por fecha (opcional)
        this.meetings.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
        
        this.updateCalendarEvents(); // Refrescar calendario
        this.reminderService.trackMeetings(this.meetings); // Refrescar recordatorios

        this.isCreatingMeeting = false;
        this.closeMeetingModal();
      },
      error: (err) => {
        console.error('Error creando reunión:', err);
        this.isCreatingMeeting = false;
        alert('Error al crear la reunión');
      }
    });
  }

  // Métodos para Crear Compromiso
  openCommitmentModal() {
    if (this.meetings.length === 0) {
      alert('Debes tener al menos una reunión para asociar un compromiso.');
      return;
    }
    
    this.newCommitment = {
      description: '',
      meetingId: this.meetings[0].id, // Preseleccionar primera
      dueDate: ''
    };
    this.showCommitmentModal = true;
  }

  closeCommitmentModal() {
    this.showCommitmentModal = false;
  }

  createCommitment() {
    if (!this.newCommitment.description || !this.newCommitment.meetingId) {
      alert('Por favor completa descripción y selecciona una reunión');
      return;
    }

    this.isCreatingCommitment = true;
    
    this.meetingService.createActionItem(this.newCommitment).subscribe({
      next: (item) => {
        this.commitments.push(item);
        this.isCreatingCommitment = false;
        this.closeCommitmentModal();
      },
      error: (err) => {
        console.error('Error creando compromiso:', err);
        this.isCreatingCommitment = false;
        alert('Error al crear el compromiso');
      }
    });
  }

  // Métodos para Stakeholder
  openStakeholderModal() {
    this.newStakeholder = {
      name: '',
      role: '',
      priority: 'medium',
      contactInfo: { email: '' }
    };
    this.showStakeholderModal = true;
  }

  closeStakeholderModal() {
    this.showStakeholderModal = false;
  }

  createStakeholder() {
    if (!this.newStakeholder.name || !this.newStakeholder.role || !this.newStakeholder.contactInfo?.email) {
      alert('Por favor completa nombre, rol y email');
      return;
    }

    this.isCreatingStakeholder = true;
    if (this.selectedProject) {
      this.newStakeholder.projectId = this.selectedProject.id;
    }

    this.stakeholderService.createStakeholder(this.newStakeholder).subscribe({
      next: (s) => {
        this.stakeholders.push(s);
        this.isCreatingStakeholder = false;
        this.closeStakeholderModal();
      },
      error: (err) => {
        console.error(err);
        this.isCreatingStakeholder = false;
        alert('Error al crear stakeholder');
      }
    });
  }

  inviteStakeholder(s: Stakeholder) {
    if (confirm(`¿Enviar invitación a ${s.name} (${s.contactInfo?.email})?`)) {
      if (s.id && s.contactInfo?.email) {
        this.stakeholderService.inviteStakeholder(s.id, s.contactInfo.email).subscribe({
          next: (res) => {
            alert(res.message || 'Invitación enviada');
          },
          error: (err) => {
            console.error(err);
            alert(err.error?.message || 'Error al invitar');
          }
        });
      }
    }
  }
}
