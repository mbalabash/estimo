void (function () {
    var smoke = {}
  
    // Options:
    smoke.ok = 'Ok' // Text for "Ok" button.
    smoke.ok_reference = undefined // Instead of text, clone the supplied element and apply the "Ok" button features to that clone.
    smoke.cancel = 'Cancel' // Text for "Cancel" button.
    smoke.cancel_reference = undefined // Instead of text, clone the supplied element and apply the "Cancel" button features to that clone.
    smoke.point_event = 'click' // Point event ("click", "touchstart", etc.)
    smoke.parent = document.body // Where the smoke div attaches. Note that if this is undefined (because document.body hasn't been added yet), the build function attempts to define it as document.body when the build function is run --that is, when the smoke DOM object is created.
    smoke.zindex = 10000 // Z-index of the smoke DOM object. This should be a high number.
    smoke.reverse_buttons = false // If false, the "Ok" button appears before (left of) the "Cancel" button. If true, the "Cancel" button appears before the "Ok" button.
    smoke.autofocus = true // If true, the input is automatically focused when the smoke DOM object is created.
    smoke.autoexit = true // If true, clicking outside the smoke dialog (but inside the dialog_wrapper) detaches the smoke DOM object, cleans up event listeners, and runs the callback with a parameter of (false, evt).
    smoke.autoclose = true // If true, clicking any regular button that would normally close a dialog (.e.g.: "ok", "cancel") actually closes the dialog (detaches it / cleans up listeners). Otherwise, "dialog.close()" must be run manually.
    smoke.custom_css = {} // Custom classes for each object in the structure. E.G.: smoke.custom_css = {"button.ok": "my_ok_button_style"} or smoke.custom_css = {"buttons.ok": ["my_ok_button_style1", "my_ok_button_style2"]}
    smoke.css_prefix = 'smoke' // The CSS prefix for the classes used in the .build function.
    smoke.value = undefined // The initial value to set the prompt input text to.
    smoke.callback = undefined // Function to run after user input is sent.
    smoke.observe_mutation = true // If true, attachess a mutation observer that will destroy the keyboard listeners when the element is removed from the DOM.
    smoke.window_opened = undefined // Function that runs at the end of smoke.build. Is in the form of "function (dom_window_object, text, processed_params)".
    smoke.window_closed = undefined // Function that runs after the object is removed from the DOM. Is in the form of "function (dom_window_object, text, processed_params)". Requires observe_mutation to be true for full functionality.
    smoke.use_wrapper = true // For older browsers, we have a wrapper in between the base and the modal.
  
    smoke.title = {} // Title element with the below options. Required in order to have a close button.
    smoke.title.text = undefined // Title text. If you don't want title text, don't define this.
    smoke.title.close = undefined // Text for a "close" button. If you don't want a close button in the title, don't define this.
    smoke.title.close_reference = undefined // Instead of text, clone the supplied element and apply the "Cancel" button features to that clone.
  
    smoke.extension = [] // Extension functions.
    smoke.build = function (text, params) {
      if (typeof smoke.parent == 'undefined' || smoke.parent == null) smoke.parent = document.body
      var ok = typeof params.ok != 'undefined' ? params.ok : smoke.ok
      var ok_reference =
        typeof params.ok_reference != 'undefined' ? params.ok_reference : smoke.ok_reference
      var cancel = typeof params.cancel != 'undefined' ? params.cancel : smoke.cancel
      var cancel_reference =
        typeof params.cancel_reference != 'undefined'
          ? params.cancel_reference
          : smoke.cancel_reference
      var point_event =
        typeof params.point_event != 'undefined' ? params.point_event : smoke.point_event
      var parent = typeof params.parent != 'undefined' ? params.parent : smoke.parent
      var zindex = typeof params.zindex != 'undefined' ? params.zindex : smoke.zindex
      var reverse_buttons =
        typeof params.reverse_buttons != 'undefined' ? params.reverse_buttons : smoke.reverse_buttons
      var autoexit = typeof params.autoexit != 'undefined' ? params.autoexit : smoke.autoexit
      var autofocus = typeof params.autofocus != 'undefined' ? params.autofocus : smoke.autofocus
      var autoclose = typeof params.autoclose != 'undefined' ? params.autoclose : smoke.autoclose
      var custom_css = typeof params.custom_css != 'undefined' ? params.custom_css : smoke.custom_css
      var css_prefix = typeof params.css_prefix != 'undefined' ? params.css_prefix : smoke.css_prefix
      var input_default_value = typeof params.value != 'undefined' ? params.value : smoke.value
      var callback = typeof params.callback != 'undefined' ? params.callback : smoke.callback
      var observe_mutation =
        typeof params.observe_mutation != 'undefined'
          ? params.observe_mutation
          : smoke.observe_mutation
      var title =
        typeof params.title != 'undefined' ? merge_objects(smoke.title, params.title) : smoke.title
      var window_opened =
        typeof params.window_opened != 'undefined' ? params.window_opened : smoke.window_opened
      var window_closed =
        typeof params.window_closed != 'undefined' ? params.window_closed : smoke.window_closed
      var use_wrapper =
        typeof params.use_wrapper != 'undefined' ? params.use_wrapper : smoke.use_wrapper
      var window_closed_ran = false
      params.point_event = point_event
      params.callback = callback
      params.autoclose = autoclose
  
      var modal = document.createElement('div')
      modal.className = css_prefix + '-base'
      modal.style.zIndex = zindex
      modal.savedScrollTop = parent.scrollTop
      parent.appendChild(modal)
  
      if (use_wrapper) {
        var dialog_wrapper = (modal.dialog_wrapper = document.createElement('div'))
        dialog_wrapper.className = css_prefix + '-dialog_wrapper'
        modal.appendChild(dialog_wrapper)
      } else {
        var dialog_wrapper = modal
      }
  
      // Add an event listener for when the user clicks outside of the dialog, but inside the dialog wrapper.
      // If activated, the parent smoke div removes itself and calls the callback.
      if (autoexit) {
        setTimeout(function () {
          dialog_wrapper.addEventListener(point_event, function (evt) {
            if (evt.currentTarget != evt.target) return
            evt.stopPropagation()
            evt.preventDefault()
            modal.dialog.close(false)
            if (!window_closed_ran && smoke.window_closed) {
              smoke.window_closed(modal, text, params)
              window_closed_ran = true
            }
          })
        }, 0)
      }
  
      // Create the dialog element.
      var dialog = (modal.dialog = document.createElement('div'))
      dialog.className = css_prefix + '-dialog'
      dialog_wrapper.appendChild(dialog)
    }
})

