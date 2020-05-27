const Usuario = require("../models/Usuario")
const bcryptjs = require("bcryptjs")


//resolvers

const resolvers ={
    Query:{
        obtenerCurso:()=>"Algo"
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
        }
    }

}

module.exports = resolvers