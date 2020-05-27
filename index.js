const {ApolloServer} = require("apollo-server")
const typeDefs = require("./db/schema")
const resolvers = require("./db/resolvers")

const cconectarDB = require("./config/db")
const jwt = require("jsonwebtoken")

// conectar a la BD

cconectarDB()

// Servidor 

const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({req})=>{
        //console.log(req.headers["authorization"])
        const token = req.headers["authorization"] || "";
        if(token){
            try{
                const usuario = jwt.verify(token,"palabrasecreta")
                //console.log(usuario)
                return{
                    usuario
                }
            }catch(error){
                console.log(error)
            }
        }
    }
})


// Arrancar el Servidor

server.listen().then(({url})=>{
    console.log(`Servidor listo en la URL ${url}`)
})