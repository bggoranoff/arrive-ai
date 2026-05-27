const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);

const originalResolveRequest = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (
    moduleName === "./Lists/VirtualizeUtils" &&
    context.originModulePath.includes("virtualized-lists")
  ) {
    return {
      type: "sourceFile",
      filePath: path.resolve(
        path.dirname(context.originModulePath),
        "Lists",
        "VirtualizeUtils.js"
      ),
    };
  }

  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }

  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
