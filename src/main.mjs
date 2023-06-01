//https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie

import express from "express"
import cookieParser from "cookie-parser"

const secretoParaFirmas="secreto-secretisimo" // Nunca aquí. En .env mejor.

const app = express();
app.use(cookieParser(secretoParaFirmas));

const middlewareFormularios = express.urlencoded({extended: true}) // Se os formularios incluen arquivos, empregar multer.

function renderizaFormulario(peticion) {

    let segundosDesdeUltimaVisita = 0
    let nomeDoVisitante = ""
    const valorCookieUltimaVisita = peticion.cookies.ultimaVisita
    const valorCookieNome = peticion.cookies.nome
    const agora = Date.now()

    if ( valorCookieUltimaVisita ) {
        const tempoUltimaVisita = new Date(parseInt(valorCookieUltimaVisita)).valueOf()
        segundosDesdeUltimaVisita = (agora - tempoUltimaVisita)/1000
    }

    if (valorCookieNome) nomeDoVisitante = valorCookieNome

    return `
        <form method="POST" action="/">
            <label>O teu nome: <input name="nome" type="text"/>
            <input type="submit"/>
        </form>
        <p>${
            segundosDesdeUltimaVisita !== 0 ? "Accediches fai "+(segundosDesdeUltimaVisita)+" segundos"
            : "É a primeira vez que accedes."
        }</p>
        <p>${
            nomeDoVisitante === "" ? "Non sei quen es"
            : "Ola de novo, "+nomeDoVisitante+" ❤️"
        }</p>
    `
}

app.get("/", (peticion,resposta)=>{

    resposta.cookie("ultimaVisita", Date.now())

    resposta.cookie("secretisimo", 42, {
        secure: true, // Solo se envía sobre HTTPS
        httpOnly: true, // No estará accesible para JavaScript en el navegador
        sameSite: "strict", // No aceptará reenvío a terceros
        domain: "localhost", // El navegador lo enviará a peticiones a este dominio
        path: "/", // El navegador lo enviará a peticiones a esta ruta en el dominio anterior
        signed: true, // Se incorpora una firma. Requiere un secret en el middleware
        maxAge: 3*60, // 3 minutos. Tiempo de validez de la cookie
    })

    resposta.send(renderizaFormulario(peticion))

})

app.post("/", middlewareFormularios, (peticion,resposta)=>{

    if ( peticion.body.nome ) resposta.cookie("nome", peticion.body.nome)

    resposta.send(renderizaFormulario(peticion))

})

app.listen(8000, ()=>{
    console.log("Listo para entregar ricas cookies");
})