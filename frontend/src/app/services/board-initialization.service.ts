import { Injectable, inject } from '@angular/core';
import { BoardsService } from './boards.service';
import { Board } from '@models/board.model';
import { List } from '@models/list.model';
import { Card } from '@models/card.model';
import { Colors } from '@models/colors.model';
import { Observable, switchMap, forkJoin } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BoardInitializationService {
  private boardsService = inject(BoardsService);

  // Crear tablero con contenido inicial
  createBoardWithInitialContent(title: string, backgroundColor: string): Observable<Board> {
    return this.boardsService.createBoard(title, backgroundColor as Colors).pipe(
      switchMap(board => {
        // Crear listas iniciales
        const initialLists = this.getInitialLists();
        const listCreationObservables = initialLists.map(listData => 
          this.boardsService.createList(listData.title, board.id, listData.position)
        );

        return forkJoin(listCreationObservables).pipe(
          switchMap(createdLists => {
            // Crear tarjetas iniciales para cada lista
            const cardCreationObservables = createdLists.flatMap((list, listIndex) => {
              const cardsForList = this.getInitialCardsForList(listIndex);
              return cardsForList.map(cardData => 
                this.boardsService.createCard({
                  title: cardData.title,
                  description: cardData.description,
                  position: cardData.position,
                  listId: list.id,
                  boardId: board.id
                })
              );
            });

            if (cardCreationObservables.length > 0) {
              return forkJoin(cardCreationObservables).pipe(
                switchMap(() => this.boardsService.getBoard(board.id))
              );
            } else {
              return this.boardsService.getBoard(board.id);
            }
          })
        );
      })
    );
  }

  private getInitialLists(): Array<{title: string, position: number}> {
    return [
      { title: '📋 Por Hacer', position: 1 },
      { title: '🔄 En Progreso', position: 2 },
      { title: '👀 En Revisión', position: 3 },
      { title: '✅ Completado', position: 4 }
    ];
  }

  private getInitialCardsForList(listIndex: number): Array<{title: string, description: string, position: number}> {
    const cardTemplates = [
      // Lista 0: Por Hacer
      [
        {
          title: '🎯 Definir Objetivos del Proyecto',
          description: 'Establecer metas claras y criterios de éxito para el proyecto.\n\n**Tareas:**\n- Reunión con stakeholders\n- Documentar objetivos SMART\n- Definir KPIs de éxito',
          position: 1
        },
        {
          title: '📊 Configurar Dashboard de Métricas',
          description: 'Implementar sistema de seguimiento automático de progreso.\n\n**Beneficios:**\n- Visibilidad en tiempo real\n- Alertas automáticas\n- Comparación vs objetivos',
          position: 2
        },
        {
          title: '👥 Mapear Stakeholders Clave',
          description: 'Identificar y documentar todos los stakeholders del proyecto.\n\n**Incluir:**\n- Roles y responsabilidades\n- Nivel de influencia\n- Canales de comunicación',
          position: 3
        }
      ],
      // Lista 1: En Progreso
      [
        {
          title: '🔧 Configuración Inicial del Sistema',
          description: 'Configurar el entorno de desarrollo y herramientas necesarias.\n\n**Estado:** 60% completado\n**Próximos pasos:** Configurar CI/CD',
          position: 1
        },
        {
          title: '📝 Documentación de Procesos',
          description: 'Crear documentación de procesos y procedimientos.\n\n**Progreso:**\n- ✅ Proceso de desarrollo\n- 🔄 Proceso de testing\n- ⏳ Proceso de deployment',
          position: 2
        }
      ],
      // Lista 2: En Revisión
      [
        {
          title: '🎨 Diseño de Interfaz de Usuario',
          description: 'Revisión de mockups y prototipos de la interfaz.\n\n**Pendiente:**\n- Aprobación del cliente\n- Feedback del equipo UX\n- Ajustes finales',
          position: 1
        }
      ],
      // Lista 3: Completado
      [
        {
          title: '✅ Análisis de Requerimientos',
          description: 'Análisis completo de requerimientos funcionales y no funcionales.\n\n**Entregables:**\n- ✅ Documento de requerimientos\n- ✅ Casos de uso\n- ✅ Criterios de aceptación',
          position: 1
        },
        {
          title: '🏗️ Arquitectura del Sistema',
          description: 'Diseño de la arquitectura técnica del sistema.\n\n**Completado:**\n- ✅ Diagrama de arquitectura\n- ✅ Stack tecnológico definido\n- ✅ Patrones de diseño seleccionados',
          position: 2
        }
      ]
    ];

    return cardTemplates[listIndex] || [];
  }

  // Método para verificar si un tablero está vacío
  isBoardEmpty(board: Board): boolean {
    return !board.lists || board.lists.length === 0 || 
           board.lists.every(list => !list.cards || list.cards.length === 0);
  }

  // Método para agregar contenido a un tablero existente vacío
  addInitialContentToExistingBoard(boardId: string): Observable<Board> {
    return this.boardsService.getBoard(boardId).pipe(
      switchMap(board => {
        if (this.isBoardEmpty(board)) {
          // Si el tablero está vacío, agregar contenido inicial
          const initialLists = this.getInitialLists();
          const listCreationObservables = initialLists.map(listData => 
            this.boardsService.createList(listData.title, boardId, listData.position)
          );

          return forkJoin(listCreationObservables).pipe(
            switchMap(createdLists => {
              const cardCreationObservables = createdLists.flatMap((list, listIndex) => {
                const cardsForList = this.getInitialCardsForList(listIndex);
                return cardsForList.map(cardData => 
                  this.boardsService.createCard({
                    title: cardData.title,
                    description: cardData.description,
                    position: cardData.position,
                    listId: list.id,
                    boardId: boardId
                  })
                );
              });

              if (cardCreationObservables.length > 0) {
                return forkJoin(cardCreationObservables).pipe(
                  switchMap(() => this.boardsService.getBoard(boardId))
                );
              } else {
                return this.boardsService.getBoard(boardId);
              }
            })
          );
        } else {
          // El tablero ya tiene contenido, retornarlo tal como está
          return this.boardsService.getBoard(boardId);
        }
      })
    );
  }
}
