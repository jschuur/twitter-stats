import { program } from 'commander';

import showStats from './stats_command';
import updateFromCLI from './update_command';

import { RECENT_DAYS } from 'util/config';

program.version('0.0.1');

program
  .command('update')
  .description('update metrics and tweets for tracked Twitter accounts')
  .option('-s, --skip-tweets', 'Skip updating tweets (profile stats only)')
  .action(updateFromCLI);

program
  .command('stats', { isDefault: true })
  .description('show latest stats for accounts')
  .option('-d, --days <days>', 'days for recent comparison', RECENT_DAYS)
  .action(showStats);

program.parse(process.argv);