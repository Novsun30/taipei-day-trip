from flask import *
from api.api_attraction import api_attraction
from api.api_user import api_user
from api.api_booking import api_booking
from api.api_order import api_order

app = Flask(__name__)
app.register_blueprint(api_attraction)
app.register_blueprint(api_user)
app.register_blueprint(api_booking)
app.register_blueprint(api_order)
app.config["JSON_AS_ASCII"] = False
app.config["TEMPLATES_AUTO_RELOAD"] = True

@app.route("/")
def index():
	return render_template("index.html")
@app.route("/attraction/<id>")
def attraction(id):
	return render_template("attraction.html")
@app.route("/booking")
def booking():
	return render_template("booking.html")
@app.route("/thankyou")
def thankyou():
	return render_template("thankyou.html")
@app.route("/member")
def member():
	return render_template("member.html")

app.run(host = "0.0.0.0", port = 3000, debug=True)