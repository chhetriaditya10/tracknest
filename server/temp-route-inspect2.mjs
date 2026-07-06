import app from './index.js';
const mainRouter = app.router || app._router;
console.log('mainRouter exists:', !!mainRouter);

mainRouter.stack.forEach((layer, idx) => {
  const route = layer.route;
  const path = layer.path || (layer.regexp && layer.regexp.toString());
  console.log(`LAYER ${idx}: name=${layer.name} path=${path}`);
  console.log('  route:', route ? { path: route.path, methods: route.methods } : 'none');
  console.log('  regexp:', layer.regexp && layer.regexp.toString());
  console.log('  handle type:', typeof layer.handle, layer.handle && layer.handle.name);
  if (layer.handle && layer.handle.stack) {
    console.log('  nested router has stack length', layer.handle.stack.length);
    layer.handle.stack.forEach((inner, jdx) => {
      const innerRoute = inner.route;
      const innerPath = inner.path || (inner.regexp && inner.regexp.toString()) || (innerRoute && innerRoute.path);
      console.log(`    INNER ${jdx}: name=${inner.name} path=${innerPath} isRoute=${!!innerRoute}`);
      if (innerRoute) console.log('      inner route methods', innerRoute.methods);
    });
  }
});
