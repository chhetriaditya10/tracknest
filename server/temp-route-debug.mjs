import app from './index.js';

console.log('app.router exists:', !!app.router);
console.log('app._router exists:', !!app._router);

const mainRouter = app.router || app._router;

if (!mainRouter) {
  console.error('No main router found');
  process.exit(1);
}

console.log('mainRouter stack length:', mainRouter.stack.length);
mainRouter.stack.forEach((layer, idx) => {
  const route = layer.route;
  const path = layer.path || (layer.regexp && layer.regexp.toString());
  console.log(`LAYER ${idx}: name=${layer.name}, path=${path}, route=${route ? 'yes' : 'no'}`);
  if (route) {
    console.log('  route path:', route.path, 'methods:', route.methods);
  }
  if (layer.handle && layer.handle.stack) {
    console.log('  nested router stack length:', layer.handle.stack.length);
    layer.handle.stack.forEach((inner, jdx) => {
      const innerRoute = inner.route;
      const innerPath = innerRoute ? innerRoute.path : (inner.regexp && inner.regexp.toString());
      console.log(`    INNER ${jdx}: name=${inner.name}, path=${innerPath}, route=${innerRoute ? 'yes' : 'no'}`);
      if (innerRoute) {
        console.log('      inner route path:', innerRoute.path, 'methods:', innerRoute.methods);
      }
    });
  }
});
