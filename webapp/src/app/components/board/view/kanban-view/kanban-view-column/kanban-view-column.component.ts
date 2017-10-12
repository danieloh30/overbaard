import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {BoardIssue} from '../../../../../model/board/data/issue/board-issue';
import {List, Map} from 'immutable';

/* tslint:disable:component-selector */
@Component({
  selector: '[app-kanban-view-column]',
  templateUrl: './kanban-view-column.component.html',
  styleUrls: ['./kanban-view-column.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class KanbanViewColumnComponent implements OnInit {

  @Input()
  issues: Map<string, BoardIssue>;
  @Input()
  issueKeys: List<string>;

  constructor() { }

  ngOnInit() {
  }
}
