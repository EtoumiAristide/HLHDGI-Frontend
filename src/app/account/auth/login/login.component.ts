import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { AuthenticationService } from '../../../core/services/auth.service';
import { AuthfakeauthenticationService } from '../../../core/services/authfake.service';

import { Store } from '@ngrx/store';
import { ActivatedRoute, Router } from '@angular/router';
import { login } from 'src/app/store/Authentication/authentication.actions';
import { UserApiService } from './service/user.service';
import { Observable } from 'rxjs';
import { ToastService } from 'src/app/core-custom/services/toast.service';
import { btnFormState } from 'src/app/core-custom/constants/form-btn-state.constant';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})

/**
 * Login component
 */
export class LoginComponent implements OnInit {

  loginForm: UntypedFormGroup;
  submitted: any = false;
  error: any = '';
  returnUrl: string;
  fieldTextType!: boolean;

  //COnfiguration du bouton lors de la validation
  loadingBtn: boolean = false;
  textButton: string = btnFormState.connect;

  // set the currenr year
  year: number = new Date().getFullYear();

  // tslint:disable-next-line: max-line-length
  constructor(private formBuilder: UntypedFormBuilder, private route: ActivatedRoute, private router: Router, private authenticationService: AuthenticationService, private store: Store,
    private authFackservice: AuthfakeauthenticationService,
    private _userService: UserApiService,
    private _toastServive: ToastService,) { }

  ngOnInit() {
    if (localStorage.getItem('currentUser')) {
      this.router.navigate(['/']);
    }
    // form validation
    this.loginForm = this.formBuilder.group({
      login: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });
  }

  // convenience getter for easy access to form fields
  get f() { return this.loginForm.controls; }

  /**
   * Form submit
   */
  onSubmit() {
    this.submitted = true;

    // Login Api
    //this.store.dispatch(login({ email: email, password: password }));
    console.log(this.f.valid);
    
    if (this.loginForm.valid) {
      console.log("Data form: " + JSON.stringify(this.loginForm.value));
      this.changeFormElement();

      let dataToSend: any = {}
      dataToSend.username = this.loginForm.controls['login'].value
      dataToSend.password = this.loginForm.controls['password'].value

      let apiSend: Observable<any> = this._userService.login(dataToSend);

      apiSend.subscribe({
        next: response => {
          console.log(response);
          
          this._toastServive.success(response.username + " connecté avec succès", "Connexion éffectuée").onHidden.subscribe(() => {
            this.initFormElement(true);
            localStorage.setItem("access_token", response.token)
            this.router.navigate(['/factures']);
          })
        },
        error: error => {
          console.error("There is an error !", error);
          this._toastServive.error("Une erreur est survenue", "Enregistrement échoué").onHidden.subscribe(() => {
            this.initFormElement();
            this.error = error.error.data
          });
        }
      });
    }
  }

  //Modification de l'apparence visuelle du bouton "Valider"
  changeFormElement() {
    this.loadingBtn = true;
    this.textButton = btnFormState.processing
  }

  //Remise à l'état initial du bouton "Valider" et des données du formulaire
  initFormElement(isReinitData: boolean = false) {
    this.textButton = btnFormState.connect
    this.loadingBtn = false;
    this.error = undefined

    // if (isReinitData) {
    //   this.clearForm()
    //   this.modalService.hide(this.modalRef?.id);
    //   this.txtModalHeader = formModalHeader.save + ' ' + this.pageTitle;
    // }
  }

  /**
 * Password Hide/Show
 */
  toggleFieldTextType() {
    this.fieldTextType = !this.fieldTextType;
  }
}
