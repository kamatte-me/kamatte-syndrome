const Koa = require('koa');
const { Nuxt, Builder } = require('nuxt');

const config = require('./nuxt.config.js');

async function start() {
  const app = new Koa();

  config.dev = !(app.env === 'production');
  const nuxt = new Nuxt(config);

  // Build in development
  if (config.dev) {
    const builder = new Builder(nuxt);
    await builder.build();
  }

  app.use(async (ctx, next) => {
    try {
      await next();
    } catch (err) {
      ctx.status = err.statusCode || err.status || 500;
      ctx.body = err.message;
      ctx.app.emit('error', err);
    }

    ctx.status = 200;
    return new Promise((resolve, reject) => {
      ctx.res.on('close', resolve);
      ctx.res.on('finish', resolve);
      nuxt.render(ctx.req, ctx.res, (promise) => {
        promise.then(resolve).catch(reject);
      });
    });
  });

  app.on('error', (err) => {
    console.error(err);
  });

  const port = config.dev ? 3000 : 8080;
  app.listen(port);
  console.log(`Server listening on http://localhost:${port}`);
}

start();
