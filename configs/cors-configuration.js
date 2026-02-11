const corsOptions = {
    //Permite que cualquier origen acceda a la API
    orgin: true,
    //Permite que la API acceda a la API
    credentials: true,
    //Establece los metodos permitidos en la API
    methods: "GET, POST, PUT, DELETE",
    //Define los headers que el cliente puede enviar
    allowedHeaders: "Content-Type,Authotization"
}

export { corsOptions }