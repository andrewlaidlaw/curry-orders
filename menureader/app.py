from flask import Flask,  jsonify
from flask_cors import CORS, cross_origin
import mariadb
import datetime
import os

DB_USER = os.getenv('DATABASE_USER', "root")
DB_PASS = os.getenv('DATABASE_PASSWORD', "abc1234")
DB_HOST = os.getenv('DATABASE_HOST', "localhost")
DB_DATABASE = os.getenv('DATABASE_NAME', "menu")

conn_params = {
    "user" : DB_USER,
    "password" : DB_PASS,
    "host" : DB_HOST,
    "database" : DB_DATABASE
}

app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

@app.route('/api/menu/<int:itemid>')
@cross_origin()
def itemdetails(itemid: int):
    content = {}

    # Set up database connection to MariaDB
    connection= mariadb.connect(**conn_params)
    cursor= connection.cursor()

    sqlquery = 'SELECT cat.categoryname, item.itemtitle, item.itemdescription, item.price FROM categories cat, menu item  WHERE cat.id=item.category AND item.id=' + str(itemid)
    
    cursor.execute(sqlquery)
    entry = cursor.fetchone()
    content['category'] = entry[0]
    content['itemname'] = entry[1]
    content['itemdescription'] = entry[2]
    content['itemprice'] = entry[3]
       
    cursor.close()
    connection.close()

    return jsonify(content)

@app.route('/api/category/<int:catid>')
@cross_origin()
def catlisting(catid: int):
    content = {}
    output = []

    # Set up database connection to MariaDB
    connection= mariadb.connect(**conn_params)
    cursor= connection.cursor()

    sqlquery = 'SELECT id, itemtitle, price FROM menu  WHERE category=' + str(catid)
    
    cursor.execute(sqlquery)
    entries = cursor.fetchall()
    for entry in entries:
        content['itemid'] = entry[0]
        content['itemname'] = entry[1]
        content['itemprice'] = entry[2]
        output.append(content.copy())
       
    cursor.close()
    connection.close()

    return jsonify(output)

@app.route('/api/menu')
@cross_origin()
def fullmenu():
    content = {}
    item = {}
    output = []

    # Set up database connection to MariaDB
    connection = mariadb.connect(**conn_params)
    cursor = connection.cursor()
    sqlquery = 'SELECT * FROM categories'

    cursor.execute(sqlquery)
    entries = cursor.fetchall()
    for entry in entries:
        content['id'] = entry[0]
        content['categoryId'] = entry[1]
        content['name'] = entry[2]
        content['items'] = []

        sqlquery = 'SELECT id, itemtitle, price, itemdescription FROM menu  WHERE category=' + str(entry[0])
        
        cursor2 = connection.cursor()
        cursor2.execute(sqlquery)
        entries = cursor2.fetchall()
        for entry in entries:
            item['itemid'] = entry[0]
            item['itemname'] = entry[1]
            item['itemprice'] = entry[2]
            item['itemdescription'] = entry[3]
            content['items'].append(item.copy())
        
        output.append(content.copy())
        cursor2.close()
    cursor.close()
    connection.close()

    return jsonify(output)

@app.route('/api/category')
@cross_origin()
def catlist():
    content = {}
    output = []

    # Set up database connection to MariaDB
    connection= mariadb.connect(**conn_params)
    cursor= connection.cursor()

    sqlquery = 'SELECT * FROM categories'
    
    cursor.execute(sqlquery)
    entries = cursor.fetchall()
    for entry in entries:
        content['id'] = entry[0]
        content['categoryId'] = entry[1]
        content['name'] = entry[2]
        output.append(content.copy())
       
    cursor.close()
    connection.close()

    return jsonify(output)

@app.route('/healthz')
# Added healthcheck endpoint
def healthz():
    return "ok"

@app.route('/')
# Added root endpoint
def root():
    content = {}
    content['status'] = "Good"
    now = datetime.datetime.now()
    content['time'] = now.strftime("%H:%M:%S")
    return jsonify(content)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8081)