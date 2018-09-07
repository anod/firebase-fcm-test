import { google } from 'googleapis';
import * as https from 'https';

const account = require('./service-account.json');

const deviceToken = "";
const message = {
    "message": {
        "token": deviceToken.replace('%3', ':'),
        "data": {
            "title": "New review",
            "body": "Soooo complicated to get started.",
            'type': 'review',
            'ext_id': 'com.Slack',
            "review_id": "gp:AOqpTOG2HTM1uLxzN8ZI8FiquT-bjK4zNEdCw8LddwguJa2PMt_6wBuLfy-G-VPP1v4A08yxctgC7gDFO5DF98E",
        },
        "apns": {
            "payload": {
                "aps": {
                    "alert": {
                        "title": "New review",
                        "body": "Soooo complicated to get started."
                    },
                    "category": "review"
                }
            }
        }
    }
};

function authorize(): Promise<string> {
    return new Promise(function (resolve, reject) {
        const jwtClient = new google.auth.JWT(
            account.client_email,
            null,
            account.private_key,
            [
                'https://www.googleapis.com/auth/firebase.messaging'
            ],
            null
        );
        jwtClient.authorize(function (err, tokens) {
            if (err) {
                reject(err);
                return;
            }
            resolve(tokens.access_token);
        });
    });
}

authorize().then(token => {
    console.log('[REQUEST] Token: ' + token);
    const postData = JSON.stringify(message);
    const options: https.RequestOptions = {
        method: 'POST',
        hostname: 'fcm.googleapis.com',
        path: `/v1/projects/${account.project_id}/messages:send`,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    };
    const req = https.request(options, (res) => {
        console.log('[RESPONSE] statusCode:', res.statusCode);
        console.log('[RESPONSE] headers:', res.headers);

        res.on('data', (d) => {
            process.stdout.write(d);
        });
    });

    req.on('error', (e) => {
        console.error(e);
    });

    req.write(postData);
    req.end();
})