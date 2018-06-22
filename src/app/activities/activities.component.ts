import { Component, OnInit } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { MessageService } from 'primeng/components/common/messageservice';
import { ActivatedRoute , Router} from '@angular/router';
import { ActivityService } from './shared/activity.service';
import { Activity } from './shared/activity';
import { AuthService } from '../shared/auth.service';

@Component({
  selector: 'app-activities',
  templateUrl: './activities.component.html',
  styleUrls: ['./activities.component.css']
})
export class ActivitiesComponent implements OnInit {
  userActivities: Array<Activity>;
  columns: any[];
  pageSizes = [10, 20, 50];
  paginator = {
    pageNumber: 0,
    perPage: this.pageSizes[0],
    offset: 0
  };
  totalCount = 0;

  activityStatusDictionary = {
    'not_started' : 'Não iniciada',
    'in_progress' : 'Em progresso',
    'finished' : 'Finalizada',
    'closed' : 'Fechada'
  };

  activityTypesDictionary = {
    'attendance' : 'Atendimento',
    'offer' : 'Proposta',
  };

  constructor(
    private activityService: ActivityService,
    public authService: AuthService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {
    this.columns = [
      { field: 'name', header: 'Nome' },
      { field: 'annotations', header: 'Anotaçoes' },
      { field: 'activity_type', header: 'Tipo' },
      { field: 'status', header: 'Status' }
    ];
  }

  ngOnInit() {
    this.listUserActivitiesPaginated();
  }

  listUserActivitiesPaginated() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    this.activityService.listUserActivitiesPaginated(currentUser['id'], this.paginator.pageNumber, this.paginator.perPage).subscribe(
      successResponse => {
        this.userActivities = successResponse['data'];
        this.totalCount = successResponse['total_count'];
      },
      errorResponse => {
        console.error('Ocorreu um erro ao tentar buscar as atividades deste usuário:' + errorResponse);
      }
    );
  }

  loadDataOnChange(event) {
    this.paginator.offset = event.first;
    this.paginator.perPage = event.rows;
    this.paginator.pageNumber = Math.ceil(this.paginator.offset / this.paginator.perPage) + 1;

    this.listUserActivitiesPaginated();
  }
}
