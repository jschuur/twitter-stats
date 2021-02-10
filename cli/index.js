#!/usr/bin/env node

// Lets us keep using esm module imports and share CLI/Next.js code (but slows CLI start time)
require('@babel/register')();

require('dotenv').config({ path: '.env.local' });
require('./twitterstats.js');
