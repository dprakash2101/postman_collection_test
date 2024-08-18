"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const fs = __importStar(require("fs"));
const newman = __importStar(require("newman"));
async function run() {
    try {
        const collectionPath = core.getInput('collection');
        const environmentPath = core.getInput('environment');
        const outputFilePath = core.getInput('output-file');
        if (!fs.existsSync(collectionPath)) {
            throw new Error(`Collection file does not exist at path: ${collectionPath}`);
        }
        // Define the options directly without specifying a type
        const newmanOptions = {
            collection: require(collectionPath),
        };
        if (environmentPath && fs.existsSync(environmentPath)) {
            newmanOptions.environment = require(environmentPath);
        }
        // Wrap Newman run in a Promise to use async/await
        const runNewman = () => new Promise((resolve, reject) => {
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
        }
        else {
            console.log(results);
        }
    }
    catch (error) {
        if (error instanceof Error) {
            core.setFailed(error.message);
        }
        else {
            core.setFailed('An unknown error occurred');
        }
    }
}
run();
