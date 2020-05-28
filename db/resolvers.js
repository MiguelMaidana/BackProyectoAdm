const Usuario = require("../models/Usuario")
const Producto = require("../models/Producto")
const Cliente = require("../models/Cliente")
const Pedido = require("../models/Pedido")
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

            
        },
        obtenerClientes : async()=>{
            try{
                const clientes = await Cliente.find({})
                return clientes
            }catch(error){
                console.log(error)
            }
        },
        obtenerClientesVendedor : async(_,{},ctx)=>{
            try{
                const clientes = await Cliente.find({vendedor: ctx.usuario.id.toString()})
                return clientes
            }catch(error){
                console.log(error)
            }
        },
        obternerCliente: async(_,{id},ctx)=>{
            // Revisar si el Cliente existe

            const cliente = await Cliente.findById(id)
            if(!cliente){
                throw new Error("El client no existe")
            }
            // quien lo creo puede verlo
            if(cliente.vendedor.toString() !== ctx.usuario.id){
                throw new Error("No tienes el permiso o credenciales para acceder a este cliente")
            }

            return cliente
        },
        obtenerPedidos : async () =>{
            try{
                const pedidos = await Pedido.find({})
                return pedidos
            }catch(error){
                console.log(error)
            }
        },
        obtenerPediddosVendedor : async(_,{},ctx)=>{
            try{
                const pedidos = await Pedido.find({vendedor : ctx.usuario.id.toString()})
                return pedidos
            }catch(error){
                console.log(error)
            }

        },
        obtenerPedido : async (_,{id},ctx)=>{
            // Revisar si el pedido existe

            const pedido = await Pedido.findById(id)
            if(!pedido){
                throw new Error("El Pedido no existe")
            }

            // revisar quien lo creo pueda  verlo
            if(pedido.vendedor.toString() !== ctx.usuario.id){
                throw new Error("No tienes las credenciales ")
            }
            return pedido
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
        },

        actualizarProducto : async(_,{id,input})=>{

              // Revisar si el producto existe

              let producto = await Producto.findById(id)

              if(!producto){
                  throw new Error("Producto NO encontrado")
              }

              // guardar en la BD

              producto = await Producto.findOneAndUpdate({_id:id}, input,{new:true})

              return producto

              
  

        },
        eliminarProducto : async(_,{id})=>{
             // Revisar si el producto existe

             let producto = await Producto.findById(id)

             if(!producto){
                 throw new Error("Producto NO encontrado")
             }

             // eliminar de la bd

            await Producto.findOneAndDelete({_id:id})

             return "Producto Eliminado"
        },
        nuevoCliente: async (_,{input},ctx)=>{

            console.log(ctx)

            const {email} = input
            // Verificar si el cliente ya esta registrado

            console.log(input)

            const cliente = await  Cliente.findOne({email})
            if(cliente){
                throw new Error("Ese cliente ya esta registrado")
            }

            const nuevoCliente = new Cliente(input)

            // asignar el vendedor
            nuevoCliente.vendedor = ctx.usuario.id

            // Guardar en la BD
            try{                                
                const resultado = await nuevoCliente.save()
                return resultado
            }catch(error){
                console.log(error)
            }

            
        },
        actualizarCliente : async(_,{id,input},ctx) =>{

            // verificar si existe o no 

            let cliente = await Cliente.findById(id)
            if(!cliente){
                throw new Error ("El cliente no existe")
            }

            // verificar si el vendedor es quien edita
            if(cliente.vendedor.toString() !== ctx.usuario.id){
                throw new Error("No tienes las credenciales que corresponden para Editar ")
            }

            // guardar el cliente

            cliente = await Cliente.findOneAndUpdate({_id:id},input, {new:true})
            return cliente

        },
        eliminarCliente: async(_,{id},ctx)=>{
             // verificar si existe o no 

             let cliente = await Cliente.findById(id)
             if(!cliente){
                 throw new Error ("El cliente no existe")
             }
 
             // verificar si el vendedor es quien edita
             if(cliente.vendedor.toString() !== ctx.usuario.id){
                 throw new Error("No tienes las credenciales que corresponden para Editar ")
             }

             // Eliminar Cliente

             await Cliente.findOneAndDelete({_id:id})

             return "Cliente Eliminado"


 
        },
        nuevoPedido : async(_,{input},ctx)=>{

            const {cliente} = input
            // verificar si el cliente existe o no
            let clienteExiste = await Cliente.findById(cliente)
            if(!clienteExiste){
                throw new Error("Ese cliente no Existe")
            }

            // verificar si el cliente es del vendedor 
            if (clienteExiste.vendedor.toString() !== ctx.usuario.id){
                throw new Error ( "No tiene las credenciales")
            }


            // Revisar qu el stock este disponible

            for await ( const articulo of input.pedido){
                const {id} = articulo
                const producto = await Producto.findById(id)

                if(articulo.cantidad > producto.existencia){
                    throw new Error (`El articulo : ${producto.nombre} excede la cantidad disponible`)
                }else{
                    // restar la cantidad a lo disponible

                    producto.existencia = producto.existencia - articulo.cantidad

                    await producto.save()
                }
            }

           // crear un nuevo pedido

           const nuevoPedido = new Pedido(input)
           

            // Asignarle un vendedor
            nuevoPedido.vendedor= ctx.usuario.id

            // guardar en la BD

            const resultado = await nuevoPedido.save()
            return resultado
        }
    }

}

module.exports = resolvers