//https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie

import express from "express"
import cookieParser from "cookie-parser"

const secretoParaFirmas="secreto-secretisimo" // Nunca aquí. En .env mejor.

const app = express();
app.use(cookieParser(secretoParaFirmas));

const middlewareFormularios = express.urlencoded({extended: true}) // Se os formularios incluen arquivos, empregar multer.

app.get("/", (peticion,resposta)=>{

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

    resposta.cookie("ultimaVisita", agora)

    resposta.cookie("secretisimo", 42, {
        secure: true,
        httpOnly: true,
        sameSite: "strict",
        domain: "localhost",
        path: "/",
        signed: true,
        maxAge: 3*60, // 3 minutos
    })

    resposta.send(`
        <form method="POST" action="/">
            <label>O teu nome: <input name="nome" type="text"/>
            <input type="submit"/>
        </form>
        <p>${
            segundosDesdeUltimaVisita !== 0 ? "Accediches fai "+(segundosDesdeUltimaVisita.toString())+" segundos"
            : "É a primeira vez que accedes."
        }</p>
        <p>${
            nomeDoVisitante === "" ? "Non sei quen es"
            : "Ola de novo, "+nomeDoVisitante+" ❤️"
        }</p>
    `)

})

app.post("/", middlewareFormularios, (peticion,resposta)=>{

    if ( peticion.body.nome ) resposta.cookie("nome", peticion.body.nome                                                                                            )

    resposta.redirect("/")

})

app.listen(8000, ()=>{
    console.log("Listo para entregar ricas cookies");
})