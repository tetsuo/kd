KD             = require './kd'
KDEventEmitter = require './eventemitter'
_              = require 'lodash'

module.exports =

class KDObject extends KDEventEmitter

  [NOTREADY, READY] = [0,1]

  utils: KD.utils

  constructor:(options = {}, data)->

    @id or= options.id or KD.utils.getUniqueId()
    @setOptions options
    @setData data  if data
    @setDelegate options.delegate if options.delegate
    @registerKDObjectInstance()

    super

    if options.testPath
      KD.registerInstanceForTesting this

    @on   'error', console.error.bind console
    @once 'ready', => @readyState = READY


  define: (property, options) ->

    options = { get: options }  if 'function' is typeof options
    Object.defineProperty this, property, options


  bound: (fn, rest...) -> _.bind fn, this, rest...


  forwardEvent: (target, eventName, prefix="") ->
    target.on eventName, @bound @emit, prefix + eventName


  forwardEvents: (target, eventNames, prefix="") ->
    @forwardEvent target, eventName, prefix  for eventName in eventNames


  ready: (listener) ->

    if Promise?::nodeify
      new Promise (resolve) =>
        resolve() if @readyState is READY
        @once 'ready', resolve
      .nodeify listener
    else if @readyState is READY then @utils.defer listener
    else @once 'ready', listener


  registerSingleton: KD.registerSingleton

  registerKDObjectInstance: -> KD.registerInstance this


  getInstance: (instanceId) ->
    KD.getAllKDInstances()[instanceId] ? null

  getSingleton : KD.getSingleton
  getData      : -> @data
  getOptions   : -> @options
  getOption    : (key) -> @options[key] ? null
  getId        : -> @id
  getDelegate  : -> @delegate


  setData     : (@data)         -> throw 'not implemented'
  setOptions  : (@options = {}) -> throw 'not implemented'
  setDelegate : (@delegate)     -> throw 'not implemented'
  setOption   : (option, value) -> @options[option] = value

  unsetOption: (option) -> delete @options[option] if @options[option]


  changeId: (id) ->

    KD.deleteInstance id
    @id = id
    KD.registerInstance @


  destroy: ->

    @isDestroyed = yes
    @emit 'KDObjectWillBeDestroyed'
    KD.deleteInstance @id
    # good idea but needs some refactoring
    # @[prop] = null  for own prop of this


  chainNames: (options) -> "#{options.chain}.#{options.newLink}"
