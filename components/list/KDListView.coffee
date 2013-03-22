class KDListView extends KDView

  constructor:(options = {}, data)->

    options.type       or= "default"
    options.lastToFirst ?= no
    options.cssClass     = if options.cssClass? then "kdlistview kdlistview-#{options.type} #{options.cssClass}" else "kdlistview kdlistview-#{options.type}"

    @items = [] unless @items

    super options,data

  empty:->

    for item,i in @items
      item.destroy() if item?
    @items = []

  keyDown:(event)->

    event.stopPropagation()
    event.preventDefault()
    @emit "KeyDownOnList", event

  _addItemHelper:(itemData, options)->

    {index, animation, viewOptions} = options
    {itemChildClass, itemChildOptions} = @getOptions()
    viewOptions or= @customizeItemOptions?(options, itemData) or {}
    viewOptions.delegate = @
    viewOptions.childClass or= itemChildClass
    viewOptions.childOptions = itemChildOptions

    itemInstance = new (viewOptions.itemClass ? @getOptions().itemClass ? KDListItemView) viewOptions, itemData
    @addItemView itemInstance, index, animation

    return itemInstance

  addHiddenItem:(item, index, animation)->

    @_addItemHelper item, {
      viewOptions :
        isHidden  : yes
        cssClass  : 'hidden-item'
      index
      animation
    }

  addItem:(itemData, index, animation)->
    @_addItemHelper itemData, {index, animation}

  removeItem:(itemInstance, itemData, index)->

    if index?
      @emit 'ItemIsBeingDestroyed', { view : @items[index], index : index }
      item = @items.splice index,1
      item[0].destroy()
      return
    else
      for item,i in @items
        if itemInstance is item or itemData is item.getData()
          @emit 'ItemIsBeingDestroyed', { view : item, index : i }
          @items.splice i,1
          item.destroy()
          return

  removeItemByData:(itemData)->
    @removeItem null, itemData

  removeItemByIndex:(index)->
    @removeItem null, null, index

  destroy:(animated = no, animationType = "slideUp", duration = 100)->

    for item in @items
      # log "destroying listitem", item
      item.destroy()
    super()

  addItemView:(itemInstance,index,animation)->

    @emit 'ItemWasAdded', itemInstance, index
    if index?
      actualIndex = if @getOptions().lastToFirst then @items.length - index - 1 else index
      @items.splice actualIndex, 0, itemInstance
      @appendItemAtIndex itemInstance, index, animation
    else
      @items[if @getOptions().lastToFirst then 'unshift' else 'push'] itemInstance
      @appendItem itemInstance, animation
    itemInstance

  appendItem:(itemInstance, animation)->
    itemInstance.setParent @
    scroll = @doIHaveToScroll()
    # @items.push itemInstance
    if animation?
      itemInstance.$().hide()
      @$()[if @getOptions().lastToFirst then 'prepend' else 'append'] itemInstance.$()
      itemInstance.$()[animation.type] animation.duration,()=>
        itemInstance.propagateEvent KDEventType: 'introEffectCompleted'
    else
      @$()[if @getOptions().lastToFirst then 'prepend' else 'append'] itemInstance.$()
    if scroll
      @scrollDown()
    if @parentIsInDom
      itemInstance.emit 'viewAppended'
    null

  appendItemAtIndex:(itemInstance,index,animation)->

    itemInstance.setParent @
    actualIndex = if @getOptions().lastToFirst then @items.length - index - 1 else index
    if animation?
      itemInstance.$().hide()
      @$()[if @getOptions().lastToFirst then 'append' else 'prepend'] itemInstance.$() if index is 0
      @items[actualIndex-1].$()[if @getOptions().lastToFirst then 'before' else 'after']  itemInstance.$() if index > 0
      itemInstance.$()[animation.type] animation.duration,()=>
        itemInstance.propagateEvent KDEventType: 'introEffectCompleted'
        # itemInstance.handleEvent { type : "viewAppended"}
    else
      @$()[if @getOptions().lastToFirst then 'append' else 'prepend'] itemInstance.$() if index is 0
      @items[actualIndex-1].$()[if @getOptions().lastToFirst then 'before' else 'after']  itemInstance.$() if index > 0
      # @items[actualIndex].$()[if @getOptions().lastToFirst then 'after' else 'before']  itemInstance.$()
      # itemInstance.handleEvent { type : "viewAppended"}
    if @parentIsInDom
      itemInstance.emit 'viewAppended'
    null

  scrollDown: ->

    clearTimeout @_scrollDownTimeout
    @_scrollDownTimeout = setTimeout =>
      scrollView    = @$().closest(".kdscrollview")
      slidingView   = scrollView.find '> .kdview'

      # scrollTop         = scrollView.scrollTop()
      slidingHeight     = slidingView.height()
      # scrollViewheight  = scrollView.height()
      # scrollDown        = slidingHeight - scrollViewheight - scrollTop
      scrollView.animate (scrollTop : slidingHeight), (duration: 200, queue: no)
    , 50

  doIHaveToScroll: ->

    scrollView = @$().closest(".kdscrollview")
    if @getOptions().autoScroll
      if scrollView.length and scrollView[0].scrollHeight <= scrollView.height()
        yes
      else
        @isScrollAtBottom()
    else
      no

  isScrollAtBottom: ->

    scrollView        = @$().closest(".kdscrollview")
    slidingView       = scrollView.find '> .kdview'

    scrollTop         = scrollView.scrollTop()
    slidingHeight     = slidingView.height()
    scrollViewheight  = scrollView.height()

    if slidingHeight - scrollViewheight is scrollTop
      return yes
    else
      return no

