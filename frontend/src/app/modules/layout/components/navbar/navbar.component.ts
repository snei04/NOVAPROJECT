import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { faBell, faInfoCircle, faClose, faAngleDown } from '@fortawesome/free-solid-svg-icons';
import { Colors, NAVBAR_BACKGROUNDS } from '@models/colors.model';
import { Board } from '@models/board.model';
import { AuthService } from '@services/auth.service';
import { BoardsService } from '@services/boards.service';
import { MeService } from '@services/me.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
})
export class NavbarComponent implements OnInit {
  // --- Iconos ---
  faBell = faBell;
  faInfoCircle = faInfoCircle;
  faClose = faClose;
  faAngleDown = faAngleDown;

  // --- Estados de la UI ---
  isOpenOverlayAvatar = false;
  isOpenOverlayBoards = false;
  isOpenOverlayCreateBoard = false;

  // --- Datos ---
  user$ = this.authService.user$;
  ownedBoards: Board[] = [];
  memberBoards: Board[] = [];
  
  // --- Estilos ---
  navBarBackgroundColor: Colors = 'sky';
  navBarColors = NAVBAR_BACKGROUNDS;

  constructor(
    private authService: AuthService,
    private boardsService: BoardsService,
    private meService: MeService,
    private router: Router
  ) {
    this.boardsService.backgroundColor$.subscribe(color => {
      this.navBarBackgroundColor = color;
    });
  }

  ngOnInit(): void {
    // Obtenemos los tableros y los separamos en las dos listas
    this.meService.getMeBoards().subscribe(data => {
      this.ownedBoards = data.owned;
      this.memberBoards = data.member;
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