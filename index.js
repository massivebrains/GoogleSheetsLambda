const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');
const serviceAccount = require('./service_account.json');
const { parse, toJSON } = require('flatted');

module.exports.handler = async (event) => {
	try {
		const serviceAccountAuth = new JWT({
			email: serviceAccount.client_email,
			key: serviceAccount.private_key,
			scopes: [
			  'https://www.googleapis.com/auth/spreadsheets',
			],
		});

		const doc = new GoogleSpreadsheet('1e6HhRAcd2qTrMgMR33g_8dCHFP-Q29ro6yNoXHFBk48', serviceAccountAuth);
		await doc.loadInfo();
		const sheet = doc.sheetsByIndex[0];

		if (!sheet) {
			throw new Error('Could not find sheet');
		}

		let payload = JSON.parse(event.body)
		if (!payload['JOB URL'] || !payload['COMPANY NAME'] || !payload['JOB TITLE'] || !payload['STATUS']) {
			throw new Error('Invalid Payload. All fields are required');
		}

		payload = {
			'JOB URL': payload['JOB URL'],
			'COMPANY NAME': payload['COMPANY NAME'],
			'JOB TITLE': payload['JOB TITLE'],
			'STATUS': payload['STATUS']
		}

		await sheet.addRow(payload);
		return responseJson(payload);
	} catch (error) {
		return responseJson({ error }, 'Failed', error.message);
	}
  };

  const responseJson = (data = null, status = 'Successful', message = 'Request Successful') => {
	return {
		statusCode: 200,
		headers: {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Headers': '*'
		},
		body: JSON.stringify(
		  {
			status,
			message,
			data
		  },
		  null,
		  2
		),
	  };
  }
