import { program } from 'commander';

import updateAccounts from 'lib/update_accounts';
import { connectToDatabase } from 'util/mongodb';
import logger from 'util/logger';

program.version('0.0.1');

program
  .command('update')
  .description('update metrics and tweets for tracked Twitter accounts')
  .option('-s, --skip-tweets', 'Skip updating tweets (profile stats only)')
  .action(async (options) => {
    // Remotely disable the update process without redeploying code changes
    if (process.env.PAUSE_UPDATES) {
      logger.warn('PAUSE_UPDATES is set, aborting the update process');

      process.exit(1);
    }

    const { client } = await connectToDatabase();

    await updateAccounts(options);
    client.close();

    // TODO: process.exit(1) if there were errors (including no Twitter stats for accounts)
  });

program.parse(process.argv);
