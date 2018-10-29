import axios from 'axios/dist/axios.min.js'


const SDK = {}
const Clients = {}
const Widgets = {}
export default SDK

SDK.options = { 
    appUrl: 'https://www.8333.io'
  , apis: { 
        mainnet: 'https://api.8333.io'
      , testnet: 'https://testnet.8333.io'
    }
}

SDK.client = (network = 'mainnet') => {
  Clients[network] = Clients[network] || axios.create({
      baseURL: SDK.options.apis[network]
  })
  return Clients[network]
}

SDK.setOptions = (options) => (SDK.options = { ...SDK.options, ...options })


SDK.createInvoice = (invoice, network) => {
  return new Promise((resolve, reject) => 
    SDK.client(invoice.network || network).post('/invoices', invoice)
      .then(res => resolve(res.data))
      .catch(e => reject(e.response && e.response.data && e.response.data.error) || e.message || e)
  )
}

// Create a widget from an invoice ID
// syncronous function
// returns a widget instance syncronously (unlike payNewInvoice(), which is asyncronous)
SDK.payInvoice = (invoice, options, cb = (status, widget)=>{}) => {
  if(typeof invoice == 'string') invoice = { id: invoice }
  if(typeof options == 'function'){ cb = options; options = {}; }
  const widget = SDK.widget(invoice, options).onStatus(status => cb(status, widget))
  if(options.show !== false) widget.show()
  return widget
}

// Create a widget from a yet to be created invoice ID
// takes care of creating an invoice for you
// invoice argument requires a 'wid' key specifing which wallet ID the newly created invoice will be ratached to
// need to specify a 'network=tetsnet' key (to either invoice or options argument objects) for 'wid' that are testnet wallet.
// takes a status change callback
// amount is optionnal
// this function is meant to be bind to a call to action on your app
SDK.payNewInvoice = (invoice, options, cb = (status, widget)=>{}) => {
  if(typeof invoice == 'string') invoice = { wid: invoice }
  if(typeof options == 'function'){ cb = options; options = {}; }
  SDK.createInvoice(invoice)
    .then(invoice => {
      const widget = SDK.widget(invoice)
      widget.onStatus(status => cb(status, widget))
      if(options.show !== false) widget.show()
    })
    .catch(e => console.log('[sdk33:err]', e))
}


SDK.widgets = () => Widgets

SDK.widget = (invoice, {
    preloadIframe = true
  , network = 'mainnet'
  , theme = 'dark'
} = {}) => {
  // convert invoice to object
  invoice = typeof invoice == 'string' ? { id: invoice } : invoice || {}
  if(!invoice.id) throw new Error('No invoice provided')

  // overide network if provided in invoice
  network = invoice.network || network

  const { appUrl, apis } = SDK.options
  const apiUrl = apis[network]
  const invoiceUrl = appUrl + '/invoice/' + invoice.id + '?'+['network='+network, 'theme='+theme, 'framed=true'].join('&')

  const frame = {
      inited: false
    , containerId: 'sdk33-'+invoice.id
    , id: invoice.id+'-frame' //+((new Date%100))
    , events: {}
  }

  const dom = {  
    body: document.getElementsByTagName('body')[0],
    container: document.getElementById(frame.containerId),
    frame: document.getElementById(frame.id),
    css: document.getElementById('sdk33-css')
  }

  // iframe postMessage event handler
  const eventHandler = function(e){
    const data = e.data
    if(data == 'close') return frame.close()
    frame.emit('data', data)
  }

  const removeListener = function(f){
    if (window.removeEventListener){ window.removeEventListener("message", f) } 
    else if (window.detachEvent){ window.detachEvent("onmessage", f) }
  }

  const addListener = function(f){
    if (window.addEventListener){ window.addEventListener("message", f) } 
    else if (window.attachEvent){ window.attachEvent("onmessage", f) }
  }

  frame.init = function(){
    if(!frame.inited) addListener(eventHandler)
    frame.inited = true

    // TODO implement destroy() widget
    // write logic for cleaning/resetting widget dom 
    // if(dom.frame) dom.frame.parentNode.removeChild(dom.frame)

    // css
    if(!dom.css){
      dom.css = document.createElement('style')
      let css = ''
      css += '.sdk33-overlay {'
      css += 'transition:320ms opacity ease;transition:320ms opacity ease;'
      css += '-webkit-transition:320ms opacity ease;transition:320ms opacity ease;'
      css += 'display: none;position: fixed;'
      css += 'overflow-y: scroll;-webkit-overflow-scrolling: touch;'
      css += 'top: 0px;left: 0px;right: 0px;bottom: 0px;'
      css += 'background-color: rgba(0, 0, 0, 0.8);' 
      css += 'z-index: 9999;'
      css += '}'
      css += '.sdk33-frame {'
      css += 'min-height: 100%;height: 100%;'
      css += 'width: 100%;'
      css += '}'
      dom.css.innerHTML = css
      dom.body.appendChild(dom.css)
    } 

    // iframe
    dom.frame = document.createElement('iframe')
    dom.frame.id = frame.id
    dom.frame.className = 'sdk33-frame'
    dom.frame.src = invoiceUrl
    dom.frame.setAttribute('frameborder', '0')
    dom.frame.setAttribute('allowtransparency', 'true')
    dom.frame.setAttribute('scrolling', 'yes')

    // overlay
    dom.overlay = document.createElement('div')
    dom.overlay.id = frame.containerId
    dom.overlay.className = 'sdk33-overlay'
    dom.overlay.appendChild(dom.frame)
    
    // apend widget to page
    dom.body.appendChild(dom.overlay)

    // reference widget instance to glabal SDK widgets list
    Widgets[frame.containerId] = frame
    return frame
  }

  frame.show = function(){
    if(!frame.inited) return frame.init().show()
    dom.overlay.style.display = 'inline-block' // display overlay
    setTimeout(function(){ dom.overlay.style.opacity = 1 }, 200)
    return frame
  }

  frame.close = function(){
    dom.overlay.style.opacity = 0 // add opacity
    setTimeout(function(){ dom.overlay.style.display = 'none' }, 200)
    return frame
  }

  frame.emit = function(event, data){
    frame.events[event] && frame.events[event](data)
    return frame
  }

  frame.on = function(event, f){
    frame.events[event] = f
    return frame
  }

  frame.onStatus = function(f){
    frame.on('data', invoice => f(invoice.status))
    return frame
  }

  // auto init
  preloadIframe && frame.init()

  return frame
}