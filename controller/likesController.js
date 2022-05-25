// Imports
var models   = require('../models');
var jwtUtils = require('../utils/jwt.utils');
var asyncLib = require('async');

// Constants
const DISLIKED = 0;
const LIKED    = 1;

// Routes
module.exports = {
    likePost: function(req, res) {
        // Getting auth header
        var headerAuth  = req.headers['authorization'];
        var userId      = jwtUtils.getUserId(headerAuth);

        // Params
        var publicationId = parseInt(req.params.publicationId);

        if (publicationId <= 0) {
            return res.status(400).json({ 'error': 'invalid parameters' });
        }

        asyncLib.waterfall([
            function(done) {
                models.Publication.findOne({
                    attributes:['id','title','likes'],
                    where: { id: publicationId }
                })
                    .then(function(publicationFound) {
                        done(null, publicationFound);
                    })
                    .catch(function(err) {
                        return res.status(500).json({ 'error': 'unable to verify publication' });
                    });
            },
            function(publicationFound, done) {
                if(publicationFound) {
                    models.User.findOne({
                        attributes:['id'],
                        where: { id: userId }
                    })
                        .then(function(userFound) {
                            done(null, publicationFound, userFound);
                        })
                        .catch(function(err) {
                            return res.status(500).json({ 'error': 'unable to verify user' });
                        });
                } else {
                    res.status(404).json({ 'error': 'post already liked' });
                }
            },
            function(publicationFound, userFound, done) {
                if(userFound) {
                    models.Like.findOne({
                        where: {
                            userId: userId,
                            publicationId: publicationId
                        }
                    })
                        .then(function(userAlreadyLikedFound) {
                            done(null, publicationFound, userFound, userAlreadyLikedFound);
                        })
                        .catch(function(err) {
                            return res.status(500).json({ 'error': 'unable to verify is user already liked' });
                        });
                } else {
                    res.status(404).json({ 'error': 'user not exist' });
                }
            },
            function(publicationFound, userFound, userAlreadyLikedFound, done) {
                if(!userAlreadyLikedFound) {
                    models.Like.create({
                        publicationId : publicationFound.id,
                        userId : userFound.id,
                        isLike: LIKED
                    }).then(function (alreadyLikeFound) {
                        done(null, publicationFound, userFound);
                    })
                        .catch(function(err) {
                            return res.status(500).json({ 'error': 'unable to set user reaction' });
                        });
                } else {
                    if (userAlreadyLikedFound.isLike === DISLIKED) {
                        models.Like.update({
                            isLike: LIKED
                        }, {where: {
                                publicationId : publicationFound.id,
                                userId : userFound.id
                            } }).then(function() {
                            done(null, publicationFound, userFound);
                        }).catch(function(err) {
                            res.status(500).json({ 'error': 'cannot update user reaction' });
                        });
                    } else {
                        res.status(409).json({ 'error': 'publication already liked' });
                    }
                }
            },
            function(publicationFound, userFound, done) {
                publicationFound.update({
                    likes: publicationFound.likes + 1,
                }).then(function() {
                    done(publicationFound);
                }).catch(function(err) {
                    res.status(500).json({ 'error': 'cannot update publication like counter' });
                });
            },
        ], function(publicationFound) {
            if (publicationFound) {
                return res.status(201).json(publicationFound);
            } else {
                return res.status(500).json({ 'error': 'cannot update publication' });
            }
        });
    },
    dislikePost: function(req, res) {
        // Getting auth header
        var headerAuth  = req.headers['authorization'];
        var userId      = jwtUtils.getUserId(headerAuth);

        // Params
        var publicationId = parseInt(req.params.publicationId);

        if (publicationId <= 0) {
            return res.status(400).json({ 'error': 'invalid parameters' });
        }

        asyncLib.waterfall([
            function(done) {
                models.Publication.findOne({
                    attributes:['id','likes'],
                    where: { id: publicationId }
                })
                    .then(function(publicationFound) {
                        done(null, publicationFound);
                    })
                    .catch(function(err) {
                        return res.status(500).json({ 'error': 'unable to verify publication' });
                    });
            },
            function(publicationFound, done) {
                if(publicationFound) {
                    models.User.findOne({
                        attributes:['id','username'],
                        where: { id: userId }
                    })
                        .then(function(userFound) {
                            done(null, publicationFound, userFound);
                        })
                        .catch(function(err) {
                            return res.status(500).json({ 'error': 'unable to verify user' });
                        });
                } else {
                    res.status(404).json({ 'error': 'post already liked' });
                }
            },
            function(publicationFound, userFound, done) {
                if(userFound) {
                    models.Like.findOne({
                        where: {
                            userId: userId,
                            publicationId: publicationId
                        }
                    })
                        .then(function(userAlreadyLikedFound) {
                            done(null, publicationFound, userFound, userAlreadyLikedFound);
                        })
                        .catch(function(err) {
                            return res.status(500).json({ 'error': 'unable to verify is user already liked' });
                        });
                } else {
                    res.status(404).json({ 'error': 'user not exist' });
                }
            },
            function(publicationFound, userFound, userAlreadyLikedFound, done) {
                if(!userAlreadyLikedFound) {
                    models.Like.create({
                        publicationId : publicationId,
                        userId : userId,
                        isLike: DISLIKED
                    })
                        .then(function (alreadyLikeFound) {
                            done(null, publicationFound, userFound);
                        })
                        .catch(function(err) {
                            return res.status(500).json({ 'error': 'unable to set user reaction' });
                        });
                } else {
                    if (userAlreadyLikedFound.isLike === LIKED) {
                        models.Like.update({
                            isLike: DISLIKED
                        }, {where: {
                                publicationId : publicationFound.id,
                                userId : userFound.id
                            } }).then(function() {
                            done(null, publicationFound, userFound);
                        }).catch(function(err) {
                            res.status(500).json({ 'error': 'cannot update user reaction' });
                        });
                    } else {
                        res.status(409).json({ 'error': 'publication already disliked' });
                    }
                }
            },
            function(publicationFound, userFound, done) {
                publicationFound.update({
                    likes: publicationFound.likes - 1,
                }).then(function() {
                    done(publicationFound);
                }).catch(function(err) {
                    res.status(500).json({ 'error': 'cannot update publication like counter' });
                });
            },
        ], function(publicationFound) {
            if (publicationFound) {
                return res.status(201).json(publicationFound);
            } else {
                return res.status(500).json({ 'error': 'cannot update publication' });
            }
        });
    }
}