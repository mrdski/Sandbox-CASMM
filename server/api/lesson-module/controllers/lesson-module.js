'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  async update(ctx) {
    const { id } = ctx.params;

    // ensure request was not sent as formdata
    if (ctx.is('multipart'))
      return ctx.badRequest('Multipart requests are not accepted!', {
        id: 'Learning-standard.update.format.invalid',
        error: 'ValidationError',
      });

    // validate the request
    const { name, expectations, standards } = ctx.request.body;
    if (!expectations || !name || !standards)
      return ctx.badRequest('A name, standards and expectations must be provided!', {
        id: 'Learning-standard.update.body.invalid',
        error: 'ValidationError',
      });

    return await strapi.services['lesson-module'].update(
      { id },
      ctx.request.body
    );
  },
};
