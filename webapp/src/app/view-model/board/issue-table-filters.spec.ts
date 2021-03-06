import {BoardStateInitializer, BoardViewObservableUtil} from './board-view.common.spec';
import {Dictionary} from '../../common/dictionary';
import {IssueSummaryLevel} from '../../model/board/user/issue-summary-level';
import {BoardChecker, NumberedHeaderStateFactory, SimpleIssueFactory} from './issue-table.util.spec';

/**
 * Contains tests for the issue table filters and search filters. General issue table tests should go in issue-table.spec.ts
 */


describe('Issue table filter tests', () => {
  describe('Filters', () => {

    let standardTable: string[][];
    let standardRank: string[];
    beforeEach(() => {
      standardTable = [['ONE-1', 'ONE-2'], ['ONE-3', 'ONE-4', 'ONE-5'], ['ONE-6', 'ONE-7', 'ONE-8', 'ONE-9']];
      standardRank = ['ONE-1', 'ONE-2', 'ONE-3', 'ONE-4', 'ONE-5', 'ONE-6', 'ONE-7', 'ONE-8', 'ONE-9'];
    });

    // We only test filtering on priority here - we have other tests doing in-depth testing of the filters

    describe('Update filter for existing table', () => {
      it('No rank', () => {
        doTest(false);
      });
      it('Rank', () => {
        doTest(true);
      });

      function doTest(rank: boolean) {
        const util: BoardViewObservableUtil = setupTable(rank ? {view: 'rv'} : null);
        util.easySubscribe(board => {
          const checker: BoardChecker = new BoardChecker(standardTable);
          checker.rankOrder(rank, ...standardRank);
          checker.checkBoard(board);
        });

        util.getUserSettingUpdater().updateFilters('priority', 'Blocker');
        util.easySubscribe(board => {
          const checker: BoardChecker = new BoardChecker(standardTable)
            .invisibleIssues('ONE-1', 'ONE-3', 'ONE-5', 'ONE-7', 'ONE-9');
          checker.rankOrder(rank, ...standardRank);
          checker.checkBoard(board);
          // The visible issue counts are checked automatically in checkTable(), but do a sanity test here
          expect(board.headers.headersList.map(h => h.visibleIssues).toArray()).toEqual([1, 1, 2]);
        });

        util.getUserSettingUpdater().updateFilters('priority', 'Major');
        util.easySubscribe(board => {
          const checker: BoardChecker = new BoardChecker(standardTable)
            .invisibleIssues('ONE-2', 'ONE-4', 'ONE-6', 'ONE-8');
          checker.rankOrder(rank, ...standardRank);
          checker.checkBoard(board);
          // The visible issue counts are checked automatically in checkTable(), but do a sanity test here
          expect(board.headers.headersList.map(h => h.visibleIssues).toArray()).toEqual([1, 2, 2]);
        });
      }
    });

    describe('Filter exists when creating table', () => {
      it('No rank', () => {
        doTest(false);
      });
      it('Rank', () => {
        doTest(true);
      });

      function doTest(rank: boolean) {
        const dict: Dictionary<string> = {priority: 'Major'};
        if (rank) {
          dict['view'] = 'rv';
        }
        const util: BoardViewObservableUtil = setupTable(dict);
        util.easySubscribe(board => {
          const checker: BoardChecker =
            new BoardChecker(standardTable)
              .invisibleIssues('ONE-2', 'ONE-4', 'ONE-6', 'ONE-8');
          checker.rankOrder(rank, ...standardRank);
          checker.checkBoard(board);
        });
      }
    });

    describe('Update table when filter exists ', () => {
      describe('New Issue', () => {
        describe('Matching filter', () => {
          it('No rank', () => {
            doTest(false);
          });
          it('Rank', () => {
            doTest(true);
          });

          function doTest(rank: boolean) {
            const dict: Dictionary<string> = {priority: 'Major'};
            if (rank) {
              dict['view'] = 'rv';
            }
            setupTable(dict)
              .getBoardStateUpdater()
              .issueChanges({new: [{key: 'ONE-10', state: '1-1', summary: 'Test', priority: 'Major', type: 'task'}]})
              .rankChanges({ONE: [{index: 9, key: 'ONE-10'}]})
              .emit()
              .easySubscribe(board => {
                standardTable[0].push('ONE-10');
                const checker: BoardChecker = new BoardChecker(standardTable)
                  .invisibleIssues('ONE-2', 'ONE-4', 'ONE-6', 'ONE-8');
                standardRank.push('ONE-10');
                checker.rankOrder(rank, ...standardRank);
                checker.checkBoard(board);
              });
          }
        });
        describe('Not matching filter', () => {
          it('No rank', () => {
            doTest(false);
          });
          it('Rank', () => {
            doTest(true);
          });

          function doTest(rank: boolean) {
            const dict: Dictionary<string> = {priority: 'Major'};
            if (rank) {
              dict['view'] = 'rv';
            }
            setupTable(dict)
              .getBoardStateUpdater()
              .issueChanges({new: [{key: 'ONE-10', state: '1-1', summary: 'Test', priority: 'Blocker', type: 'task'}]})
              .rankChanges({ONE: [{index: 9, key: 'ONE-10'}]})
              .emit()
              .easySubscribe(board => {
                standardTable[0].push('ONE-10');
                const checker: BoardChecker = new BoardChecker(standardTable)
                  .invisibleIssues('ONE-2', 'ONE-4', 'ONE-6', 'ONE-8', 'ONE-10');
                standardRank.push('ONE-10');
                checker.rankOrder(rank, ...standardRank);
                checker.checkBoard(board);
              });
          }
        });
        describe('Update Issue', () => {
          describe('Matching filter', () => {
            it('No rank', () => {
              doTest(false);
            });
            it('Rank', () => {
              doTest(true);
            });

            function doTest(rank: boolean) {
              const dict: Dictionary<string> = {priority: 'Major'};
              if (rank) {
                dict['view'] = 'rv';
              }
              setupTable(dict)
                .getBoardStateUpdater()
                .issueChanges({update: [{key: 'ONE-2', priority: 'Major'}]})
                .emit()
                .easySubscribe(board => {
                  const checker: BoardChecker = new BoardChecker(standardTable)
                    .invisibleIssues('ONE-4', 'ONE-6', 'ONE-8');
                  checker.rankOrder(rank, ...standardRank);
                  checker.checkBoard(board);
                });
            }
          });
          describe('Not matching filter', () => {
            it('No rank', () => {
              doTest(false);
            });
            it('Rank', () => {
              doTest(true);
            });

            function doTest(rank: boolean) {
              const dict: Dictionary<string> = {priority: 'Major'};
              if (rank) {
                dict['view'] = 'rv';
              }
              setupTable(dict)
                .getBoardStateUpdater()
                .issueChanges({update: [{key: 'ONE-1', priority: 'Blocker'}]})
                .emit()
                .easySubscribe(board => {
                  const checker: BoardChecker = new BoardChecker(standardTable)
                    .invisibleIssues('ONE-1', 'ONE-2', 'ONE-4', 'ONE-6', 'ONE-8');
                  checker.rankOrder(rank, ...standardRank);
                  checker.checkBoard(board);
                });
            }
          });
        });
      });
    });

    describe('Update issue details when filters exist', () => {
      it('No rank', () => {
        doTest(false);
      });
      it('Rank', () => {
        doTest(true);
      });

      function doTest(rank: boolean) {
        const dict: Dictionary<string> = {priority: 'Major'};
        if (rank) {
          dict['view'] = 'rv';
        }
        const util: BoardViewObservableUtil = setupTable(dict);
        util.easySubscribe(board => {
          const checker: BoardChecker =
            new BoardChecker(standardTable)
              .invisibleIssues('ONE-2', 'ONE-4', 'ONE-6', 'ONE-8');
          checker.rankOrder(rank, ...standardRank);
          checker.checkBoard(board);
        });

        // Now update the issue details and check that it is all the same
        util.getUserSettingUpdater().updateIssueSummaryLevel(IssueSummaryLevel.SHORT_SUMMARY_NO_AVATAR);
        util.easySubscribe(board => {
          const checker: BoardChecker =
            new BoardChecker(standardTable)
              .invisibleIssues('ONE-2', 'ONE-4', 'ONE-6', 'ONE-8')
              .issueDetailState({
                issueSummaryLevel: IssueSummaryLevel.SHORT_SUMMARY_NO_AVATAR,
                linkedIssues: true,
                parallelTasks: true,
                rankingOrder: false
              });
          checker.rankOrder(rank, ...standardRank);
          checker.checkBoard(board);
        });
      }
    });

    function setupTable(params?: Dictionary<string>): BoardViewObservableUtil {
      const init =
        new BoardStateInitializer()
          .headerStateFactory(new NumberedHeaderStateFactory(3))
          .setRank('ONE', 1, 2, 3, 4, 5, 6, 7, 8, 9)
          .mapState('ONE', 'S-1', '1-1')
          .mapState('ONE', 'S-2', '1-2')
          .mapState('ONE', 'S-3', '1-3')
          .issuesFactory(
            new SimpleIssueFactory()
              .addIssue('ONE-1', 0)
              .addIssue('ONE-2', 0)
              .addIssue('ONE-3', 1)
              .addIssue('ONE-4', 1)
              .addIssue('ONE-5', 1)
              .addIssue('ONE-6', 2)
              .addIssue('ONE-7', 2)
              .addIssue('ONE-8', 2)
              .addIssue('ONE-9', 2),
          );
      const util: BoardViewObservableUtil = new BoardViewObservableUtil(params)
        .updateBoardState(init);

      return util;
    }
  });

  describe ('Search filters', () => {

    let standardTable: string[][];
    let standardRank: string[];
    beforeEach(() => {
      standardTable = [['ONE-1', 'ONE-2'], ['ONE-3', 'ONE-4'], ['ONE-5', 'ONE-6']];
      standardRank = ['ONE-1', 'ONE-2', 'ONE-3', 'ONE-4', 'ONE-5', 'ONE-6'];
    });

    describe('Not hidden', () => {
      describe('Issue IDs', () => {
        it ('No rank', () => {
          doTest(false);
        });

        it ('Rank', () => {
          doTest(true);
        });

        function doTest(rank: boolean) {
          const util: BoardViewObservableUtil = setupTable(rank ? {view: 'rv'} : null);
          util.easySubscribe(board => {
            const checker: BoardChecker = new BoardChecker(standardTable);
            checker.rankOrder(rank, ...standardRank);
            checker.checkBoard(board);

          });
          util.getUserSettingUpdater().updateSearchIssueIds('ONE-2');
          util.easySubscribe(board => {
            const checker: BoardChecker = new BoardChecker(standardTable);
            checker.rankOrder(rank, ...standardRank);
            checker
              .nonMatchingIssues('ONE-1', 'ONE-3', 'ONE-4', 'ONE-5', 'ONE-6')
              .checkBoard(board);
          });
          util.getUserSettingUpdater().updateSearchIssueIds('ONE-2', 'ONE-4');
          util.easySubscribe(board => {
            const checker: BoardChecker = new BoardChecker(standardTable);
            checker.rankOrder(rank, ...standardRank);
            checker
              .nonMatchingIssues('ONE-1', 'ONE-3', 'ONE-5', 'ONE-6')
              .checkBoard(board);
          });
          util.getUserSettingUpdater().updateSearchIssueIds('ONE-4');
          util.easySubscribe(board => {
            const checker: BoardChecker = new BoardChecker(standardTable);
            checker.rankOrder(rank, ...standardRank);
            checker
              .nonMatchingIssues('ONE-1', 'ONE-2', 'ONE-3', 'ONE-5', 'ONE-6')
              .checkBoard(board);
          });
          util.getUserSettingUpdater().updateSearchIssueIds();
          util.easySubscribe(board => {
            const checker: BoardChecker = new BoardChecker(standardTable);
            checker.rankOrder(rank, ...standardRank);
            checker
              .checkBoard(board);
          });
        }
      });

      describe('Containing text', () => {
        it ('No Rank', () => {
          doTest(false);
        });
        it ('Rank', () => {
          doTest(true);
        });

        function doTest(rank: boolean) {
          const util: BoardViewObservableUtil = setupTable(rank ? {view: 'rv'} : null);
          util.easySubscribe(board => {
            const checker: BoardChecker = new BoardChecker(standardTable);
            checker.rankOrder(rank, ...standardRank);
            checker
              .checkBoard(board);
          });
          util.getUserSettingUpdater().updateSearchContainingText('IssUe ##');
          util.easySubscribe(board => {
            const checker: BoardChecker = new BoardChecker(standardTable);
            checker.rankOrder(rank, ...standardRank);
            checker
              .checkBoard(board);
          });
          util.getUserSettingUpdater().updateSearchContainingText('##1');
          util.easySubscribe(board => {
            const checker: BoardChecker = new BoardChecker(standardTable);
            checker.rankOrder(rank, ...standardRank);
            checker
              .nonMatchingIssues('ONE-2', 'ONE-4', 'ONE-6')
              .checkBoard(board);
          });
          util.getUserSettingUpdater().updateSearchContainingText('##12');
          util.easySubscribe(board => {
            const checker: BoardChecker = new BoardChecker(standardTable);
            checker.rankOrder(rank, ...standardRank);
            checker
              .nonMatchingIssues('ONE-1', 'ONE-2', 'ONE-4', 'ONE-5', 'ONE-6')
              .checkBoard(board);
          });
          util.getUserSettingUpdater().updateSearchContainingText('##1');
          util.easySubscribe(board => {
            const checker: BoardChecker = new BoardChecker(standardTable);
            checker.rankOrder(rank, ...standardRank);
            checker
              .nonMatchingIssues('ONE-2', 'ONE-4', 'ONE-6')
              .checkBoard(board);
          });
          util.getUserSettingUpdater().updateSearchContainingText('##');
          util.easySubscribe(board => {
            const checker: BoardChecker = new BoardChecker(standardTable);
            checker.rankOrder(rank, ...standardRank);
            checker
              .checkBoard(board);
          });
          util.getUserSettingUpdater().updateSearchContainingText('##2');
          util.easySubscribe(board => {
            const checker: BoardChecker = new BoardChecker(standardTable);
            checker.rankOrder(rank, ...standardRank);
            checker
              .nonMatchingIssues('ONE-1', 'ONE-3', 'ONE-5')
              .checkBoard(board);
          });
        }
      });

      describe('Issue ids and text', () => {
        it ('No Rank', () => {
          doTest(false);
        });
        it ('Rank', () => {
          doTest(true);
        });

        function doTest(rank: boolean) {
          const util: BoardViewObservableUtil = setupTable(rank ? {view: 'rv'} : null);
          util.getUserSettingUpdater().updateSearchIssueIds('ONE-1', 'ONE-2', 'ONE-3');
          util.easySubscribe(board => {
            const checker: BoardChecker = new BoardChecker(standardTable);
            checker.rankOrder(rank, ...standardRank);
            checker
              .nonMatchingIssues('ONE-4', 'ONE-5', 'ONE-6')
              .checkBoard(board);

          });
          util.getUserSettingUpdater().updateSearchContainingText('##1');
          util.easySubscribe(board => {
            const checker: BoardChecker = new BoardChecker(standardTable);
            checker.rankOrder(rank, ...standardRank);
            checker
              .nonMatchingIssues('ONE-2', 'ONE-4', 'ONE-5', 'ONE-6')
              .checkBoard(board);
          });
          util.getUserSettingUpdater().updateSearchContainingText('##12');
          util.easySubscribe(board => {
            const checker: BoardChecker = new BoardChecker(standardTable);
            checker.rankOrder(rank, ...standardRank);
            checker
              .nonMatchingIssues('ONE-1', 'ONE-2', 'ONE-4', 'ONE-5', 'ONE-6')
              .checkBoard(board);
          });
          util.getUserSettingUpdater().updateSearchContainingText('##1');
          util.easySubscribe(board => {
            const checker: BoardChecker = new BoardChecker(standardTable);
            checker.rankOrder(rank, ...standardRank);
            checker
              .nonMatchingIssues('ONE-2', 'ONE-4', 'ONE-5', 'ONE-6')
              .checkBoard(board);
          });
          util.getUserSettingUpdater().updateSearchIssueIds('ONE-2');
          util.easySubscribe(board => {
            const checker: BoardChecker = new BoardChecker(standardTable);
            checker.rankOrder(rank, ...standardRank);
            checker
              .nonMatchingIssues('ONE-1', 'ONE-2', 'ONE-3', 'ONE-4', 'ONE-5', 'ONE-6')
              .checkBoard(board);
          });
          util.getUserSettingUpdater().updateSearchContainingText('##');
          util.easySubscribe(board => {
            const checker: BoardChecker = new BoardChecker(standardTable);
            checker.rankOrder(rank, ...standardRank);
            checker
              .nonMatchingIssues('ONE-1', 'ONE-3', 'ONE-4', 'ONE-5', 'ONE-6')
              .checkBoard(board);
          });
          util.getUserSettingUpdater().updateSearchIssueIds('ONE-2', 'ONE-6');
          util.easySubscribe(board => {
            const checker: BoardChecker = new BoardChecker(standardTable);
            checker.rankOrder(rank, ...standardRank);
            checker
              .nonMatchingIssues('ONE-1', 'ONE-3', 'ONE-4', 'ONE-5')
              .checkBoard(board);
          });
        }
      });

      describe('IssueQl', () => {
        it ('No Rank', () => {
          doTest(false);
        });
        it ('Rank', () => {
          doTest(true);
        });

        function doTest(rank: boolean) {
          const util: BoardViewObservableUtil = setupTable(rank ? {view: 'rv'} : null);
          util.easySubscribe(board => {
            const checker: BoardChecker = new BoardChecker(standardTable);
            checker.rankOrder(rank, ...standardRank);
            checker
              .checkBoard(board);
          });
          util.getUserSettingUpdater().updateSearchIssueQl('priority="Blocker"');
          util.easySubscribe(board => {
            const checker: BoardChecker = new BoardChecker(standardTable);
            checker.rankOrder(rank, ...standardRank);
            checker
              .nonMatchingIssues('ONE-1', 'ONE-3', 'ONE-5')
              .checkBoard(board);
          });
          util.getUserSettingUpdater().updateSearchIssueQl('assignee IS EMPTY');
          util.easySubscribe(board => {
            const checker: BoardChecker = new BoardChecker(standardTable);
            checker.rankOrder(rank, ...standardRank);
            checker
              .checkBoard(board);
          });
        }
      });
    });

    describe('Hidden', () => {
      describe('Issue IDs', () => {
        it ('No Rank', () => {
          doTest(false);
        });
        it ('Rank', () => {
          doTest(true);
        });

        function doTest(rank: boolean) {
          const util: BoardViewObservableUtil = setupTable(rank ? {view: 'rv'} : null);
          util.getUserSettingUpdater().updateSearchHideNonMatching(true);
          util.easySubscribe(board => {
            const checker: BoardChecker = new BoardChecker(standardTable);
            checker.rankOrder(rank, ...standardRank);
            checker
              .checkBoard(board);

          });
          util.getUserSettingUpdater().updateSearchIssueIds('ONE-2');
          util.easySubscribe(board => {
            const checker: BoardChecker = new BoardChecker(standardTable);
            checker.rankOrder(rank, ...standardRank);
            checker
              .invisibleIssues('ONE-1', 'ONE-3', 'ONE-4', 'ONE-5', 'ONE-6')
              .checkBoard(board);
          });
          util.getUserSettingUpdater().updateSearchIssueIds('ONE-2', 'ONE-4');
          util.easySubscribe(board => {
            const checker: BoardChecker = new BoardChecker(standardTable);
            checker.rankOrder(rank, ...standardRank);
            checker
              .invisibleIssues('ONE-1', 'ONE-3', 'ONE-5', 'ONE-6')
              .checkBoard(board);

          });
          util.getUserSettingUpdater().updateSearchIssueIds('ONE-4');
          util.easySubscribe(board => {
            const checker: BoardChecker = new BoardChecker(standardTable);
            checker.rankOrder(rank, ...standardRank);
            checker
              .invisibleIssues('ONE-1', 'ONE-2', 'ONE-3', 'ONE-5', 'ONE-6')
              .checkBoard(board);

          });
          util.getUserSettingUpdater().updateSearchIssueIds();
          util.easySubscribe(board => {
            const checker: BoardChecker = new BoardChecker(standardTable);
            checker.rankOrder(rank, ...standardRank);
            checker
              .checkBoard(board);
          });
        }
      });

      describe('Containing text', () => {
        it ('No Rank', () => {
          doTest(false);
        });
        it ('Rank', () => {
          doTest(true);
        });

        function doTest(rank: boolean) {
          const util: BoardViewObservableUtil = setupTable(rank ? {view: 'rv'} : null);
          util.getUserSettingUpdater().updateSearchHideNonMatching(true);
          util.easySubscribe(board => {
            const checker: BoardChecker = new BoardChecker(standardTable);
            checker.rankOrder(rank, ...standardRank);
            checker
              .checkBoard(board);
          });
          util.getUserSettingUpdater().updateSearchContainingText('IssUe ##');
          util.easySubscribe(board => {
            const checker: BoardChecker = new BoardChecker(standardTable);
            checker.rankOrder(rank, ...standardRank);
            checker
              .checkBoard(board);
          });
          util.getUserSettingUpdater().updateSearchContainingText('##1');
          util.easySubscribe(board => {
            const checker: BoardChecker = new BoardChecker(standardTable);
            checker.rankOrder(rank, ...standardRank);
            checker
              .invisibleIssues('ONE-2', 'ONE-4', 'ONE-6')
              .checkBoard(board);
          });
          util.getUserSettingUpdater().updateSearchContainingText('##12');
          util.easySubscribe(board => {
            const checker: BoardChecker = new BoardChecker(standardTable);
            checker.rankOrder(rank, ...standardRank);
            checker
              .invisibleIssues('ONE-1', 'ONE-2', 'ONE-4', 'ONE-5', 'ONE-6')
              .checkBoard(board);
          });
          util.getUserSettingUpdater().updateSearchContainingText('##1');
          util.easySubscribe(board => {
            const checker: BoardChecker = new BoardChecker(standardTable);
            checker.rankOrder(rank, ...standardRank);
            checker
              .invisibleIssues('ONE-2', 'ONE-4', 'ONE-6')
              .checkBoard(board);
          });
          util.getUserSettingUpdater().updateSearchContainingText('##');
          util.easySubscribe(board => {
            const checker: BoardChecker = new BoardChecker(standardTable);
            checker.rankOrder(rank, ...standardRank);
            checker
              .checkBoard(board);
          });
          util.getUserSettingUpdater().updateSearchContainingText('##2');
          util.easySubscribe(board => {
            const checker: BoardChecker = new BoardChecker(standardTable);
            checker.rankOrder(rank, ...standardRank);
            checker
              .invisibleIssues('ONE-1', 'ONE-3', 'ONE-5')
              .checkBoard(board);
          });
        }
      });

      describe('Issue ids and text', () => {
        it ('No Rank', () => {
          doTest(false);
        });
        it ('Rank', () => {
          doTest(true);
        });

        function doTest(rank: boolean) {
          const util: BoardViewObservableUtil = setupTable(rank ? {view: 'rv'} : null);
          util.getUserSettingUpdater().updateSearchHideNonMatching(true);
          util.getUserSettingUpdater().updateSearchIssueIds('ONE-1', 'ONE-2', 'ONE-3');
          util.easySubscribe(board => {
            const checker: BoardChecker = new BoardChecker(standardTable);
            checker.rankOrder(rank, ...standardRank);
            checker
              .invisibleIssues('ONE-4', 'ONE-5', 'ONE-6')
              .checkBoard(board);
          });
          util.getUserSettingUpdater().updateSearchContainingText('##1');
          util.easySubscribe(board => {
            const checker: BoardChecker = new BoardChecker(standardTable);
            checker.rankOrder(rank, ...standardRank);
            checker
              .invisibleIssues('ONE-2', 'ONE-4', 'ONE-5', 'ONE-6')
              .checkBoard(board);
          });
          util.getUserSettingUpdater().updateSearchContainingText('##12');
          util.easySubscribe(board => {
            const checker: BoardChecker = new BoardChecker(standardTable);
            checker.rankOrder(rank, ...standardRank);
            checker
              .invisibleIssues('ONE-1', 'ONE-2', 'ONE-4', 'ONE-5', 'ONE-6')
              .checkBoard(board);
          });
          util.getUserSettingUpdater().updateSearchContainingText('##1');
          util.easySubscribe(board => {
            const checker: BoardChecker = new BoardChecker(standardTable);
            checker.rankOrder(rank, ...standardRank);
            checker
              .invisibleIssues('ONE-2', 'ONE-4', 'ONE-5', 'ONE-6')
              .checkBoard(board);
          });
          util.getUserSettingUpdater().updateSearchIssueIds('ONE-2');
          util.easySubscribe(board => {
            const checker: BoardChecker = new BoardChecker(standardTable);
            checker.rankOrder(rank, ...standardRank);
            checker
              .invisibleIssues('ONE-1', 'ONE-2', 'ONE-3', 'ONE-4', 'ONE-5', 'ONE-6')
              .checkBoard(board);
          });
          util.getUserSettingUpdater().updateSearchContainingText('##');
          util.easySubscribe(board => {
            const checker: BoardChecker = new BoardChecker(standardTable);
            checker.rankOrder(rank, ...standardRank);
            checker
              .invisibleIssues('ONE-1', 'ONE-3', 'ONE-4', 'ONE-5', 'ONE-6')
              .checkBoard(board);
          });
          util.getUserSettingUpdater().updateSearchIssueIds('ONE-2', 'ONE-6');
          util.easySubscribe(board => {
            const checker: BoardChecker = new BoardChecker(standardTable);
            checker.rankOrder(rank, ...standardRank);
            checker
              .invisibleIssues('ONE-1', 'ONE-3', 'ONE-4', 'ONE-5')
              .checkBoard(board);
          });
        }
      });

      describe('IssueQl', () => {
        it ('No Rank', () => {
          doTest(false);
        });
        it ('Rank', () => {
          doTest(true);
        });

        function doTest(rank: boolean) {
          const util: BoardViewObservableUtil = setupTable(rank ? {view: 'rv'} : null);
          util.getUserSettingUpdater().updateSearchHideNonMatching(true);
          util.easySubscribe(board => {
            const checker: BoardChecker = new BoardChecker(standardTable);
            checker.rankOrder(rank, ...standardRank);
            checker
              .checkBoard(board);
          });
          util.getUserSettingUpdater().updateSearchIssueQl('priority="Blocker"');
          util.easySubscribe(board => {
            const checker: BoardChecker = new BoardChecker(standardTable);
            checker.rankOrder(rank, ...standardRank);
            checker
              .invisibleIssues('ONE-1', 'ONE-3', 'ONE-5')
              .checkBoard(board);
          });
          util.getUserSettingUpdater().updateSearchIssueQl('assignee IS EMPTY');
          util.easySubscribe(board => {
            const checker: BoardChecker = new BoardChecker(standardTable);
            checker.rankOrder(rank, ...standardRank);
            checker
              .checkBoard(board);
          });
        }
      });
    });

    describe('Flick hidden/not hidden', () => {
      it ('No Rank', () => {
        doTest(false);
      });
      it ('Rank', () => {
        doTest(true);
      });

      function doTest(rank: boolean) {
        const util: BoardViewObservableUtil = setupTable(rank ? {view: 'rv'} : null);

        util.getUserSettingUpdater().updateSearchIssueIds('ONE-1', 'ONE-2', 'ONE-3');
        check(false, 'ONE-4', 'ONE-5', 'ONE-6');
        util.getUserSettingUpdater().updateSearchHideNonMatching(true);
        check(true, 'ONE-4', 'ONE-5', 'ONE-6');

        util.getUserSettingUpdater().updateSearchContainingText('##1');
        check(true, 'ONE-2', 'ONE-4', 'ONE-5', 'ONE-6');
        util.getUserSettingUpdater().updateSearchHideNonMatching(false);
        check(false, 'ONE-2', 'ONE-4', 'ONE-5', 'ONE-6');

        util.getUserSettingUpdater().updateSearchContainingText('##12');
        check(false, 'ONE-1', 'ONE-2', 'ONE-4', 'ONE-5', 'ONE-6');
        util.getUserSettingUpdater().updateSearchHideNonMatching(true);
        check(true, 'ONE-1', 'ONE-2', 'ONE-4', 'ONE-5', 'ONE-6');

        util.getUserSettingUpdater().updateSearchContainingText('##1');
        check(true, 'ONE-2', 'ONE-4', 'ONE-5', 'ONE-6');
        util.getUserSettingUpdater().updateSearchHideNonMatching(false);
        check(false, 'ONE-2', 'ONE-4', 'ONE-5', 'ONE-6');

        util.getUserSettingUpdater().updateSearchIssueIds('ONE-2');
        check(false, 'ONE-1', 'ONE-2', 'ONE-3', 'ONE-4', 'ONE-5', 'ONE-6');
        util.getUserSettingUpdater().updateSearchHideNonMatching(true);
        check(true, 'ONE-1', 'ONE-2', 'ONE-3', 'ONE-4', 'ONE-5', 'ONE-6');

        util.getUserSettingUpdater().updateSearchContainingText('##');
        check(true, 'ONE-1', 'ONE-3', 'ONE-4', 'ONE-5', 'ONE-6');
        util.getUserSettingUpdater().updateSearchHideNonMatching(false);
        check(false, 'ONE-1', 'ONE-3', 'ONE-4', 'ONE-5', 'ONE-6');

        util.getUserSettingUpdater().updateSearchIssueIds('ONE-1', 'ONE-2', 'ONE-3', 'ONE-4');
        check(false, 'ONE-5', 'ONE-6');
        util.getUserSettingUpdater().updateSearchHideNonMatching(true);
        check(true, 'ONE-5', 'ONE-6');

        util.getUserSettingUpdater().updateSearchIssueQl('priority="Major"');
        check(true, 'ONE-2', 'ONE-4', 'ONE-5', 'ONE-6');
        util.getUserSettingUpdater().updateSearchHideNonMatching(false);
        check(false, 'ONE-2', 'ONE-4', 'ONE-5', 'ONE-6');

        function check(hidden: boolean, ...hiddenIds: string[]) {
          util.easySubscribe(board => {
            const checker: BoardChecker = new BoardChecker(standardTable);
            checker.rankOrder(rank, ...standardRank);
            if (hidden) {
              checker
                .invisibleIssues(...hiddenIds);
            } else {
              checker.nonMatchingIssues(...hiddenIds);
            }
            checker.checkBoard(board);
          });
        }
      }
    });

    function setupTable(params?: Dictionary<string>): BoardViewObservableUtil {
      const init =
        new BoardStateInitializer()
          .headerStateFactory(new NumberedHeaderStateFactory(3))
          .setRank('ONE', 1, 2, 3, 4, 5, 6)
          .mapState('ONE', 'S-1', '1-1')
          .mapState('ONE', 'S-2', '1-2')
          .mapState('ONE', 'S-3', '1-3')
          .issuesFactory(
            new SimpleIssueFactory()
            // Numbering is <row><column>
              .addIssue('ONE-1', 0, {summary: 'Issue ##11'})
              .addIssue('ONE-2', 0, {summary: 'Issue ##21'})
              .addIssue('ONE-3', 1, {summary: 'Issue ##12'})
              .addIssue('ONE-4', 1, {summary: 'Issue ##22'})
              .addIssue('ONE-5', 2, {summary: 'Issue ##13'})
              .addIssue('ONE-6', 2, {summary: 'Issue ##23'})
          );
      const util: BoardViewObservableUtil = new BoardViewObservableUtil(params)
        .updateBoardState(init);

      return util;
    }
  });

  describe('Combined Filters and Search Filters', () => {

    let standardTable: string[][];
    let standardRank: string[];
    beforeEach(() => {
      standardTable = [['ONE-1', 'ONE-2'], ['ONE-3', 'ONE-4'], ['ONE-5', 'ONE-6']];
      standardRank = ['ONE-1', 'ONE-2', 'ONE-3', 'ONE-4', 'ONE-5', 'ONE-6'];
    });

    describe('No existing filters', () => {
      describe('No Hide', () => {
        it ('No Rank', () => {
          doTest(false);
        });
        it ('Rank', () => {
          doTest(true);
        });
        function doTest(rank: boolean) {
          const util: BoardViewObservableUtil = setupTable(rank ? {view: 'rv'} : null);
          util.easySubscribe(board => {
            new BoardChecker(standardTable)
              .rankOrder(rank, ...standardRank)
              .checkBoard(board);
          });

          util.getUserSettingUpdater().updateFilters('priority', 'Blocker');
          util.easySubscribe(board => {
            new BoardChecker(standardTable)
              .invisibleIssues('ONE-1', 'ONE-3', 'ONE-5')
              .rankOrder(rank, ...standardRank)
              .checkBoard(board);
          });

          util.getUserSettingUpdater().updateSearchContainingText('##1');
          util.easySubscribe(board => {
            new BoardChecker(standardTable)
              .rankOrder(rank, ...standardRank)
              .invisibleIssues('ONE-1', 'ONE-3', 'ONE-5')
              .nonMatchingIssues('ONE-4', 'ONE-6') // ONE-5 doesn't match the search, but is filtered out by the filter
              .checkBoard(board);
          });

          util.getUserSettingUpdater().updateSearchContainingText('');
          util.easySubscribe(board => {
            new BoardChecker(standardTable)
              .rankOrder(rank, ...standardRank)
              .invisibleIssues('ONE-1', 'ONE-3', 'ONE-5')
              .checkBoard(board);
          });

          util.getUserSettingUpdater().updateSearchContainingText('##1');
          util.easySubscribe(board => {
            new BoardChecker(standardTable)
              .rankOrder(rank, ...standardRank)
              .invisibleIssues('ONE-1', 'ONE-3', 'ONE-5')
              .nonMatchingIssues('ONE-4', 'ONE-6') // ONE-5 doesn't match the search, but is filtered out by the filter
              .checkBoard(board);
          });

          util.getUserSettingUpdater().updateFilters('priority');
          util.easySubscribe(board => {
            new BoardChecker(standardTable)
              .rankOrder(rank, ...standardRank)
              .nonMatchingIssues('ONE-4', 'ONE-5', 'ONE-6')
              .checkBoard(board);
          });

          util.getUserSettingUpdater().updateSearchContainingText('');
          util.easySubscribe(board => {
            new BoardChecker(standardTable)
              .rankOrder(rank, ...standardRank)
              .checkBoard(board);
          });

          util.getUserSettingUpdater().updateSearchContainingText('##2');
          util.easySubscribe(board => {
            new BoardChecker(standardTable)
              .rankOrder(rank, ...standardRank)
              .nonMatchingIssues('ONE-1', 'ONE-2', 'ONE-3')
              .checkBoard(board);
          });

          util.getUserSettingUpdater().updateFilters('priority', 'Major');
          util.easySubscribe(board => {
            new BoardChecker(standardTable)
              .invisibleIssues('ONE-2', 'ONE-4', 'ONE-6')
              .nonMatchingIssues('ONE-1', 'ONE-3') // ONE-2 doesn't match the search, but is filtered out by the filter
              .rankOrder(rank, ...standardRank)
              .checkBoard(board);
          });
        }
      });

      describe('With Hide', () => {
          it ('No Rank', () => {
            doTest(false);
          });
          it ('Rank', () => {
            doTest(true);
          });
          function doTest(rank: boolean) {
            const util: BoardViewObservableUtil = setupTable(rank ? {view: 'rv'} : null);
            util.easySubscribe(board => {
              new BoardChecker(standardTable)
                .rankOrder(rank, ...standardRank)
                .checkBoard(board);
            });

            util.getUserSettingUpdater().updateFilters('priority', 'Blocker');
            util.easySubscribe(board => {
              new BoardChecker(standardTable)
                .invisibleIssues('ONE-1', 'ONE-3', 'ONE-5')
                .rankOrder(rank, ...standardRank)
                .checkBoard(board);
            });

            util.getUserSettingUpdater().updateSearchContainingText('##1');
            util.easySubscribe(board => {
              new BoardChecker(standardTable)
                .rankOrder(rank, ...standardRank)
                .invisibleIssues('ONE-1', 'ONE-3', 'ONE-5')
                .nonMatchingIssues('ONE-4', 'ONE-6') // ONE-5 doesn't match the search, but is filtered out by the filter
                .checkBoard(board);
            });

            // Hide here, not right away so it has been 'running' a bit before ending up here (it made sense at the time :) )
            util.getUserSettingUpdater().updateSearchHideNonMatching(true);
            util.easySubscribe(board => {
              new BoardChecker(standardTable)
                .rankOrder(rank, ...standardRank)
                .invisibleIssues('ONE-1', 'ONE-3', 'ONE-4', 'ONE-5', 'ONE-6')
                .checkBoard(board);
            });

            util.getUserSettingUpdater().updateSearchContainingText('');
            util.easySubscribe(board => {
              new BoardChecker(standardTable)
                .rankOrder(rank, ...standardRank)
                .invisibleIssues('ONE-1', 'ONE-3', 'ONE-5')
                .checkBoard(board);
            });

            util.getUserSettingUpdater().updateSearchContainingText('##1');
            util.easySubscribe(board => {
              new BoardChecker(standardTable)
                .rankOrder(rank, ...standardRank)
                .invisibleIssues('ONE-1', 'ONE-3', 'ONE-4', 'ONE-5', 'ONE-6')
                .checkBoard(board);
            });

            util.getUserSettingUpdater().updateFilters('priority');
            util.easySubscribe(board => {
              new BoardChecker(standardTable)
                .rankOrder(rank, ...standardRank)
                .invisibleIssues('ONE-4', 'ONE-5', 'ONE-6')
                .checkBoard(board);
            });

            util.getUserSettingUpdater().updateSearchContainingText('');
            util.easySubscribe(board => {
              new BoardChecker(standardTable)
                .rankOrder(rank, ...standardRank)
                .checkBoard(board);
            });

            util.getUserSettingUpdater().updateSearchContainingText('##2');
            util.easySubscribe(board => {
              new BoardChecker(standardTable)
                .rankOrder(rank, ...standardRank)
                .invisibleIssues('ONE-1', 'ONE-2', 'ONE-3')
                .checkBoard(board);
            });

            util.getUserSettingUpdater().updateFilters('priority', 'Major');
            util.easySubscribe(board => {
              new BoardChecker(standardTable)
                .invisibleIssues('ONE-1', 'ONE-2', 'ONE-3', 'ONE-4', 'ONE-6')
                .rankOrder(rank, ...standardRank)
                .checkBoard(board);
            });
          }
        });
    });

    describe('Existing filters', () => {
      describe('No Hide', () => {
        describe('Update search and filter', () => {
          it ('No Rank', () => {
            doTest(false);
          });
          it ('Rank', () => {
            doTest(true);
          });
          function doTest(rank: boolean) {
            const dict: Dictionary<string> = {priority: 'Major', 's.text': '##2'};
            if (rank) {
              dict['view'] = 'rv';
            }

            const util: BoardViewObservableUtil = setupTable(dict);
            util.easySubscribe(board => {
              new BoardChecker(standardTable)
                .rankOrder(rank, ...standardRank)
                .invisibleIssues('ONE-2', 'ONE-4', 'ONE-6')
                .nonMatchingIssues('ONE-1', 'ONE-3') // ONE-2 doesn't match the search, but is filtered out by the filter
                .checkBoard(board);
            });

            util.getUserSettingUpdater().updateFilters('priority');
            util.easySubscribe(board => {
              new BoardChecker(standardTable)
                .rankOrder(rank, ...standardRank)
                .nonMatchingIssues('ONE-1', 'ONE-2', 'ONE-3')
                .checkBoard(board);
            });

            util.getUserSettingUpdater().updateSearchContainingText('##1');
            util.easySubscribe(board => {
              new BoardChecker(standardTable)
                .rankOrder(rank, ...standardRank)
                .nonMatchingIssues('ONE-4', 'ONE-5', 'ONE-6')
                .checkBoard(board);
            });

            util.getUserSettingUpdater().updateFilters('priority', 'Blocker');
            util.easySubscribe(board => {
              new BoardChecker(standardTable)
                .rankOrder(rank, ...standardRank)
                .invisibleIssues('ONE-1', 'ONE-3', 'ONE-5')
                .nonMatchingIssues('ONE-4', 'ONE-6') // ONE-5 doesn't match the search, but is filtered out by the filter
                .checkBoard(board);
            });
          }
        });
        describe('Create Issue', () => {
          it ('No Rank', () => {
            doTest(false);
          });
          it ('Rank', () => {
            doTest(true);
          });
          function doTest(rank: boolean) {
            const dict: Dictionary<string> = {priority: 'Major', 's.text': '##2'};
            if (rank) {
              dict['view'] = 'rv';
            }

            const util: BoardViewObservableUtil = setupTable(dict);
            util.easySubscribe(board => {
              new BoardChecker(standardTable)
                .rankOrder(rank, ...standardRank)
                .invisibleIssues('ONE-2', 'ONE-4', 'ONE-6')
                .nonMatchingIssues('ONE-1', 'ONE-3') // ONE-2 doesn't match the search, but is filtered out by the filter
                .checkBoard(board);
            });

            // Create an issue that gets filtered out
            util
              .getBoardStateUpdater()
              .issueChanges({new: [{key: 'ONE-7', state: '1-1', summary: 'Test', priority: 'Blocker', type: 'task'}]})
              .rankChanges({ONE: [{index: 6, key: 'ONE-7'}]})
              .emit()
              .easySubscribe(board => {
                standardTable[0].push('ONE-7');
                standardRank.push('ONE-7');
                new BoardChecker(standardTable)
                  .rankOrder(rank, ...standardRank)
                  .invisibleIssues('ONE-2', 'ONE-4', 'ONE-6', 'ONE-7')
                  .nonMatchingIssues('ONE-1', 'ONE-3') // ONE-2 and 7 don't match the search, but are filtered out by the filter
                  .checkBoard(board);
              });

            // Create an issue that does not match search
            util
              .getBoardStateUpdater()
              .issueChanges({new: [{key: 'ONE-8', state: '1-2', summary: 'Test', priority: 'Major', type: 'task'}]})
              .rankChanges({ONE: [{index: 7, key: 'ONE-8'}]})
              .emit()
              .easySubscribe(board => {
                standardTable[1].push('ONE-8');
                standardRank.push('ONE-8');
                new BoardChecker(standardTable)
                  .rankOrder(rank, ...standardRank)
                  .invisibleIssues('ONE-2', 'ONE-4', 'ONE-6', 'ONE-7')
                  .nonMatchingIssues('ONE-1', 'ONE-3', 'ONE-8') // ONE-2 and 7 don't match the search, but are filtered out by the filter
                  .checkBoard(board);
              });
            // Create an issue that is visible
            util
              .getBoardStateUpdater()
              .issueChanges({new: [{key: 'ONE-9', state: '1-3', summary: '##2YES!', priority: 'Major', type: 'task'}]})
              .rankChanges({ONE: [{index: 8, key: 'ONE-9'}]})
              .emit()
              .easySubscribe(board => {
                standardTable[2].push('ONE-9');
                standardRank.push('ONE-9');
                new BoardChecker(standardTable)
                  .rankOrder(rank, ...standardRank)
                  .invisibleIssues('ONE-2', 'ONE-4', 'ONE-6', 'ONE-7')
                  .nonMatchingIssues('ONE-1', 'ONE-3', 'ONE-8') // ONE-2 and 7 don't match the search, but are filtered out by the filter
                  .checkBoard(board);
              });
          }
        });

        describe('Update Issue', () => {
          it ('No Rank', () => {
            doTest(false);
          });
          it ('Rank', () => {
            doTest(true);
          });
          function doTest(rank: boolean) {
            const dict: Dictionary<string> = {priority: 'Major', 's.text': '##2'};
            if (rank) {
              dict['view'] = 'rv';
            }

            const util: BoardViewObservableUtil = setupTable(dict);
            util.easySubscribe(board => {
              new BoardChecker(standardTable)
                .rankOrder(rank, ...standardRank)
                .invisibleIssues('ONE-2', 'ONE-4', 'ONE-6')
                .nonMatchingIssues('ONE-1', 'ONE-3') // ONE-2 doesn't match the search, but is filtered out by the filter
                .checkBoard(board);
            });

            // Update an issue not matching search to be filtered out
            util
              .getBoardStateUpdater()
              .issueChanges({update: [{key: 'ONE-1', priority: 'Blocker'}]})
              .emit()
              .easySubscribe(board => {
                new BoardChecker(standardTable)
                  .rankOrder(rank, ...standardRank)
                  .invisibleIssues('ONE-1', 'ONE-2', 'ONE-4', 'ONE-6')
                  .nonMatchingIssues('ONE-3') // ONE-2 doesn't match the search, but are filtered out by the filter
                  .checkBoard(board);
              });

            // Update an issue not matching search to be visible
            util
              .getBoardStateUpdater()
              .issueChanges({update: [{key: 'ONE-3', summary: '##2yes!'}]})
              .emit()
              .easySubscribe(board => {
                new BoardChecker(standardTable)
                  .rankOrder(rank, ...standardRank)
                  .invisibleIssues('ONE-1', 'ONE-2', 'ONE-4', 'ONE-6')
                  .checkBoard(board);
              });

            // Update an issue that is filtered out to not match search
            util
              .getBoardStateUpdater()
              .issueChanges({update: [{key: 'ONE-1', priority: 'Major'}]})
              .emit()
              .easySubscribe(board => {
                new BoardChecker(standardTable)
                  .rankOrder(rank, ...standardRank)
                  .invisibleIssues('ONE-2', 'ONE-4', 'ONE-6')
                  .nonMatchingIssues('ONE-1') // ONE-2 doesn't match the search, but is filtered out by the filter
                  .checkBoard(board);
              });

            // Update an issue that is filtered out to be visible
            util
              .getBoardStateUpdater()
              .issueChanges({update: [{key: 'ONE-4', priority: 'Major'}]})
              .emit()
              .easySubscribe(board => {
                new BoardChecker(standardTable)
                  .rankOrder(rank, ...standardRank)
                  .invisibleIssues('ONE-2', 'ONE-6')
                  .nonMatchingIssues('ONE-1') // ONE-2 doesn't match the search, but is filtered out by the filter
                  .checkBoard(board);
              });

            // Update an issue that is visible to not match search
            util
              .getBoardStateUpdater()
              .issueChanges({update: [{key: 'ONE-3', summary: 'nope'}]})
              .emit()
              .easySubscribe(board => {
                new BoardChecker(standardTable)
                  .rankOrder(rank, ...standardRank)
                  .invisibleIssues('ONE-2', 'ONE-6')
                  .nonMatchingIssues('ONE-1', 'ONE-3') // ONE-2 doesn't match the search, but is filtered out by the filter
                  .checkBoard(board);
              });

            // Update an issue that is visible to be filtered out
            util
              .getBoardStateUpdater()
              .issueChanges({update: [{key: 'ONE-4', priority: 'Blocker'}]})
              .emit()
              .easySubscribe(board => {
                new BoardChecker(standardTable)
                  .rankOrder(rank, ...standardRank)
                  .invisibleIssues('ONE-2', 'ONE-4', 'ONE-6')
                  .nonMatchingIssues('ONE-1', 'ONE-3') // ONE-2 doesn't match the search, but is filtered out by the filter
                  .checkBoard(board);
              });
          }
        });

      });

      describe('Hide', () => {
        describe('Update search and filter', () => {
          it ('No Rank', () => {
            doTest(false);
          });
          it ('Rank', () => {
            doTest(true);
          });
          function doTest(rank: boolean) {
            const dict: Dictionary<string> = {priority: 'Major', 's.text': '##2', 's.hide': 'true'};
            if (rank) {
              dict['view'] = 'rv';
            }

            const util: BoardViewObservableUtil = setupTable(dict);
            util.easySubscribe(board => {
              new BoardChecker(standardTable)
                .rankOrder(rank, ...standardRank)
                .invisibleIssues('ONE-1', 'ONE-2', 'ONE-3', 'ONE-4', 'ONE-6')
                .checkBoard(board);
            });

            util.getUserSettingUpdater().updateFilters('priority');
            util.easySubscribe(board => {
              new BoardChecker(standardTable)
                .rankOrder(rank, ...standardRank)
                .invisibleIssues('ONE-1', 'ONE-2', 'ONE-3')
                .checkBoard(board);
            });

            util.getUserSettingUpdater().updateSearchContainingText('##1');
            util.easySubscribe(board => {
              new BoardChecker(standardTable)
                .rankOrder(rank, ...standardRank)
                .invisibleIssues('ONE-4', 'ONE-5', 'ONE-6')
                .checkBoard(board);
            });

            util.getUserSettingUpdater().updateFilters('priority', 'Blocker');
            util.easySubscribe(board => {
              new BoardChecker(standardTable)
                .rankOrder(rank, ...standardRank)
                .invisibleIssues('ONE-1', 'ONE-3', 'ONE-4', 'ONE-5', 'ONE-6')
                .checkBoard(board);
            });
          }
        });
        describe('Create Issue', () => {
          it ('No Rank', () => {
            doTest(false);
          });
          it ('Rank', () => {
            doTest(true);
          });
          function doTest(rank: boolean) {
            const dict: Dictionary<string> = {priority: 'Major', 's.text': '##2', 's.hide': 'true'};
            if (rank) {
              dict['view'] = 'rv';
            }

            const util: BoardViewObservableUtil = setupTable(dict);
            util.easySubscribe(board => {
              new BoardChecker(standardTable)
                .rankOrder(rank, ...standardRank)
                .invisibleIssues('ONE-1', 'ONE-2', 'ONE-3', 'ONE-4', 'ONE-6')
                .checkBoard(board);
            });

            // Create an issue that gets filtered out
            util
              .getBoardStateUpdater()
              .issueChanges({new: [{key: 'ONE-7', state: '1-1', summary: 'Test', priority: 'Blocker', type: 'task'}]})
              .rankChanges({ONE: [{index: 6, key: 'ONE-7'}]})
              .emit()
              .easySubscribe(board => {
                standardTable[0].push('ONE-7');
                standardRank.push('ONE-7');
                new BoardChecker(standardTable)
                  .rankOrder(rank, ...standardRank)
                  .invisibleIssues('ONE-1', 'ONE-2', 'ONE-3', 'ONE-4', 'ONE-6', 'ONE-7')
                  .checkBoard(board);
              });

            // Create an issue that does not match search
            util
              .getBoardStateUpdater()
              .issueChanges({new: [{key: 'ONE-8', state: '1-2', summary: 'Test', priority: 'Major', type: 'task'}]})
              .rankChanges({ONE: [{index: 7, key: 'ONE-8'}]})
              .emit()
              .easySubscribe(board => {
                standardTable[1].push('ONE-8');
                standardRank.push('ONE-8');
                new BoardChecker(standardTable)
                  .rankOrder(rank, ...standardRank)
                  .invisibleIssues('ONE-1', 'ONE-2', 'ONE-3', 'ONE-4', 'ONE-6', 'ONE-7', 'ONE-8')
                  .checkBoard(board);
              });
            // Create an issue that is visible
            util
              .getBoardStateUpdater()
              .issueChanges({new: [{key: 'ONE-9', state: '1-3', summary: '##2YES!', priority: 'Major', type: 'task'}]})
              .rankChanges({ONE: [{index: 8, key: 'ONE-9'}]})
              .emit()
              .easySubscribe(board => {
                standardTable[2].push('ONE-9');
                standardRank.push('ONE-9');
                new BoardChecker(standardTable)
                  .rankOrder(rank, ...standardRank)
                  .invisibleIssues('ONE-1', 'ONE-2', 'ONE-3', 'ONE-4', 'ONE-6', 'ONE-7', 'ONE-8')
                  .checkBoard(board);
              });
          }
        });
        describe('Update Issue', () => {
          it ('No Rank', () => {
            doTest(false);
          });
          it ('Rank', () => {
            doTest(true);
          });
          function doTest(rank: boolean) {
            const dict: Dictionary<string> = {priority: 'Major', 's.text': '##2', 's.hide': 'true'};
            if (rank) {
              dict['view'] = 'rv';
            }

            const util: BoardViewObservableUtil = setupTable(dict);
            util.easySubscribe(board => {
              new BoardChecker(standardTable)
                .rankOrder(rank, ...standardRank)
                .invisibleIssues('ONE-1', 'ONE-2', 'ONE-3', 'ONE-4', 'ONE-6')
                .checkBoard(board);
            });

            // Update an issue not matching search to be filtered out
            util
              .getBoardStateUpdater()
              .issueChanges({update: [{key: 'ONE-1', priority: 'Blocker'}]})
              .emit()
              .easySubscribe(board => {
                new BoardChecker(standardTable)
                  .rankOrder(rank, ...standardRank)
                  .invisibleIssues('ONE-1', 'ONE-2', 'ONE-3', 'ONE-4', 'ONE-6')
                  .checkBoard(board);
              });

            // Update an issue not matching search to be visible
            util
              .getBoardStateUpdater()
              .issueChanges({update: [{key: 'ONE-3', summary: '##2yes!'}]})
              .emit()
              .easySubscribe(board => {
                new BoardChecker(standardTable)
                  .rankOrder(rank, ...standardRank)
                  .invisibleIssues('ONE-1', 'ONE-2', 'ONE-4', 'ONE-6')
                  .checkBoard(board);
              });

            // Update an issue that is filtered out to not match search
            util
              .getBoardStateUpdater()
              .issueChanges({update: [{key: 'ONE-1', priority: 'Major'}]})
              .emit()
              .easySubscribe(board => {
                new BoardChecker(standardTable)
                  .rankOrder(rank, ...standardRank)
                  .invisibleIssues('ONE-1', 'ONE-2', 'ONE-4', 'ONE-6')
                  .checkBoard(board);
              });

            // Update an issue that is filtered out to be visible
            util
              .getBoardStateUpdater()
              .issueChanges({update: [{key: 'ONE-4', priority: 'Major'}]})
              .emit()
              .easySubscribe(board => {
                new BoardChecker(standardTable)
                  .rankOrder(rank, ...standardRank)
                  .invisibleIssues('ONE-1', 'ONE-2', 'ONE-6')
                  .checkBoard(board);
              });

            // Update an issue that is visible to not match search
            util
              .getBoardStateUpdater()
              .issueChanges({update: [{key: 'ONE-3', summary: 'nope'}]})
              .emit()
              .easySubscribe(board => {
                new BoardChecker(standardTable)
                  .rankOrder(rank, ...standardRank)
                  .invisibleIssues('ONE-1', 'ONE-2', 'ONE-3', 'ONE-6')
                  .checkBoard(board);
              });

            // Update an issue that is visible to be filtered out
            util
              .getBoardStateUpdater()
              .issueChanges({update: [{key: 'ONE-4', priority: 'Blocker'}]})
              .emit()
              .easySubscribe(board => {
                new BoardChecker(standardTable)
                  .rankOrder(rank, ...standardRank)
                  .invisibleIssues('ONE-1', 'ONE-2', 'ONE-3', 'ONE-4', 'ONE-6')
                  .checkBoard(board);
              });
          }
        });
      });
    });

    function setupTable(params?: Dictionary<string>): BoardViewObservableUtil {
      const init =
        new BoardStateInitializer()
          .headerStateFactory(new NumberedHeaderStateFactory(3))
          .setRank('ONE', 1, 2, 3, 4, 5, 6)
          .mapState('ONE', 'S-1', '1-1')
          .mapState('ONE', 'S-2', '1-2')
          .mapState('ONE', 'S-3', '1-3')
          .issuesFactory(
            new SimpleIssueFactory()
            // Numbering is <row><column>
              .addIssue('ONE-1', 0, {summary: 'Issue ##11'})
              .addIssue('ONE-2', 0, {summary: 'Issue ##12'})
              .addIssue('ONE-3', 1, {summary: 'Issue ##13'})
              .addIssue('ONE-4', 1, {summary: 'Issue ##21'})
              .addIssue('ONE-5', 2, {summary: 'Issue ##22'})
              .addIssue('ONE-6', 2, {summary: 'Issue ##23'})
          );
      const util: BoardViewObservableUtil = new BoardViewObservableUtil(params)
        .updateBoardState(init);

      return util;
    }
  });
});





