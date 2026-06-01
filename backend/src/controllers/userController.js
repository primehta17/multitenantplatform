import * as userService from '../services/userService.js'

export const getUsers = async (req,res,next) => {
  try{
     const result = await userService.getOrgUsers(req.user)
     res.json(result)
    }
  catch(err){
      next(err);
  }
}

export const inviteUser = async (req,res,next) => {
   try{
    const result = await userService.inviteUser(req.body, req.user);
    res.status(201).json(result);
   }
   catch(err){
    next(err)
   }
}

export const changeRole = async (req,res,next) => {
  try{
   const result = await userService.changeUserRole(req.params.id, req.body.role, req.user);
   res.json(result);
  }
  catch(err){
   next(err)
  }
}