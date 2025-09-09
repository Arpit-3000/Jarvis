#!/usr/bin/env node

/**
 * Script to insert dummy student data into the database
 * Usage: node scripts/insertDummyData.js
 */

const { insertDummyData } = require('../data/dummyStudents');

console.log('🚀 Starting dummy data insertion...');
insertDummyData();
