


//resolvers

const resolvers ={
    Query:{
        obtenerCurso:()=>"Algo"
    },
    Mutation :{
        nuevoUsuario:(_,{input})=>{
            console.log(input)

            return " creando ..."
        }
    }

}

module.exports = resolvers