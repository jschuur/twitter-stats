import { performance } from 'perf_hooks';

import { connectToDatabase } from 'util/mongodb';
import logger from 'util/logger';
import { httpResponse } from 'util/misc';
import { readAccounts } from 'lib/db';
import { updateSnapshots } from 'lib/update_snapshots';

const numFormat = new Intl.NumberFormat('en-GB').format;

// API handler for triggering snapshot updates
 export default async function handler(req, res) {
   const startTime = performance.now();
   const { db } = await connectToDatabase();
   let results = {};

   try {
     var accounts = await readAccounts();
   } catch ({ message }) {
     logger.error(message);

     return httpResponse({ res, status: 500, error: message });
   }

   // TODO: Bulk update
   for (const account of accounts) {
     try {
       const followers = await updateSnapshots(account.screen_name);

       results[account.screen_name] = followers;
     } catch ({ message }) {
       logger.error(message);

       continue;
     }
   }

   httpResponse({
     res,
     startTime,
     message: 'Update completed',
     results,
   });
 }