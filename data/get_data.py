import json, re, mysql.connector

db_config = {
    "user": "root",
    "password": "1234",
    "host": "127.0.0.1",
    "database": "taipei_day_trip"
}

cnx = mysql.connector.connect(**db_config)

with open("taipei-attractions.json", "r") as file:
    data = json.load(file)
    data = data["result"]["results"]
    attraction_id = 1
    for result in data:
        name = result["name"]
        category = result["CAT"]
        description = result["description"]
        address = result["address"]
        transport = result["direction"]
        mrt = result["MRT"]
        lat = result["latitude"]
        lng = result["longitude"]
        images = result["file"]
        images = re.findall("https:.*?\.jpg", images, re.IGNORECASE)
        with cnx.cursor() as cursor:
            insert_attraction = ("INSERT INTO attraction(name, category, description, address, transport, mrt, lat, lng) VALUES(%s, %s, %s, %s, %s, %s, %s, %s)")
            attraction_data = (name, category, description, address, transport, mrt, lat, lng)
            cursor.execute(insert_attraction, attraction_data)
            cnx.commit()
        with cnx.cursor() as cursor:
            for url in images:
                add_url = ("INSERT INTO image(attraction_id, url) VALUES(%s, %s)")
                url_data = (attraction_id, url)
                cursor.execute(add_url, url_data)
                cnx.commit()
        attraction_id += 1
cnx.close()
