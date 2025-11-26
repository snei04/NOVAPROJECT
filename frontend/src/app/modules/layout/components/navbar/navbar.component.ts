import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // <-- NUEVO
import { Router, ActivatedRoute, NavigationEnd, RouterModule } from '@angular/router'; // <-- NUEVO
import { filter } from 'rxjs/operators';
import { OverlayModule } from '@angular/cdk/overlay'; // <-- NUEVO
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'; // <-- NUEVO

import { faBell, faInfoCircle, faClose, faAngleDown } from '@fortawesome/free-solid-svg-icons';
import { Colors, NAVBAR_BACKGROUNDS } from '@models/colors.model';
import { Board } from '@models/board.model';
import { AuthService } from '@services/auth.service';
import { BoardsService } from '@services/boards.service';
import { MeService } from '@services/me.service';
import { DeliverableService } from '../../../../features/deliverable-tracker/services/deliverable.service'; 
import { RiskService } from '../../../../features/risk-management/services/risk.service'; 
import { forkJoin } from 'rxjs'; 

import { ButtonComponent } from '@shared/components/button/button.component'; 
import { BoardFormComponent } from '../board-form/board-form.component'; 

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  standalone: true, 
  imports: [ 
    CommonModule,
    RouterModule,
    OverlayModule,
    FontAwesomeModule,
    ButtonComponent,
    BoardFormComponent
  ],
})
export class NavbarComponent implements OnInit {
  faBell = faBell;
  faInfoCircle = faInfoCircle;
  faClose = faClose;
  faAngleDown = faAngleDown;

  isOpenOverlayAvatar = false;
  isOpenOverlayBoards = false;
  isOpenOverlayCreateBoard = false;
  isOpenOverlayNotifications = false;
  isOpenOverlayInfo = false;

  notifications: any[] = []; 

  user$ = this.authService.user$;
  ownedBoards: Board[] = [];
  memberBoards: Board[] = [];
  
  boardId: string | null = null;

  navBarBackgroundColor: Colors = 'sky';
  navBarColors = NAVBAR_BACKGROUNDS;

  constructor(
    private authService: AuthService,
    private boardsService: BoardsService,
    private meService: MeService,
    private router: Router,
    private route: ActivatedRoute,
    private deliverableService: DeliverableService, 
    private riskService: RiskService 
  ) {
    this.boardsService.backgroundColor$.subscribe(color => {
      this.navBarBackgroundColor = color;
    });
  }

  ngOnInit(): void {
    this.meService.getMeBoards().subscribe(data => {
      this.ownedBoards = data.owned;
      this.memberBoards = data.member;
    });

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      let currentRoute = this.route.firstChild;
      while (currentRoute?.firstChild) {
        currentRoute = currentRoute.firstChild;
      }
      this.boardsService.boardId$.subscribe(id => {
        this.boardId = id;
        if (this.boardId) {
          this.loadNotifications(this.boardId);
        } else {
          this.notifications = [];
        }
      });
    });
  }

  loadNotifications(projectId: string) {
    forkJoin({
      deliverables: this.deliverableService.getByProject(projectId),
      risks: this.riskService.getRisksByProject(projectId)
    }).subscribe({
      next: (data) => {
        const alerts: any[] = [];
        const now = new Date();

        data.deliverables.forEach(d => {
          if (d.status !== 'approved') {
            const dueDate = d.due_date || d.dueDate ? new Date(d.due_date || d.dueDate!) : null;
            if (dueDate) {
              const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
              
              if (diffDays < 0) {
                alerts.push({
                  id: `d-${d.id}`,
                  title: `Vencido: ${d.title}`,
                  message: `Venció hace ${Math.abs(diffDays)} días`,
                  type: 'error',
                  time: 'Urgente'
                });
              } else if (diffDays <= 3) {
                alerts.push({
                  id: `d-${d.id}`,
                  title: `Próximo a vencer: ${d.title}`,
                  message: `Vence en ${diffDays} días`,
                  type: 'warning',
                  time: 'Atención'
                });
              }
            }
          }
        });

        data.risks.forEach(r => {
          const severity = (r.probability || 0) * (r.impact || 0);
          if (r.status !== 'closed' && r.status !== 'mitigated' && severity >= 15) {
            alerts.push({
              id: `r-${r.id}`,
              title: `Riesgo Crítico: ${r.title}`,
              message: `Severidad ${severity}/25 - Requiere acción`,
              type: 'error',
              time: 'Alta Prioridad'
            });
          }
        });

        this.notifications = alerts;
      },
      error: (err) => console.error('Error cargando notificaciones:', err)
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  close(event: boolean) {
    this.isOpenOverlayCreateBoard = event;
  }

  get colors() {
    const classes = this.navBarColors[this.navBarBackgroundColor];
    return classes ? classes : {};
  }
}