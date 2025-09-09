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

import { ButtonComponent } from '@shared/components/button/button.component'; // <-- NUEVO
import { BoardFormComponent } from '../board-form/board-form.component'; // <-- NUEVO

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  standalone: true, // <-- AÑADIDO
  imports: [ // <-- AÑADIDO
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

  user$ = this.authService.user$;
  ownedBoards: Board[] = [];
  memberBoards: Board[] = [];
  
  // 2. AÑADE LA NUEVA PROPIEDAD
  boardId: string | null = null;

  navBarBackgroundColor: Colors = 'sky';
  navBarColors = NAVBAR_BACKGROUNDS;

  constructor(
    private authService: AuthService,
    private boardsService: BoardsService,
    private meService: MeService,
    private router: Router,
    private route: ActivatedRoute // 3. INYECTA ActivatedRoute
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

    // 4. AÑADE LA LÓGICA PARA OBTENER EL boardId DE LA URL
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      let currentRoute = this.route.firstChild;
      while (currentRoute?.firstChild) {
        currentRoute = currentRoute.firstChild;
      }
      this.boardsService.boardId$.subscribe(id => {
      this.boardId = id;
      console.log('Board ID recibido en la Navbar via Servicio:', this.boardId);
    });
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