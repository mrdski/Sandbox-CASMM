'use strict';

module.exports = {
  /**
   * Get the current student(s) saves for an activity
   *
   * @param {*} ctx
   */
  async findByActivity(ctx) {
    const { ids, session } = ctx.state.user;
    const { activity } = ctx.params;

    const allSaves = await strapi.services.save.find({ student: ids, activity });

    const saves = {
      current: allSaves.find((save) => save.session.id === session),
      past: allSaves.filter((save) => save.session.id !== session),
    };

    return saves;
  },

  async create(ctx) {
    // ensure request was not sent as formdata
    if (ctx.is('multipart'))
      return ctx.badRequest('Multipart requests are not accepted!', {
        id: 'Save.create.format.invalid',
        error: 'ValidationError',
      });

    // ensure the request has the right number of params
    const params = Object.keys(ctx.request.body).length;
    if (params !== 3)
      return ctx.badRequest('Invalid number of params!', {
        id: 'Save.create.body.invalid',
        error: 'ValidationError',
      });

    // validate the request
    // at somept validate the xml...could lead to bad things...
    const { activity, workspace, replay } = ctx.request.body;
    if (!strapi.services.validator.isInt(activity) || !workspace)
      return ctx.badRequest('A activity and workspace must be provided!', {
        id: 'Save.create.body.invalid',
        error: 'ValidationError',
      });

    // ensure the activity is valid
    const validActivity = await strapi.services.activity.findOne({ id: activity });
    if (validActivity === null)
      return ctx.notFound('The activity provided is invalid!', {
        id: 'Save.create.activity.invalid',
        error: 'ValidationError',
      });

    // get the current student(s) and session
    const { ids, session } = ctx.state.user;

    // get the save(s) for the student(s) for the target activity and session
    const saves = await strapi.services.save.find({
      student: ids,
      activity,
      session,
    });

    // create a student saves map
    const studentSaves = {};
    saves.forEach((save) => (studentSaves[save.student.id] = save.id));

    // create/update a save for each student(s)
    return await Promise.all(
      ids.map((id) => {
        // save exists, update
        const saveId = studentSaves[id];
        if (saveId)
          return strapi.services.save.update(
            { id: saveId },
            { workspace, replay }
          );

        // else, create a new save
        return strapi.services.save.create({
          student: id,
          activity,
          workspace,
          session,
          replay,
        });
      })
    );
  },
};
