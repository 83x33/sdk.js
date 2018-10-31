# sdk33

NodeJs/Browser compatible SDK for the 8333.io platform.

## Install with node

```js
// install
npm install sdk33 --save

// import
import sdk33 from 'sdk33'
```

## Install Web

Include the SDK dependencies:
```html
<script type="text/javascript" src="https://unpkg.com/axios@0.18.0/dist/axios.min.js"></script>
<script type="text/javascript" src="https://unpkg.com/socket.io-client@2.1.1/dist/socket.io.js"></script>
```

Include the SDK:
```html
<script type="text/javascript" src="https://unpkg.com/sdk33"></script>
```

## chain(network=mainnet)

```js
sdk33.chain()
  .on('tip', console.log)
  .on('block', console.log)
  .emit('tip')
```

## payInvoice()

```html
<script type="text/javascript">
  function PayWithBitcoin(){
    sdk33.payInvoice('invoiceID', (status, widget) => {
      // custom logic on status change
      if(status == 'success') doSomething()
    })
  }
</script>

<a onclick="PayWithBitcoin()">
  Click to Pay
</a>
```

## payNewInvoice()

```html
<script type="text/javascript">
  function PayWithBitcoin(amount){
    sdk33.payNewInvoice({ wid: 'walletID', amount }, (status, widget) => {
      // custom logic on status change
      if(status == 'success') doSomething()
    })
  }
</script>

<a onclick="PayWithBitcoin('20-eur')">
  Click to Pay
</a>
```