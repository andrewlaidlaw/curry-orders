from flask import Flask, request
import asyncio
from urllib.request import urlopen
from bs4 import BeautifulSoup
import mariadb
import json
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

@app.route('/importmenu/')
async def menureader():
    content = {}

    if request.args.get('url'):
        url = request.args.get('url')
        print("Getting menu items from " + url)
        content['result'] = "Found URL"
        content['url'] = url

        # Set up database connection to MariaDB
        connection= mariadb.connect(**conn_params)
        cursor= connection.cursor()

        # Setup database tables (and remove existing entries)

        try:
            cursor.execute("DROP TABLE menu")
            connection.commit()
        except:
            print("Menu table doesn't exist")            

        try:
            cursor.execute("DROP TABLE categories")
            connection.commit()
        except:
            print("Categories table doesn't exist")
            
        finally:
            cursor.execute("CREATE TABLE categories (id int NOT NULL AUTO_INCREMENT, categoryid varchar(255), categoryname varchar(255), PRIMARY KEY (id))")
            connection.commit()
            cursor.execute("CREATE TABLE menu (id int NOT NULL AUTO_INCREMENT, category int, itemtitle varchar(255), itemdescription varchar(255), price double(6,2), PRIMARY KEY (id), FOREIGN KEY (category) REFERENCES categories(id))")
            connection.commit()

        print("Tables created")

        # html = urlopen("https://indiancity.co.uk/our-menu/")
        html = urlopen(url)
        soup = BeautifulSoup(html, 'html.parser')

        sqlquery = 'INSERT INTO menu (category, itemtitle, itemdescription, price) VALUES ("{}", "{}", "{}", {})'
        catquery = 'INSERT INTO categories (categoryid, categoryname) VALUES ("{}", "{}")'
        menuTitle = soup.find("h2", string="À la carte Menu")
        menu = menuTitle.find_previous("div")
        sections = menu.find_all("div", class_="menu_category")
        previoussectionname = ""
        for section in sections:
            sectionid = section.get('id')
            sectioncopy = section
            currentsectionname = sectioncopy.find_previous("h1").getText()
            print("Prev: ", previoussectionname)
            print("Curr: ", currentsectionname)
            if currentsectionname == previoussectionname:
                sectionname = section.find_next("h2").getText()
            else:
                sectionname = section.find_previous("h1").getText()
            previoussectionname = currentsectionname
            # Add category to appropriate table
            cursor.execute(catquery.format(sectionid, sectionname))
            connection.commit()
            cursor.execute('SELECT id FROM categories WHERE categoryid="' + sectionid + '"')
            categoryid = cursor.fetchone()[0]
            # Now iterate through the entries in that section
            entries = section.find_all("li")
            for entry in entries:
                entrytitle = entry.find("h3")
                if entrytitle != None:
                    entrytitle = entrytitle.getText()
                    entrydesc = entry.find("p").getText()
                    #if entrydesc == "":
                    #    entrydesc = entrytitle
                    entryprice = entry.find("span", class_="menu_price").getText()
                    
                    if " or " in entrytitle:
                        # Handle the 'Chicken or Lamb' menu options
                        print(entrytitle)
                        words = entrytitle.split(" ")
                        words2 = entrytitle.split(" ")
                        orindex = words.index("or")
                        del words[orindex: orindex+2]
                        del words2[orindex-1: orindex+1]
                        firstproduct = " ".join(words)
                        entrytitle = " ".join(words2)
                        cursor.execute(sqlquery.format(categoryid, firstproduct, entrydesc, float(entryprice[1:])))
                    if entryprice[:4] == "Side":
                        # Add logic to cope with two sizes here (side and main)
                        cursor.execute(sqlquery.format(categoryid, entrytitle + " - starter", entrydesc, float(entryprice[6:10])))
                        # Add to database
                        entrytitle = entrytitle + " - main"
                        entryprice = float(entryprice[-5:])
                    elif entryprice[5:] == " per person":
                        # Add logic to cope with prices per person
                        entryprice = float(entryprice[1:5])
                    else:
                        # For everything else simply remove the £ sign
                        entryprice = float(entryprice[1:])
                    # sqlquery = "INSERT INTO menu (category, item-title, item-description, price) VALUES (" + sectionname + ", " + entrytitle + ", " + entrydesc + ", " + entryprice + ");"
                    cursor.execute(sqlquery.format(categoryid, entrytitle, entrydesc, entryprice))
                    # print(sqlquery.format(categoryid, entrytitle, entrydesc, entryprice))
        # Write all inserts to the database and close the connection
        connection.commit()
        cursor.close()
        connection.close()
        print("Entries inserted")
        content['result'] = "Entries inserted"

    else:
        content ['result'] = "URL Missing"

    return json.dumps(content)

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
    return json.dumps(content)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8083)