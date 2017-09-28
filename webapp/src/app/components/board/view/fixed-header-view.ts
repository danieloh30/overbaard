/**
 * Abstract base class for a board containing a fixed header.
 */
import {BoardState} from '../../../common/board/board.reducer';
import {Input} from '@angular/core';
import {List} from 'immutable';
import {HeaderState} from '../../../common/board/header/header.model';
import {BoardIssue} from '../../../common/board/issue/issue.model';

export class FixedHeaderView {

  @Input()
  boardState: BoardState;

  @Input()
  windowHeight: number;

  @Input()
  windowWidth: number;

  @Input()
  boardLeftOffset: number;

  get headers(): HeaderState {
    return this.boardState.headers;
  }

  get issueTable(): List<List<BoardIssue>> {
    return this.boardState.issueTable.table;
  }

  scrollTableBodyX($event: Event) {
    this.boardLeftOffset = event.target['scrollLeft'] * -1
  }
}
