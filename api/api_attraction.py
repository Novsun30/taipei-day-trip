from flask import *
import re, mysql.connector, mysql.connector.pooling
api_attraction = Blueprint("api_attraction", __name__)

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

@api_attraction.route("/api/attractions") 
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

@api_attraction.route("/api/attraction/<attractionId>")
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

@api_attraction.route("/api/categories")
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