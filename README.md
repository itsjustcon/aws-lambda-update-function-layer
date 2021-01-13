# aws-lambda-update-function-layer
Easily update an AWS Lambda function layer to the most recent version.

## Usage
You can install the package globally for use anywhere in your shell:
```bash
$ npm install -g aws-lambda-update-function-layer
$ aws-lambda-update-function-layer <function-name> <layer-name> [layer-version]
```
or you can install it locally to a package: (useful for running via npm scripts)
```bash
$ npm install --save-dev aws-lambda-update-function-layer
$ cat package.json
{
  "name": "my-node-package",
  "version": "1.0.0",
  "scripts": {
    "deploy": "aws-lambda-update-function-layer <function-name> <layer-name> [layer-version]"
  }
}
$ npm run deploy
```
