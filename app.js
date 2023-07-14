const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
app.set("view engine", "ejs");
const _ = require("lodash");
//------------------------------------------------
const date = require(__dirname + "/date.js");
const day = date.getDate();
//-------------------------------------------------
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
//-------------------------------------------------
// Connect to Data Base ... port :: 27017 ...
// mongodb+srv://MohammedNaga:<password>@cluster0.ieowrn3.mongodb.net/?retryWrites=true&w=majority
mongoose.connect(
  "mongodb+srv://MohammedNaga:OJMZtR6xJeO6bzpt@cluster0.ieowrn3.mongodb.net/todoDB",
  { useNewUrlParser: true }
);
// Schema for collections //-----------------------------------------------------
const itemSchema = new mongoose.Schema({
  name: String,
});
const listSchema = new mongoose.Schema({
  name: String,
  items: [itemSchema],
});
// Models Schema for collections //-----------------------------------------------------
const Item = mongoose.model("Item", itemSchema);
const List = mongoose.model("List", listSchema);
// documents for collection <Item> //-----------------------------------------------------
const item1 = new Item({
  name: "Mohammed Tarek",
});
const item2 = new Item({
  name: "Ahmed Tarek",
});
const item3 = new Item({
  name: "Ali Tarek",
});
const defaultItems = [item1, item2, item3];
//-----------------------------------------------------
app.get("/", function (req, res) {
  Item.find()
    .then((items) => {
      res.render("list", { listTitle: day, newListItems: items });
    })
    .catch((error) => {
      console.log("Error");
    });
});
//-----------------------------------------------------
app.post("/", function (req, res) {
  const item = req.body.newItem;
  const listName = req.body.list;
  if (listName === day) {
    const itemDB = new Item({
      name: item,
    });
    itemDB.save();
    res.redirect("/");
  } else {
    const itemCust = new Item({
      name: item,
    });
    List.findOneAndUpdate(
      { name: listName },
      { $push: { items: itemCust } },
      { new: true }
    )
      .then(() => {
        res.redirect("/" + listName); // Redirect to the desired page after addition
      })
      .catch((error) => {
        console.log(error);
        res.status(500).send("Error occurred while Adding the item."); // Handle error appropriately
      });
  }
});
//-----------------------------------------------------
app.post("/delete", (req, res) => {
  var listTitle = req.body.listTitle;

  if (listTitle === day) {
    Item.deleteOne({ _id: req.body.checkbox })
      .then(() => {
        //console.log("Item deleted");
        res.redirect("/");
      })
      .catch((err) => {
        console.error("Item not deleted:", err);
      });
  } else {
    List.findOneAndUpdate(
      { name: listTitle },
      { $pull: { items: { _id: req.body.checkbox } } },
      { new: true }
    )
      .then((updatedList) => {
        res.redirect("/" + listTitle); // Redirect to the desired page after deletion
      })
      .catch((error) => {
        console.log(error);
        res.status(500).send("Error occurred while deleting the item."); // Handle error appropriately
      });
  }
});
//-----------------------------------------------------
app.get("/favicon.ico", (req, res) => {
  console.log("additional request by browser .... >> ");
});
//-----------------------------------------------------
app.get("/:customListName", (req, res) => {
  var customListName = _.capitalize(req.params.customListName);
  List.findOne({ name: customListName })
    .then((foundList) => {
      if (!foundList) {
        // if name of the list not founded ... create new list ... using default items
        var list = new List({
          name: customListName,
          items: defaultItems,
        });
        list.save();
        res.render("list", {
          listTitle: list.name,
          newListItems: list.items,
        });
        
      } else {
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items,
        });
      }
    })
    .catch((err) => {
      console.log("error" + err);
    });
});
//-----------------------------------------------------
app.listen(3000, function () {
  console.log("Server started on port 3000");
});
//-----------------------------------------------------
