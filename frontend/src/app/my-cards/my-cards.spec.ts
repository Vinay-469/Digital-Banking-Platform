import { Component } from '@angular/core';
import { Card, UserService } from '../Shared/Custom-Services/user-service';
import { AuthService } from '../Shared/Custom-Services/auth-state';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-my-cards',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './my-cards.html',
})
export class MyCards {

  cards: Card[] = [];
  selectedCardId!: number;
  showBlockModal = false;

  constructor(
    private cardService: UserService,
    private authState: AuthService
  ) {}

  ngOnInit(): void {
    this.loadCards();
  }

  loadCards() {
    const userId = this.authState.userId();

    this.cardService.getActiveCards(userId).subscribe({
      next: (data) => {
        this.cards = data;
      },
      error: (err) => {
        console.error("Error loading cards", err);
      }
    });
  }

  maskCard(cardNumber?: number): string {

    if (!cardNumber) return '**** **** **** ****';

    const num = cardNumber.toString();
    return '**** **** **** ' + num.slice(-4);
  }

  openBlockModal() {
    this.showBlockModal = true;
  }

  closeBlockModal() {
    this.showBlockModal = false;
  }

  blockOrUnblockCard(id: number, status: number) {

    this.cardService.blockOrUnblock(id, status)
      .subscribe({
        next: () => {

          alert("Card Blocked Successfully");

          this.closeBlockModal();

          this.loadCards(); // reload cards
        },
        error: (err) => {
          console.error(err);
        }
      });

  }

}