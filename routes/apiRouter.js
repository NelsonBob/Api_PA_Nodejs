// Imports
var express      =  require('express');
var usersController    = require('../controller/usersController');
var publicationsController = require('../controller/publicationsController');
var likesController    = require('../controller/likesController');

// Router
exports.router = (function() {
  var apiRouter = express.Router();

  // Users controller
  apiRouter.route('/users/register/').post(usersController.register);
  apiRouter.route('/users/login/').post(usersController.login);
  apiRouter.route('/users/me/').get(usersController.getUserProfile);
  apiRouter.route('/users/me/').put(usersController.updateUserProfile);
   
  // publications controller
  apiRouter.route('/publications/new/').post(publicationsController.createPublication);
  apiRouter.route('/publications/').get(publicationsController.listPublications);
 
  // Likes
  apiRouter.route('/publications/:publicationId/vote/like').post(likesController.likePost);
  apiRouter.route('/publications/:publicationId/vote/dislike').post(likesController.dislikePost);

  return apiRouter;
})();