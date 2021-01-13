#!/usr/bin/env node
const pkg = require('./package.json');
const UpdateFunctionLayer = require('./index');
const UpdateNotifier = require('update-notifier');

async function main() {

  UpdateNotifier({ pkg }).notify();

  const argv = process.argv.slice(2);
  const lastArgv = process.argv[process.argv.length-1];

  if (lastArgv === '--version') {
    console.log(`v${pkg.version}`);
    return;
  }

  if (lastArgv === '--help' || lastArgv === 'help') {
    showHelp();
    return;
  }

  const [functionName, layerName] = argv;
  const layerVersion = argv.length > 2 ? parseInt(argv[2]) : undefined;

  if (!functionName || !layerName) {
    showHelp();
    process.exit(1);
  }

  const retVal = await UpdateFunctionLayer(functionName, layerName, layerVersion);
  if (retVal.updated === false) {
    console.log(`${retVal.functionName} is already using layer: ${retVal.layerName} v${retVal.layerVersion}`);
  } else {
    console.log(`${retVal.functionName} is now using layer: ${retVal.layerName} v${retVal.layerVersion}`);
  }

  return;

}

function showHelp() {
  const helpText = [
    '',
    'Usage:',
    '',
    `  ${pkg.name} <function-name> <layer-name> [layer-version]`,
    '',
    'Arguments:',
    '',
    '  function-name    function to update',
    '  layer-name       layer to update',
    '  layer-version    layer version to update to (optional)',
    '',
  ].join('\n');
  console.log(helpText);
}

if (require.main === module) {
  main()
    .catch((error) => {
      console.error(error.message);
      process.exit(1);
    });
}
