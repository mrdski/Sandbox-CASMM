'use strict';

const { sanitizeEntity } = require('strapi-utils/lib');

module.exports = {
  // Create workspace template and block list
  async create(ctx) {
    let workspace = {
      name: '',
      description: '',
      template: '',
      blocks: [],
    };
    workspace.template = ctx.request.body.template;
    workspace.name = ctx.request.body.name;
    workspace.description = ctx.request.body.description;
    let unfriendlyBlocks = ctx.request.body.blocks;
    let friendlyBlocks = [];
    for (let i = 0; i < unfriendlyBlocks.length; i++) {
      let currentBlock = await strapi.services.block.findOne({
        name: unfriendlyBlocks[i],
      });
      friendlyBlocks.push(currentBlock);
    }
    workspace.blocks = friendlyBlocks;

    const classroomId = ctx.request.body.classroomId;
    let classroom = null;

    if(classroomId){
      classroom = await strapi.services.classroom.findOne({id: classroomId});
    }

    workspace.classroom = classroom;

    const createdWorkspace = await strapi.services['authorized-workspace'].create(
      workspace
    );
    return sanitizeEntity(createdWorkspace, {
      model: strapi.models['authorized-workspace'],
    });
  },

  // overload the find to only return workspaces that don't belong to any classrooms
  async find(ctx){
    const workspaces = await strapi.services['authorized-workspace'].find({classroom_null: true});
    return workspaces;
  },
  // Update workspace template and block list
  async update(ctx) {
    // find the activity
    const { id } = ctx.params;
    let workspace = await strapi.services['authorized-workspace'].findOne({ id: id });
    if (!workspace)
      return ctx.notFound('Invalid workspace id', {
        id: 'authorized-workspace.id.invalid',
        error: 'ValidationError',
      });

    // update template and blocks
    workspace.template = ctx.request.body.template;
    let unfriendlyBlocks = ctx.request.body.blocks;
    let friendlyBlocks = [];
    for (let i = 0; i < unfriendlyBlocks.length; i++) {
      let currentBlock = await strapi.services.block.findOne({
        name: unfriendlyBlocks[i],
      });
      friendlyBlocks.push(currentBlock);
    }
    workspace.blocks = friendlyBlocks;

    const updatedWorkspace = await strapi.services['authorized-workspace'].update(
      { id: id },
      workspace
    );
    return sanitizeEntity(updatedWorkspace, {
      model: strapi.models['authorized-workspace'],
    });
  },

  async toolbox(ctx) {
    const { id } = ctx.params;

    // get the blocks
    const blocks = await strapi.services.block.findByWorkspace(id);

    // return 404 if blocks is undefined
    // (only the case of an activity not existing)
    if (!blocks) return undefined;

    // return the activity id and the toolbox
    return {
      id,
      toolbox: strapi.services.block.blocksToToolbox(blocks),
    };
  },
};
