from flask import *
import re, mysql.connector, mysql.connector.pooling, jwt
from flask_bcrypt import Bcrypt
api = Blueprint("api", __name__)
secret_key = "hello pyjwt"
bcrypt = Bcrypt()

db_config = {
    "user": "root",
    "password": "1234",
    "host": "127.0.0.1",
    "database": "taipei_day_trip"
}
cnx_pool = mysql.connector.pooling.MySQLConnectionPool(
    pool_name = "mypool",
    pool_size = 5,
    **db_config
)

class Data_object:
    def __init__(self, id, name, category, description, address, transport, mrt, lat, lng, images):
        self.id = id
        self.name = name
        self.category = category
        self.description = description
        self.address = address
        self.transport = transport
        self.mrt = mrt
        self.lat = lat
        self.lng = lng
        self.images = images.split(",")

@api.route("/api/attractions") 
def api_attractions():
    try:
        cnx = cnx_pool.get_connection()
        cursor = cnx.cursor()
        page = int(request.args.get("page"))
        keyword = request.args.get("keyword")
        next_page = page + 1
        data_start = page * 12
        data_end =  12
        result = {"nextPage":next_page, "data": []}
        if keyword != None:
            name_keyword = "%"+keyword+"%"
            select_count =  "SELECT COUNT(id) FROM attraction WHERE category LIKE %s OR name LIKE %s"
            cursor.execute(select_count,(keyword, name_keyword))
            data_rows = cursor.fetchone()
            if data_rows[0]/(next_page*12) < 1:
                result["nextPage"] = None
            select_keyword =  "SELECT attraction.*, GROUP_CONCAT(image.url) AS images FROM attraction INNER JOIN image ON attraction.id = image.attraction_id WHERE category LIKE %s OR name LIKE %s GROUP BY attraction.id LIMIT %s, %s"
            cursor.execute(select_keyword,(keyword, name_keyword, data_start, data_end))
            attraction_data = cursor.fetchall()
            if attraction_data == []:
                result["data"] = None
                return jsonify(result)
            for (id, name, category, description, address, transport, mrt, lat, lng, images) in attraction_data:
                data = Data_object(id, name, category, description, address, transport, mrt, lat, lng, images)
                result["data"].append(vars(data))
            return result
        select_data_rows = "SELECT COUNT(id) FROM attraction"
        cursor.execute(select_data_rows)
        all_pages = cursor.fetchone()
        if all_pages[0]/(next_page*12) < 1:
           result["nextPage"]  = None
        select_data = "SELECT attraction.*, GROUP_CONCAT(image.url) AS images FROM attraction INNER JOIN image ON attraction.id = image.attraction_id GROUP BY attraction.id LIMIT %s, %s" 
        cursor.execute(select_data,(data_start, data_end))
        attraction_data = cursor.fetchall()
        if attraction_data == []:
            result["data"] = None
            return jsonify(result)
        for (id, name, category, description, address, transport, mrt, lat, lng, images) in attraction_data:
            data = Data_object(id, name, category, description, address, transport, mrt, lat, lng, images)
            result["data"].append(vars(data))
        cursor.close()
        return jsonify(result)
    except:
        return jsonify({"error": True,"message": "伺服器發生錯誤"}), 500
    finally:
        cursor.close()
        cnx.close()

@api.route("/api/attraction/<attractionId>")
def api_attraction_id(attractionId):
    try:
        cnx = cnx_pool.get_connection()
        cursor = cnx.cursor()
        if re.search("\D", attractionId) != None:
            return jsonify({"error": True,"message": "請輸入正整數"}), 400
        select_data = "SELECT attraction.*, GROUP_CONCAT(image.url) AS images FROM attraction INNER JOIN image ON attraction.id = image.attraction_id WHERE attraction.id = %s"
        cursor.execute(select_data,(attractionId,))
        attraction_data = cursor.fetchall()
        if attraction_data[0][0] == None:
            return jsonify({"error": True,"message": "無資料"}), 400
        result = {"data":[]}
        if attraction_data == []:
            result["data"] = None
            return jsonify(result)
        for (id, name, category, description, address, transport, mrt, lat, lng, images) in attraction_data:
            data = Data_object(id, name, category, description, address, transport, mrt, lat, lng, images)
        result["data"] = vars(data)
        return jsonify(result)
    except:
        return jsonify({"error": True,"message": "伺服器發生錯誤"}), 500
    finally:
        cursor.close()
        cnx.close()

@api.route("/api/categories")
def api_categories():
    try:
        cnx = cnx_pool.get_connection()
        cursor = cnx.cursor()
        result = {"data":[]}
        select_category = "SELECT GROUP_CONCAT(DISTINCT category) AS category FROM attraction "
        cursor.execute(select_category)
        data = cursor.fetchall()
        data = data[0][0].split(",")
        result["data"] = data
        return jsonify(result)
    except:
        return jsonify({"error": True,"message": "伺服器發生錯誤"}), 500
    finally:
        cursor.close()
        cnx.close()

@api.route("/api/user", methods = ["POST"])
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

@api.route("/api/user/auth")
def api_user_auth_get():
    try:
        jwt_token = request.cookies.get("token")
        data = jwt.decode(jwt_token, secret_key, algorithms = "HS256")
        return jsonify({"data": {"id": data["id"], "name": data["name"], "email": data["email"]}})
    except:
        return jsonify({"data": None})

@api.route("/api/user/auth", methods = ["PUT"])
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
        login_check = "SELECT id, name, email, password FROM member WHERE email = %s"
        cursor.execute(login_check,(email,))
        result = cursor.fetchone()
        if result == None:
            return jsonify({"error": True, "message": "該信箱未註冊"}), 400
        hash_password = result[3]
        if bcrypt.check_password_hash(hash_password, password) == False:
            return jsonify({"error": True, "message": "信箱或密碼錯誤"}), 400
        encoded_jwt = jwt.encode({"id": result[0], "name": result[1], "email": result[2]}, secret_key, algorithm = "HS256")
        auth_response = make_response(jsonify({"ok": True}))
        auth_response.set_cookie("token", encoded_jwt, max_age = 604800)
        return auth_response
    except:
        return jsonify({"error": True, "message": "伺服器發生錯誤"}), 500
    finally:
        cursor.close()
        cnx.close()

@api.route("/api/user/auth", methods = ["DELETE"])
def api_user_auth_delete():
    auth_response = make_response(jsonify({"ok": True}))
    auth_response.set_cookie("token", "", max_age = -1)
    return auth_response