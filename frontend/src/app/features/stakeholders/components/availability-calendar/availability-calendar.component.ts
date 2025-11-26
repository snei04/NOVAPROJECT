import { Component, OnInit, inject, signal, computed, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { StakeholderService } from '../../../../core/services/stakeholder.service';
import { Stakeholder } from '../../../../core/models/stakeholder.model';

@Component({
  selector: 'app-availability-calendar',
  standalone: true,
  imports: [CommonModule, FullCalendarModule],
  templateUrl: './availability-calendar.component.html',
})
export class AvailabilityCalendarComponent implements OnInit {
  @Input() boardId: string = '1'; // Usamos '1' como ejemplo

  private stakeholderService = inject(StakeholderService);
  stakeholders = signal<Stakeholder[]>([]);
  
  // --- NUEVO ---
  // Señal para guardar los IDs de los stakeholders seleccionados en los filtros
  selectedStakeholders = signal<string[]>([]);

  // --- MODIFICADO ---
  // Ahora, este signal calculado depende de los stakeholders y de los filtros seleccionados
  calendarEvents = computed(() => {
    const events: EventInput[] = [];
    const selected = this.selectedStakeholders();
    
    // Si hay filtros, usa la lista filtrada. Si no, usa la lista completa.
    const stakeholdersToDisplay = selected.length > 0
      ? this.stakeholders().filter(s => selected.includes(s.id))
      : this.stakeholders();

    for (const stakeholder of stakeholdersToDisplay) {
      if (stakeholder.availability && Array.isArray(stakeholder.availability)) {
        for (const slot of stakeholder.availability) {
          events.push({
            title: `Disponible - ${stakeholder.name}`,
            start: slot.start,
            end: slot.end,
            backgroundColor: '#34d399',
            borderColor: '#059669'
          });
        }
      }
    }
    return events;
  });

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'timeGridWeek',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    editable: true,
    selectable: true,
    selectMirror: true,
    select: this.handleDateSelect.bind(this),
    locale: 'es',
    events: []
  };

  ngOnInit(): void {
    this.loadStakeholders(this.boardId);
  }

  loadStakeholders(boardId: string) {
    this.stakeholderService.getAllByBoard(boardId).subscribe(data => {
      this.stakeholders.set(data);
    });
  }

  handleDateSelect(selectInfo: any) {
    const title = prompt('Por favor, introduce un título para la entrevista:');
    const calendarApi = selectInfo.view.calendar;
    calendarApi.unselect();

    if (title) {
      const newInterview = {
        title: title,
        startTime: selectInfo.startStr,
        endTime: selectInfo.endStr,
        stakeholderIds: this.selectedStakeholders() // Asigna los stakeholders seleccionados
      };

      this.stakeholderService.createInterview(this.boardId, newInterview)
        .subscribe(() => {
          calendarApi.addEvent({
            title: newInterview.title,
            start: newInterview.startTime,
            end: newInterview.endTime,
          });
          alert('Entrevista guardada exitosamente');
        });
    }
  }

  // --- NUEVOS MÉTODOS ---
  // Para manejar la lógica de los botones de filtro
  toggleStakeholder(stakeholderId: string) {
    this.selectedStakeholders.update(currentSelected => {
      const index = currentSelected.indexOf(stakeholderId);
      if (index > -1) {
        return currentSelected.filter(id => id !== stakeholderId); // Lo quita si ya estaba
      } else {
        return [...currentSelected, stakeholderId]; // Lo añade si no estaba
      }
    });
  }

  isSelected(stakeholderId: string): boolean {
    return this.selectedStakeholders().includes(stakeholderId);
  }
}