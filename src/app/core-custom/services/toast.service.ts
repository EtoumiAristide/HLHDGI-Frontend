import { Injectable } from '@angular/core';
import { ToastrService } from "ngx-toastr";

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  constructor(private toastr: ToastrService) {
  }

  success(title: string, message: string) {
    return this.toastr.success(message, title, {
      timeOut: 1500,
      progressBar: true,
      closeButton: true,
    })
  }

  error(title: string, message: string) {
    return this.toastr.error(message, title, {
      timeOut: 3000,
      progressBar: true,
      closeButton: true,
    })
  }

  warning(title: string, message: string) {
    return this.toastr.warning(message, title, {
      timeOut: 3000,
      progressBar: true,
      closeButton: true,
    })
  }

  info(title: string, message: string) {
    return this.toastr.info(message, title, {
      timeOut: 1500,
      progressBar: true,
      closeButton: true,
    })
  }
}
