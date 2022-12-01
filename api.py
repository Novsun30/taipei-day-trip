from flask import *
import re, mysql.connector, mysql.connector.pooling

api = Blueprint("api", __name__)

db_config = {
    "user": "root",
    "password": "1234",
    "host": "127.0.0.1",
    "database": "taipei_day_trip"
}
cnx_pool = mysql.connector.pooling.MySQLConnectionPool(
    pool_name= "mypool",
    pool_size=5,
    **db_config
)

class Date_object:
    def __init__(self, id, name, category, description, address, transport, mrt, lat, lng):
        self.id = id
        self.name = name
        self.category = category
        self.description = description
        self.address = address
        self.transport = transport
        self.mrt = mrt
        self.lat = lat
        self.lng = lng
        self.images = None
    def select_image(self):
        cnx = cnx_pool.get_connection()
        cursor = cnx.cursor()
        select_images = "SELECT url FROM image WHERE attraction_id = %s" 
        cursor.execute(select_images,(self.id,))
        images = cursor.fetchall()
        image_data = []
        for image in images:
            image_data.append(image[0])
        self.images = image_data
        cursor.close()
        cnx.close()

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
            select_keyword =  "SELECT * FROM attraction WHERE category LIKE %s OR name LIKE %s LIMIT %s, %s"
            cursor.execute(select_keyword,(keyword, name_keyword, data_start, data_end))
            attraction_data = cursor.fetchall()
            if attraction_data == []:
                result["data"] = None
                return jsonify(result)
            for (id, name, category, description, address, transport, mrt, lat, lng) in attraction_data:
                data = Date_object(id, name, category, description, address, transport, mrt, lat, lng)
                data.select_image()
                result["data"].append(vars(data))
            if keyword == "":
                result["nextPage"] = None
            return result
        select_data_rows = "SELECT COUNT(id) FROM attraction"
        cursor.execute(select_data_rows)
        all_pages = cursor.fetchone()
        if all_pages[0]/(next_page*12) < 1:
           result["nextPage"]  = None
        select_data = "SELECT * FROM attraction LIMIT %s, %s" 
        cursor.execute(select_data,(data_start, data_end))
        attraction_data = cursor.fetchall()
        if attraction_data == []:
            result["data"] = None
            return jsonify(result)
        for (id, name, category, description, address, transport, mrt, lat, lng) in attraction_data:
            data = Date_object(id, name, category, description, address, transport, mrt, lat, lng)
            data.select_image()
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
        select_data = "SELECT * FROM attraction WHERE id = %s"
        cursor.execute(select_data,(attractionId,))
        attraction_data = cursor.fetchall()
        result = {"data":[]}
        if attraction_data == []:
            result["data"] = None
            return jsonify(result)
        for (id, name, category, description, address, transport, mrt, lat, lng) in attraction_data:
            data = Date_object(id, name, category, description, address, transport, mrt, lat, lng)
        data.select_image()
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
        select_category = "SELECT DISTINCT category FROM attraction "
        cursor.execute(select_category)
        data = cursor.fetchall()
        categories = []
        for category in data:
            categories.append(category[0])
        result["data"] = categories
        return jsonify(result)
    except:
        return jsonify({"error": True,"message": "伺服器發生錯誤"}), 500
    finally:
        cursor.close()
        cnx.close()