import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { FormsModule, NgForm } from "@angular/forms";
import { Card, UserService } from "../Shared/Custom-Services/user-service";
import { AuthService } from "../Shared/Custom-Services/auth-state";
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ToastrService } from "ngx-toastr";
import { RouterLink } from "@angular/router";
import { A11yModule } from "@angular/cdk/a11y";

@Component({
  selector: 'app-my-cards',
  standalone: true,
  imports: [CommonModule, FormsModule, MatSnackBarModule, RouterLink, A11yModule],
  templateUrl: './my-cards.html'
})
export class MyCards {

  cards: Card[] = [];

  selectedCardId!: number;
  selectedCardStatus: number | null = null;
  selectedCardNumber: number | null = null;
  selectedCard!: Card;
  cvv!: number;
  newPin!: number;
  showModal = false;
  showLimitModal = false;
  showResetPin = false;
  selectedForm: 'block' | 'unblock' = 'block';
  withdrawLimit = 100;
  resetPinForm!: NgForm;
  blockCardForm!: NgForm;
  unblockCardForm!: NgForm;
  limitForm!: NgForm;
  showSensitiveData: boolean = false;
  maskTimeout: any;
  activeCardId: number | null | undefined = null;
  flippedCardId: number | null = null;

  constructor(
    private cardService: UserService,
    private authState: AuthService,
    private snackBar: MatSnackBar,
    private toaster: ToastrService
  ) { }

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

  maskCard(cardNumber?: number, accountId?: number): string {
    if (!cardNumber) return '**** **** **** ****';

    const num = cardNumber.toString();

    if (this.activeCardId === accountId) {
      return num.replace(/(.{4})/g, '$1 ').trim();
    }

    return '**** **** **** ' + num.slice(-4);
  }

  maskBalance(balance: number | null | undefined, accountId?: number): string {
    if (balance == null) return '₹ ****';

    return this.activeCardId === accountId
      ? `₹ ${balance}`
      : '₹ ****';
  }

  maskCvv(cvv?: number, accountId?: number): string {
    if (!cvv) return '***';

    return this.activeCardId === accountId ? cvv.toString() : '***';
  }

  toggleAccountView(accountId: number | undefined) {

    if (this.activeCardId === accountId) {
      this.activeCardId = null;
      return;
    }
    this.activeCardId = accountId;

    clearTimeout(this.maskTimeout);

    this.maskTimeout = setTimeout(() => {
      this.activeCardId = null;
    }, 5000);
  }

  toggleFlip(cardId: number) {
    this.flippedCardId = this.flippedCardId === cardId ? null : cardId;
  }
  
  openBlockModal() {
    this.showModal = true;
  }

  closeBlockModal() {
    this.showModal = false;
  }

  openLimitModal() {
    console.log(this.withdrawLimit);

    this.showLimitModal = true;
  }

  closeLimitModal() {
    this.showLimitModal = false;
  }

  openResetPin() {
    this.showResetPin = true;
  }

  closeForm() {
    this.showLimitModal = false;
    this.showModal = false;
    this.showResetPin = false;
    this.selectedCardId = 0;
    this.selectedCardStatus = null;
    this.selectedCardNumber = null;
    this.selectedCard = null as any;
    this.cvv = 0;
    this.newPin = 0;
    this.withdrawLimit = 100;
    this.resetPinForm?.resetForm();
    this.blockCardForm?.resetForm();
    this.unblockCardForm?.resetForm();
    this.limitForm?.resetForm();

  }

  selectForm(form: 'block' | 'unblock') {
    this.selectedForm = form;
  }

  Activate(id: number) {
    this.blockOrUnblockCard(id, 1)
  }

  selectCard(card: Card) {
    this.selectedCardId = card.cardId;
    this.selectedCardStatus = card.status;
    this.selectedCardNumber = card.cardNumber;
    this.selectedCard = card;
    this.withdrawLimit = card.withdrawLimit ?? 100;
  }

  blockOrUnblockCard(id: number, status: number) {
    this.cardService.blockOrUnblock(id, status).subscribe({
      next: () => {
        this.snackBar.open(
          status === 0 ? 'Card blocked successfully' : 'Card unblocked successfully',
          'Close',
          { duration: 4000 }
        );
        this.closeBlockModal();
        this.loadCards();
      },
      error: () => {
        this.snackBar.open(
          'Failed to update card status',
          'Close',
          { duration: 4000 }
        );
      }
    });
  }

  setWithdrawLimit() {

    if (!this.selectedCardId) return;

    if (!this.selectedCardStatus) {
      this.toaster.error("Inactive card. Withdraw limit cannot be set.");
      return;
    }

    this.cardService
      .setWithdrawLimit(this.selectedCardId, this.withdrawLimit)
      .subscribe({

        next: () => {

          this.snackBar.open(
            'Withdraw limit updated successfully',
            'Close',
            { duration: 4000 }
          );
          this.closeLimitModal();
          this.loadCards();
        },
        error: () => {
          this.snackBar.open(
            'Failed to update withdraw limit',
            'Close',
            { duration: 4000 }
          );
        }
      });
  }

  limitPin(event: any) {
    let value = event.target.value;
    value = value.replace(/[^0-9]/g, '').slice(0, 4);
    event.target.value = value;
    this.newPin = value ? Number(value) : 0;
  }

  resetPin() {
    if (!this.selectedCardStatus) {
      this.toaster.error("Inactive card. PIN reset not allowed.");
      return;
    }
    if (!this.cvv || !this.newPin) {
      this.toaster.warning("Enter CVV and new PIN");
      return;
    }
    this.cardService.resetPin(this.selectedCardNumber, this.cvv, this.newPin)
      .subscribe({
        next: () => {
          this.toaster.success("PIN reset successfully");
          this.closeForm();
        },
        error: () => {
          this.toaster.error("Failed to reset PIN");
        }
      });
  }

}