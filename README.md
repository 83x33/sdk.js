# sdk.js

## Install

Include the SDK to your page:
```html
<script type="text/javascript" src="https://www.8333.io/sdk.js"></script>
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