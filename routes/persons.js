const express = require('express');
const fs = require('fs');
const path = require('path');
const moment = require('moment');

const router = express.Router();
const accessFilePath = path.join(__dirname, '../access.json');
const personsFilePath = path.join(__dirname, '../persons.json');
const ageLimitDays = parseInt(process.env.AGE_LIMIT_DAYS, 10) || 5475;

// Helper function to calculate age in days
const calculateAgeInDays = (birthdate) => {
  const birthDateMoment = moment(birthdate, 'YYYY-MM-DD');
  return moment().diff(birthDateMoment, 'days');
};

router.get('/', (req, res) => {
  // Append current date and time to access.json
  const currentTime = moment().format();
  fs.readFile(accessFilePath, 'utf-8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error reading access file');
    }

    const accessLog = data ? JSON.parse(data) : [];
    accessLog.push({ timestamp: currentTime });

    fs.writeFile(accessFilePath, JSON.stringify(accessLog, null, 2), (err) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Error writing to access file');
      }
    });
  });

  // Read and filter persons.json
  fs.readFile(personsFilePath, 'utf-8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error reading persons file');
    }

    const persons = JSON.parse(data);
    const filteredPersons = persons.filter(person => calculateAgeInDays(person.birthdate) > ageLimitDays);

    res.render('persons', { persons: filteredPersons, moment });
  });
});

module.exports = router;
