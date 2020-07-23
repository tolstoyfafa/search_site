const elasticsearch = require('elasticsearch')

const client = new elasticsearch.Client({
  host: 'localhost:9200',
})

async function get_aggs() {
  const search_query = {
    index: "books",
    body: {
      aggs: {
        "authors.name": {
          terms: {
            field: "authors.name.keyword",
            size: 20,
          }
        }
      }
    }
  }

  const results = await client.search(search_query)
  return results.aggregations["authors.name"].buckets
}

async function search(query, sorting_type, authors) {

  const custom_sort = []
  switch (sorting_type) {
    default:
    case "pertinence":
      custom_sort.push({
        _score: {
          order: "desc",
        }
      })
      break
    case "downloads":
      custom_sort.push({
        download_count: {
          order: "desc",
        }
      })
      break
    case "oldest":
      custom_sort.push({
        "authors.birth_year": {
          order: "asc",
        }
      })
      break
    case "youngest":
      custom_sort.push({
        "authors.birth_year": {
          order: "desc",
        }
      })
      break
  }


  const search_query = {
    index: "books",
    body: {
      query: {
        bool: {
          must: [{
            multi_match: {
              query,
              fields: [
                "title^3",
                "authors.name^2",
                "subjects^1",
              ],
              fuzziness: "AUTO",
            },
          }],
        },
      },
      highlight: {
        pre_tags: `<span style="color: green;">`,
        post_tags: "</span>",
        fields: {
          title: {},
          "authors.name": {},
          subjects: {},
        }
      },
      sort: custom_sort,
      suggest : {
        title_suggestion : {
          text : query,
          term : {
            field : "title"
          }
        }
      }
    }
  }

  if (authors.length) {
    search_query.body.query.bool.filter = [{
        term: {
          "authors.name.keyword": authors[0]
        }
      }]
  }

  const results = await client.search(search_query)
  return results
}

function get_suggestion(suggestion) {
  let out = []

  for (let sug of suggestion) {
    if (sug.options.length)
      out.push(sug.options[0].text)
    else
      out.push(sug.text)
  }
  return out.join(" ")
}

module.exports = {
  search,
  get_aggs,
  get_suggestion,
}
