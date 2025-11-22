import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Meeting } from './meeting.service';
import { differenceInMinutes } from 'date-fns';

@Injectable({
  providedIn: 'root'
})
export class MeetingReminderService {
  private trackedMeetings: Meeting[] = [];
  private notifiedState: Map<string, Set<number>> = new Map(); // meetingId -> Set of minutes notified

  constructor(private toastr: ToastrService) {
    // Iniciar el chequeo periódico
    setInterval(() => this.checkMeetings(), 10000); // Chequear cada 10 segundos para mayor precisión
  }

  trackMeetings(meetings: Meeting[]) {
    this.trackedMeetings = meetings;
    // Limpiar estado de reuniones que ya no están o completadas si fuera necesario
  }

  private checkMeetings() {
    const now = new Date();
    
    this.trackedMeetings.forEach(meeting => {
      if (meeting.status === 'completed' || meeting.status === 'cancelled') return;

      const start = new Date(meeting.startTime);
      const diff = differenceInMinutes(start, now);
      
      // Recordatorios: 30, 15, 10, 5 minutos
      // Verificamos si estamos en el minuto exacto (diff)
      const reminders = [30, 15, 10, 5];
      
      if (reminders.includes(diff)) {
        this.notify(meeting, diff);
      }
    });
  }

  private notify(meeting: Meeting, minutes: number) {
    if (!meeting.id) return;

    if (!this.notifiedState.has(meeting.id)) {
      this.notifiedState.set(meeting.id, new Set());
    }
    
    const notified = this.notifiedState.get(meeting.id);
    if (notified?.has(minutes)) return;

    this.toastr.info(
      `Tu reunión "${meeting.title}" comienza en ${minutes} minutos.`,
      'Recordatorio de Reunión',
      { timeOut: 10000, closeButton: true, progressBar: true }
    );
    
    notified?.add(minutes);
  }
}
