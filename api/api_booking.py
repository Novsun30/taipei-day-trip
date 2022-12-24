from flask import *
import mysql.connector, mysql.connector.pooling, jwt, os
from dotenv import load_dotenv
load_dotenv()
api_booking = Blueprint("api_booking", __name__)
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

@api_booking.route("/api/booking")
def api_booking_get():
    try:
        cnx = cnx_pool.get_connection()
        cursor = cnx.cursor(dictionary=True)
        jwt_token = request.cookies.get("token")
        if jwt_token == None:
            return jsonify({"error": True, "message": "未登入"}), 403
        member_data = jwt.decode(jwt_token, secret_key, algorithms = "HS256")
        member_id = member_data["id"]
        select_all_booking_data = """SELECT attraction.id,
            attraction.name,
            attraction.address,
            image.url AS image,
            DATE_FORMAT(booking.date, '%Y-%m-%d') AS date,
            booking.time,
            booking.price FROM booking 
            INNER JOIN attraction ON booking.attraction_id = attraction.id 
            INNER JOIN image ON image.attraction_id = attraction.id 
            WHERE booking.member_id = %s GROUP BY booking.date"""
        cursor.execute(select_all_booking_data, (member_id, ))
        boooking_data = cursor.fetchall()
        result = {"data":[], "total_price": ""}
        totla_price = 0
        for i in range(len(boooking_data)):
            data = {
                "attraction": {
                    "id": boooking_data[i]["id"],
                    "name": boooking_data[i]["name"],
                    "address": boooking_data[i]["address"],
                    "image": boooking_data[i]["image"]
                },
                "date": boooking_data[i]["date"],
                "time": boooking_data[i]["time"],
                "price": boooking_data[i]["price"]
            }
            result["data"].append(data)
            totla_price = totla_price + boooking_data[i]["price"]
        if boooking_data == []:
            result["data"] = None
        result["total_price"] = totla_price
        return jsonify(result)
    except:
        return jsonify({"error": True, "message": "伺服器發生錯誤"}), 500
    finally:
        cursor.close()
        cnx.close()
@api_booking.route("/api/booking", methods = ["POST"])
def api_booking_post():
    try:
        cnx = cnx_pool.get_connection()
        cursor = cnx.cursor()
        jwt_token = request.cookies.get("token")
        if jwt_token == None:
            return jsonify({"error": True, "message": "未登入"}), 403
        try:
            booking_data = request.get_json()
            attraction_id = booking_data["attractionId"]
            date = booking_data["date"]
            time = booking_data["time"]
            price = booking_data["price"]
            if date == "" or time == "":
                return jsonify({"error": True, "message": "資料缺漏"}), 400
            if type(attraction_id) != int or type(price) != int:
                return jsonify({"error": True, "message": "格式錯誤"}), 400
        except:
            return jsonify({"error": True, "message": "資料缺漏或格式錯誤"}), 400
        member_data = jwt.decode(jwt_token, secret_key, algorithms = "HS256")
        member_id = member_data["id"]
        check_exist_booking = "SELECT * FROM booking WHERE member_id = %s AND date = %s"
        cursor.execute(check_exist_booking, (member_id, date))
        exist_booking_result = cursor.fetchone()
        if(exist_booking_result != None):
            return jsonify({"error": True, "message": "該日期已預訂"}), 400
        insert_booking_data = "INSERT INTO booking(member_id, attraction_id, date, time, price) VALUES(%s, %s, %s, %s, %s)"
        booking_data = (member_id, attraction_id, date, time, price)
        cursor.execute(insert_booking_data, booking_data)
        cnx.commit()
        return jsonify({"ok": True})
    except:
        return jsonify({"error": True, "message": "伺服器發生錯誤"}), 500
    finally:
        cursor.close()
        cnx.close()
        
@api_booking.route("/api/booking", methods = ["DELETE"])
def api_booking_delete():
    try:
        cnx = cnx_pool.get_connection()
        cursor = cnx.cursor()
        jwt_token = request.cookies.get("token")
        if jwt_token == None:
            return jsonify({"error": True, "message": "未登入"}), 403
        member_data = jwt.decode(jwt_token, secret_key, algorithms = "HS256")
        member_id = member_data["id"]
        target_date = request.get_json()["date"]
        delete_data = "DELETE FROM booking WHERE member_id = %s AND date = %s"
        cursor.execute(delete_data, (member_id, target_date))
        cnx.commit()
        return jsonify({"ok": True})
    except:
        return jsonify({"error": True, "message": "伺服器發生錯誤"}), 500
    finally:
        cursor.close()
        cnx.close()