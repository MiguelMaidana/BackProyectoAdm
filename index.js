const {ApolloServer} = require("apollo-server")
const typeDefs = require("./db/schema")
const resolvers = require("./db/resolvers")

const cconectarDB = require("./config/db")

// conectar a la BD

cconectarDB()

// Servidor 

const server = new ApolloServer({
    typeDefs,
    resolvers
})


// Arrancar el Servidor

server.listen().then(({url})=>{
    console.log(`Servidor listo en la URL ${url}`)
})