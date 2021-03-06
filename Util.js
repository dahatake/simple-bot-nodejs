const request = require('request');

class Util {

    getCognitiveResults(imageURL) {
        return new Promise((resolve, reject) => {
            const apiEndpoint = process.env.COMPUTER_VISION_ENDPOINT || 'https://southeastasia.api.cognitive.microsoft.com/vision/v1.0/analyze';

            const params = {
                'subscription-key': process.env.COMPUTER_VISION_SUBSCRIPTION_KEY || '<<Your Key>>',
                'visualFeatures': 'Description',
            };

            const options = {
                url: apiEndpoint,
                qs: params,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/octet-stream'
                },
                body: request.get(imageURL),
                // encoding: null
            };

            request.post(options, (error, response, body) => {
                console.log(body)
                if (error) {
                    console.log('Image Recognition Error: ', error);
                } else {
                    resolve(JSON.parse(body));
                }
            });
        });
    };

    getCustomVisionResults(imageURL) {
        return new Promise((resolve, reject) => {
            const apiEndpoint = process.env.CUSTOM_VISION_ENDPOINT || 'https://southcentralus.api.cognitive.microsoft.com/customvision/v1.0/Prediction/399b3eaa-1863-439d-9ab6-580eaa720ab9/image';

            const params = {
                'Prediction-Key': process.env.CUSTOM_VISION_SUBSCRIPTION_KEY || '<<Your Key>>'
            };

            const options = {
                url: apiEndpoint,
                qs: params,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/octet-stream'
                },
                body: request.get(imageURL),
                // encoding: null
            };

            request.post(options, (error, response, body) => {
                console.log(body)
                if (error) {
                    console.log('Image Recognition Error: ', error);
                } else {
                    resolve(JSON.parse(body));
                }
            });
        });
    };

    getTranslatorAuthToken(){
        return new Promise((resolve, reject) => {
            var apiEndpoint = 'https://api.cognitive.microsoft.com/sts/v1.0/issueToken';

            const params = {
                'Subscription-Key': process.env.TRANSLATOR_KEY || '<<Your Key>>'
            };

            const options = {
                url: apiEndpoint,
                qs: params,
                headers: {
                    'Accept': 'application/jwt'
                }
                // encoding: null
            };

            request.post(options, (error, response, body) => {
                if (error) {
                    console.log('Translator Auth Error: ', error);
                } else {
                    console.log('Translator Token:' + body);
                    resolve(body);
                }
            });
        });
    };

    getTranslationResults(key, text) {
        return new Promise((resolve, reject) => {
            var apiEndpoint = process.env.TRANSLATOR_ENDPOINT || 'https://api.microsofttranslator.com/V2/Http.svc/Translate';
            apiEndpoint += '?text='+text+'&from=en&to=ja&category=generalnn';
    
           const params = {
                'appid': 'Bearer ' + key
            };
    
            const options = {
                url: apiEndpoint,
                qs: params,
                headers: {
                    'Accept': 'application/xml',
                    'Encoding': 'utf8'
                }
                // encoding: null
            };
    
            request.get(options, (error, response, body) => {
                console.log(body);
                if (error) {
                    console.log('Translator Error: ', error);
                } else {
                    body = body.replace(/<(.+?)>|<\/string>/g, '');
                    console.log('Translated: ' + text + ' -> ' + body);
                    resolve(body);
                }
            });
        });
    };

    /*     getLuis(text) {
        return new Promise((resolve, reject) => {
            const apiEndpoint = process.env.LUIS_ENDPOINT || 'https://southeastasia.api.cognitive.microsoft.com/luis/v2.0';

            const params = {
                'subscription-key': process.env.SUBSCRIOTION_KEY,
                'timezoneOffset': 540,
                'verbose': true,
                q: text
            };

            const options = {
                url: apiEndpoint,
                headers: {
                    'Accept': 'application/json',
                },
                qs: params
            };

            request.get(options, (err, response, body) => {
                if (err) { console.log(err); return; }
                const res = JSON.parse(response.body);
                resolve(res);
            });
        });
    }
 */

}

module.exports = Util;