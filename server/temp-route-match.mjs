import app from './index.js';
const mainRouter = app.router || app._router;
if (!mainRouter) {
  console.error('No main router');
  process.exit(1);
}
const pathToTest = '/api/balance';
const method = 'post';
mainRouter.stack.forEach((layer, idx) => {
  const canMatch = typeof layer.match === 'function';
  console.log(`LAYER ${idx} name=${layer.name} canMatch=${canMatch}`);
  if (canMatch) {
    try {
      const result = layer.match(pathToTest);
      console.log('  match result:', result);
    } catch (e) {
      console.log('  match error', e.message);
    }
  }
  if (layer.handle && layer.handle.stack) {
    console.log('  nested router', layer.handle.stack.length, 'inner layers');
    layer.handle.stack.forEach((inner, jdx) => {
      const canMatchInner = typeof inner.match === 'function';
      console.log(`    INNER ${jdx} name=${inner.name} canMatch=${canMatchInner}`);
      if (canMatchInner) {
        try {
          const result = inner.match(pathToTest);
          console.log('      inner match result:', result);
        } catch (e) {
          console.log('      inner match error', e.message);
        }
      }
    });
  }
});
