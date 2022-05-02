//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");

const mongoose = require("mongoose");
const { redirect } = require("express/lib/response");

const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://boostry:Test-123@cluster0.6xn6j.mongodb.net/todolistDB")
const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "welcome to your todoList"
});
const item2 = new Item({
  name: "Hit the + button to add a new item"
});
const item3 = new Item({
  name: "<-- Hit this to delete an item"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema)





app.get("/", function (req, res) {

  Item.find({}, (err, foundItems) => {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, (err) => {
        if (err) {
          console.log(err)
        } else {
          console.log("all items have been added to the collections")
        }
      });
      res.redirect("/")
    } else {
      res.render("list", { listTitle: "Today", newListItems: foundItems })
    }

  });
});

app.get("/:paramName", (req, res) => {
  const paramName = _.capitalize(req.params.paramName);

  List.findOne({ name: paramName }, (err, resault) => {
    if (!err) {
      if (!resault) {
        const list = new List({
          name: paramName,
          items: defaultItems
        });
        list.save();
        res.redirect("/"+paramName)
      } else {
        res.render("list", { listTitle: resault.name, newListItems: resault.items })
      }
    }
  });


  
});


app.post("/", function (req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const newItem = new Item({
    name: itemName
  });

  if(listName==="Today"){
    newItem.save()
    res.redirect("/")
  }else{
    List.findOne({name: listName}, (err, foundList)=>{
      foundList.items.push(newItem)
      foundList.save();
      res.redirect("/"+ listName);
    })
  }

});

app.post("/delete", (req, res) => {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "today"){
    Item.findByIdAndRemove(checkedItemId, (err) => {
      if (err) {
        console.log(err)
      } else {
        console.log("item removed")
        res.redirect("/")
      }
    })
  }else{
    List.findOneAndUpdate({name : listName},{$pull:{items: {_id:checkedItemId}}},(err,foundList)=>{
      if(!err){
        res.redirect("/"+ listName);
      }
    })
  }

})


app.get("/about", function (req, res) {
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == ""){
  port = 3000;
}
app.listen(port);

app.listen(port, function () {
  console.log("Server started on port 3000");
});
