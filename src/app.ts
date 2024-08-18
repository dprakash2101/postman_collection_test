import * as core from '@actions/core';
import * as fs from 'fs';
import * as newman from 'newman';

async function run() {
    try {
        const collectionPath = core.getInput('collection');
        const environmentPath = core.getInput('environment');
        const outputFilePath = core.getInput('output-file');

        if (!fs.existsSync(collectionPath)) {
            throw new Error(`Collection file does not exist at path: ${collectionPath}`);
        }

        // Define the options directly without specifying a type
        const newmanOptions: any = {
            collection: require(collectionPath),
        };

        if (environmentPath && fs.existsSync(environmentPath)) {
            newmanOptions.environment = require(environmentPath);
        }

        // Wrap Newman run in a Promise to use async/await
        const runNewman = () =>
            new Promise((resolve, reject) => {
                newman.run(newmanOptions, (err, summary) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve(summary);
                });
            });

        const summary = await runNewman();

        const results = JSON.stringify(summary, null, 2);
        core.setOutput('results', results);

        if (outputFilePath) {
            fs.writeFileSync(outputFilePath, results);
            console.log(`Results written to file: ${outputFilePath}`);
        } else {
            console.log(results);
        }
    } catch (error) {
        if (error instanceof Error) {
            core.setFailed(error.message);
        } else {
            core.setFailed('An unknown error occurred');
        }
    }
}

run();
