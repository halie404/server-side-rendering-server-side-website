import express from "express";
import { Liquid } from "liquidjs";
const app = express();
app.use(express.static("public"));

const engine = new Liquid();
app.engine("liquid", engine.express());
app.set("views", "./views");

//--- base directus url ---
const directusApiBaseUrl = "https://fdnd-agency.directus.app/items";

//--- endpoints ---
const webinarsEndpoint = `${directusApiBaseUrl}/avl_webinars`;
const categoriesEndpoint = `${directusApiBaseUrl}/avl_categories`;

app.get("/", async function (req, res) {
  const fetchWebinars = await fetch(
    webinarsEndpoint +
      "?fields=duration,title,thumbnail,categories.*.*,speakers.*.*"
  );
  const { data: webinarData } = await fetchWebinars.json();

  const categories = await fetch(categoriesEndpoint + "?fields=name");
  const { data: categoriesData } = await categories.json();

  const allCategories = [{ id: 0, name: "Select all" }, ...categoriesData];

  const selectedCategory = req.query.category;

  const filteredWebinars =
    selectedCategory && selectedCategory !== "Select all"
      ? webinarData.filter((webinar) =>
          webinar.categories.some(
            (category) => category.avl_categories_id.name === selectedCategory
          )
        )
      : webinarData;

  const webinars = filteredWebinars.map((webinar) => ({
    id: webinar.id,
    title: webinar.title,
    duration: webinar.duration,
    thumbnail: webinar.thumbnail,
    categories: webinar.categories,
    speakers: webinar.speakers,
  }));

  res.render("index.liquid", {
    webinars: webinars,
    categories: allCategories,
    hasWebinars: webinars.length > 0,
    selectedCategory: selectedCategory || "Select all",
  });
});

app.set("port", process.env.PORT || 8000);
app.listen(app.get("port"), function () {
  console.log(`Application started on http://localhost:${app.get("port")}`);
});
