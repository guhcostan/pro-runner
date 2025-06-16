import Joi from 'joi';

export const userCreateSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  height: Joi.number().min(100).max(250).required(), // em cm
  weight: Joi.number().min(30).max(200).required(), // em kg
  personal_record_5k: Joi.string().pattern(/^([0-5]?[0-9]):([0-5][0-9])$/).required(), // formato MM:SS
  goal: Joi.string().valid(
    'fazer_5km',
    'fazer_10km', 
    'meia_maratona',
    'maratona',
    'melhorar_tempo_5km',
    'melhorar_tempo_10km',
    'voltar_a_correr'
  ).required(),
  auth_user_id: Joi.string().uuid().optional() // Para integração com Supabase auth
});

export const planCreateSchema = Joi.object({
  userId: Joi.string().uuid().required()
}); 