const Airtable = require('airtable');

exports.handler = async function(event, context) {
  const { AIRTABLE_API_KEY } = process.env
  const base = new Airtable({ apiKey: AIRTABLE_API_KEY }).base('appjuGEWY7gmDmQgI');
  let records;

  try {
    records = await base('Random Items for All Occasions').select().all();
  } catch (err) {
    console.error('-------------');
    console.error(err);
    console.error('-------------');
    return;
  }

  const randomRecord = records[Math.floor(Math.random()*records.length)];
  const randomItem = { id: randomRecord.id, ...randomRecord.fields };
  console.log('ITEM', randomItem);

  return {
    statusCode: 200,
    body: JSON.stringify(randomItem)
  }
}
