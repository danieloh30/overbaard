import {BoardIssue} from '../../model/board/data/issue/board-issue';
import {FontSizeTableService} from '../../services/font-size-table.service';
import {IssueSummaryLevel} from '../../model/board/user/issue-summary-level';
import {Dictionary} from '../../common/dictionary';
import {IssueDetailState} from '../../model/board/user/issue-detail/issue-detail.model';
import {UserSettingState} from '../../model/board/user/user-setting';
import {List} from 'immutable';

export const ISSUE_SUMMARY_NAME = 'issue-summary';
export const EXTRA_ITEM = 'extra-item';

export class IssueHeightCalculator {

  private static readonly ISSUE_SUMMARY_WIDTH = 186;
  private static readonly AVATAR_WIDTH = 32;
  private static readonly ISSUE_SUMMARY_AVATAR_LINES = 2;
  private static readonly ISSUE_SUMMARY_LINE_HEIGHT = 20;

  private static readonly LINKED_ISSUE_HEIGHT = 19;
  private static readonly PARALLEL_TASK_HEIGHT = 19;

  private _issueDetail: IssueDetailState;
  private _summaryCalcConfig: SummaryCalulationConfig;

  constructor(private _boardIssue: BoardIssue, private _fontSizeTable: FontSizeTableService, userSettingState: UserSettingState) {
    this._issueDetail = userSettingState.issueDetail;
    this._summaryCalcConfig = SummaryCalculationConfig(this._issueDetail.issueSummaryLevel);
  }

  calculateHeight(): number {
    let issueHeight =
      3 + 3 +       // card top and bottom padding
      10 +          // card bottom margin
      24 +          // card title height
      4;            // Height of div containing colours for project, issue type and priority

    issueHeight += this.calculateSummaryHeight();
    issueHeight += this.calculateLinkedIssueLines() * IssueHeightCalculator.LINKED_ISSUE_HEIGHT;
    issueHeight += this.calculateParallelTaskLines() * IssueHeightCalculator.PARALLEL_TASK_HEIGHT;
    return issueHeight;
  }

  private calculateSummaryHeight(): number {
    if (this._issueDetail.issueSummaryLevel === IssueSummaryLevel.HEADER_ONLY) {
      // HEADER_ONLY has zero lines
      return 0;
    }
    let lines = this.calculateSummaryLines()
    if (lines < this._summaryCalcConfig.minLines) {
      lines = this._summaryCalcConfig.minLines;
    }
    return lines * IssueHeightCalculator.ISSUE_SUMMARY_LINE_HEIGHT;
  }

  private calculateSummaryLines(): number {
    const sizeLookup: Dictionary<number> = this._fontSizeTable.getTable(ISSUE_SUMMARY_NAME);
    const splitter: WordAndWidthSplitter = this.splitWordsAndGetSizes(sizeLookup);

    const lineFitter: LineFitter = this.fitWordsToLines(sizeLookup, splitter.words, splitter.wordWidths);
    return lineFitter.lines;
  }

  private splitWordsAndGetSizes(sizeLookup: Dictionary<number>): WordAndWidthSplitter {
    return WordAndWidthSplitter.create(
        this._boardIssue.summary,
        (character => {
          const width: number = sizeLookup[character];
          if (!width) {
            // TODO record characters not in the lookup table
          }
          return width;

        }));
  }

  private fitWordsToLines(sizeLookup: Dictionary<number>, words: string[], wordWidths: number[]): LineFitter {
    return LineFitter.create(
      this._boardIssue.summary, words, wordWidths, this._summaryCalcConfig.maxLines,
      character => sizeLookup[character],
      line => {
        if (this._summaryCalcConfig.trimFirstTwoLines && line < IssueHeightCalculator.ISSUE_SUMMARY_AVATAR_LINES) {
          return IssueHeightCalculator.ISSUE_SUMMARY_WIDTH - IssueHeightCalculator.AVATAR_WIDTH;
        }
        return IssueHeightCalculator.ISSUE_SUMMARY_WIDTH;
      }
    );
  }

  private calculateParallelTaskLines(): number {
    const extraWidth = 3; // 3px right margin
    return this.calculateExtraInfoLines(
      this._issueDetail.parallelTasks, extraWidth, this._boardIssue.parallelTasks, pt => pt.display);
  }


  private calculateLinkedIssueLines(): number {
    const extraWidth = 5; // 5px right margin
    return this.calculateExtraInfoLines(
      this._issueDetail.linkedIssues, extraWidth, this._boardIssue.linkedIssues, li => li.key);
  }

  private calculateExtraInfoLines<T>(detailSetting: boolean, extraWidth: number,
                                     list: List<T>, textGetter: (t: T) => string): number {

    if (!detailSetting || !list || list.size === 0) {
      return 0;
    }

    const lookup: Dictionary<number> = this._fontSizeTable.getTable(EXTRA_ITEM);
    let lines = 1;
    let currentWidth = 0;
    list.forEach(infoItem => {
      const word: string = textGetter(infoItem);
      let wordSize = 0;
      for (let ci = 0 ; ci < word.length ; ci++) {
        wordSize += lookup[word.charAt(ci)];
      }
      wordSize += extraWidth;
      if (currentWidth + wordSize > IssueHeightCalculator.ISSUE_SUMMARY_WIDTH) {
        lines++;
        currentWidth = 0;
      }
      currentWidth += wordSize;
    });
    return lines;
  }
}

export class LineFitter {
  private _spaceWidth: number;

  private _lines: number;

  private _updatedSummary = false;

  private constructor(
    private _summary: string,
    private _words: string[],
    private _wordWidths: number[],
    private _maxLines: number,
    private _charWidthLookup: (character: string) => number,
    private _getLineWidth: (line: number) => number) {
    this._spaceWidth = _charWidthLookup(' ');
  }

  /* tslint:disable:member-ordering */
  static create(
    summary: string,
    words: string[],
    wordWidths: number[],
    maxLines: number,
    charWidthLookup: (character: string) => number,
    getLineWidth: (line: number) => number): LineFitter {
    const fitter: LineFitter = new LineFitter(summary, words, wordWidths, maxLines, charWidthLookup, getLineWidth);
    fitter.countLines();
    return fitter;
  }

  private countLines(): void {
    let currentLine = 0;
    let currentLineMaxWidth = this._getLineWidth(currentLine);
    let currentLineIndex = 0;

    for (let wi = 0 ; wi < this._words.length ; wi++) {
      let test = currentLineIndex;
      const nextWordWidth = this._wordWidths[wi];
      if (currentLineIndex > 0) {
        test += this._spaceWidth;
      }

      test += nextWordWidth;
      if (test <= currentLineMaxWidth) {
        // It fits, continue with everything
        currentLineIndex = test;
        continue;
      }

      // TODO some corner cases if it is say a long word on line 2, which would fit on line 3
      if (nextWordWidth <= this._getLineWidth(currentLine + 1)) {
        // The word fits on the next line
        currentLine++;
        currentLineMaxWidth = this._getLineWidth(currentLine);
        currentLineIndex = nextWordWidth;
      } else {
        // TODO work this out
/*
        // It is a long word spanning more than one line
        const word: string = this._words[wi];
        test = currentLineIndex + this._spaceWidth;
        for (let ci = 0 ; ci < word.length ; ci++) {
        }
*/
      }
    }
    this._lines = currentLine + 1;
  }

  get lines(): number {
    return this._lines;
  }
}

/**
 * Breaks a string into its individual words, and calculates the sizes of each word from
 * a font size lookup table.
 */
export class WordAndWidthSplitter {
  private _words: string[] = [];
  private _wordWidths: number[] = [];
  private constructor(private _summary: string, private _lookup: (character: string) => number) {
  }

  /* tslint:disable:member-ordering */
  static create(summary: string, lookup: (character: string) => number): WordAndWidthSplitter {
    const splitter: WordAndWidthSplitter = new WordAndWidthSplitter(summary, lookup);
    splitter.createWordList();
    return splitter;
  }

  private createWordList() {
    let wordStart = -1;
    let currentWordWidth = 0;
    for (let i = 0 ; i < this._summary.length ; i++) {
      const curr: string = this._summary.charAt(i);
      if (curr !== ' ') {
        currentWordWidth += this._lookup(curr);
        if (wordStart === -1) {
          wordStart = i;
        }
      } else {
        if (wordStart !== -1) {
          this._words.push(this._summary.slice(wordStart, i));
          this._wordWidths.push(currentWordWidth);
          wordStart = -1;
          currentWordWidth = 0;
        }
      }
    }
    if (wordStart !== -1) {
      const last: number = this._summary.length;
      this._words.push(this._summary.slice(wordStart, last));
      this._wordWidths.push(currentWordWidth);
    }
  }

  get words(): string[] {
    return this._words;
  }

  get wordWidths(): number[] {
    return this._wordWidths;
  }
}

interface SummaryCalulationConfig {
  maxLines: number;
  minLines: number;
  trimFirstTwoLines: boolean;
}

function SummaryCalculationConfig(summaryLevel: IssueSummaryLevel): SummaryCalulationConfig {
  switch (summaryLevel) {
    case IssueSummaryLevel.SHORT_SUMMARY_NO_AVATAR:
      return {maxLines: 2, minLines: 1, trimFirstTwoLines: false};
    case IssueSummaryLevel.SHORT_SUMMARY:
      return {maxLines: 2, minLines: 2, trimFirstTwoLines: true};
    case IssueSummaryLevel.FULL:
      return {maxLines: 0, minLines: 2, trimFirstTwoLines: true};
  }
}