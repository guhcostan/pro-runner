const Joi = require('joi');

const userCreateSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  height: Joi.number().min(100).max(250).required(), // em cm
  weight: Joi.number().min(30).max(200).required(), // em kg
  personal_record_5k: Joi.string().pattern(/^([0-5]?[0-9]):([0-5][0-9])$/).required(), // formato MM:SS
  goal: Joi.string().valid(
    'start_running',
    'run_5k',
    'run_10k',
    'half_marathon',
    'marathon',
    'improve_time'
  ).required(),
  weekly_frequency: Joi.number().integer().min(1).max(6).required(), // frequência semanal de treinos
  auth_user_id: Joi.string().uuid().optional() // Para integração com Supabase auth
});

const planCreateSchema = Joi.object({
  userId: Joi.string().uuid().required(),
  force: Joi.boolean().optional().default(false)
});

module.exports = {
  userCreateSchema,
  planCreateSchema
}; 