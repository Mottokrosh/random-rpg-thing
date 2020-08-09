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

  const allItems = records.map(record => {
    return { id: record.id, ...record.fields };
  });

  return {
    statusCode: 200,
    body: JSON.stringify(allItems),
  }
}
