const request = require('request');

class Util {
    storeUserInput(text) {
        const apiEndpoint = process.env.LOG_ENDPOINT;
        if (!apiEndpoint) return;

        const body = {
            input: text,
        }
        const options = {
            url: apiEndpoint,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body),
        };
        request.post(options, (error, response, body) => {
            if (error) {
                console.log('Logging Error: ', error);
            } else {
                console.log(body);
            }
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
    getCognitiveResults(imageURL) {
        return new Promise((resolve, reject) => {
            const apiEndpoint = process.env.COMPUTER_VISION_ENDPOINT || 'https://southeastasia.api.cognitive.microsoft.com/vision/v1.0/analyze';

            const params = {
                'subscription-key': process.env.COMPUTER_VISION_SUBSCRIPTION_KEY || '387cf4661f90475d8c3ed1ac68b21bfd',
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
                'Prediction-Key': process.env.CUSTOM_VISION_SUBSCRIPTION_KEY || '018e195c10dd430f87a38bdba7cb0c44'
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
                'Subscription-Key': process.env.TRANSLATOR_KEY || 'baedf3aeaee74af4b54468179b160bd1'
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
}

module.exports = Util;