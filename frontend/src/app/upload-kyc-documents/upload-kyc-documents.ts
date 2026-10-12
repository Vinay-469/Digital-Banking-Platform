import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { UserService } from '../Shared/Custom-Services/user-service';
import { AuthService } from '../Shared/Custom-Services/auth-state';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-upload-kyc-documents',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './upload-kyc-documents.html',
  styleUrl: './upload-kyc-documents.scss',
})
export class UploadKycDocuments implements OnInit {

  files: File[] = [];
  kycId: number | null | undefined = null;

  isCameraOpen = false;
  stream: MediaStream | null = null;

  profilePreview: string | null = null;

  @ViewChild('video') video!: ElementRef<HTMLVideoElement>;

  constructor(
    private kycService: UserService,
    private authState: AuthService,
    private toaster: ToastrService,
    private router: Router
  ) {}

  ngOnInit() {
    this.kycId = this.authState.user()?.kycId;
  }

  // ================= CAMERA =================
  async openCamera() {
    this.isCameraOpen = true;
    this.stream = await navigator.mediaDevices.getUserMedia({ video: true });
    this.video.nativeElement.srcObject = this.stream;
  }

  captureImage() {
    const video = this.video.nativeElement;
    const canvas = document.createElement('canvas');

    // Resize for better compression
    const maxWidth = 800;
    const scale = maxWidth / video.videoWidth;

    canvas.width = maxWidth;
    canvas.height = video.videoHeight * scale;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    this.compressImage(canvas, 199 * 1024).then((file) => {
      // send to same handler (index 0)
      this.handleFile(file, 0);
    });

    this.stopCamera();
  }

  stopCamera() {
    this.stream?.getTracks().forEach(track => track.stop());
    this.isCameraOpen = false;
  }

  // ================= FILE HANDLING =================
  onFileSelect(event: any, index: number) {
    const file: File = event.target.files[0];
    if (!file) return;

    this.handleFile(file, index);
  }

  handleFile(file: File, index: number) {
    const maxFileSize = 200 * 1024;
    const validExtensions = ['pdf', 'jpg', 'jpeg', 'png'];
    const extension = file.name.split('.').pop()?.toLowerCase();

    if (!validExtensions.includes(extension!)) {
      this.toaster.error('Invalid file format');
      return;
    }

    if (file.size > maxFileSize) {
      this.toaster.error('File must be less than 200KB');
      return;
    }

    const isDuplicate = this.files.some(f =>
      f && f.name === file.name && f.size === file.size
    );

    if (isDuplicate) {
      this.toaster.warning('Duplicate file not allowed');
      return;
    }

    this.files[index] = file;

    // Preview only for profile image
    if (index === 0) {
      this.profilePreview = URL.createObjectURL(file);
    }
  }

  // ================= COMPRESSION =================
  async compressImage(canvas: HTMLCanvasElement, maxSize: number): Promise<File> {
    let quality = 0.9;

    return new Promise((resolve) => {
      const tryCompress = () => {
        canvas.toBlob(
          (blob) => {
            if (!blob) return;

            if (blob.size <= maxSize || quality <= 0.1) {
              const file = new File([blob], 'profile.jpg', { type: 'image/jpeg' });
              resolve(file);
            } else {
              quality -= 0.1;
              tryCompress();
            }
          },
          'image/jpeg',
          quality
        );
      };

      tryCompress();
    });
  }

  // ================= UPLOAD =================
  upload() {
    if (this.files.length < 3 || this.files.includes(undefined as any)) {
      this.toaster.info('Please upload all documents');
      return;
    }

    this.kycService.uploadKycDocuments(this.kycId, this.files)
      .subscribe({
        next: () => {
          this.toaster.success('KYC uploaded successfully');
          this.router.navigate(['/home']);
        },
        error: () => {
          this.toaster.error('Upload failed');
        }
      });
  }
}