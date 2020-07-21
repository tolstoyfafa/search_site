const elasticsearch = require('elasticsearch');

const client = new elasticsearch.Client( {  
  hosts: [
    'http://localhost:9200/'
  ]
});


async function search(query) {
  const out = await client.search({  
    index: 'books',

    body:{
      query: {

        multi_match : {
          query: query,
          fields: [ "title", "subjects" ]
        }
        
    }/* ,
    sort: [{
      "download_count" : {"order" : "desc"}
   }] */
  }
    
  });
  return out.hits.hits
}


module.exports = search
