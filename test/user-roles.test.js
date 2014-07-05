/* Copyright (c) 2014 Richard Rodger, MIT License */
"use strict";

// mocha project.test.js


var seneca  = require('seneca')

var assert  = require('assert')

var _      = require('underscore')


describe('web-access', function() {

  it('happy', function(fin) {
    var si = seneca()
          .use(function(){
            this.act({role:'web', use:function(req,res,next){
              _.extend(req.seneca,req.seneca_add)
              next()
            }})
          })
          .use('..')
          .use('web-access',{prefixlist:[
            '/account',
            '/staff',
            '/admin',
            '/never',
          ]})

    si.ready( function() {
            
      var mw = si.export('web')

      var call = {}

      function writeHead(code){
        call.code = code
      }


      open_nouser()

      function open_nouser() {
        call = {}
        mw(
          {
            url: '/open'
          },
          {      
            writeHead: writeHead,
            end:       function() {
              assert(!call.code)
              assert.fail()
            }
          },
          function(){
            closed_nouser()
          })
      }


      function closed_nouser() {
        call = {}
        mw(
          {
            url: '/account'
          },
          {      
            writeHead: writeHead,
            end:       function() {
              assert(401,call.code)
              open_user_noroles()
            }
          },
          function(){
            assert.fail()
          })
      }


      function open_user_noroles() {
        call = {}
        mw(
          {
            seneca_add:{user: {}},
            url:  '/open'
          },
          {      
            writeHead: writeHead,
            end:       function() {
              assert(!call.code)
              assert.fail()
            }
          },
          function(){
            open_user_role()
          })
      }


      function open_user_role() {
        call = {}
        mw(
          {
            seneca_add:{user: {roles:['user']}},
            url:  '/open'
          },
          {      
            writeHead: writeHead,
            end:       function() {
              assert(!call.code)
              assert.fail()
            }
          },
          function(){
            closed_user_role_allow()
          })
      }


      function closed_user_role_allow() {
        call = {}
        mw(
          {
            seneca_add:{user: {roles:['user']}},
            url:  '/account'
          },
          {      
            writeHead: writeHead,
            end:       function() {
              assert(!call.code)
              assert.fail()
            }
          },
          function(){
            closed_user_role_block()
          })
      }


      function closed_user_role_block() {
        call = {}
        mw(
          {
            seneca_add:{user: {roles:['user']}},
            url:  '/staff'
          },
          {      
            writeHead: writeHead,
            end:       function() {
              assert(401,call.code)
              fin()
            }
          },
          function(){
            assert.fail()
          })
      }
   })
  })    

})

