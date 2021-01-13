const {
  LambdaClient,
  ListLayerVersionsCommand,
  GetLayerVersionCommand,
  GetFunctionConfigurationCommand,
  UpdateFunctionConfigurationCommand
} = require('@aws-sdk/client-lambda');

const lambdaClient = new LambdaClient();

async function UpdateFunctionLayer(functionName, layerName, layerVersion) {

  if (typeof(layerVersion) === 'string') {
    layerVersion = parseInt(layerVersion);
  }
  if (typeof(layerVersion) !== 'number') {
    // fetch most recent layer version
    const layer = await lambdaClient.send(
      new ListLayerVersionsCommand({
        LayerName: layerName,
      })
    ).then((layerVersions) => {
      return layerVersions.LayerVersions[0];
    }).catch((err) => {
      throw new Error(`Failed to lookup most recent version for layer: ${layerName}\n${err.message}`);
    });
    if (!layer) {
      throw new Error(`Could not find layer: ${layerName}`);
    }
    layerVersion = layer.Version;
  }
  if (isNaN(layerVersion)) {
    throw new Error(`Invalid layer version: ${layerVersion}`);
  }

  // fetch layer
  const layer = await lambdaClient.send(
    new GetLayerVersionCommand({
      LayerName: layerName,
      VersionNumber: layerVersion,
    })
  ).catch((err) => {
    throw new Error(`Failed to lookup layer: ${layerName} v${layerVersion}\n${err.message}`);
  });

  // get function configuration
  const functionConfiguration = await lambdaClient.send(
    new GetFunctionConfigurationCommand({
      FunctionName: functionName,
    })
  ).catch((err) => {
    throw new Error(`Failed to lookup function: ${functionName}\n${err.message}`);
  });
  
  const layerArns = functionConfiguration.Layers.map((layer) => layer.Arn);

  // check that function has layer: `layerName`
  const layerIdx = layerArns.findIndex((arn) =>
    arn.startsWith(`${layer.LayerArn}:`)
  );
  if (!~layerIdx) {
    throw new Error(`Could not find layer: ${layerName} on function: ${functionName}`);
  }

  // check that function layer isn't already correct version
  if (layerArns[layerIdx] === layer.LayerVersionArn) {
    // console.log(`function: ${functionName} already has layer: ${layerName} v${layerVersion}`);
    return {
      functionName,
      layerName,
      layerVersion,
      updated: false,
    }
  }

  // update function configuration
  layerArns[layerIdx] = layer.LayerVersionArn;
  const updatedFunctionConfiguration = await lambdaClient.send(
    new UpdateFunctionConfigurationCommand({
      FunctionName: functionName,
      Layers: layerArns,
    })
  ).catch((err) => {
    throw new Error(`Failed to update function: ${functionName}\n${err.message}`);
  });

  return {
    functionName,
    layerName,
    layerVersion,
    updated: true,
  };

}

module.exports = UpdateFunctionLayer;
