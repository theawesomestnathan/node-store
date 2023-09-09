const express = require("express")
const sqlite3 = require("sqlite3")
const bodyParser = require("body-parser")

const db = new sqlite3.Database("database.db")
const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.set("view engine", "ejs")

app.get("/", (req, res) => {
  db.all("SELECT category, GROUP_CONCAT(name) as names, GROUP_CONCAT(price) as prices, GROUP_CONCAT(image) as images FROM items GROUP BY category", [], (err, rows) => {
    if (err) {
      throw err
    }
    let items = rows.map(row => {
      return {
        category: row.category,
        items: row.names.split(",").map((name, index) => {
          return {
            name: name,
            price: row.prices.split(",")[index],
            image: row.images.split(",")[index],
          }
        })
      }
    })
    res.render("index", {categories: items})
  })
})

app.get("/cart", (req, res) => {
  db.all("SELECT category, GROUP_CONCAT(name) as names, GROUP_CONCAT(price) as prices, GROUP_CONCAT(image) as images FROM cart GROUP BY category", [], (err, rows) => {
    if (err) {
      throw err
    }

    let items = rows.map(row => {
      return {
        category: row.category,
        items: row.names.split(",").map((name, index) => {
          return {
            name: name,
            price: row.prices.split(",")[index],
            image: row.images.split(",")[index]
          }
        })
      }
    })
    
    res.render("cart", { categories: items })
  })
})



app.post("/insert-data", (req, res) => {
  db.run("INSERT INTO cart (category, name, price, image) VALUES (?, ?, ?, ?)", [req.body.category, req.body.name, req.body.price, req.body.image], function(err) {
    if (err) {
      console.log(err)
      res.send("Failed to insert data")
    } 
    else {
      res.send("Added to cart successfully!")
    }
  })
})

app.post("/delete-data", (req, res) => {
  db.run("DELETE FROM cart WHERE ROWID = (SELECT ROWID FROM cart WHERE image = ?) ", [req.body.image], function(err) {
    if (err) {
      console.log(err)
      res.send("Failed to delete data")
    } 
    else {
      res.send("Deleted from cart successfully!")
    }
  })
})


app.post("/buy", (req, res) => {
  db.run("DELETE FROM cart", function(err) {
    if (err) {
      console.log(err)
      res.send("Failed to delete data")
    } 
    else {
      res.send("Deleted from cart successfully!")
    }
  })
})


app.listen(3000, () => {
  console.log("App listening on localhost:3000")
})