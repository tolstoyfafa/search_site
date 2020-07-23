const express = require("express")
const ejs = require("ejs")
const winston = require('winston')
const expressWinston = require('express-winston')
const qs = require("querystring")

const { search, get_aggs, get_suggestion } = require("./search")

const app = express()

const PORT = process.env.PORT || 8080

app.set("view engine", "ejs")


app.use(expressWinston.logger({
  transports: [
    new winston.transports.File({
      filename: 'app.log',
      level: 'info'
    }),
  ],
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.json()
  ),
  meta: true,
  msg: "HTTP {{req.method}} {{req.url}}",
  expressFormat: true,
  colorize: false,
  ignoreRoute: function (req, res) { return false; }
}));

app.get("/", async (req, res) => {
  const aggs = await get_aggs()
  res.render("homepage", { aggs })
})

app.get("/search", async (req, res) => {
  if (!req.query.query || req.query.query.length < 3)
    res.redirect("/")
  let authors
  if (!req.query.authors)
    authors = []
  else if (!Array.isArray(req.query.authors))
    authors = [req.query.authors]
  else
    authors = req.query.authors
  const { hits: { hits, total }, suggest: { title_suggestion } } = await search(req.query.query, req.query.sort, authors)
  const suggestion = get_suggestion(title_suggestion)
  res.render("results", {
    hits,
    total,
    query: req.query.query,
    suggestion: {
      suggestion,
      href: "/search?" + qs.stringify({...req.query, query: suggestion})
    }
  })
})

app.listen(PORT)
console.log(`app running on ${PORT}`)
