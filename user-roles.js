/* Copyright (c) 2014 Richard Rodger, MIT License */
"use strict";


var _ = require('underscore')



module.exports = function( options ) {
  var seneca = this
  var plugin   = 'user-roles'


  options = seneca.util.deepextend({
    roles:{
      'user':{
        prefixmap:{"/account":1}
      },
      'staff':{
        prefixmap:{"/staff":1}
      },
      'admin':{
        prefixmap:{"/admin":1}
      },
    }
  },options)
  

  // web interface
  seneca.act({role:'web', use:function(req,res,next){
    var user = req.seneca.user

    if( user ) {
      // TODO: add role perms to user perms

      // Set URL access
      var access = req.seneca.context.access = (req.seneca.context.access||{})

      access.prefixmap = {}
      _.each( user.roles, function(role) {
        _.extend(access.prefixmap, options.roles[role].prefixmap)
      })
    }

    return next();
  }})



  return {
    name: plugin
  }
}
