import { bold, red } from 'colors/safe';
import { CLONE_EVENT, END_EVENT, Events } from '../events';
import { IClone } from '../interfaces/clone.interface';
import { IOptions } from '../interfaces/options.interface';
import { IReporter } from '../interfaces/reporter.interface';
import { IStatistic } from '../interfaces/statistic.interface';
import { SOURCES_DB, STATISTIC_DB } from '../stores/models';
import { StoresManager } from '../stores/stores-manager';
import { getPathConsoleString, getSourceLocation } from '../utils';

const Table = require('cli-table2');

export class ConsoleReporter implements IReporter {
  constructor(protected options: IOptions) {}

  public attach(): void {
    Events.on(CLONE_EVENT, this.cloneFound.bind(this));
    Events.on(END_EVENT, this.finish.bind(this));
  }

  protected cloneFound(clone: IClone) {
    const { duplicationA, duplicationB, format } = clone;
    console.log('Clone found (' + format + '):' + (clone.is_new ? red('*') : ''));
    console.log(
      ` - ${getPathConsoleString(
        this.options,
        StoresManager.getStore(SOURCES_DB).get(duplicationA.sourceId).id
      )} [${getSourceLocation(duplicationA.start, duplicationA.end)}]`
    );
    console.log(
      `   ${getPathConsoleString(
        this.options,
        StoresManager.getStore(SOURCES_DB).get(duplicationB.sourceId).id
      )} [${getSourceLocation(duplicationB.start, duplicationB.end)}]`
    );
    console.log('');
  }

  protected finish() {
    const statistic = StoresManager.getStore(STATISTIC_DB).get(this.options.executionId);
    if (statistic) {
      const table = new Table({
        head: ['Format', 'Files analyzed', 'Total lines', 'Clones found (new)', 'Duplicated lines (new)', '%']
      });
      Object.keys(statistic.formats)
        .filter(format => statistic.formats[format].sources as boolean)
        .forEach((format: string) => {
          table.push(this.convertStatisticToArray(format, statistic.formats[format]));
        });
      table.push(this.convertStatisticToArray(bold('Total:'), statistic.all));
      console.log(table.toString());
    }
  }

  private convertStatisticToArray(format: string, statistic: IStatistic): string[] {
    return [
      format,
      `${statistic.sources}`,
      `${statistic.lines}`,
      `${statistic.clones} (${statistic.newClones})`,
      `${statistic.duplicatedLines} (${statistic.newDuplicatedLines})`,
      `${statistic.percentage}%`
    ];
  }
}
