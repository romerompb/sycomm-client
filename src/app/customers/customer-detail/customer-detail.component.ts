
import {switchMap} from 'rxjs/operators';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Location } from '@angular/common';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';

import { Customer } from '../shared/customer.model';
import { CustomerService } from '../shared/customer.service';
import { PublicOffice } from '../../public_offices/shared/public_office.model';
import { PublicOfficeService } from '../../public_offices/shared/public_office.service';
import { PublicAgency } from '../../public_agencies/shared/public_agency.model';
import { PublicAgencyService } from '../../public_agencies/shared/public_agency.service';

import { MessageService } from 'primeng/components/common/messageservice';
import { Message } from 'primeng/components/common/api';

import { FormUtils} from '../../shared/form-utils';

import * as cpf from '@fnando/cpf';

@Component({
  selector: 'app-customer',
  templateUrl: './customer-detail.component.html',
  styleUrls: ['./customer-detail.component.css']
})

export class CustomerDetailComponent implements OnInit {
  customer: Customer;
  public_offices: PublicOffice[];
  public_agencies: PublicAgency[];
  form: FormGroup;
  formUtils: FormUtils;
  msgs: Message[] = [];
  customerTypes: Array<any> = [
    { value: 'Admin', text: 'Administrador'},
    { value: 'Employee', text: 'Funcionário' },
    { value: 'CustomerModel', text: 'Cliente' }
  ];
  // masls
  registrationMask = [/\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/];
  cpfMask = [/\d/, /\d/, /\d/, '.', /\d/, /\d/, /\d/, '.', /\d/, /\d/, /\d/, '-', /\d/, /\d/];
  phoneMask = ['(', /\d/, /\d/, ')', ' ', /\d/, '-', /\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/];

  constructor(
    private customerService: CustomerService, private publicOfficeService: PublicOfficeService, private publicAgencyService: PublicAgencyService,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private formBuilder: FormBuilder,
    private messageService: MessageService
  ) {

    this.customer = new Customer(
      null,
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null
    );

    this.form = this.formBuilder.group({
      name: [null, [Validators.required]],
      email: [null],
      registration: [null, Validators.required],
      cpf: [null, [Validators.required]],
      landline: [null],
      cellphone: [null, [Validators.required]],
      whatsapp: [null],
      simple_address: [null],
      public_office_id: [null, Validators.required],
      public_agency_id: [null, Validators.required]
    });

    this.formUtils = new FormUtils(this.form);
  }

  ngOnInit() {
    this.route.params.pipe(switchMap(
      (params: Params) => this.customerService.getById(+params['id'])
    )).subscribe(
      customer => {
        if (customer) {
          this.setCustomer(customer);
        }

        this.publicOfficeService.getAll().subscribe(
          public_offices => {
            this.public_offices = public_offices;

            this.publicAgencyService.getAll().subscribe(
              public_agencies => this.public_agencies = public_agencies,
              error => console.error('Erro ao carregar : ' + error)
            );
          },
          error => console.error('Erro ao carregar cargos: ' + error)
        );
      },
      error => console.error('Erro ao carregar o usuário: ' + error)
    );
  }

  create() {
    this.applyFormValues();

    this.customerService.create(this.customer).subscribe(
      () => this.messageService.add({severity: 'success', summary: 'Sucesso', detail: 'Usuário criado com sucesso!'}),
      (error) => this.messageService.add({severity: 'error', summary: 'Erro', detail: 'Ocorreu um erro inesperado ao tentar criar o usuário.'})
    );
  }

  update() {
    this.applyFormValues();

    let errorFound = false;

    if (!cpf.isValid(this.customer.cpf)) {
      this.messageService.add({severity: 'error', summary: 'Erro', detail: 'CPF inválido.'});
      errorFound = true;
    }

    if (this.customer.landline && this.customer.landline.length !== 11) {
      this.messageService.add({severity: 'error', summary: 'Erro', detail: 'Telefone fixo precisa ter 11 dígitos.'});
      errorFound = true;
    }

    if (this.customer.landline && this.customer.cellphone.length !== 11) {
      this.messageService.add({severity: 'error', summary: 'Erro', detail: 'Celular precisa ter 11 dígitos.'});
      errorFound = true;
    }

    if (this.customer.whatsapp && this.customer.whatsapp.length !== 11) {
      this.messageService.add({severity: 'error', summary: 'Erro', detail: 'WhatsApp precisa ter 11 dígitos.'});
      errorFound = true;
    }

    if (errorFound) { return false; };

    this.customerService.update(this.customer).subscribe(
      (response) => this.messageService.add({severity: 'success', summary: 'Sucesso', detail: 'Cliente atualizado'}),
      (errorRseponse) => this.messageService.add({severity: 'error', summary: 'Erro', detail: errorRseponse.error.errors.cellphone[0]})
    );
  }

  createOrUpdate() {
    if (this.customer.id) {
      this.update();
    } else {
      this.create();
    }

    this.router.navigate(['/customers']);
  }

  public goBack() {
    this.location.back();
  }

  private setCustomer(customer: Customer): void {
    this.customer = customer;
    this.form.patchValue(customer);
  }

  private applyFormValues() {
    if (this.form.get('name').value) { this.customer.name = this.form.get('name').value; }
    if (this.form.get('email').value) { this.customer.email = this.form.get('email').value; }
    if (this.form.get('registration').value) { this.customer.registration = this.form.get('registration').value; }
    if (this.form.get('cpf').value) { this.customer.cpf = cpf.strip(this.form.get('cpf').value).match(/\d+/g).join([]); }
    if (this.form.get('landline').value) { this.customer.landline = this.form.get('landline').value.match(/\d+/g).join([]); }
    if (this.form.get('cellphone').value) { this.customer.cellphone = this.form.get('cellphone').value.match(/\d+/g).join([]); }
    if (this.form.get('whatsapp').value) { this.customer.whatsapp = this.form.get('whatsapp').value.match(/\d+/g).join([]); }
    if (this.form.get('simple_address').value) { this.customer.simple_address = this.form.get('simple_address').value; }
    if (this.form.get('public_office_id').value) { this.customer.public_office_id = this.form.get('public_office_id').value; }
    if (this.form.get('public_agency_id').value) { this.customer.public_agency_id = this.form.get('public_agency_id').value; }
  }
}
