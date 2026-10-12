import {
  Component,
  ElementRef,
  ViewChild,
  OnInit,
  effect
} from '@angular/core';
import { Html5Qrcode } from 'html5-qrcode';
import { CommonModule } from '@angular/common';
import { UserService } from '../Shared/Custom-Services/user-service';
import { AuthService } from '../Shared/Custom-Services/auth-state';
import { ToastrService } from 'ngx-toastr';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-bank-transfer',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './bank-tranfer.html',
  styleUrls: ['./bank-tranfer.scss']
})
export class BankTranfer implements OnInit {

  // ================= UI FLAGS =================
  showTransferCard = true;
  showQrCard = false;
  showAccountCard = false;
  showAmountCard = false;
  showThresholdCard = false;
  showCancelledCard = false;

  // ================= FORMS =================
  transferForm!: FormGroup;
  amountForm!: FormGroup;

  // ================= DATA =================
  accountHolderName = '';
  activeAccounts: any[] = [];
  userId: number | null = null;

  pendingTransferData: any = null;
  delayTime = 10;
  timer: any;
  thresholdTimeout: any;

  // ================= CAMERA =================
  @ViewChild('video') video!: ElementRef<HTMLVideoElement>;
  stream: MediaStream | null = null;

  constructor(
    private userService: UserService,
    private toaster: ToastrService,
    private router: Router,
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    effect(() => {
      this.userId = this.authService.userId();
      if (!this.userId) {
        this.toaster.error('User not logged in');
        this.router.navigate(['/login']);
      }
    });
  }

  // ================= INIT =================
  ngOnInit(): void {

    this.transferForm = this.fb.group({
      accountNumber: ['', [
        Validators.required,
        Validators.pattern('^[0-9]{10,16}$')
      ]],
      reEnterAccountNumber: ['', [
        Validators.required,
        Validators.pattern('^[0-9]{10,16}$')
      ]],
      IFSC: ['', Validators.required]
    });

    this.amountForm = this.fb.group({
      fromAccount: ['', Validators.required],
      amount: ['', [
        Validators.required,
        Validators.min(1)
      ]]
    });

    this.loadActiveAccounts();
  }

  // ================= LOAD ACCOUNTS =================
  loadActiveAccounts() {
    const userId = this.authService.userId();
    if (!userId) return;

    this.userService.getActiveAccounts(userId)
      .subscribe({
        next: (res: any[]) => {
          this.activeAccounts = res;
        },
        error: () => {
          this.toaster.error('Failed to load accounts');
        }
      });
  }

  // ================= STEP 1 =================
  submitTransfer() {

    if (this.transferForm.invalid) {
      this.toaster.warning('Fill all fields correctly');
      return;
    }

    const acc1 = this.transferForm.get('accountNumber')?.value;
    const acc2 = this.transferForm.get('reEnterAccountNumber')?.value;

    if (acc1 !== acc2) {
      this.toaster.error('Account numbers do not match');
      return;
    }

    const ifsc = this.transferForm.get('IFSC')?.value;

    this.userService
      .getAccountByAccountNumberAndIFSCcode(acc1, ifsc)
      .subscribe({
        next: (res: any) => {

          if (!res || !res.data) {
            this.toaster.error('Invalid Account / IFSC');
            return;
          }

          this.accountHolderName = res.data;
          this.showAccountCard = false;
          this.showAmountCard = true;

          this.toaster.success('Account Verified');
        },
        error: () => {
          this.toaster.error('Verification failed');
        }
      });
  }

  // ================= STEP 2 =================
  submitAmount() {

    if (this.amountForm.invalid) {
      this.toaster.warning('Enter valid details');
      return;
    }

    const fromAccount = this.amountForm.get('fromAccount')?.value;
    const toAccount = this.transferForm.get('accountNumber')?.value;
    const amount = Number(this.amountForm.get('amount')?.value);

    const currentAccount = this.activeAccounts.find(
      acc => acc.accountNumber == fromAccount
    );

    if (!currentAccount) {
      this.toaster.error('Sender account not found');
      return;
    }

    if (amount > currentAccount.balance) {
      this.toaster.error('Insufficient balance');
      return;
    }

    const remainingBalance = currentAccount.balance - amount;

    if (remainingBalance < currentAccount.customThreshold) {

      this.pendingTransferData = { fromAccount, toAccount, amount };
      this.delayTime = 10;

      this.showThresholdCard = true;
      this.showCancelledCard = false;

      this.startTimer();

      this.thresholdTimeout = setTimeout(() => {
        if (this.showThresholdCard) {
          this.cancelThreshold(true);
        }
      }, this.delayTime * 1000);

      return;
    }

    this.processTransfer(fromAccount, toAccount, amount);
  }

  // ================= PROCESS =================
  processTransfer(fromAccount: any, toAccount: any, amount: number) {

    clearTimeout(this.thresholdTimeout);
    clearInterval(this.timer);

    this.userService
      .TranferAmount(fromAccount, toAccount, amount)
      .subscribe({
        next: (res: any) => {
          this.toaster.success(res || 'Transfer Successful');

          this.showAmountCard = false;
          this.showAccountCard = false;
          this.showThresholdCard = false;
          this.pendingTransferData = null;
        },
        error: (err) => {
          const msg = err?.error || 'Transfer failed';
          this.toaster.error(msg);
        }
      });
  }

  // ================= NAVIGATION =================
  goToB2BTransfer() {
    this.showAccountCard = true;
    this.showTransferCard = false;
  }

  // goToQrScanner() {
  //   this.showTransferCard = false;
  //   this.showQrCard = true;

  //   // wait for DOM to render video
  //   setTimeout(() => {
  //     this.startCamera();
  //   }, 200);
  // }

  goToHome() {
    this.router.navigate(['home']);
  }

  goToHistory() {
    this.router.navigate(['history']);
  }

  // ================= CAMERA =================
  async startCamera() {
    try {
      this.stopCamera(); // prevent duplicate streams

      this.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          aspectRatio: 16 / 9
        }
      });

      if (this.video) {
        this.video.nativeElement.srcObject = this.stream;
      }

    } catch (err) {
      console.error('Camera error:', err);
      this.toaster.error('Unable to access camera');
    }
  }

  stopCamera() {
    this.stream?.getTracks().forEach(track => track.stop());
    this.stream = null;
  }

  // ================= TIMER =================
  startTimer() {
    clearInterval(this.timer);

    this.timer = setInterval(() => {
      if (this.delayTime > 0) {
        this.delayTime--;
      } else {
        clearInterval(this.timer);
      }
    }, 1000);
  }

  // ================= THRESHOLD =================
  confirmThreshold() {

    clearInterval(this.timer);
    clearTimeout(this.thresholdTimeout);

    if (this.pendingTransferData) {
      const { fromAccount, toAccount, amount } = this.pendingTransferData;
      this.processTransfer(fromAccount, toAccount, amount);
    }

    this.showThresholdCard = false;
    this.pendingTransferData = null;
  }

  cancelThreshold(autoCancel: boolean = false) {

    clearInterval(this.timer);
    clearTimeout(this.thresholdTimeout);

    this.showThresholdCard = false;
    this.pendingTransferData = null;
    this.showCancelledCard = true;

    if (autoCancel) {
      this.toaster.warning("Transaction auto cancelled");
    } else {
      this.toaster.warning("Transaction cancelled by user");
    }
  }

  // 🔙 Back to account screen
goBack() {
  this.showAmountCard = false;
  this.showAccountCard = true;
  this.amountForm.reset();
}

// 🔁 Send again (after success)
goToAmount() {
  this.showAmountCard = true;
  this.showAccountCard = false;
  this.showTransferCard = false;
  this.showQrCard = false;
}

// 🏠 Close cancelled popup / go home state
goHome() {
  this.showCancelledCard = false;
  this.showTransferCard = true;
  this.showAccountCard = false;
  this.showAmountCard = false;
  this.showQrCard = false;
}

qrCode!: Html5Qrcode;
scannedData: any = null;

goToQrScanner() {
    this.showTransferCard = false;
    this.showQrCard = true;

    setTimeout(() => {
      this.startScanner();
    }, 300);
  }

  // goToB2BTransfer() {
  //   this.showTransferCard = false;
  //   this.showAccountCard = true;
  // }

  // ================= QR SCANNER =================
  startScanner() {
    this.qrCode = new Html5Qrcode("qr-reader");

    this.qrCode.start(
      { facingMode: "environment" },
      { fps: 10,  qrbox: { width: 250, height: 250 } },// 🔥 square scan box
      (decodedText) => {
        this.handleQr(decodedText);
      },
      () => {}
    ).catch(err => {
      console.error("Camera error:", err);
      this.toaster.error("Camera not accessible");
    });
  }

  // ================= HANDLE QR =================
  handleQr(text: string) {
    console.log("QR:", text);

    this.qrCode.stop();

    // 🔹 JSON QR
    try {
      const data = JSON.parse(text);

      this.transferForm.patchValue({
        accountNumber: data.accountNumber,
        reEnterAccountNumber: data.accountNumber,
        IFSC: data.ifsc
      });
      this.submitTransfer()
      this.successFlow();
      return;

    } catch {}

    // 🔹 UPI QR
    if (text.startsWith("upi://")) {
      const params = new URLSearchParams(text.split('?')[1]);

      const upiId = params.get('pa');
      this.toaster.info("UPI ID: " + upiId);

      this.successFlow();
      return;
    }

    // 🔹 Custom format
    const acc = text.match(/ACC:(\d+)/)?.[1];
    const ifsc = text.match(/IFSC:([A-Z0-9]+)/)?.[1];

    if (acc && ifsc) {
      this.transferForm.patchValue({
        accountNumber: acc,
        reEnterAccountNumber: acc,
        IFSC: ifsc
      });

      this.successFlow();
      return;
    }

    this.toaster.error("Invalid QR");
  }

  // ================= AFTER SCAN =================
  successFlow() {
    this.showQrCard = false;
    // this.showAccountCard = true;

    this.toaster.success("QR Scanned");
  }

  // ================= FORM =================
  // submitTransfer() {
  //   this.showAccountCard = false;
  //   this.showSuccessCard = true;
  // }

// 🔥 Handle scanned QR
handleScan(text: string) {
  try {
    this.scannedData = JSON.parse(text);

    // stop after scan
    this.qrCode.stop();

    // 🔥 Auto-fill form
    this.transferForm.patchValue({
      accountNumber: this.scannedData.accountNumber,
      reEnterAccountNumber: this.scannedData.accountNumber,
      IFSC: this.scannedData.ifsc
    });

    // Move to next step
    this.showQrCard = false;
    this.showAccountCard = true;

  } catch {
    console.warn("Invalid QR format");
  }
}
}