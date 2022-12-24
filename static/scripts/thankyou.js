const orderMessage = document.querySelector("p.order-number");
const params = new URLSearchParams(document.location.search)
const orderNumber = params.get("number")
orderMessage.textContent = `訂單編號：${orderNumber}`