import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // <-- NUEVO
import { RouterModule } from '@angular/router'; // <-- NUEVO
import { CdkAccordionModule } from '@angular/cdk/accordion'; // <-- NUEVO
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'; 
import { faBox, faWaveSquare, faClock, faAngleUp, faAngleDown, faHeart, faBorderAll, faUsers, faGear } from '@fortawesome/free-solid-svg-icons';
import { faTrello } from '@fortawesome/free-brands-svg-icons';

import { MeService } from '@services/me.service';
import { Board } from '@models/board.model';
import { CardColorComponent } from '@shared/components/card-color/card-color.component';

@Component({
  selector: 'app-boards',
  templateUrl: './boards.component.html',
  standalone: true, // <-- AÑADIDO
  imports: [ // <-- AÑADIDO
    CommonModule,
    RouterModule,
    CdkAccordionModule,
    FontAwesomeModule,
    CardColorComponent
  ],
})
export class BoardsComponent implements OnInit {

  boards: Board[] = [];

  faTrello = faTrello;
  faBox = faBox;
  faWaveSquare = faWaveSquare;
  faClock = faClock;
  faAngleUp = faAngleUp;
  faAngleDown = faAngleDown;
  faHeart = faHeart;
  faBorderAll = faBorderAll;
  faUsers = faUsers;
  faGear = faGear;

  constructor(
    private meService: MeService
  ) { }

  ngOnInit() {
    this.getMeBoards();
  }

  getMeBoards() {
    this.meService.getMeBoards()
    .subscribe(data  => {
      this.boards = [...data.owned, ...data.member];
    });
  }

}
