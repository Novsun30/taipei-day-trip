# Taipei day trip
Taipei day trip is a tourism e-commerce website. \
Access here: <a href="http://52.69.110.95:3000" target="_blank">http://52.69.110.95:3000</a>

<img src="https://github.com/Novsun30/Assignments/assets/107986642/44f9f4a1-ba30-4a88-889c-7eb1c1160069" />

Image by <a href="https://www.freepik.com/free-vector/gradient-responsive-website-design_28627323.htm#query=responsive%20mockup&position=16&from_view=search&track=ais#position=16&query=responsive%20mockup">Freepik</a>


<br />

## Technology stack 

Taipei day trip was only using HTML, JavaScript, CSS and SCSS to build front-end. \
For back-end, it was manily built by Python Flask, used MySQL for database and deployed on AWS EC2. \
Taipei day trip also used a third party payment system (TapPay) to deal with online transaction.

+ Front-end:
  + HTML
  + CSS, SCSS
  + JavaScript
+ Back-end:
  + Python Flask
  + MySQL
  + AWS EC2 

## Features
+ Infinite scroll, carousel slider, pop-up modal
+ Responsive web design
+ Member Authentication
+ Member page that show order history and member data

## Demo account
  test00@test.com
  testtest

  備註: 卡片到期年份及月份使用超過目前年月份的效期即可

  卡號	CCV	結果
  4242 4242 4242 4242	123	0 - Success ( type : Visa )
  3543 9234 8838 2426	123	0 - Success ( type : JCB )
  3454 5465 4604 563	1234	0 - Success ( type : AMEX )
  5451 4178 2523 0575	123	0 - Success ( type : MASTERCARD )
  使用此卡號進行 3D 驗證時會直接授權成功
  6234 5774 3859 4899	123	0 - Success ( type : UnionPay )
  4716 3139 6829 4359	123	0 - Success ( type : Visa )
  使用此測試卡，會得到 bank_id 與 issuer_zh_tw 皆為空的情境
  4242 4202 3507 4242	123	915 - Unknown Error, please contact TapPay customer service
  4242 4216 0218 4242	123	10003 - Card Error
  4242 4222 0418 4242	123	10005 - Bank System Error
  4242 4240 1026 4242	123	10006 - Duplicate Transaction
  4242 4246 1228 4242	123	10008 - Bank Merchant Account Data Error
  4242 4264 1829 4242	123	10009 - Amount Error
  4242 4276 2229 4242	123	10013 - Order number duplicate
  4242 4288 2639 4242	123	10023 - Bank Error
  4242 4210 0008 4242	123	10015 = Redeem Failed
  
## License
This project is licensed under the terms of the MIT license.