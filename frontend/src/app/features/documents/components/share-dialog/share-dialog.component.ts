import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsersService } from '@services/users.service';
import { User } from '@models/user.model';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-share-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './share-dialog.component.html'
})
export class ShareDialogComponent {
  @Output() close = new EventEmitter<void>();
  @Output() invite = new EventEmitter<{email: string, role: string}>();

  searchQuery = '';
  searchResults: User[] = [];
  selectedUser: User | null = null;
  role = 'editor';
  isLoading = false;
  
  private searchSubject = new Subject<string>();

  constructor(private usersService: UsersService) {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => {
        this.isLoading = true;
        return this.usersService.searchUsers(query);
      })
    ).subscribe(users => {
      this.searchResults = users;
      this.isLoading = false;
    });
  }

  onSearch(query: string) {
    this.searchQuery = query;
    if (query && query.length > 1) {
      this.searchSubject.next(query);
    } else {
      this.searchResults = [];
    }
    this.selectedUser = null;
  }

  selectUser(user: User) {
    this.selectedUser = user;
    this.searchQuery = user.email;
    this.searchResults = [];
  }

  onInvite() {
    if (this.searchQuery) {
        const email = this.selectedUser ? this.selectedUser.email : this.searchQuery;
        this.invite.emit({ email, role: this.role });
    }
  }
}
