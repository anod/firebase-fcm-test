import { google } from 'googleapis';
import * as https from 'https';

const firebaseProject = "";
const deviceToken = "";
const message = {
    "message": {
        "token": deviceToken,
        "data": {
            "title": "Notification title",
            "body": "Notification body",
            'type': 'review',
            'ext_id': '692885364'
        },
        "apns": {
            "payload": {
                "alert": {
                    "title": "Notification title",
                    "body": "Notification body"
                },
                "category": "review"
            }
        }
    }
};

function authorize(): Promise<string> {
    return new Promise(function (resolve, reject) {
        const key = require('./service-account.json');
        const jwtClient = new google.auth.JWT(
            key.client_email,
            null,
            key.private_key,
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
        path: `/v1/projects/${firebaseProject}/messages:send`,
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