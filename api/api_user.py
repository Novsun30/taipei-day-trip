from flask import *
import re, mysql.connector, mysql.connector.pooling, jwt, os
from flask_bcrypt import Bcrypt
from dotenv import load_dotenv
load_dotenv()
api_user = Blueprint("api_user", __name__)
secret_key = os.getenv("JWT_KEY")
bcrypt = Bcrypt()

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


@api_user.route("/api/user", methods = ["POST"])
def api_user_post():
    try:
        cnx = cnx_pool.get_connection()
        cursor = cnx.cursor()
        data = request.get_json()
        name = data["name"].strip()
        name =  re.sub("\s+", " ", name)
        email = data["email"].strip()
        password = data["password"].strip()
        name_regex = re.search("^[\u4e00-\u9fa5a-zA-Z ]+$",name)
        email_regex = re.search("^[^@]+@[^@]+$", email)
        password_regex = re.search("[^a-zA-Z0-9]", password)
        #need to improve email authentication
        if name == None or email == None or password == None:
            return jsonify({"error": True, "message": "請輸入會員資料"}), 400
        if len(name) > 30 or len(email) > 100 or len (password) > 50 or len(password) < 8:
            return jsonify({"error": True, "message": "會員資料長度不符"}), 400
        if name_regex == None or email_regex == None or password_regex != None:
            return jsonify({"error": True, "message": "無效的會員資料"}), 400
        check_email = "SELECT id FROM member WHERE email LIKE %s"
        cursor.execute(check_email, (email,))
        exist_email = cursor.fetchone()
        if exist_email != None:
            return jsonify({"error": True, "message": "信箱已經註冊過了"}), 400
        insert_data = "INSERT INTO member(name, email, password) VALUES(%s, %s, %s)"
        password = bcrypt.generate_password_hash(password)
        member_data = (name, email, password)
        cursor.execute(insert_data, member_data)
        cnx.commit()
        return jsonify({"ok": True})
    except:
        return jsonify({"error": True, "message": "伺服器發生錯誤"}), 500
    finally:
        cursor.close()
        cnx.close()

@api_user.route("/api/user/auth")
def api_user_auth_get():
    try:
        cnx = cnx_pool.get_connection()
        cursor = cnx.cursor(dictionary = True)
        jwt_token = request.cookies.get("token")
        data = jwt.decode(jwt_token, secret_key, algorithms = "HS256")
        select_member_data = "SELECT id, name, email, DATE_FORMAT(register_time, '%Y-%m-%d') AS date FROM member WHERE id = %s"
        id = data["id"]
        cursor.execute(select_member_data, (id,))
        member_data = cursor.fetchone()
        return jsonify({
            "data": {
                "id": member_data["id"], 
                "name": member_data["name"], 
                "email": member_data["email"],
                "registerDate": member_data["date"]
                }
            })
    except:
        return jsonify({"data": None})
    finally:
        cursor.close()
        cnx.close()

@api_user.route("/api/user/auth", methods = ["PUT"])
def api_user_auth_put():
    try:
        cnx = cnx_pool.get_connection()
        cursor = cnx.cursor()
        data = request.get_json()
        email = data["email"].strip()
        password = data["password"].strip()
        if email == None or password == None:
            return jsonify({"error": True, "message": "請輸入信箱或密碼"}), 400
        #need to improve email authentication
        if  re.search("^[^@]+@[^@]+$", email) == None or re.search("[^a-zA-Z0-9]", password) != None:
           return jsonify({"error": True, "message": "無效的信箱或密碼"}), 400
        login_check = "SELECT id, name, email, password, register_time FROM member WHERE email = %s"
        cursor.execute(login_check,(email,))
        result = cursor.fetchone()
        if result == None:
            return jsonify({"error": True, "message": "該信箱未註冊"}), 400
        hash_password = result[3]
        if bcrypt.check_password_hash(hash_password, password) == False:
            return jsonify({"error": True, "message": "信箱或密碼錯誤"}), 400
        encoded_jwt = jwt.encode({
            "id": result[0],
            "name": result[1],
            "email": result[2]},
            secret_key, 
            algorithm = "HS256")
        auth_response = make_response(jsonify({"ok": True}))
        auth_response.set_cookie("token", encoded_jwt, max_age = 604800)
        return auth_response
    except:
        return jsonify({"error": True, "message": "伺服器發生錯誤"}), 500
    finally:
        cursor.close()
        cnx.close()

@api_user.route("/api/user/auth", methods = ["DELETE"])
def api_user_auth_delete():
    auth_response = make_response(jsonify({"ok": True}))
    auth_response.set_cookie("token", "", max_age = -1)
    return auth_response

@api_user.route("/api/user/upload", methods = ["post"])
def api_user_upload():
    
    return "123"