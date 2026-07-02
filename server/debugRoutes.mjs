import router from './routes/recurringRoutes.js';
const routes = router.stack.filter(layer => layer.route).map(layer => ({ path: layer.route.path, methods: layer.route.methods }));
console.log(JSON.stringify(routes, null, 2));
