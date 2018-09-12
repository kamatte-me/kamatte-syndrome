const Koa = require('koa');
const { Nuxt } = require('nuxt');

async function start() {
  const app = new Koa();

  const config = require('./nuxt.config.js');
  const nuxt = new Nuxt(config);

  app.use(async (ctx, next) => {
    try {
      await next();
    } catch (err) {
      ctx.status = err.statusCode || err.status || 500;
      ctx.body = err.message;
      ctx.app.emit('error', err);
    }

    ctx.status = 200;
    ctx.set('Cache-Control', 'public, max-age=10800');
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

  const port = process.env.PORT || 3000;
  app.listen(port);
}

start();
