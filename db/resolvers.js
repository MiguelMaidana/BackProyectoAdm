const Usuario = require("../models/Usuario")
const Producto = require("../models/Producto")
const bcryptjs = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config({path:"../variables.env"})


const crearToken =(usuario,secreta,expiresIn)=>{

    //console.log(usuario)
    const{id,email,nombre,apellido} = usuario
    return jwt.sign({id,email,nombre,apellido},secreta,{expiresIn})

}

//resolvers

const resolvers ={
    Query:{
        obtenerUsuario : async (_,{token})=>{
            const usuarioId = await jwt.verify(token,"palabrasecreta")
            return usuarioId
        },
        obtenerProductos : async()=>{
            try{
                const productos = await Producto.find({})
                return productos
            }catch(error){
                console.log(error)
            }
        },
        obtenerProducto : async(_,{id})=>{
            // Revisar si el producto existe

            const producto = await Producto.findById(id)

            if(!producto){
                throw new Error("Producto NO encontrado")
            }

            return producto

            
        }
    },
    Mutation :{
        nuevoUsuario: async (_,{input})=>{

            

            const {email,password} = input
            // revisar si el usuario ya esta registrado
            const existeUsuario = await Usuario.findOne({email})
            if(existeUsuario){
                throw new Error ( "El usuario ya esta registrado")
            }
           

            // Hashear el password

            const salt = await bcryptjs.genSalt(10)
            input.password = await bcryptjs.hash(password, salt);

            try{
                 // Guardarlo en la BD
                const usuario = new Usuario(input)
                usuario.save() // guardarlo
                return usuario
            }catch(error){
                console.log("Error al guardar en la BD",error)
            }
        },
        autenticarUsuario: async (_,{input})=>{
            const {email,password} = input

            // si el usuario existe

            const existeUsuario = await Usuario.findOne({email})
            if(!existeUsuario){
                throw new Error ( "El usuario no existe")
            }

            // revisar si el password es correcto
            const passwordCorrecto = await bcryptjs.compare(password, existeUsuario.password)
            if(!passwordCorrecto){
                throw new Error ("El password es incorrecto")
            }

            // Crear el token
            
            return {
                token : crearToken(existeUsuario,"palabrasecreta","24h")
            }

        },

        nuevoProducto : async (_,{input})=>{
            try{
                const producto = new Producto(input)

                // Almacenar en la BD

                const resultado = await producto.save()
                return resultado

            }catch(error){
                console.log(error)
            }
        }
    }

}

module.exports = resolvers