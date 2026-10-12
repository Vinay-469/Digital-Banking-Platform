import { Component, OnInit } from '@angular/core';
import { User, UserService } from '../Shared/Custom-Services/user-service';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../Shared/Custom-Services/auth-state';

@Component({
  selector: 'app-view-kyc-documents',
  imports: [],
  templateUrl: './view-kyc-documents.html',
  styleUrl: './view-kyc-documents.scss',
})
export class ViewKycDocuments implements OnInit{
kycId: number|null|undefined  = 0;
user: User|null=null;

constructor( private kycService: UserService,
             private toaster: ToastrService,
             private authState : AuthService
){}
ngOnInit(){
  this.kycId= this.authState.user()?.kycId
  this.user = this.authState.user()
}
// To preview file
viewDocument(type: string) {
  this.kycService.getKycDocument(this.kycId, type)
    .subscribe({
      next: (blob: Blob) => {
        const fileURL = URL.createObjectURL(blob);
        window.open(fileURL, '_blank'); // opens in new tab
      },
      error: () => {
        this.toaster.error('Document not found');
      }
    });
}

// To download file
downloadDocument(type: string) {
  this.kycService.getKycDocument(this.kycId, type)
    .subscribe({
      next: (blob: Blob) => {
        const fileURL = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = fileURL;
        a.download = `${type}_Document`;
        a.click();
      },
      error: () => {
        this.toaster.error('Download failed');
      }
    });
}
}
