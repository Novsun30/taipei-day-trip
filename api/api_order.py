from flask import *
import mysql.connector, mysql.connector.pooling, jwt, datetime, requests, os
from dotenv import load_dotenv
load_dotenv()
api_order = Blueprint("api_order", __name__)
secret_key = os.getenv("JWT_KEY")

db_config = {
    "user": "root",
    "password": os.getenv("DB_PASSWORD"),
    "host": "127.0.0.1",
    "database": "taipei_day_trip"
}
cnx_pool = mysql.connector.pooling.MySQLConnectionPool(
    pool_name = "mypool",
    pool_size = 5,
    **db_config
)

@api_order.route("/api/orders", methods = ["POST"])
def api_orders_post():
    try:
        cnx = cnx_pool.get_connection()
        cursor = cnx.cursor()
        jwt_token = request.cookies.get("token")
        if jwt_token == None:
            return {"error": True, "message": "未登入"}, 403

        try:
            member_data = jwt.decode(jwt_token, secret_key, algorithms = "HS256")
        except:
            return {"error": True, "message": "未登入"}, 403

        member_id = member_data["id"]

        try:
            data = request.get_json()
            get_last_id = "SELECT id FROM `order` ORDER BY id DESC LIMIT 1"
            cursor.execute(get_last_id)
            last_id = cursor.fetchone()
            if last_id == None:
                last_id = 0
            else:
                last_id = last_id[0]
            new_id = str(last_id + 1)
            now = datetime.datetime.now()
            order_number = now.strftime("%Y%m%d%H%M%S") + new_id
            status = "未付款"
            create_order = """INSERT INTO `order`
            (order_number, status, member_id, name, email, phone, total_price)
            VALUES(%s, %s, %s, %s, %s, %s, %s)"""
            contact = data["contact"]
            cursor.execute(create_order, (
                order_number,
                status,
                member_id,
                contact["name"],
                contact["email"],
                contact["phone"],
                data["order"]["total_price"]
            ))
            cnx.commit()

            trips = data["order"]["trips"]
            for i in range(len(trips)):
                trips = data["order"]["trips"]
                create_order_detail = """INSERT INTO order_detail
                (order_number, attraction_id, name, address, image, date, time, price)
                VALUES(%s, %s, %s, %s, %s, %s, %s, %s)"""
                cursor.execute(create_order_detail, (
                    order_number, 
                    trips[i]["attraction"]["id"],
                    trips[i]["attraction"]["name"],
                    trips[i]["attraction"]["address"],
                    trips[i]["attraction"]["image"],
                    trips[i]["date"],
                    trips[i]["time"],
                    trips[i]["price"]
                ))
                cnx.commit()
        except:
            return {"error": True, "message": "訂單建立失敗"}, 400

        tap_pay_url = "https://sandbox.tappaysdk.com/tpc/payment/pay-by-prime"
        tap_pay_request_header = { 
            "content-type": "application/json",
            "x-api-key": os.getenv("PARTNER_KEY")
        }
        tap_pay_request_body = {
            "prime": data["prime"],
            "partner_key": os.getenv("PARTNER_KEY"),
            "merchant_id": "novsun30_TAISHIN",
            "details": "TapPay Test",
            "amount": data["order"]["total_price"],
            "cardholder": {
                "phone_number": contact["phone"],
                "name": contact["name"],
                "email": contact["email"]
            }
        }
        response = requests.post(tap_pay_url, headers = tap_pay_request_header, json = tap_pay_request_body)
        tap_pay_result = response.json()
        if tap_pay_result["status"] != 0:
            status = "付款失敗"
            update_order_status = "UPDATE `order` SET status = %s WHERE order_number = %s"
            cursor.execute(update_order_status, (status, order_number))
            cnx.commit()
            return {"error": True, "message": "付款失敗"}, 400

        status = "付款成功"
        update_order_status = "UPDATE `order` SET status = %s WHERE order_number = %s"
        cursor.execute(update_order_status, (status, order_number))
        cnx.commit()
        delete_booking_data = "DELETE FROM booking WHERE member_id = %s"
        cursor.execute(delete_booking_data, (member_id, ))
        cnx.commit()
        result = {
            "data": {
                "number": order_number,
                "payment": {
                    "status": 0,
                    "message": "付款成功"
                }
            }
        }
        return result

    except:
        return {"error": True, "message": "伺服器發生錯誤"}, 500
    finally:
        cursor.close()
        cnx.close()

@api_order.route("/api/order/<orderNumber>")
def api_order_get(orderNumber):
    try:
        cnx = cnx_pool.get_connection()
        cursor = cnx.cursor(dictionary = True)
        jwt_token = request.cookies.get("token")
        try:
            jwt.decode(jwt_token, secret_key, algorithms = "HS256")
        except:
            return {"error": True, "message": "未登入"}, 403
        search_order = """SELECT `order`.order_number, 
        `order`.total_price,
        order_detail.attraction_id,
        order_detail.name,
        order_detail.address,
        order_detail.image,
        DATE_FORMAT(order_detail.date, '%Y-%m-%d') AS date,
        order_detail.time,
        order_detail.price,
        `order`.name AS contact_name,
        `order`.email,
        `order`.phone,
        `order`.status FROM `order`
        INNER JOIN order_detail ON `order`.order_number = order_detail.order_number 
        WHERE `order`.order_number = %s"""
        cursor.execute(search_order, (orderNumber,))
        data = cursor.fetchall()
        if data == []:
            return {"data": None}
        trips = []
        status = 0
        if data[0]["status"] != "付款成功":
            status = 1
        for i in range(len(data)):
            trip = {
                "attraction":{
                    "id": data[i]["attraction_id"],
                    "name": data[i]["name"],
                    "address": data[i]["address"],
                    "image": data[i]["image"]
                },
                "date": data[i]["date"],
                "time": data[i]["time"],
                "price": data[i]["price"]
            }
            trips.append(trip)
        result = {
            "data":{
                "number": data[0]["phone"],
                "price": data[0]["total_price"],
                "trips": trips,
                "contact": {
                    "name": data[0]["contact_name"],
                    "email": data[0]["email"],
                    "phone": data[0]["phone"]
                },
                "status": status
            }
        }
        return result
    except:
        return {"error": True, "message": "伺服器發生錯誤"}, 500
    finally:
        cursor.close()
        cnx.close()

@api_order.route("/api/orders")
def api_orders_get():
    try:
        cnx = cnx_pool.get_connection()
        cursor = cnx.cursor(dictionary = True)
        jwt_token = request.cookies.get("token")
        try:
            member_data = jwt.decode(jwt_token, secret_key, algorithms = "HS256")
        except:
            return {"error": True, "message": "未登入"}, 403
        select_orders = """SELECT order_number, total_price, status, name, email, phone,
        DATE_FORMAT(create_time, '%Y-%m-%d') AS create_time 
        FROM `order`
        WHERE member_id = %s"""
        cursor.execute(select_orders, (member_data["id"],))
        orders = cursor.fetchall()
        result = {"data": orders}
        return result
        
    except:
        return {"error": True, "message": "伺服器發生錯誤"}, 500
    finally:
        cursor.close()
        cnx.close()